<template>
  <div
    style="height: 100%; width: 100%; z-index: 0; position: absolute"
    :class="{
      'satellite-enabled': mapStyle === 'satellite',
    }"
  >
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
          [
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
      satelliteLabelLayerOpacity: 0.48,
      monochromeMapOpactiy: 0.68,
      windowHeight: 0,
      clientHeight: 0,
      windowWidth: 0,
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
      if (
        (newv === 'explore' && oldv === 'nearby') ||
        (newv === 'nearby' && oldv === 'explore')
      ) {
        if (this.nearbyEventsDates?.length > 0) {
          //this.setMapBoundsNearby();
        }
        if (
          this.userLocation?.lat &&
          !this.userLocationFromSearch &&
          this.$q.screen.gt.xs &&
          newv === 'nearby'
        )
          // go to users location
          this.fitBoundsForExplorePage(this.userLocation);
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
    userLocation: {
      handler: function (newval) {
        this.fitBoundsForExplorePage(newval);
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
              toRaw(this.map).hasLayer(toRaw(this.mapMarkers))
            ) {
              toRaw(this.mapMarkers).remove();
            }
            if (
              this.eventDateHoverLayer &&
              toRaw(this.map).hasLayer(toRaw(this.eventDateHoverLayer))
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
            //

            // restore previous map view
            if (this.exploreMapView) {
              toRaw(this.map).setView(
                this.exploreMapView.latlng,
                this.exploreMapView.zoom
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
              toRaw(this.map).hasLayer(toRaw(this.focusMarkerLayer))
            ) {
              this.focusMarkerLayer.clearLayers();
              this.focusMarkerLayer.remove();
            }
            if (
              this.eventDateHoverLayer &&
              toRaw(this.map).hasLayer(toRaw(this.eventDateHoverLayer))
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
    ...mapActions(useQueryStore, ['loadPoints']),
    ...mapActions(useNearbyStore, ['setMapBoundsNearby']),
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
      this.loadPoints();
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
          animate: true,
          duration: 0.3,
          easeLinearity: 1,
          maxZoom: 10,
        });
      } else {
        toRaw(this.map).fitBounds(bounds, {
          paddingBottomRight: [paddingRight, paddingBottom],
          animate: true,
          maxZoom: zoom,
        });
      }
    },

    fitBoundsForExplorePage(coords) {
      // padding for desktop panel
      var latlng = L.latLng(coords);
      if (this.$q.screen.gt.xs) {
        if (this.sidebarExpanded) {
          // padding for sidebar
          toRaw(this.map).fitBounds(L.latLngBounds(latlng, latlng), {
            paddingTopLeft: [1000, 0],
            animate: true,
            duration: 0.3,
            easeLinearity: 1,
            maxZoom: 10,
          });
        } else {
          toRaw(this.map).fitBounds(L.latLngBounds(latlng, latlng), {
            paddingTopLeft: [580, 0],
            animate: true,
            duration: 0.3,
            easeLinearity: 1,
            maxZoom: 10,
          });
        }
      } else {
        // padding for mobile bottom panel
        toRaw(this.map).fitBounds(L.latLngBounds(latlng, latlng), {
          paddingTopLeft: [0, -150],
          animate: true,
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
      if (this.$q.screen.gt.xs) {
        var pxSw = this.map.getPixelBounds().getBottomLeft();

        // Get the width of the overlapping sidebar if on desktop
        // so that the bounds exclude the sidebar
        var $cover = document.getElementById('sidebar');
        var deltaX = $cover.getBoundingClientRect().width;
        var pxSw = this.map.getPixelBounds().getBottomLeft();
        pxSw = pxSw.add(L.point(deltaX, 0)); // add the width of the sidebar
        var sw = this.map.unproject(pxSw);
        bounds = L.latLngBounds(sw, this.map.getBounds().getNorthEast()); // bounds without the sidebar
      } else {
        // padding for mobile bottom panel
        var pxSw = this.map.getPixelBounds().getBottomLeft();

        const bottomPanelHeight = '276';
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
        3
      );
      this.initTileLayers();
      toRaw(this.map).on('click', () => {
        if (this.$route.name === 'EventPage') {
          //this.peekMap = false;
          if (!this.peekMap) {
            this.goBack();
          } else {
            this.peekMap = false;
          }
        }
      });

      toRaw(this.map).on('mousedown', () => {
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
      });

      toRaw(this.map).on('movestart', () => {
        /*
        this.exploreMapView = {
          latlng: this.map.getCenter(),
          zoom: this.map.getZoom(),
        };
        */
        this.mapMoving = true;
      });

      toRaw(this.map).on('moveend', (event) => {
        if (!this.blockUpdates) {
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
        this.mapMarkers = L.markerClusterGroup({ chunkedLoading: true });

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
        toRaw(this.mapMarkers).addLayers(tooltipMarkers);
        //toRaw(this.mapMarkersPermanentTooltip).addLayers(tooltipMarkers);

        this.markersLoaded = true;
        toRaw(this.map).addLayer(toRaw(this.mapMarkers));
        //toRaw(this.map).addLayer(toRaw(this.mapMarkersPermanentTooltip));
        //this.mapMarkers.addTo(toRaw(this.map));
      }
    },
  },
  computed: {
    ...mapState(useMapStore, [
      'currentMapTileAttribution',
      'currentMapTileUrl',
      'labelsMapTileUrl',
      'defaultIcon',
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
      'userLocationFromSearch',
      'userLocation',
      'sidebarPanel',
      'showPanel',
      'darkMode',
      'sidebarExpanded',
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
  .map {
    background: white;
    .leaflet-map-pane {
      .leaflet-marker-pane {
        .marker-icon {
          background: url('assets/marker-light-filled.png') !important;
          z-index: 800 !important;
          height: 30px !important;
          width: 30px !important;
          //background: url('~assets/marker-dark.svg') !important;
          background-size: contain !important;
          background-repeat: no-repeat !important;
          background-position: center !important;
          filter: drop-shadow(0px 10px 5px rgba(0, 0, 0, 0.2));
        }
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
          .marker-icon {
            background: url('assets/marker-dark-filled.png') !important;
            z-index: 800 !important;
            height: 30px !important;
            width: 30px !important;
            //background: url('~assets/marker-dark.svg') !important;
            background-size: contain !important;
            background-repeat: no-repeat !important;
            background-position: center !important;
            filter: drop-shadow(0px 10px 5px rgba(0, 0, 0, 0.2));
          }
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
@media only screen and (max-width: 600px) {
  :deep(.leaflet-top) {
    top: unset;
    transform: unset;
    bottom: calc(268px + env(safe-area-inset-bottom));
  }
}
</style>
