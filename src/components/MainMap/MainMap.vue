<template>
  <div
    class="main-map"
    :class="{
      'nearby-map-overlay-mobile': mainStore.sidebarPanel === 'nearby',
      'map-overlay-mobile-minimized': mainStore.sidebarMinimized,
    }"
  >
    <UseDevicePixelRatio v-slot="{ pixelRatio: { pixelRatio } }">
      <mgl-map
        :pixel-ratio="pixelRatio"
        :map-style="style"
        :trackResize="true"
        @map:movestart="movestart"
        @map:moveend="moveend"
        @map:click="mapClick"
        @map:move="moving"
        @map:load="mapLoaded"
        hash="state"
      >
        <mgl-raster-source
          :tile-size="pixelRatio >= 1.5 ? 128 : 168"
          source-id="satellite"
          :tiles="[mapStore.satelliteMapTileUrl]"
        >
          <mgl-raster-layer layer-id="satellite" />
        </mgl-raster-source>
        <mgl-navigation-control :position="'bottom-right'" />
        <mgl-geo-json-source
          v-show="showPoints"
          source-id="points"
          :data="mappedPoints"
          :cluster="true"
        >
          <!-- Clustered points -->
          <mgl-circle-layer
            layer-id="clusters"
            :filter="['has', 'point_count']"
            :paint="clusterPaint"
          />

          <!-- Cluster count labels -->
          <mgl-symbol-layer
            layer-id="cluster-count"
            :filter="['has', 'point_count']"
            :layout="clusterCountLayout"
            :paint="clusterCountPaint"
          />

          <!-- Unclustered points -->
          <mgl-circle-layer
            layer-id="unclustered-point"
            :filter="['!', ['has', 'point_count']]"
            :paint="unclusteredPointPaint"
            @click="onClickPoint"
            @mouseenter="onMouseOverPoint"
            @mouseleave="mouseOverPoint = null"
          />
        </mgl-geo-json-source>
      </mgl-map>
    </UseDevicePixelRatio>
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div class="markers-loading-overlay" v-if="loadingPoints"></div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useMapStore } from 'stores/map';
import { useMainStore } from 'stores/main';
import { useQueryStore } from 'src/stores/query';
import { UseDevicePixelRatio } from '@vueuse/components';
import {
  MglMap,
  MglNavigationControl,
  MglRasterSource,
  MglRasterLayer,
  MglGeoJsonSource,
  MglCircleLayer,
  MglSymbolLayer,
  useMap,
} from '@indoorequal/vue-maplibre-gl';
import style from './style.json';
import { onMounted, watch, nextTick, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { debounce } from 'lodash';
import {
  LngLat,
  LngLatBounds,
  LngLatLike,
  Map,
  MapLayerMouseEvent,
  Padding,
  PaddingOptions,
} from 'maplibre-gl';
import { storeToRefs } from 'pinia';
import { Dialog, Screen } from 'quasar';
//import markerDarkFilled from 'assets/marker-dark-filled.png';
import EventSelectionComponent from './EventSelectionComponent.vue';

const mapStore = useMapStore();

const { blockUpdates, peekMap, focusMarker } = storeToRefs(mapStore);

const $route = useRoute();
const $router = useRouter();

const showPoints = ref(true);

const mainStore = useMainStore();

const queryStore = useQueryStore();

const blockPeekMap = ref(false);

const mouseOverPointEvents = ref(null);

const {
  points,
  loadingPoints,
  topTagsInArea,
  topArtistsInArea,
  controlDateRange,
  controlDuration,
  controlSize,
  controlArtist,
  controlTag,
  controlEmptyLineup,
  controlDateUnconfirmed,
} = storeToRefs(queryStore);

const map = useMap();

const delayedRouteName = ref();

const mappedPoints = computed(() => ({
  type: 'FeatureCollection',
  features: points.value.map((x) => ({
    type: 'Feature',
    properties: x,
    geometry: {
      type: 'Point',
      coordinates: [x.lng, x.lat], // geojson [lng, lat] format.. wtf.
    },
  })),
}));

onMounted(async () => {
  if ($route.name === 'Explore') {
    queryStore.loadPoints();
  }
  const imageCat = new Image();
  //imageCat.src = markerDarkFilled;
  console.log(imageCat);
  if (map.map) {
    const image = await map.map.loadImage('/src/assets/marker-dark-filled.png');
    map.map?.addImage('marker-dark', image.data, {
      pixelRatio: 5,
      content: [16, 16, 50, 50], // place text over left half of image, avoiding the 16px border
    });
    mapStore.map = map.map;
  }
});

watch(
  () => $route.name,
  (to: string, from: string) => {
    setTimeout(() => {
      delayedRouteName.value = to;
    }, 500);
    if (from === 'EventPage') {
      mapStore.peekMap = false;
    }
    // load points on route change if not loaded
    if (to === 'Explore') {
      if (from !== 'EventPage') {
        // if we're coming from eventpage, blockupdates is disabled
        // on map:moveend
        blockUpdates.value = false;
      }

      if (!points.value || points.value.length === 0) {
        queryStore.loadPoints();
      }
    }
  }
);

watch(
  () => mainStore.userLocation,
  (newv: LngLatLike | null) => {
    if (mainStore.sidebarPanel === 'nearby' && newv) {
      blockUpdates.value = true;
      flyTo({
        center: newv,
        padding: getNearbyPagePadding(),
      });
    }
  }
);

watch(
  () => mainStore.sidebarPanel,
  (newv: string, oldv: string) => {
    if (mainStore.userLocation && newv === 'nearby') {
      blockUpdates.value = true;
      flyTo({
        center: mainStore.userLocation,
        padding: getNearbyPagePadding(),
      });
      if (Screen.lt.sm) {
        showPoints.value = false;
      }
    }
    if (newv === 'explore') {
      showPoints.value = true;
      blockUpdates.value = false;
      if (oldv === 'nearby' && mainStore.userLocation && Screen.lt.sm) {
        flyTo({ center: mainStore.userLocation });
      }
    }
  }
);

watch(
  [
    controlDateRange,
    controlDuration,
    controlSize,
    controlArtist,
    controlTag,
    controlEmptyLineup,
    controlDateUnconfirmed,
  ],
  () => {
    debouncedClearMarkersAndLoadPoints();
  },
  { deep: true }
);

const movestart = () => {
  if (!blockUpdates.value) {
    mapStore.mapMoving = true;
    mainStore.sidebarPanel = 'explore';
    topTagsInArea.value = [];
    topArtistsInArea.value = [];
  }
  if (!peekMap.value && !blockPeekMap.value) {
    setTimeout(() => {
      if (
        delayedRouteName.value == 'EventPage' &&
        $route.name === 'EventPage'
      ) {
        peekMap.value = true;
      }
    }, 300);
  }
};

const moving = (event) => {
  if (!blockUpdates.value) {
    mainStore.userLocationLoading = false;
  }
};

const mapLoaded = (event) => {
  if (mainStore.sidebarPanel === 'explore' && Screen.gt.xs) {
    debouncedReverseGeocode(map.map?.getCenter(), map.map?.getZoom());
  }
  mapStateToStore();
};

const debouncedClearMarkersAndLoadPoints = debounce(
  async () => {
    points.value = [];
    queryStore.loadPoints();
  },
  300,
  { leading: false, trailing: true }
);

const debouncedReverseGeocode = debounce(
  async (coords, zoom) => {
    if (zoom <= 4) {
      mainStore.currentLocationCity = 'In this area';
    } else {
      const reverseGeo = await mainStore.reverseGecodeLocation(coords, zoom);
      if (reverseGeo.country || reverseGeo.city) {
        if (reverseGeo.country)
          mainStore.currentLocationCountry = reverseGeo.country;
        if (zoom > 9) {
          const cityOrState = reverseGeo.city || reverseGeo.state;
          if (cityOrState) {
            mainStore.currentLocationCity = cityOrState; //+ ', ' + reverseGeo.country;
          } else mainStore.currentLocationCity = reverseGeo.country;
        } else if (zoom > 7) {
          if (reverseGeo.state) {
            mainStore.currentLocationCity = reverseGeo.state; // + ', ' + reverseGeo.country;
          } else {
            mainStore.currentLocationCity = reverseGeo.country;
          }
        } else {
          mainStore.currentLocationCity = reverseGeo.country;
        }
      }

      mainStore.currentLocationFromSearch = false;
      mainStore.userLocationLoading = false;
    }
  },
  500,
  { leading: false, trailing: true }
);

const mapStateToStore = () => {
  if (map.map) {
    const center = map.map.getCenter();
    const zoomLevel = map.map.getZoom();
    mapStore.mapBounds = getPaddedBounds(map.map, getDefaultPadding());
    mapStore.mapCenter = center;
    mapStore.mapZoomLevel = zoomLevel;
    mainStore.currentLocation = center;
  }
};

const moveend = () => {
  mapStore.mapMoving = false;
  blockPeekMap.value = false;
  if (!blockUpdates.value) {
    if (map.map) {
      mapStateToStore();
      // dont rev. geocode immediatly after selecting search result
      if (!mainStore.currentLocationFromSearch && Screen.gt.xs)
        debouncedReverseGeocode(mapStore.mapCenter, mapStore.mapZoomLevel);
    }
    mainStore.currentLocationFromSearch = false;
  } else {
    nextTick(() => {
      if ($route.name === 'Explore') {
        blockUpdates.value = false;
      }
    });
  }
};

const mapClick = () => {
  if ($route.name === 'EventPage') {
    if (mapStore.peekMap) {
      peekMap.value = false;
      if (focusMarker.value) blockPeekMap.value = true;
      flyTo({ center: focusMarker.value, padding: getEventPagePadding() });
    } else {
      if (mainStore.routerHistory.length > 0) {
        $router.go(-1);
      } else {
        $router.push({ name: 'Explore' });
      }
    }
  }
};

const getEventPagePadding = (): PaddingOptions => {
  if (peekMap.value) {
    return {
      top: 0,
      bottom: window.innerHeight / 2,
      left: 0,
      right: 0,
    };
  }
  if (Screen.lt.sm) {
    return {
      top: 0,
      bottom: window.innerHeight * 0.66 - 64,
      left: 0,
      right: 0,
    };
  } else {
    return {
      top: 0,
      bottom: window.innerHeight * 0.66 - 64,
      left: 0,
      right: 0,
    };
  }
};

const getNearbyPagePadding = (): PaddingOptions => {
  // default padding for explore page
  if (Screen.lt.sm) {
    return {
      top: 0,
      bottom: window.innerHeight / 2 - 86 + mainStore.safeAreaInsets.top,
      left: 0,
      right: 0,
    };
  } else {
    return getDefaultPadding();
  }
};

const getDefaultPadding = (): PaddingOptions => {
  // default padding for explore page
  if (Screen.lt.sm) {
    return { top: 0, bottom: 150, left: 0, right: 0 };
  } else if (Screen.gt.sm) {
    return { top: 0, bottom: 0, left: 568, right: 0 };
  } else {
    // lt.md
    return { top: 0, bottom: 250, left: 0, right: 0 };
  }
};

const getPaddedBounds = (map: Map, padding: PaddingOptions) => {
  const pixelBounds = map.getContainer().getBoundingClientRect();
  const widthPx = pixelBounds.width;
  const heightPx = pixelBounds.height;

  const swPadded = map.unproject([padding.left, heightPx - padding.bottom]);
  const nePadded = map.unproject([widthPx - padding.right, padding.top]);

  return new LngLatBounds(swPadded, nePadded); //.adjustAntiMeridian();
};

const flyTo = ({
  center,
  zoom = 9,
  padding,
}: {
  center: LngLatLike;
  zoom?: number;
  padding?: PaddingOptions;
}) => {
  console.log('fly to');
  map.map?.flyTo({ center, zoom, padding: padding || getDefaultPadding() });
};

const onMouseOverPoint = (e: MapLayerMouseEvent) => {
  const properties = e?.features?.[0]?.properties;
  if (properties?.events) {
    mouseOverPointEvents.value = JSON.parse(properties.events);
  }
};

const onClickPoint = (e: MapLayerMouseEvent) => {
  const properties = e?.features?.[0]?.properties;
  if (properties?.events) {
    const events = JSON.parse(properties.events);
    if (events.length > 1) {
      Dialog.create({
        component: EventSelectionComponent,
        // props forwarded to component
        componentProps: {
          data: properties,
        },
      });
    } else {
      // show event page
      focusMarker.value = {
        lat: properties.lat,
        lng: properties.lng,
      };
      $router.push({
        name: 'EventPage',
        params: {
          id: events[0].event_id,
          eventDateId: events[0].event_date_id,
        },
        query: {
          name: events[0].name.replace(/ /g, '_'),
        },
      });
    }
  }
};

watch(
  () => map.isLoaded,
  (isLoaded: boolean) => {
    if (map.map && isLoaded) {
      map.map.scrollZoom.setWheelZoomRate(1 / 500);
      map.map.scrollZoom.setZoomRate(1 / 500);
    }
  }
);

watch(
  () => mainStore.currentLocation,
  (newv: LngLatLike | null) => {
    if (newv && mainStore.currentLocationFromSearch) {
      flyTo({ center: newv });
    }
  }
);

watch(focusMarker, (newval: LngLat | null) => {
  if (newval) {
    blockUpdates.value = true;
    blockPeekMap.value = true;
    // save current map view so we can return to it
    if (newval.lat && newval.lng && map.map) {
      mapStore.exploreMapView = {
        latlng: map.map.getCenter(),
        zoom: map.map.getZoom(),
      };
      blockUpdates.value = true;
      flyTo({ center: newval, padding: getEventPagePadding() });
    }
  } else {
    if (mapStore.exploreMapView)
      if (mainStore.sidebarPanel === 'nearby') {
        flyTo({
          center: mapStore.exploreMapView.latlng,
          zoom: mapStore.exploreMapView.zoom,
          padding: getNearbyPagePadding(),
        });
      } else {
        flyTo({
          center: mapStore.exploreMapView.latlng,
          zoom: mapStore.exploreMapView.zoom,
        });
      }
  }
});

const clusterPaint = {
  /*
  'circle-color': 'rgba(0,0,0,0.8)',
  'circle-radius': ['step', ['get', 'point_count'], 10, 10, 15, 30, 20],
  'circle-stroke-width': 3,
  'circle-stroke-color': '#fff',
  */
};

const clusterCountLayout = {
  'icon-image': 'marker-dark',
  'icon-size': 1,
  'text-field': '{point_count_abbreviated}',
  'text-font': ['Arial Unicode MS Bold'],
  'text-size': 15,
  'text-offset': [0, 1.5], // Offset text below the icon
  'text-anchor': 'top',

  //'icon-allow-overlap': true,
};

const clusterCountPaint = {
  'text-color': '#FFFFFF',
  'icon-halo-color': 'rgba(0, 0, 0, 1)',
  'icon-halo-width': 2,
  'icon-halo-blur': 1,
};

const unclusteredPointPaint = {
  'circle-color': '#11b4da',
  'circle-radius': 4,
  'circle-stroke-width': 3,
  'circle-stroke-color': '#fff',
};

function useRef(arg0: boolean) {
  throw new Error('Function not implemented.');
}
</script>

<style lang="scss" scoped>
@import 'maplibre-gl/dist/maplibre-gl.css';
.body--dark {
  .maplibregl-map {
    &:before {
    }
  }
}

.body--light {
  &:before {
  }
}

@property --bottomGradient1 {
  syntax: '<color>';
  initial-value: transparent;
  inherits: false;
}

@property --bottomGradient2 {
  syntax: '<color>';
  initial-value: transparent;
  inherits: false;
}
@property --bottomGradient3 {
  syntax: '<color>';
  initial-value: rgba(0, 0, 0, 0.68);
  inherits: false;
}

.main-map {
  z-index: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
  :deep(.maplibregl-map) {
    height: 100%;
    width: 100%;
    z-index: 0;
    position: absolute;
    &:before {
      position: absolute;
      content: '';
      width: 100%;
      height: 100%;
      z-index: 1;
      pointer-events: none;
      background: linear-gradient(
        rgba(0, 0, 0, 1),
        rgba(0, 0, 0, 0.2) 148px,
        var(--bottomGradient1) 200px,
        var(--bottomGradient2) calc(100% - 128px),
        var(--bottomGradient2) calc(100% - 200px),
        var(--bottomGradient3) 100%
      );
    }
  }
  .nearby-map-overlay-mobile {
    --bottomGradient1: rgba(0, 0, 0, 0.48);
  }
  .map-overlay-mobile-minimized {
  }

  .markers-loading-overlay {
    background-color: rgba(0, 0, 0, 0.8);
    position: absolute;
    z-index: 1000;
    height: 100%;
    width: 100%;
  }
}

@media only screen and (max-width: 599px) {
  .main-map {
    .maplibregl-ctrl-bottom-right {
      bottom: calc(268px + env(safe-area-inset-bottom));
      .maplibregl-ctrl-attrib {
        display: none;
      }
    }
  }
}
</style>
