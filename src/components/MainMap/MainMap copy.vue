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

<script setup>
import { mapWritableState, mapState, mapActions } from 'pinia';
import { shallowRef } from 'vue';
import { useMapStore } from 'stores/map.ts';
import { useMainStore } from 'stores/main.ts';
import { useQueryStore } from 'src/stores/query';
import { useQuasar } from 'quasar';

import _ from 'lodash';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster';
import 'leaflet.tilelayer.colorfilter';
//import '../../../node_modules/leaflet.tilelayer.colorfilter/src/leaflet-tilelayer-colorfilter.js';

import { shallowRef, onMounted } from 'vue';

import EventSelectionComponent from './EventSelectionComponent.vue';

const $q = useQuasar();

const mainStore = useMainStore();
const mapStore = useMapStore();
const queryStore = useQueryStore();

const map = shallowRef();
const tileLayer = shallowRef();
const labelLayer = shallowRef();

const satelliteMapOpacity = 1;
const monochromeMapOpactiy = 0.68;

const initMap = () => {
  map.value = L.map(this.$refs.map, mapOptions).setView([53.9, 27.6], 3);

  map.value.on('mousedown', () => {
    // switch to explore view
    if (this.sidebarPanel !== 'explore' && this.sidebarPanel !== 'favorites') {
      this.sidebarPanel = 'explore';
    }
    this.showPanel = false;
  });

  map.value.on('movestart', () => {
    mapMoving = true;
  });

  map.value.on('moveend', (event) => {
    if (!this.blockUpdates) {
      this.setBounds(event.target.getBounds());
    }

    mapMoving = false;
  });
  map.value.on('zoomstart', () => {
    this.markersLoaded = false;
    // switch to explore view handled by wheel event
  });
  map.value.on('zoomend', (event) => {
    /*
        if (event.target.getZoom() > 10) {
          // show markers with tooltips at a certain zoom level
          mapMarkers.remove();
          mapMarkersPermanentTooltip.addTo(toRaw(map));
        } else {
          // remove markers with tooltips
          mapMarkersPermanentTooltip.remove();
          mapMarkers.addTo(toRaw(map));
        }
        */
    if (!this.blockUpdates) {
      this.setBounds(event.target.getBounds());
    }
  });
  initTileLayers();
};

const initTileLayers = () => {
  if (tileLayer.value && map.value?.hasLayer(tileLayer.value)) {
    map.value.removeLayer(tileLayer.value);
  }
  if (labelLayer.value && map.value?.hasLayer(labelLayer.value)) {
    map.value.removeLayer(labelLayer.value);
  }

  // style specific parameters
  const detectRetina = mapStyle === 'satellite';

  let opacity = 1;
  if (mapStyle === 'satellite') opacity = satelliteMapOpacity;
  if (mapStyle === 'toner') opacity = monochromeMapOpactiy;

  let filter = [];
  if (mapStyle === 'transport' && this.$q.dark.isActive) {
    filter = ['saturate:150%', 'brightness:100%'];
  }

  tileLayer.value = L.tileLayer(this.currentMapTileUrl, {
    attribution: this.currentMapTileAttribution,
    detectRetina,
    filter,
    updateWhenZooming: false,
    bounds: [
      [-90, -180],
      [90, 180],
    ],
  });
  tileLayer.value.setOpacity(opacity);
  tileLayer.value.addTo(map.value);

  if (mapStyle === 'satellite') {
    // add additional label layer for satellite map
    this.labelLayer = L.tileLayer(this.labelsMapTileUrl, {
      detectRetina: false,
      updateWhenZooming: false,
      bounds: [
        [-90, -180],
        [90, 180],
      ],
    });
    this.labelLayer.addTo(toRaw(map));
    this.labelLayer.setOpacity(this.satelliteLabelLayerOpacity);
  }
};

onMounted(() => {
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
});
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
    bottom: 268px;
  }
}
</style>
