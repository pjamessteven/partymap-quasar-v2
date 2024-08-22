<template>
  <div
    style="height: 100%; width: 100%; z-index: 0; position: absolute"
    :class="{
      'satellite-enabled': mapStyle === 'satellite',
    }"
  >
    <div class="location-button-wrapper">
      <div class="location-button t1" v-on:click="locateMe">
        <i class="mdi mdi-crosshairs-gps" />
      </div>
    </div>
    <div
      ref="map"
      style="height: 100%; z-index: 0"
      class="map"
      @wheel="handleWheel"
    >
      <transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <div class="markers-loading-map-overlay" v-if="loadingPoints"></div>
      </transition>
    </div>
  </div>
</template>

<script>
import { mapWritableState, mapState, mapActions } from 'pinia';
import { toRaw } from 'vue';
import { useMapStore } from 'stores/map.ts';
import { useMainStore } from 'stores/main.ts';
import { useQueryStore } from 'src/stores/query';

import _ from 'lodash';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster';
import 'leaflet.tilelayer.colorfilter';
//import '../../../node_modules/leaflet.tilelayer.colorfilter/src/leaflet-tilelayer-colorfilter.js';

import EventSelectionComponent from './EventSelectionComponent.vue';
import { useNearbyStore } from 'src/stores/nearby';

export default {
  components: {},
  props: [],
  data() {
    return {
      markersLoaded: false,
      zoom: 3,
      focusMarkerLayer: L.featureGroup(),
      eventDateHoverLayer: L.featureGroup(),
      userLocationMarkerLayer: L.featureGroup(),
      withPopup: L.latLng(47.41322, -1.219482),
      withTooltip: L.latLng(47.41422, -1.250482),
      currentZoom: 11.5,
      mapOptions: {
        zoom: 1,
        zoomControl: true,
        minZoom: 2,
        maxZoom: 14,
        maxBounds: L.latLngBounds(
          // L.latLng(-89.98155760646617, -Infinity),
          // L.latLng(89.99346179538875, Infinity)
          this.$q.screen.gt.xs
            ? [
                [-90, -350], // account for sidebar
                [90, 220],
              ]
            : [
                [-90, -180],
                [90, 220],
              ]
        ),
        maxBoundsViscosity: 0.5,
        worldCopyJump: false,
        preferCanvas: true,
      },

      clusterOptions: {
        chunkedLoading: true,
      },
      tileLayer: null,
      labelLayer: null,
      mapMarkers: null,
      mapMarkersPermanentTooltip: null,
      satelliteMapOpacity: 1,
      satelliteLabelLayerOpacity: 0.9,
      monochromeMapOpactiy: 0.68,
      windowHeight: 0,
      clientHeight: 0,
    };
  },
  created() {
    this.debouncedClearMarkersAndLoadPoints = _.debounce(
      this.clearMarkersAndLoadPoints,
      300,
      {
        leading: false,
        trailing: true,
      }
    );
    this.debouncedInvalidateMapSize = _.debounce(this.invalidateMapSize, 500, {
      leading: false,
      trailing: true,
    });
  },

  watch: {
    peekMap(newv, oldv) {
      if (this.$route.name === 'EventPage') this.fitBoundsForFocusMarker();
    },
    sidebarPanel(newv, oldv) {
      if (newv === 'nearby' && oldv === 'explore') {
        if (
          this.userLocation?.lat &&
          // !this.userLocationFromSearch &&
          newv === 'nearby'
        ) {
          // go to users location
          this.fitBoundsForNearbyPage(this.userLocation);
        }
        if (this.$q.screen.lt.sm) {
          // hide map markers on nearby page
          if (
            this.mapMarkers &&
            toRaw(this.map)?.hasLayer(toRaw(this.mapMarkers))
          ) {
            toRaw(this.mapMarkers).remove();
          }
        }
      }
      if (newv === 'explore' && oldv === 'nearby' && this.userLocation) {
        this.fitBoundsForExplorePage(this.userLocation);
      }
      if (newv === 'explore') {
        if (
          toRaw(this.mapMarkers) &&
          this.$q.screen.lt.sm &&
          !toRaw(this.map)?.hasLayer(toRaw(this.mapMarkers))
        ) {
          // possible performance issue
          if (toRaw(this.mapMarkers)) {
            toRaw(this.mapMarkers).addTo(toRaw(this.map));
          } else {
            this.clearMarkersAndLoadPoints();
          }
        }
      }
    },
    darkMode() {
      this.initTileLayers();
    },
    windowHeight() {
      this.invalidateMapSize();
    },
    controlDateRange: {
      handler() {
        this.debouncedClearMarkersAndLoadPoints();
      },
      deep: false,
    },
    controlDuration: {
      handler() {
        this.debouncedClearMarkersAndLoadPoints();
      },
      deep: true,
    },
    controlSize: {
      handler() {
        this.debouncedClearMarkersAndLoadPoints();
      },
      deep: true,
    },
    controlFavorite: {
      handler() {
        this.debouncedClearMarkersAndLoadPoints();
      },
    },
    controlArtist: {
      handler() {
        this.debouncedClearMarkersAndLoadPoints();
      },
      deep: true,
    },
    controlTag: {
      handler() {
        this.debouncedClearMarkersAndLoadPoints();
      },
      deep: true,
    },
    controlCountry: {
      handler() {
        this.debouncedClearMarkersAndLoadPoints();
      },
    },
    controlRegion: {
      handler() {
        this.debouncedClearMarkersAndLoadPoints();
      },
    },
    controlLocality: {
      handler() {
        this.debouncedClearMarkersAndLoadPoints();
      },
    },
    controlEmptyLineup: {
      handler() {
        this.debouncedClearMarkersAndLoadPoints();
      },
    },
    controlDateUnconfirmed: {
      handler() {
        this.debouncedClearMarkersAndLoadPoints();
      },
    },
    userLocation: {
      deep: true,
      handler(newval) {
        console.log('USERLOCATION', newval);
        this.fitBoundsForNearbyPage(newval);
        // add location marker for fine location
        if (!this.userLocationFromSearch && this.fineLocation) {
          this.addUserLocationMarker(newval);
        }
        // wait for animation
        setTimeout(() => {
          if (!this.blockUpdates) {
            this.exploreMapView = {
              latlng: this.map.getCenter(),
              zoom: this.map.getZoom(),
            };
          }
        }, 500);
      },
    },
    route: {
      handler: function (to, from) {
        if (toRaw(this.map)) {
          if (from.name === 'EventPage') {
            this.peekMap = false;
          }
          if (to.name === 'EventPage') {
            // enter event page
            if (
              this.mapMarkers &&
              toRaw(this.map)?.hasLayer(toRaw(this.mapMarkers))
            ) {
              toRaw(this.mapMarkers).remove();
            }
            if (
              this.eventDateHoverLayer &&
              toRaw(this.map)?.hasLayer(toRaw(this.eventDateHoverLayer))
            ) {
              toRaw(this.eventDateHoverLayer).clearLayers();
              toRaw(this.eventDateHoverLayer).remove();
            }
            // this.eventDateHoverLayer.clearLayers()
          } else if (from.name === 'Explore') {
            this.exploreMapView = {
              latlng: this.map.getCenter(),
              zoom: this.map.getZoom(),
            };
          } else if (to.name === 'Explore') {
            if (!to.query.view) {
              // gone to nearby page
              this.fitBoundsForNearbyPage(this.userLocation);
            }

            // restore previous map view
            else if (this.exploreMapView) {
              toRaw(this.map).setView(
                this.exploreMapView.latlng,
                this.exploreMapView.zoom,
                {
                  animate:
                    !this.disableAnimations &&
                    (this.$q.screen.gt.xs ||
                      (this.$q.screen.lt.sm && !this.showPanel)),
                }
              );
            }

            // restore default opacity
            if (this.mapStyle === 'satellite') {
              toRaw(this.tileLayer).setOpacity(this.satelliteMapOpacity);
            } else if (this.mapStyle === 'transport') {
              toRaw(this.tileLayer).setOpacity(1);
            } else {
              toRaw(this.tileLayer).setOpacity(this.monochromeMapOpactiy);
            }

            if (
              this.focusMarkerLayer &&
              toRaw(this.map)?.hasLayer(toRaw(this.focusMarkerLayer))
            ) {
              this.focusMarkerLayer.clearLayers();
              this.focusMarkerLayer.remove();
            }
            if (
              this.eventDateHoverLayer &&
              toRaw(this.map)?.hasLayer(toRaw(this.eventDateHoverLayer))
            ) {
              this.eventDateHoverLayer.clearLayers();
              this.eventDateHoverLayer.remove();
            }

            // possible performance issue
            if (toRaw(this.mapMarkers)) {
              toRaw(this.mapMarkers).addTo(toRaw(this.map));
            } else {
              this.clearMarkersAndLoadPoints();
            }
          }
        }
      },
    },
    focusMarker: {
      handler: function (newval) {
        console.log('focus', newval);

        if (newval !== null) {
          this.blockUpdates = true;
          // save current map view so we can return to it
          if (newval.lat && newval.lng) {
            this.exploreMapView = {
              latlng: toRaw(this.map).getCenter(),
              zoom: toRaw(this.map).getZoom(),
            };

            this.setMarkerFocusForEventPage(newval);
          }
        }
      },
    },
    eventDateHoverMarker: function (newv) {
      toRaw(this.eventDateHoverLayer).unbindTooltip();
      toRaw(this.eventDateHoverLayer).clearLayers();
      if (newv !== null && toRaw(this.map)) {
        var markers = [
          L.marker([newv.lat, newv.lng], {
            icon: this.defaultIcon,
            zIndexOffset: 6000,
          }),
        ];
        this.eventDateHoverLayer = L.featureGroup(markers)
          .bindTooltip(newv.name, {
            direction: 'top',
            permanent: true,
            className: 'hoverToolTip',
          })
          .addTo(toRaw(this.map));
      }
    },
    mapMoving: function (newv) {
      this.$nextTick(() => {
        if (newv === false && this.$route.name === 'Explore') {
          this.blockUpdates = false;
        }
      });
    },
    mapStyle: function () {
      this.initTileLayers();
    },
    points: function () {
      if (this.$route.name === 'Explore') {
        this.initMarkers();
      }
    },
  },

  methods: {
    ...mapActions(useMainStore, ['getFineLocation', 'loadIpInfo']),
    ...mapActions(useQueryStore, ['loadPoints']),
    ...mapActions(useNearbyStore, ['setMapBoundsNearby']),
    addUserLocationMarker(latlng) {
      if (
        this.userLocationMarkerLayer &&
        toRaw(this.map)?.hasLayer(toRaw(this.userLocationMarkerLayer))
      ) {
        this.userLocationMarkerLayer.clearLayers();
        this.userLocationMarkerLayer.remove();
      }
      var markers = [
        L.marker(latlng, {
          icon: this.locationIcon,
          zIndexOffset: 5000,
        }),
      ];

      this.userLocationMarkerLayer = L.featureGroup(markers);
      this.userLocationMarkerLayer.addTo(toRaw(this.map));
    },
    async locateMe() {
      try {
        try {
          await this.getFineLocation();
        } catch {
          await this.loadIpInfo();
        }
        this.fitBoundsForNearbyPage(this.userLocation);
      } catch (e) {
        this.fitBoundsForNearbyPage(this.userLocation);
      }
      // go to users location
    },
    goBack() {
      if (this.routerHistory.length > 0) {
        this.$router.go(-1);
      } else {
        this.$router.push({ name: 'Explore' });
      }
    },
    handleWheel(event) {
      if (this.preventMapZoom) {
        event.stopImmediatePropagation();
        return false;
      }
      // switch to explore view
      if (!this.preventMapZoom) {
        this.showPanel = false;

        if (this.sidebarPanel !== 'explore') {
          this.sidebarPanel = 'explore';
        }
        return false;
      }
    },
    clearMarkersAndLoadPoints() {
      if (this.mapMarkers !== null) {
        toRaw(this.map)?.removeLayer(toRaw(this.mapMarkers));
        this.mapMarkers.clearLayers();
      }
      if (this.mapMarkersPermanentTooltip !== null) {
        toRaw(this.map)?.removeLayer(toRaw(this.mapMarkersPermanentTooltip));
        this.mapMarkersPermanentTooltip.clearLayers();
      }
      try {
        this.loadPoints();
      } catch (e) {}
    },
    fitBoundsForFocusMarker() {
      // var paddingBottom = this.windowHeight - (this.windowHeight / 2 - 120)
      var zoom = toRaw(this.map).getZoom();
      if (zoom <= 4) {
        zoom = 4;
      }

      var mapContainerHeight = this.windowHeight; // minus menubar
      var paddingBottom = this.windowHeight - mapContainerHeight / 3 + 28;
      var paddingRight = 0;

      const bounds = toRaw(this.focusMarkerLayer).getBounds();
      if (this.peekMap) {
        toRaw(this.map).fitBounds(bounds, {
          paddingTopLeft: [0, -128],
          animate: !this.disableAnimations,
          duration: 0.3,
          easeLinearity: 1,
          maxZoom: 10,
        });
      } else {
        toRaw(this.map).fitBounds(bounds, {
          paddingBottomRight: [paddingRight, paddingBottom],
          animate: !this.disableAnimations,
          maxZoom: zoom,
        });
      }
    },

    fitBoundsForNearbyPage(coords) {
      if (coords) {
        // padding for desktop panel
        var latlng = L.latLng(coords);
        if (this.$q.screen.gt.xs) {
          toRaw(this.map).fitBounds(L.latLngBounds(latlng, latlng), {
            paddingTopLeft: [
              0,
              0 - window.innerHeight / 2 - 128 + this.safeAreaInsets.top,
            ],
            animate: !this.disableAnimations,
            duration: 0.3,
            easeLinearity: 1,
            maxZoom: 10,
          });
        } else {
          // padding for mobile bottom panel
          toRaw(this.map).fitBounds(L.latLngBounds(latlng, latlng), {
            //paddingTopLeft: [0, -150],
            paddingTopLeft: [
              0,
              0 - window.innerHeight / 2 - 86 + this.safeAreaInsets.top,
            ],
            animate: !this.disableAnimations,
            duration: 0.3,
            easeLinearity: 1,
            maxZoom: 10,
          });
        }
      } else {
        this.locateMe();
      }
    },
    fitBoundsForExplorePage(coords) {
      // padding for desktop panel
      var latlng = L.latLng(coords);
      if (this.$q.screen.gt.xs) {
        toRaw(this.map).fitBounds(L.latLngBounds(latlng, latlng), {
          paddingTopLeft: [0, -150],
          animate: !this.disableAnimations,
          duration: 0.3,
          easeLinearity: 1,
          maxZoom: 10,
        });
      } else {
        // padding for mobile bottom panel
        toRaw(this.map).fitBounds(L.latLngBounds(latlng, latlng), {
          paddingTopLeft: [0, -150],
          animate: !this.disableAnimations,
          duration: 0.3,
          easeLinearity: 1,
          maxZoom: 10,
        });
      }
    },
    invalidateMapSize() {
      setTimeout(() => {
        toRaw(this.map).invalidateSize();
      }, 1000);
    },
    showEventPageForMarker(data) {
      this.focusMarker = {
        lat: data.lat,
        lng: data.lng,
      };
      if (data.events[0])
        this.$router.push({
          name: 'EventPage',
          params: {
            id: data.events[0].event_id,
            eventDateId: data.events[0].event_date_id,
          },
          query: {
            name: data.events[0].name.replace(/ /g, '_'),
          },
        });
    },
    clickMarker(e) {
      var marker = e.target;
      if (marker.data.events.length > 1) {
        // show dialog to allow user to choose which event
        this.$q.dialog({
          component: EventSelectionComponent,
          parent: this, // becomes child of this Vue node
          // ("this" points to your Vue component)
          // (prop was called "root" in < 1.1.0 and
          // still works, but recommending to switch
          // to the more appropriate "parent" name)

          // props forwarded to component
          componentProps: {
            data: marker.data,
          },
        });
      } else {
        this.showEventPageForMarker(marker.data);
      }
    },
    setBounds(bounds) {
      if (this.$q.screen.lt.md) {
        // padding for mobile bottom panel
        // on desktop we don't care about the portion the panel covers
        var pxSw = this.map.getPixelBounds().getBottomLeft();

        const bottomPanelHeight = '200';
        pxSw = pxSw.subtract(L.point(0, bottomPanelHeight)); // add the height of the bottom panel
        var sw = toRaw(this.map).unproject(pxSw);
        bounds = L.latLngBounds(sw, toRaw(this.map).getBounds().getNorthEast()); // bounds without the bottom panel
      }

      this.mapBounds = bounds;
      this.mapCenter = bounds;
    },
    setMarkerFocusForEventPage(latlng, zoom) {
      toRaw(this.mapMarkers)?.remove();
      //this.mapMarkersPermanentTooltip.remove();

      var markers = [
        L.marker(latlng, {
          icon: this.defaultIcon,
          zIndexOffset: 1000,
        }).on('click', this.clickMarker),
      ];

      this.focusMarkerLayer.clearLayers();
      this.focusMarkerLayer = L.featureGroup(markers);
      this.focusMarkerLayer.addTo(toRaw(this.map));

      this.fitBoundsForFocusMarker();
    },
    initMap() {
      this.map = L.map(this.$refs.map, this.mapOptions).setView(
        [53.9, 27.6],
        3,
        { animate: !this.disableAnimations }
      );
      if (this.focusMarker !== null) {
        this.blockUpdates = true;
        // save current map view so we can return to it
        if (this.focusMarker.lat && this.focusMarker.lng) {
          this.exploreMapView = {
            latlng: toRaw(this.map).getCenter(),
            zoom: toRaw(this.map).getZoom(),
          };

          this.setMarkerFocusForEventPage(newval);
        }
      }
      this.initTileLayers();
      // add location marker for fine location
      if (!this.userLocationFromSearch && this.fineLocation) {
        this.addUserLocationMarker(this.userLocation);
      }
      toRaw(this.map).clicked = 0;

      toRaw(this.map).on('click', () => {
        if (this.sidebarPanel === 'explore') {
          toRaw(this.map).clicked = toRaw(this.map).clicked + 1;

          setTimeout(() => {
            if (toRaw(this.map).clicked == 1) {
              toRaw(this.map).clicked = 0;
              // single click action
              this.sidebarMinimized = !this.sidebarMinimized;
            }
          }, 300);
        }

        if (this.$route.name === 'EventPage') {
          //this.peekMap = false;
          if (!this.peekMap) {
            this.goBack();
          } else {
            this.peekMap = false;
          }
        }
      });

      toRaw(this.map).on('dblclick', (event) => {
        toRaw(this.map).clicked = 0;
        // toRaw(this.map).zoomIn();
      });

      toRaw(this.map).on('mouseup', () => {
        setTimeout(() => {
          if (this.$route.name === 'Explore') {
            // switch to explore view
            if (
              this.sidebarPanel !== 'explore' &&
              this.sidebarPanel !== 'favorites'
            ) {
              this.sidebarPanel = 'explore';
            }
            this.showPanel = false;
          }
        }, 50);
      });

      toRaw(this.map).on('movestart', () => {
        this.mapMoving = true;
        if (this.$route.name === 'EventPage' && !this.peekMap) {
          // this.peekMap = true;
        }
      });

      toRaw(this.map).on('moveend', (event) => {
        if (!this.blockUpdates) {
          // ipad/tablet view doesnt respect mousedown so we also do on move end
          /*
          if (this.$route.name === 'Explore' && this.$q.platform.is.ipad) {
            // switch to explore view

            if (
              this.sidebarPanel !== 'explore' &&
              this.sidebarPanel !== 'favorites'
            ) {
              this.sidebarPanel = 'explore';
            }
            this.showPanel = false;
          }
          */
          /*
          this.exploreMapView = {
            latlng: this.map.getCenter(),
            zoom: this.map.getZoom(),
          };*/
          this.setBounds(event.target.getBounds());
        }

        this.mapMoving = false;
      });
      toRaw(this.map).on('zoomstart', () => {
        if (this.$route.name === 'EventPage' && !this.peekMap) {
          //  this.peekMap = true;
        }
        this.markersLoaded = false;
        // switch to explore view handled by wheel event
      });
      toRaw(this.map).on('zoomend', (event) => {
        this.mapZoomLevel = toRaw(this.map).getZoom();
        /*
        if (event.target.getZoom() > 10) {
          // show markers with tooltips at a certain zoom level
          this.mapMarkers.remove();
          this.mapMarkersPermanentTooltip.addTo(toRaw(this.map));
        } else {
          // remove markers with tooltips
          this.mapMarkersPermanentTooltip.remove();
          this.mapMarkers.addTo(toRaw(this.map));
        }
        */
        if (!this.blockUpdates) {
          /*
          this.exploreMapView = {
            latlng: this.map.getCenter(),
            zoom: this.map.getZoom(),
          };*/
          this.setBounds(event.target.getBounds());
        }
      });
    },
    initTileLayers() {
      if (
        toRaw(this.tileLayer) &&
        toRaw(this.map)?.hasLayer(toRaw(this.tileLayer))
      ) {
        toRaw(this.map).removeLayer(toRaw(this.tileLayer));
      }
      if (
        toRaw(this.labelLayer) &&
        toRaw(this.map)?.hasLayer(toRaw(this.labelLayer))
      ) {
        toRaw(this.map).removeLayer(toRaw(this.labelLayer));
      }

      // style specific parameters
      const detectRetina = this.mapStyle === 'satellite';

      let opacity = 1;
      if (this.mapStyle === 'satellite') opacity = this.satelliteMapOpacity;
      if (this.mapStyle === 'toner') opacity = this.monochromeMapOpactiy;

      let filter = [];
      if (this.mapStyle === 'transport' && this.$q.dark.isActive) {
        filter = ['saturate:150%', 'brightness:100%'];
      }

      this.tileLayer = L.tileLayer(this.currentMapTileUrl, {
        attribution: this.currentMapTileAttribution,
        detectRetina,
        filter,
        updateWhenZooming: false,
        bounds: [
          [-90, -180],
          [90, 180],
        ],
      });
      toRaw(this.tileLayer).setOpacity(opacity);
      toRaw(this.tileLayer).addTo(toRaw(this.map));

      if (this.mapStyle === 'satellite') {
        // add additional label layer for satellite map
        this.labelLayer = L.tileLayer(this.labelsMapTileUrl, {
          detectRetina: false,
          updateWhenZooming: false,
          bounds: [
            [-90, -180],
            [90, 180],
          ],
        });
        toRaw(this.labelLayer).addTo(toRaw(this.map));
        toRaw(this.labelLayer).setOpacity(this.satelliteLabelLayerOpacity);
      }
      //this.map.fitWorld();
    },
    initMarkers() {
      this.markersLoaded = false;

      if (this.points.length > 0) {
        // this.map.locate({setView: true, maxZoom: 17});
        // Leaflet.markercluster
        this.mapMarkers = L.markerClusterGroup({
          chunkedLoading: true,
          showCoverageOnHover: false,
          // disableClusteringAtZoom: 0,
          spiderfyOnMaxZoom: false,
          /*
          iconCreateFunction: (cluster) => {
            let className;
            if (cluster.getChildCount() > 10) {
              className = 'cluster-icon-10';
            } else if (cluster.getChildCount() > 2) {
              className = 'cluster-icon-3';
            } else {
              className = 'cluster-icon-2';
            }
            return L.divIcon({
              className, // style defined in App.vue
              iconAnchor: [12, 30],
              iconSize: [25, 30],
              tooltipAnchor: [3, -32],
            });
            */
        });

        /*this.mapMarkersPermanentTooltip = L.markerClusterGroup({
          chunkedLoading: true,
        });*/
        var tooltipMarkers = [];
        for (let i = 0; i < this.points.length; i++) {
          var toolTipHtml = '';
          var toolTipString = '';
          // show list of events for location in toolTip
          // if there are more than one
          var eventIds = [];
          for (let j = 0; j < this.points[i].events.length; j++) {
            if (eventIds.indexOf(this.points[i].events[j].event_id) === -1) {
              eventIds.push(this.points[i].events[j].event_id);
              toolTipHtml = toolTipHtml + this.points[i].events[j].name;
              toolTipString = toolTipString + this.points[i].events[j].name;
              if (
                this.points[i].events[j + 1] ||
                this.points[i].events[j - 1]
              ) {
                if (j !== this.points[i].events.length - 1) {
                  // not last element
                  // toolTipHtml = toolTipHtml + '<ul>'
                  toolTipHtml = toolTipHtml + '<br/>';
                  toolTipString = toolTipString + ', ';
                }
                /* if (this.points[i].events[j + 1] || this.points[i].events[j - 1]) {
                // toolTipHtml = toolTipHtml + '</li>'
                if (j === this.points[i].events.length - 1) {
                  //  toolTipHtml = toolTipHtml + '<ul/>'
                  // last item
                  }
                }
                */
              }
            }
          }

          let marker = L.marker([this.points[i].lat, this.points[i].lng], {
            icon: toRaw(this.defaultIcon),
            title: toolTipString,
            alt: toolTipString,
          }).bindTooltip(toolTipHtml, {
            direction: 'top',
            permanent: true,
            interactive: true,
          });

          marker.on('click', this.clickMarker);
          marker.data = this.points[i];
          tooltipMarkers.push(marker);
        }
        // on mobile markers are hidden on nearby view - handled by watcher
        toRaw(this.mapMarkers).addLayers(tooltipMarkers);

        //toRaw(this.mapMarkersPermanentTooltip).addLayers(tooltipMarkers);

        this.markersLoaded = true;
        if (this.$q.screen.gt.xs || this.sidebarPanel == 'explore') {
          toRaw(this.map).addLayer(toRaw(this.mapMarkers));
        }
        //toRaw(this.map).addLayer(toRaw(this.mapMarkersPermanentTooltip));
        //this.mapMarkers.addTo(toRaw(this.map));
      }
    },
  },
  computed: {
    darkMode() {
      return this.$q.dark.isActive;
    },
    ...mapState(useMapStore, [
      'currentMapTileAttribution',
      'currentMapTileUrl',
      'labelsMapTileUrl',
      'defaultIcon',
      'locationIcon',
    ]),
    ...mapWritableState(useMapStore, [
      'peekMap',
      'map',
      'mapBounds',
      'mapCenter',
      'exploreMapView',
      'focusMarker',
      'eventDateHoverMarker',
      'mapMoving',
      'blockUpdates',
      'preventMapZoom',
      'mapStyle',
      'mapZoomLevel',
    ]),
    ...mapWritableState(useMainStore, [
      'windowWidth',
      'safeAreaInsets',
      'userLocationFromSearch',
      'userLocation',
      'fineLocation',
      'sidebarPanel',
      'showPanel',
      'sidebarExpanded',
      'disableAnimations',
      'sidebarMinimized',
    ]),
    ...mapState(useMainStore, ['routerHistory']),
    ...mapState(useQueryStore, [
      'controlDateRange',
      'controlDuration',
      'controlSize',
      'controlArtist',
      'controlTag',
      'controlCountry',
      'controlRegion',
      'controlLocality',
      'controlEmptyLineup',
      'controlDateUnconfirmed',
      'loadingPoints',
      'nearbyEventDates',
      'points',
    ]),
    route() {
      return this.$route;
    },
  },
  mounted() {
    if (this.$route.name === 'Explore') {
      // don't load points if page load starts with eventpage
      this.clearMarkersAndLoadPoints();
    }
    this.initMap();
    if (this.userLocation) {
      this.fitBoundsForNearbyPage(this.userLocation);
    }
    this.windowHeight = window.innerHeight;
    this.windowWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      this.windowHeight = window.innerHeight;
      this.windowWidth = window.innerWidth;
      this.clientHeight = window;
      this.debouncedInvalidateMapSize(); // bceause it fucks up on mobile when the keyboard appears
    });
  },
};
</script>

<style lang="scss">
.body--dark {
  .location-button-wrapper {
    .location-button {
      background: black;
      border-radius: 4px;
      outline: 2px solid $bi-3 !important;
      color: $ti-2;
    }
  }
  .map {
    background: rgb(0, 0, 0);
    //background: linear-gradient(black, rgb(68, 68, 68));
    //background: #727272;
    //background: #484848;
  }
  .leaflet-map-pane {
    .leaflet-tooltip-pane {
      .leaflet-tooltip {
        opacity: 1;
        background: $bi-3;
        color: $ti-1;
        border-color: $bi-4;
        &:before {
          border-top-color: $bi-3;
        }
      }
    }
    .leaflet-marker-pane {
      .focus-marker-icon {
        &:before {
          content: '';
          position: absolute;
          width: 30px;
          height: 30px;
          top: 9px;
          left: 11px;
          background: url('assets/marker-dark-filled.png') !important;
          background-size: contain !important;
          background-repeat: no-repeat !important;
          //filter: drop-shadow(0px 2px 5px rgba(0, 0, 0, 0.2));
        }
        background: rgba(0, 0, 0, 0);
        border: 8px solid rgba(255, 255, 255, 0.68);
        border-radius: 200px;
        background-position: center !important;
        z-index: 800 !important;
        height: 62px !important;
        width: 62px !important;
        //background: url('~assets/marker-dark.svg') !important;
        background-size: contain !important;
        background-repeat: no-repeat !important;
        //background-position: center !important;
        filter: drop-shadow(0px 10px 5px rgba(0, 0, 0, 0.4));
      }

      .marker-cluster-small,
      .marker-cluster-medium,
      .marker-cluster-large {
        background: rgba(0, 0, 0, 0.68);
        border: 6px solid rgba(255, 255, 255, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 100%;

        div {
          background: transparent;
          color: white;
          font-size: 14pt;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: bold;
          margin-left: 0px;
          margin-top: 0px;
        }
      }
    }
  }
}
.body--light {
  .location-button-wrapper {
    .location-button {
      background: white;
      border-radius: 4px;
      outline: 2px solid rgba(0, 0, 0, 0.2) !important;
    }
  }
  .map {
    background: black;
    .leaflet-map-pane {
      .leaflet-marker-pane {
        .focus-marker-icon {
          &:before {
            content: '';
            position: absolute;
            width: 30px;
            height: 30px;
            top: 9px;
            left: 11px;
            background: url('assets/marker-light-filled.png') !important;
            background-size: contain !important;
            background-repeat: no-repeat !important;
            //filter: drop-shadow(0px 2px 5px rgba(0, 0, 0, 0.2));
          }
          background: rgba(255, 255, 255, 0.8);
          border: 8px solid rgba(0, 0, 0, 0.1);
          border-radius: 200px;
          background-position: center !important;
          z-index: 800 !important;
          height: 62px !important;
          width: 62px !important;
          //background: url('~assets/marker-dark.svg') !important;
          background-size: contain !important;
          background-repeat: no-repeat !important;
          //background-position: center !important;
          filter: drop-shadow(0px 10px 5px rgba(0, 0, 0, 0.1));
        }

        .marker-cluster-small,
        .marker-cluster-medium,
        .marker-cluster-large {
          background: rgba(0, 0, 0, 0.68);
          border: 6px solid rgba(255, 255, 255, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 100%;
          div {
            background: transparent;
            color: white;
            font-size: 14pt;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: bold;
            margin-left: 0px;
            margin-top: 0px;
          }
        }
      }
    }
  }
  .satellite-enabled {
    .map {
      //background: black;
      .leaflet-map-pane {
        .leaflet-marker-pane {
        }
      }
    }
  }
}

:root {
  --pulseSize: 28px;
  --blue: rgba(95, 139, 250, 0.65);
  --transparentBlue: rgba(95, 139, 250, 0);
}
.map {
  .leaflet-map-pane {
    .leaflet-marker-pane {
      .marker-icon {
        background: url('assets/marker-dark-filled.png') !important;
        z-index: 800 !important;
        height: 30px !important;
        width: 30px !important;
        //background: url('~assets/marker-dark.svg') !important;
        background-size: contain !important;
        background-repeat: no-repeat !important;
        background-position: center !important;
        filter: drop-shadow(0px 10px 5px rgba(0, 0, 0, 0.4));
      }
      .cluster-icon-3 {
        cursor: zoom-in;

        background: url('assets/multi.png') !important;
        z-index: 800 !important;
        height: 40px !important;
        width: 40px !important;
        //background: url('~assets/marker-dark.svg') !important;
        background-size: contain !important;
        background-repeat: no-repeat !important;
        background-position: center !important;
        filter: drop-shadow(0px 10px 5px rgba(0, 0, 0, 0.4));
      }
      .cluster-icon-2 {
        cursor: zoom-in;
        background: url('assets/multi-2.png') !important;
        z-index: 800 !important;
        height: 30px !important;
        width: 30px !important;
        //background: url('~assets/marker-dark.svg') !important;
        background-size: contain !important;
        background-repeat: no-repeat !important;
        background-position: center !important;
        filter: drop-shadow(0px 10px 5px rgba(0, 0, 0, 0.4));
      }
      .cluster-icon-5 {
        cursor: zoom-in;
        background: url('assets/multi-5.png') !important;
        z-index: 800 !important;
        height: 30px !important;
        width: 30px !important;
        //background: url('~assets/marker-dark.svg') !important;
        background-size: contain !important;
        background-repeat: no-repeat !important;
        background-position: center !important;
        filter: drop-shadow(0px 10px 5px rgba(0, 0, 0, 0.4));
      }
      .cluster-icon-10 {
        cursor: zoom-in;
        background: url('assets/multi-12.png') !important;
        z-index: 800 !important;
        height: 50px !important;
        width: 50px !important;
        //background: url('~assets/marker-dark.svg') !important;
        background-size: contain !important;
        background-repeat: no-repeat !important;
        background-position: center !important;
        filter: drop-shadow(0px 10px 5px rgba(0, 0, 0, 0.4));
      }

      .location-marker-icon {
        &::before {
          position: absolute;
          width: 100%;
          height: 100%;
          content: '';
          background: radial-gradient(
            circle,
            rgb(0, 153, 219) 0%,
            rgba(25, 118, 210, 1) 100%
          );
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.5);
        }
        /*
        width: var(--pulseSize);
        height: var(--pulseSize);
        border-radius: 50%;
        background: var(--blue);
        box-shadow: 0 0 0 var(--blue);
        animation: pulsing 2s infinite;
        transition: all 0.2s;
        pointer-events: none;
        */
        pointer-events: none;
      }

      .location-marker-icon:active {
        transform: scale(1.5);
      }

      @keyframes pulsing {
        from {
          box-shadow: 0 0 0 0 var(--blue);
        }
        70% {
          box-shadow: 0 0 0 var(--pulseSize) var(--transparentBlue);
        }
        to {
          box-shadow: 0 0 0 0 var(--transparentBlue);
        }
      }
    }
  }
}

img.leaflet-tile,
img.leaflet-marker-icon,
img.leaflet-marker-shadow {
  /* work-around from here: https://github.com/Leaflet/Leaflet/issues/161 */
  outline: 1px solid transparent;
  /* work-around from here: https://bugs.chromium.org/p/chromium/issues/detail?id=600120 */
  mix-blend-mode: plus-lighter;
}

.hoverToolTip {
  background: $primary !important;
  border: $secondary !important;
  color: white !important;
  &:before {
    border-top-color: $primary !important;
  }
}
</style>
<style lang="scss" scoped>
@import 'leaflet.markercluster/dist/MarkerCluster.css';
@import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

.map {
  cursor: grab;

  &.disable-interaction {
    pointer-events: none !important;
    cursor: default;
  }
}
/*
/deep/.leaflet-marker-pane:before {
  content: '';
  position: fixed;
  left: 0px;
  top: 0px;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 33%,
      rgba(0, 0, 0, 0.9) 66%
    ),
    linear-gradient(270deg, rgba(0, 0, 0, 0.2) 30%, rgba(0, 0, 0, 0.9) 100%),
    linear-gradient(270deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.2) 30%);
  z-index: 700;
}
*/

.location-button-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;

  .location-button {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    position: absolute;
    right: 22px;
    z-index: 500;
    pointer-events: all;
    cursor: pointer;
    height: 30px;
    width: 30px;
    border-radius: 4px;
    bottom: calc(50vh + 38px);
  }
}

canvas {
  opacity: 1;
  transition: opacity 0.5s;
}

.markers-loading-map-overlay {
  background-color: rgba(0, 0, 0, 0.8);
  position: absolute;
  z-index: 1000;
  height: 100%;
  width: 100%;
}

/*
.marker-cluser-large {

}

.marker-cluser-medium {
}
*/

.marker-cluster-small {
  background: linear-gradient(135deg, #a14ebf 0%, #5fb0b7 100%);
  //background: linear-gradient(135deg,   #ffc299 0%,    #ff99c2 100%);
  //opacity: 0.2
  //background: linear-gradient(135deg, rgba(255,195,98,1) 0%, rgba(233,136,172,1) 100%);
  //background: linear-gradient(135deg, rgba(255,173,41,1) 0%, rgba(232,34,108,1) 100%);
}

.marker-cluster-small div {
  //background: linear-gradient(135deg, rgba(255,195,98,1) 0%, rgba(233,136,172,1) 100%);
  // orange sunset  background: linear-gradient(135deg,   #ffc299 0%,    #ff99c2 100%);
  //opacity: 0.5;
  color: black;
  background: rgba(255, 255, 255, 0.5);
  font-size: 14pt;
  font-weight: bold;
}
.marker-cluster-medium {
  background: linear-gradient(135deg, #af2bbf 0%, #5bc8af 100%);
  //background: linear-gradient(135deg,   #ffc299 0%,    #ff99c2 100%);
  //opacity: 0.2
  //background: linear-gradient(135deg, rgba(255,195,98,1) 0%, rgba(233,136,172,1) 100%);
  //background: linear-gradient(135deg, rgba(255,173,41,1) 0%, rgba(232,34,108,1) 100%);
}

.marker-cluster-medium div {
  background: linear-gradient(135deg, #ffc299 0%, #ff99c2 100%);
  //background: linear-gradient(135deg, rgba(255,195,98,1) 0%, rgba(233,136,172,1) 100%);
  color: black;
  font-size: 14pt;
  font-weight: bold;
}

:deep(.leaflet-top) {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: unset;
  right: 20px;
}
/*
:deep(.leaflet-container) {
  background: linear-gradient(180deg, #404040 0%, #808080 100%);
}
*/

:deep(.leaflet-container-markers-loading) {
  canvas {
    opacity: 0.2;
  }
}
@media only screen and (max-width: 599px) {
  :deep(.leaflet-top) {
    top: unset;
    transform: unset;
    bottom: calc(268px + env(safe-area-inset-bottom));
  }
  .location-button-wrapper {
    .location-button {
      bottom: 344px;
      @supports (
        (top: var(--safe-area-inset-bottom)) and (font: -apple-system-body) and
          (-webkit-appearance: none)
      ) {
        bottom: calc(344px + var(--safe-area-inset-bottom));
      }
    }
  }
}
</style>
