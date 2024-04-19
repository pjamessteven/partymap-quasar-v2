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
//import L from 'leaflet';
//import { PIXI } from 'pixi.js';
import * as L from 'leaflet';
import * as PIXI from 'pixi.js';

import * as d3 from 'd3';
import 'leaflet-pixi-overlay';
//import 'leaflet-pixi-overlay';
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
      pixiContainer: null,
      pixiOverlay: null,
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
    peekMap() {
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
        //this.initPixiOverlay();
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
        toRaw(this.map).hasLayer(toRaw(this.userLocationMarkerLayer))
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
        this.fitBoundsForExplorePage(this.userLocation);
      } catch (e) {
        this.fitBoundsForExplorePage(this.userLocation);
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

    fitBoundsForExplorePage(coords) {
      // padding for desktop panel
      var latlng = L.latLng(coords);
      if (this.$q.screen.gt.xs) {
        if (this.sidebarExpanded) {
          // padding for sidebar
          toRaw(this.map).fitBounds(L.latLngBounds(latlng, latlng), {
            paddingTopLeft: [1000, 0],
            animate: !this.disableAnimations,
            duration: 0.3,
            easeLinearity: 1,
            maxZoom: 10,
          });
        } else {
          toRaw(this.map).fitBounds(L.latLngBounds(latlng, latlng), {
            paddingTopLeft: [580, 0],
            animate: !this.disableAnimations,
            duration: 0.3,
            easeLinearity: 1,
            maxZoom: 10,
          });
        }
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
    setMarkerFocusForEventPage(latlng) {
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

          //  this.setMarkerFocusForEventPage(newval);
        }
      }
      this.initTileLayers();
      // add location marker for fine location
      if (!this.userLocationFromSearch && this.fineLocation) {
        this.addUserLocationMarker(this.userLocation);
      }
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
        this.mapMoving = true;
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
    solveCollision: (t, e) => {
      e = e || {};
      var r = d3
          .quadtree()
          .x(function (t) {
            return t.xp;
          })
          .y(function (t) {
            return t.yp;
          }),
        m = (void 0 !== e.extent && r.extent(e.extent), 0),
        n =
          (t.forEach(function (t) {
            (t.xp = t.x0),
              (t.yp = t.y0),
              void 0 !== e.r0 && (t.r0 = e.r0),
              (t.r = t.r0),
              (t.xMin = t.x0 - t.r0),
              (t.xMax = t.x0 + t.r0),
              (t.yMin = t.y0 - t.r0),
              (t.yMax = t.y0 + t.r0);
            var d,
              y = [];
            r.visit(
              ((d = t),
              function (t, n, e, r, i) {
                if (!t.length)
                  for (
                    ;
                    d.xMax > t.data.xMin &&
                      d.xMin < t.data.xMax &&
                      d.yMax > t.data.yMin &&
                      d.yMin < t.data.yMax &&
                      ((o = t.data),
                      (p = f = p = f = h = c = l = s = u = a = void 0),
                      (f = d.xp - o.xp),
                      (p = d.yp - o.yp),
                      (f = f * f + p * p),
                      (p = d.r + o.r),
                      f < p * p) &&
                      ((p = { r: o.r, xp: o.xp, yp: o.yp, from: o }),
                      y.push(p),
                      (o = Math.sqrt(f)),
                      (p = d.r < p.r ? ((a = p), d) : ((a = d), p)),
                      (c = ((s = a.r) + (l = p.r) + o) / 4),
                      (f =
                        0 < f
                          ? ((h = (p.xp - a.xp) / o), (p.yp - a.yp) / o)
                          : ((f = 2 * Math.PI * Math.random()),
                            (h = Math.cos(f)),
                            Math.sin(f))),
                      (c =
                        c <= l
                          ? ((u = c / s), c / l)
                          : ((u = (s - l + o) / (2 * s)), 1)),
                      (a.r *= u),
                      (p.r *= c),
                      (a.xp += (u - 1) * s * h),
                      (a.yp += (u - 1) * s * f),
                      (p.xp += (1 - c) * l * h),
                      (p.yp += (1 - c) * l * f),
                      (a.xMin = a.xp - a.r),
                      (a.xMax = a.xp + a.r),
                      (a.yMin = a.yp - a.r),
                      (a.yMax = a.yp + a.r),
                      (p.xMin = p.xp - p.r),
                      (p.xMax = p.xp + p.r),
                      (p.yMin = p.yp - p.r),
                      (p.yMax = p.yp + p.r)),
                      (t = t.next);

                  );
                var o, a, u, s, l, c, h, f, p;
                return (
                  n > d.xMax + m ||
                  r + m < d.xMin ||
                  e > d.yMax + m ||
                  i + m < d.yMin
                );
              })
            ),
              (m = Math.max(m, t.r)),
              r.removeAll(
                y.map(function (t) {
                  return t.from;
                })
              );
            var n = y.map(function (t) {
              var n = t.from;
              return (
                (n.xp = t.xp),
                (n.yp = t.yp),
                (n.r = t.r),
                (n.xMin = t.xMin),
                (n.xMax = t.xMax),
                (n.yMin = t.yMin),
                (n.yMax = t.yMax),
                n
              );
            });
            n.push(t), r.addAll(n);
          }),
          void 0 !== e.zoom &&
            t.forEach(function (t) {
              (t.cache = t.cache || {}),
                (t.cache[e.zoom] = { x: t.xp, y: t.yp, r: t.r });
            }),
          0);
      return (
        t.forEach(function (t) {
          n = Math.max(n, t.r);
        }),
        (r.rMax = n),
        r
      );
    },
    async initPixiOverlay() {
      this.$nextTick(async () => {
        let firstDraw = true;
        let prevZoom;
        const Assets = PIXI.Assets;
        const textures = [
          await Assets.load('/src/assets/marker-dark-filled.png'),
        ];
        const markerSprites = [];
        let colorScale = d3
          .scaleLinear()
          .domain([0, 50, 100])
          .range(['#c6233c', '#ffd300', '#008000']);
        let frame = null;
        let focus = null;
        this.pixiContainer = new PIXI.Container();
        const doubleBuffering =
          /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        this.pixiOverlay = L.pixiOverlay(
          (utils) => {
            const zoom = utils.getMap().getZoom();
            if (frame) {
              cancelAnimationFrame(frame);
              frame = null;
            }
            const container = utils.getContainer();
            const renderer = utils.getRenderer();
            const project = utils.latLngToLayerPoint;
            const scale = utils.getScale();
            const invScale = 1 / scale;
            if (firstDraw) {
              prevZoom = zoom;
              this.points.forEach((point) => {
                // calculate label text
                var toolTipHtml = '';
                var toolTipString = '';
                // show list of events for location in toolTip
                // if there are more than one
                var eventIds = [];
                for (let j = 0; j < point.events.length; j++) {
                  if (eventIds.indexOf(point.events[j].event_id) === -1) {
                    eventIds.push(point.events[j].event_id);
                    toolTipHtml = toolTipHtml + point.events[j].name;
                    toolTipString = toolTipString + point.events[j].name;
                    if (point.events[j + 1] || point.events[j - 1]) {
                      if (j !== point.events.length - 1) {
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

                const coords = project([point.lat, point.lng]);
                const index = Math.floor(Math.random() * textures.length);
                const markerSprite = new PIXI.Sprite(textures[index]);
                markerSprite.textureIndex = index;
                markerSprite.x0 = coords.x;
                markerSprite.y0 = coords.y;
                markerSprite.anchor.set(0.5, 1);

                const tint = d3
                  .color(
                    colorScale(markerSprite.avancement || Math.random() * 100)
                  )
                  .rgb();

                // markerSprite.tint = 256 * (tint.r * 256 + tint.g) + tint.b;
                container.addChild(markerSprite);
                markerSprites.push(markerSprite);
                markerSprite.legend = toolTipString;
                //markerSprite.scale.x = scale - 0.2;
              });
              const quadTrees = {};
              for (
                let z = toRaw(this.map).getMinZoom();
                z <= toRaw(this.map).getMaxZoom();
                z++
              ) {
                const rInit = (z <= 7 ? 16 : 24) / utils.getScale(z);
                quadTrees[z] = this.solveCollision(markerSprites, {
                  r0: rInit,
                  zoom: z,
                });
              }
              const findMarker = (ll) => {
                const layerPoint = project(ll);
                const quadTree = quadTrees[utils.getMap().getZoom()];
                let marker;
                const rMax = quadTree.rMax;
                let found = false;
                quadTree.visit((quad, x1, y1, x2, y2) => {
                  if (!quad.length) {
                    var dx = quad.data.x - layerPoint.x;
                    var dy = quad.data.y - layerPoint.y;
                    var r = quad.data.scale.x * 16;
                    if (dx * dx + dy * dy <= r * r) {
                      marker = quad.data;
                      found = true;
                    }
                  }
                  return (
                    found ||
                    x1 > layerPoint.x + rMax ||
                    x2 + rMax < layerPoint.x ||
                    y1 > layerPoint.y + rMax ||
                    y2 + rMax < layerPoint.y
                  );
                });
                return marker;
              };
              toRaw(this.map).on('click', (e) => {
                let redraw = false;
                if (focus) {
                  focus.texture = textures[focus.textureIndex];
                  focus = null;
                  L.DomUtil.addClass(legend, 'hide');
                  legendContent.innerHTML = '';
                  redraw = true;
                }
                const marker = findMarker(e.latlng);
                if (marker) {
                  marker.texture = focusTextures[marker.textureIndex];
                  focus = marker;
                  legendContent.innerHTML = marker.legend;
                  L.DomUtil.removeClass(legend, 'hide');
                  redraw = true;
                }
                if (redraw) utils.getRenderer().render(container);
              });
              /*
            const self = toRaw(this.map);
            toRaw(this.map).on(
              'mousemove',
              L.Util.throttle((e) => {
                const marker = findMarker(e.latlng);
                if (marker) {
                  L.DomUtil.addClass(self._container, 'leaflet-interactive');
                } else {
                  L.DomUtil.removeClass(self._container, 'leaflet-interactive');
                }
              }, 32)
            );              */
            }
            if (firstDraw || prevZoom !== zoom) {
              markerSprites.forEach((markerSprite) => {
                const position = markerSprite.cache[zoom];
                if (firstDraw) {
                  markerSprite.x = position.x;
                  markerSprite.y = position.y;
                  markerSprite.currentScale = markerSprite.scale.x;
                  markerSprite.targetScale =
                    zoom > 5 ? 0.12 / scale : 0.07 / scale;
                } else {
                  markerSprite.currentX = markerSprite.x;
                  markerSprite.currentY = markerSprite.y;
                  markerSprite.targetX = position.x;
                  markerSprite.targetY = position.y;
                  markerSprite.currentScale = markerSprite.scale.x;
                  markerSprite.targetScale =
                    zoom > 5 ? 0.12 / scale : 0.07 / scale;
                }
              });
            }

            let start = null;
            const delta = 300;
            const animate = (timestamp) => {
              let progress;
              if (start === null) start = timestamp;
              progress = timestamp - start;
              let lambda = progress / delta;
              if (lambda > 1) lambda = 1;
              lambda = lambda * (0.4 + lambda * (2.2 + lambda * -1.6));
              markerSprites.forEach((markerSprite) => {
                markerSprite.x =
                  markerSprite.currentX +
                  lambda * (markerSprite.targetX - markerSprite.currentX);
                markerSprite.y =
                  markerSprite.currentY +
                  lambda * (markerSprite.targetY - markerSprite.currentY);
                markerSprite.scale.set(
                  markerSprite.currentScale +
                    lambda *
                      (markerSprite.targetScale - markerSprite.currentScale)
                );
              });
              renderer.render(container);
              if (progress < delta) {
                frame = requestAnimationFrame(animate);
              }
            };
            if (!firstDraw && prevZoom !== zoom) {
              frame = requestAnimationFrame(animate);
            }
            firstDraw = false;
            prevZoom = zoom;
            renderer.render(container);
          },
          toRaw(this.pixiContainer),
          {
            doubleBuffering: doubleBuffering,
            destroyInteractionManager: true,
          }
        );

        toRaw(this.pixiOverlay).addTo(toRaw(this.map));
      });
    },
    initMarkers() {
      this.markersLoaded = false;

      if (this.points.length > 0) {
        // this.map.locate({setView: true, maxZoom: 17});
        // Leaflet.markercluster
        this.mapMarkers = L.layerGroup();

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
            permanent: false,
            interactive: true,
          });

          marker.on('click', this.clickMarker);
          marker.data = this.points[i];
          tooltipMarkers.push(marker);
          toRaw(this.mapMarkers).addLayer(marker);
        }
        //toRaw(this.mapMarkers).addLayers(tooltipMarkers);
        //toRaw(this.mapMarkersPermanentTooltip).addLayers(tooltipMarkers);

        this.markersLoaded = true;
        toRaw(this.map).addLayer(toRaw(this.mapMarkers));
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
      'userLocationFromSearch',
      'userLocation',
      'fineLocation',
      'sidebarPanel',
      'showPanel',
      'sidebarExpanded',
      'disableAnimations',
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
  .location-button-wrapper {
    .location-button {
      background: white;
      border-radius: 4px;
      outline: 2px solid rgba(0, 0, 0, 0.2) !important;
    }
  }
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

:root {
  --pulseSize: 28px;
  --blue: rgba(95, 139, 250, 0.65);
  --transparentBlue: rgba(95, 139, 250, 0);
}
.map {
  .leaflet-map-pane {
    .leaflet-marker-pane {
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
