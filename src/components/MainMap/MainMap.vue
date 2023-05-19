<template>
  <div
    style="height: 100%; width: 100%; z-index: 0"
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
        zoom: 2,
        zoomControl: true,
        minZoom: 2,
        maxBounds: L.latLngBounds(
          L.latLng(-89.98155760646617, -Infinity),
          L.latLng(89.99346179538875, Infinity)
        ),
        maxBoundsViscosity: 0.5,
        worldCopyJump: false,
        preferCanvas: true,
      },
      defaultIcon: L.divIcon({
        className: 'marker-icon',
        iconAnchor: [12, 30],
        iconSize: [25, 30],
        tooltipAnchor: [0, -32],
      }),
      focusIcon: L.divIcon({
        className: 'focus-marker-icon',
        iconAnchor: [29, 49],
        iconSize: [60, 60],
        tooltipAnchor: [0, -32],
      }),
      focusIconRed: L.divIcon({
        className: 'focus-marker-icon-red animated flash infinite slower',
        iconAnchor: [12, 30],
        iconSize: [25, 30],
        tooltipAnchor: [0, -32],
      }),
      clusterOptions: {
        chunkedLoading: true,
      },
      map: null,
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
    preventMapZoom: {
      // we need to prevent map zoom for 300ms or so after user uses mousewheel to hide nav panel
      // otherwise it zooms uncontrolably
      handler(newv) {
        if (newv) {
          console.log(this.map);
          this.map.scrollWheelZoom.disable();
        } else {
          this.map.scrollWheelZoom.enable();
        }
      },
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
      },
    },
    route: {
      handler: function (to) {
        if (this.map) {
          if (to.name === 'EventPage') {
            // enter event page
            if (this.mapMarkers && this.map.hasLayer(this.mapMarkers)) {
              this.map.removeLayer(this.mapMarkers);
            }
            if (
              this.eventDateHoverLayer &&
              this.map.hasLayer(this.eventDateHoverLayer)
            ) {
              this.eventDateHoverLayer.clearLayers();
              this.map.removeLayer(this.eventDateHoverLayer);
            }
            // this.eventDateHoverLayer.clearLayers()
          } else if (to.name === 'Explore') {
            // this.setBounds(this.map.getBounds());

            // restore default opacity
            if (this.mapStyle === 'satellite') {
              this.tileLayer.setOpacity(this.satelliteMapOpacity);
            } else if (this.mapStyle === 'transport') {
              this.tileLayer.setOpacity(1);
            } else {
              this.tileLayer.setOpacity(this.monochromeMapOpactiy);
            }

            if (
              this.focusMarkerLayer &&
              this.map.hasLayer(this.focusMarkerLayer)
            ) {
              this.focusMarkerLayer.clearLayers();
              this.map.removeLayer(this.focusMarkerLayer);
            }
            if (
              this.eventDateHoverLayer &&
              this.map.hasLayer(this.eventDateHoverLayer)
            ) {
              this.eventDateHoverLayer.clearLayers();
              this.map.removeLayer(this.eventDateHoverLayer);
            }
            // restore previous map view
            this.$nextTick(() => {
              this.map.invalidateSize();
              if (this.exploreMapView) {
                this.map.setView(
                  this.exploreMapView.latlng,
                  this.exploreMapView.zoom
                );
              }
            });
            // possible performance issue
            if (this.mapMarkers) {
              this.map.addLayer(this.mapMarkers);
            } else {
              this.clearMarkersAndLoadPoints();
            }
          }
        }
      },
    },
    focusMarker: {
      handler: function (newval) {
        if (newval !== null) {
          this.blockUpdates = true;
          // save current map view so we can return to it
          if (newval.lat && newval.lng) {
            /*
            moved to route watcher
            this.previousMapView = {
              latlng: this.map.getCenter(),
              zoom: currentZoom
            }
            */
            var currentZoom = this.map.getZoom();
            this.setMarkerFocusForEventPage(
              newval,
              currentZoom < 4 ? 4 : currentZoom
            );
          }
        }
      },
    },
    eventDateHoverMarker: function (newv) {
      this.eventDateHoverLayer.unbindTooltip();
      this.eventDateHoverLayer.clearLayers();
      if (newv !== null && this.map) {
        var markers = [
          L.marker([newv.lat, newv.lng], {
            icon: this.defaultIcon,
            zIndexOffset: 6000,
          }),
        ];
        this.eventDateHoverLayer = L.featureGroup(markers)
          .bindTooltip(newv.name, { direction: 'top', permanent: true })
          .addTo(this.map);
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
    handleWheel(event) {
      // switch to explore view
      this.showPanel = false;

      if (
        this.sidebarPanel !== 'explore' &&
        this.sidebarPanel !== 'favorites'
      ) {
        this.sidebarPanel = 'explore';
      }
      return false;
    },
    clearMarkersAndLoadPoints() {
      if (this.mapMarkers !== null) {
        this.map?.removeLayer(this.mapMarkers);
        this.mapMarkers.clearLayers();
      }
      if (this.mapMarkersPermanentTooltip !== null) {
        this.map?.removeLayer(this.mapMarkersPermanentTooltip);
        this.mapMarkersPermanentTooltip.clearLayers();
      }
      this.loadPoints();
    },
    fitBoundsForExplorePage(coords) {
      // padding for desktop panel
      var latlng = L.latLng(coords);
      if (this.$q.screen.gt.xs) {
        this.map.fitBounds(L.latLngBounds(latlng, latlng), {
          paddingTopLeft: [0, 276],
          animate: true,
          duration: 0.3,
          easeLinearity: 1,
          maxZoom: 10,
        });
      } else {
        // padding for mobile bottom panel
        this.map.fitBounds(L.latLngBounds(latlng, latlng), {
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
        this.map.invalidateSize();
      }, 1000);
    },
    showEventPageForMarker(data) {
      this.focusMarker = {
        lat: data.lat,
        lng: data.lng,
      };
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
          data: marker.data,
        });
      } else {
        this.showEventPageForMarker(marker.data);
      }
    },
    setBounds(bounds) {
      const bottomPanelHeight = '276';

      var pxSw = this.map.getPixelBounds().getBottomLeft();

      pxSw = pxSw.subtract(L.point(0, bottomPanelHeight)); // add the height of the bottom panel
      var sw = this.map.unproject(pxSw);
      bounds = L.latLngBounds(sw, this.map.getBounds().getNorthEast()); // bounds without the bottom panel

      this.mapBounds = bounds;
      this.mapCenter = bounds;
    },
    setMarkerFocusForEventPage(latlng, zoom) {
      this.eventDateHoverLayer.clearLayers();

      var markers = [
        L.marker(latlng, {
          icon: this.defaultIcon,
          zIndexOffset: 1000,
        }).on('click', this.clickMarker),
      ];

      this.focusMarkerLayer.clearLayers();
      this.focusMarkerLayer = L.featureGroup(markers);
      this.focusMarkerLayer.addTo(this.map);
      // var paddingBottom = this.windowHeight - (this.windowHeight / 2 - 120)
      var mapContainerHeight = this.windowHeight; // minus menubar
      var paddingBottom = this.windowHeight - mapContainerHeight / 3 + 28;
      var paddingRight = 0;

      this.map.fitBounds(this.focusMarkerLayer.getBounds(), {
        paddingBottomRight: [paddingRight, paddingBottom],
        animate: true,
        maxZoom: zoom,
      });
    },
    initMap() {
      this.map = L.map(this.$refs.map, this.mapOptions).setView(
        [53.9, 27.6],
        3
      );
      this.initTileLayers();

      this.map.on('mousedown', () => {
        // switch to explore view
        if (
          this.sidebarPanel !== 'explore' &&
          this.sidebarPanel !== 'favorites'
        ) {
          this.sidebarPanel = 'explore';
        }
        this.showPanel = false;
      });

      this.map.on('movestart', () => {
        this.mapMoving = true;
        this.exploreMapView = {
          latlng: this.map.getCenter(),
          zoom: this.map.getZoom(),
        };
      });

      this.map.on('moveend', (event) => {
        if (!this.blockUpdates) {
          this.exploreMapView = {
            latlng: this.map.getCenter(),
            zoom: this.map.getZoom(),
          };
          this.setBounds(event.target.getBounds());
        }

        this.mapMoving = false;
      });
      this.map.on('zoomstart', () => {
        this.markersLoaded = false;
        // switch to explore view handled by wheel event
      });
      this.map.on('zoomend', (event) => {
        if (event.target.getZoom() > 10) {
          // show markers with tooltips at a certain zoom level
          if (this.mapMarkers && this.map?.hasLayer(this.mapMarkers)) {
            this.map.removeLayer(this.mapMarkers);
            this.map.addLayer(this.mapMarkersPermanentTooltip);
          }
        } else {
          // remove markers with tooltips
          if (
            this.mapMarkersPermanentTooltip &&
            this.map?.hasLayer(this.mapMarkersPermanentTooltip)
          ) {
            this.map.removeLayer(this.mapMarkersPermanentTooltip);
            this.map.addLayer(this.mapMarkers);
          }
        }
        if (!this.blockUpdates) {
          this.exploreMapView = {
            latlng: this.map.getCenter(),
            zoom: this.map.getZoom(),
          };
          this.setBounds(event.target.getBounds());
        }
      });
    },
    initTileLayers() {
      if (this.tileLayer && this.map?.hasLayer(this.tileLayer)) {
        this.map.removeLayer(this.tileLayer);
      }
      if (this.labelLayer && this.map?.hasLayer(this.labelLayer)) {
        this.map.removeLayer(this.labelLayer);
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
      });
      this.tileLayer.setOpacity(opacity);
      this.tileLayer.addTo(this.map);

      if (this.mapStyle === 'satellite') {
        // add additional label layer for satellite map
        this.labelLayer = L.tileLayer(this.labelsMapTileUrl, {
          detectRetina: false,
        });
        this.labelLayer.addTo(this.map);
        this.labelLayer.setOpacity(this.satelliteLabelLayerOpacity);
      }
    },
    initMarkers() {
      this.markersLoaded = false;

      if (this.points.length > 0) {
        // this.map.locate({setView: true, maxZoom: 17});
        // Leaflet.markercluster
        this.mapMarkers = L.markerClusterGroup({ chunkedLoading: true });
        this.mapMarkersPermanentTooltip = L.markerClusterGroup({
          chunkedLoading: true,
        });

        var markers = [];
        var tooltipMarkers = [];
        for (let i = 0; i < this.points.length; i++) {
          var toolTipHtml = '';

          // show list of events for location in toolTip
          // if there are more than one
          var eventIds = [];
          for (let j = 0; j < this.points[i].events.length; j++) {
            if (eventIds.indexOf(this.points[i].events[j].event_id) === -1) {
              eventIds.push(this.points[i].events[j].event_id);
              toolTipHtml = toolTipHtml + this.points[i].events[j].name;
              if (
                this.points[i].events[j + 1] ||
                this.points[i].events[j - 1]
              ) {
                if (j !== this.points[i].events.length - 1) {
                  // not last element
                  // toolTipHtml = toolTipHtml + '<ul>'
                  toolTipHtml = toolTipHtml + '<br/>';
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
            icon: this.defaultIcon,
          }).bindTooltip(toolTipHtml, { direction: 'top' });
          marker.on('click', this.clickMarker);
          marker.data = this.points[i];
          markers.push(marker);

          let tooltipMarker = L.marker(
            [this.points[i].lat, this.points[i].lng],
            {
              icon: this.defaultIcon,
            }
          ).bindTooltip(toolTipHtml, { direction: 'top', permanent: true });
          tooltipMarker.on('click', this.clickMarker);
          tooltipMarker.data = this.points[i];
          tooltipMarkers.push(tooltipMarker);
        }
        this.mapMarkers.addLayers(markers);
        this.mapMarkersPermanentTooltip.addLayers(tooltipMarkers);
        this.markersLoaded = true;
        this.map.addLayer(this.mapMarkers);
      }
    },
  },
  computed: {
    ...mapState(useMapStore, [
      'currentMapTileAttribution',
      'currentMapTileUrl',
      'labelsMapTileUrl',
    ]),
    ...mapWritableState(useMapStore, [
      'mapBounds',
      'mapCenter',
      'exploreMapView',
      'focusMarker',
      'eventDateHoverMarker',
      'mapMoving',
      'blockUpdates',
      'preventMapZoom',
      'mapStyle',
    ]),
    ...mapWritableState(useMainStore, [
      'userLocation',
      'sidebarPanel',
      'showPanel',
    ]),
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
      'points',
    ]),

    addingEvent() {
      return this.$route.path === '/add';
    },
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
</style>
<style lang="scss" scoped>
@import 'leaflet.markercluster/dist/MarkerCluster.css';
@import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

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
    bottom: 348px;
  }
}
</style>
