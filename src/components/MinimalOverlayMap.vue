<template>
  <div class="minimal-map" v-show="enablePanelSwipeDown">
    <div class="minimal-map-overlay" />
    <div ref="map" style="height: 100%; z-index: 0" class="map" />
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { toRaw } from 'vue';
import { useMapStore } from 'stores/map.ts';
import { useMainStore } from 'stores/main.ts';

import _ from 'lodash';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet.tilelayer.colorfilter';

export default {
  components: {},
  props: [],
  data() {
    return {
      markersLoaded: false,
      zoom: 1,
      focusMarkerLayer: L.featureGroup(),
      eventDateHoverLayer: L.featureGroup(),
      withPopup: L.latLng(47.41322, -1.219482),
      withTooltip: L.latLng(47.41422, -1.250482),
      currentZoom: 11.5,
      mapOptions: {
        zoom: 1,
        zoomControl: false,
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
      map: null, // when accessing this.map, we need to use toRaw() to avoid vue3 proxy which causes issues ()
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
    this.debouncedInvalidateMapSize = _.debounce(this.invalidateMapSize, 500, {
      leading: false,
      trailing: true,
    });
  },

  watch: {
    darkMode() {
      this.initTileLayers();
    },
    windowHeight() {
      this.invalidateMapSize();
    },
    userLocation: {
      deep: true,
      handler: function (newval) {
        this.fitBoundsForExplorePage(newval);
      },
    },
  },

  methods: {
    fitBoundsForExplorePage(coords) {
      // padding for desktop panel
      var latlng = L.latLng(coords);
      if (this.$q.screen.gt.xs) {
        this.map.fitBounds(L.latLngBounds(latlng, latlng), {
          paddingTopLeft: [512, 0],
          animate: false,
          maxZoom: 14,
        });
      } else {
        // padding for mobile bottom panel
        this.map.fitBounds(L.latLngBounds(latlng, latlng), {
          paddingTopLeft: [0, 0],
          animate: false,
          maxZoom: 13,
        });
      }
    },
    invalidateMapSize() {
      setTimeout(() => {
        this.map.invalidateSize();
      }, 1000);
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
    initMap() {
      this.map = L.map(this.$refs.map, this.mapOptions);
      if (this.userLocation?.lat && this.userLocation?.lng)
        this.fitBoundsForExplorePage(this.userLocation);

      this.initTileLayers();
    },
    initTileLayers() {
      if (this.tileLayer && this.map?.hasLayer(toRaw(this.tileLayer))) {
        this.map.removeLayer(toRaw(this.tileLayer));
      }

      let opacity = 1;

      let filter = [];
      if (this.$q.dark.isActive) {
        filter = ['saturate:150%', 'brightness:100%'];
      }

      this.tileLayer = L.tileLayer(this.labelsMapTileUrl, {
        attribution: this.labelsMapTileAttribution,
        detectRetina: false,
        filter,
        updateWhenZooming: false,
        bounds: [
          [-90, -180],
          [90, 180],
        ],
      });
      this.tileLayer.setOpacity(opacity);
      this.tileLayer.addTo(toRaw(this.map));
    },
  },
  computed: {
    ...mapState(useMapStore, [
      'currentMapTileAttribution',
      'tonerMapTileUrl',
      'labelsMapTileUrl',
      'labelsMapTileAttribution',
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
    ...mapState(useMainStore, [
      'userLocation',
      'sidebarPanel',
      'showPanel',
      'darkMode',
      'enablePanelSwipeDown',
    ]),
  },
  mounted() {
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

<style lang="scss" scoped>
.body--dark {
  .minimal-map {
    .minimal-map-overlay {
      background: linear-gradient(transparent, transparent 50%, black);
    }
    .map {
      opacity: 0.15;
    }
  }
}

.body--light {
  .minimal-map {
    .minimal-map-overlay {
      background: linear-gradient(transparent, transparent 50%, white);
    }
    .map {
      filter: invert(1);
      opacity: 0.1;
      background: black;
    }
  }
}
.minimal-map {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 232px;
  z-index: 103;
  display: flex;
  justify-content: center;
  .minimal-map-overlay {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0px;
    top: 0px;
    z-index: 104;
  }
  .map {
    width: 66vw;
    pointer-events: none !important;
    cursor: default;
  }
}

@media only screen and (min-width: 1024px) {
  .map {
    max-width: 1024px;
    min-width: 920px;
  }
}

@media only screen and (min-width: 1921px) {
  .map {
    max-width: 1280px;
  }
}
@media only screen and (max-width: 1024px) {
  .map {
    width: 100%;
    max-width: unset;
  }
}
</style>
