<template>
  <div
    class="main-map"
    :class="{
      'nearby-map-overlay-mobile': mainStore.sidebarPanel === 'nearby',
      'map-overlay-mobile-minimized': mainStore.sidebarMinimized,
      'transport-map': mapStore.mapStyle !== 'satellite',
    }"
  >
    <UseDevicePixelRatio v-slot="{ pixelRatio: { pixelRatio } }">
      <mgl-map
        :pixel-ratio="pixelRatio"
        :map-style="currentMapStyleUrl"
        :trackResize="true"
        :validateStyle="false"
        @map:movestart="movestart"
        @map:moveend="moveend"
        @map:click="mapClick"
        @map:move="moving"
        @map:load="mapLoaded"
        hash="state"
        :attribution-control="false"
      >
        <mgl-navigation-control :position="'bottom-right'" />

        <mgl-geo-json-source
          source-id="points"
          :data="mappedPoints"
          :cluster="false"
        >
          <!-- Clustered points 
          <mgl-circle-layer
            layer-id="clusters"
            :filter="['has', 'point_count']"
            :paint="clusterPaint"
            @mouseenter="mouseEnterPoint"
            @mouseleave="mouseLeavePoint"
          />

Cluster count labels 
          <mgl-symbol-layer
            @click="onClickCluster"
            layer-id="cluster-count"
            :filter="['has', 'point_count']"
            :layout="clusterCountLayout"
            :paint="clusterCountPaint"
          />
    -->
          <!-- Unclustered points -->
          <mgl-symbol-layer
            layer-id="unclustered-point"
            :layout="unclusteredPointLayout"
            :paint="unclusteredPointPaint"
            @click="onClickPoint"
            @mouseenter="mouseEnterPoint"
            @mouseleave="mouseLeavePoint"
          />

          <!-- Unclustered points 
          <mgl-symbol-layer
            layer-id="unclustered-point-label"
            :filter="['!', ['has', 'point_count']]"
            :layout="unclusteredPointLabelLayout"
            :paint="unclusteredPointLabelPaint"
            @click="onClickPoint"
            @mouseenter="mouseEnterPoint"
            @mouseleave="mouseLeavePoint"
          />-->
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
  MglGeoJsonSource,
  MglCircleLayer,
  MglSymbolLayer,
  useMap,
} from '@indoorequal/vue-maplibre-gl';
import { onMounted, watch, nextTick, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { debounce } from 'lodash';
import {
  LngLat,
  LngLatBounds,
  LngLatLike,
  Map,
  MapLayerMouseEvent,
  PaddingOptions,
} from 'maplibre-gl';
import { storeToRefs } from 'pinia';
import { Dialog, Screen } from 'quasar';

import EventSelectionComponent from './EventSelectionComponent.vue';
import { useDevicePixelRatio } from '@vueuse/core';

const mapStore = useMapStore();

const { blockUpdates, peekMap, focusMarker, currentMapStyleUrl } =
  storeToRefs(mapStore);

const { pixelRatio } = useDevicePixelRatio();

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
  features: points.value.map((x: any) => ({
    // TODO update type
    type: 'Feature',
    properties: {
      ...x,
      label:
        x.events.length > 1
          ? x.name + ' (' + x.events.length + ' events)'
          : x.events[0].name,
    },
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

  if (map.map) {
    mapStateToStore();

    const image = await map.map.loadImage(
      '/src/assets/marker-dark-shadow.webp'
    );
    map.map?.addImage('marker-dark', image.data, {
      pixelRatio: 5,
      content: [16, 16, 50, 50], // place text over left half of image, avoiding the 16px border
    });
    const image2 = await map.map.loadImage(
      '/src/assets/marker-dark-shadow-cluster2.webp'
    );
    map.map?.addImage('marker-dark-cluster', image2.data, {
      pixelRatio: 5,
      content: [16, 16, 50, 50], // place text over left half of image, avoiding the 16px border
    });
    mapStore.map = map.map;
  }

  if ($route.name !== 'EventPage') {
    if (mainStore.sidebarPanel === 'nearby') {
      map.map?.easeTo(
        {
          padding: getNearbyPagePadding(),
          duration: 0,
        },
        { ignoreMoveEvents: true }
      );
    } else {
      map.map?.easeTo(
        {
          padding: getDefaultPadding(),
          duration: 0,
        },
        { ignoreMoveEvents: true }
      );

      if (Screen.gt.xs) {
        debouncedReverseGeocode(map.map?.getCenter(), map.map?.getZoom());
      }
    }
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

const movestart = (e: any) => {
  console.log('ignore', e);
  if (e.event.ignoreMoveEvents) {
    return;
  }
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

const mapStyleData = (event) => {
  console.log('styledata');
};

const mapLoaded = (event) => {
  // set tilesize of satellite layer for 2x screens
  const landsat = map.map?.getSource('landsat');
  if (landsat && landsat.type === 'raster') {
    landsat.tileSize = pixelRatio.value >= 1.5 ? 128 : 168;

    // Force a re-render of the map
    if (map.map?.style.sourceCaches['landsat']) {
      map.map?.style.sourceCaches['landsat']?.clearTiles();
      map.map?.style.sourceCaches['landsat']?.update(map.map?.transform);
    }
    map.map?.triggerRepaint();
  }

  // set globe projection

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
    console.log(mapStore.mapBounds, 'bbb');
    mapStore.mapCenter = center;
    mapStore.mapZoomLevel = zoomLevel;
    mainStore.currentLocation = center;
  }
};

const moveend = (e: any) => {
  if (e.ignoreMoveEvents) {
    return;
  }
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
  } else {
    mainStore.sidebarPanel = 'explore';
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
  } else if (Screen.gt.lg) {
    return { ...getDefaultPadding(), bottom: window.innerHeight * 0.82 - 64 };
  } else {
    return {
      top: 0,
      bottom: window.innerHeight * 0.82 - 64,
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
  console.log('get default pad');
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
  const bounds = map.getBounds();

  if (map.getZoom() > 4) {
    console.log('apply padding');
    const pixelBounds = map.getContainer().getBoundingClientRect();
    const widthPx = pixelBounds.width;
    const heightPx = pixelBounds.height;
    //map2.map?.fitBounds(bounds, { animate: false });
    // project to regular map
    const swPadded = map?.unproject([padding.left, heightPx - padding.bottom]);
    const nePadded = map?.unproject([widthPx - padding.right, padding.top]);

    return new LngLatBounds(swPadded, nePadded).adjustAntiMeridian();
  } else return bounds.adjustAntiMeridian();

  /*
  const pixelBounds = map.getContainer().getBoundingClientRect();
  const widthPx = pixelBounds.width;
  const heightPx = pixelBounds.height;
  const swPadded = map.unproject([padding.left, heightPx - padding.bottom]);
  const nePadded = map.unproject([widthPx - padding.right, padding.top]);
*/
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
  //map.map?.easeTo({ padding: padding || getDefaultPadding(), duration: 0 });
  map.map?.setPadding(padding || getDefaultPadding());
  map.map?.flyTo({ center, zoom });
};

const mouseEnterPoint = (e: MapLayerMouseEvent) => {
  const canvas = map.map?.getCanvas();
  if (canvas) {
    canvas.style.cursor = 'pointer';
  }
  //
  const properties = e?.features?.[0]?.properties;
  if (properties?.events) {
    mouseOverPointEvents.value = JSON.parse(properties.events);
  }
};

const mouseLeavePoint = (e: MapLayerMouseEvent) => {
  const canvas = map.map?.getCanvas();
  if (canvas) {
    canvas.style.cursor = '';
  }
  mouseOverPointEvents.value = null;
};

const onClickCluster = async (e: MapLayerMouseEvent) => {
  const features = e.features;
  const clusterId = features?.[0]?.properties.cluster_id;
  if (clusterId) {
    const source = map.map?.getSource('points') as maplibregl.GeoJSONSource;
    const zoom = await source.getClusterExpansionZoom(clusterId);
    const coordinates = (features[0].geometry as GeoJSON.Point).coordinates;
    if (zoom && coordinates)
      map.map?.easeTo({
        center: [coordinates[0], coordinates[1]],
        zoom: zoom + 1,
      });
  }
};

const onClickPoint = (e: MapLayerMouseEvent) => {
  console.log('click', e.features);
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
    console.log('NEWV');
    // save current map view so we can return to it
    if (newval.lat && newval.lng && map.map) {
      const currentZoom = map.map.getZoom();
      mapStore.exploreMapView = {
        latlng: map.map.getCenter(),
        zoom: currentZoom,
      };
      blockUpdates.value = true;
      console.log('NEWV FLY');

      flyTo({
        center: newval,
        padding: getEventPagePadding(),
        zoom: currentZoom > 9 ? currentZoom : 9,
      });
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
  'icon-image': 'marker-dark-cluster',
  'icon-size': [
    'interpolate',
    ['exponential', 1.5], // You can adjust the base of the exponential function
    ['zoom'],
    1,
    0.5, // At zoom level 10, the icon size will be 0.5 times the original size
    8,
    1, // At zoom level 15, the icon size will be the original size
    20,
    1.5, // At zoom level 20, the icon size will be 2 times the original size
  ],
  'text-field': '{point_count_abbreviated}',
  'text-font': ['Arial Unicode MS Bold'],
  'text-size': 15,
  'text-offset': [0, 0.2], // Offset text below the icon
  'text-anchor': 'top',

  //'icon-allow-overlap': true,
};

const clusterCountPaint = {};

const unclusteredPointPaint = {
  'text-color': '#FFFFFF',
  'icon-halo-color': 'rgba(0, 0, 0, 1)',
  'icon-halo-width': 2,
  'icon-halo-blur': 1,
  'text-halo-color': '#000000',
  'text-halo-width': 1,
  'text-halo-blur': 1,
};

const unclusteredPointLayout = {
  'text-size': [
    'interpolate',
    ['exponential', 1.5], // You can adjust the base of the exponential function
    ['zoom'],
    1,
    0.0, // At zoom level 10
    5,
    0.0, // At zoom level 10
    6,
    11, // At zoom level 8
    8,
    12, // At zoom level 20
  ],
  'text-field': '{label}',
  'text-font': ['Metropolis Regular'],
  'text-offset': [0, 2.5], // Offset text below the icon
  'text-allow-overlap': false,
  'text-ignore-placement': false,
  'text-optional': true,
  //'icon-ignore-placement': true,
  'icon-image': 'marker-dark',
  'icon-size': [
    'interpolate',
    ['exponential', 1.5], // You can adjust the base of the exponential function
    ['zoom'],
    1,
    0.25, // At zoom level 10
    8,
    0.8, // At zoom level 8
    20,
    1, // At zoom level 20
  ],
};

const unclusteredPointLabelLayout = {};

function useRef(arg0: boolean) {
  throw new Error('Function not implemented.');
}
</script>

<style lang="scss">
@import 'maplibre-gl/dist/maplibre-gl.css';
</style>

<style lang="scss" scoped>
.body--dark {
  .main-map {
    :deep(.maplibregl-map) {
      .maplibregl-control-container {
        .maplibregl-ctrl-bottom-right {
          filter: invert(1);
        }
      }
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
  initial-value: rgba(0, 0, 0, 0.48);
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
    canvas {
      background: black;
      //background: linear-gradient(to bottom, #6c5ce7, #74b9ff, #81ecec);
      height: 1;
    }
    &:before {
      position: absolute;
      content: '';
      width: 100%;
      height: 100%;
      z-index: 1;
      pointer-events: none;
      background: linear-gradient(
        rgba(0, 0, 0, 1),
        rgba(0, 0, 0, 0.1) 148px,
        var(--bottomGradient1) 200px,
        var(--bottomGradient2) calc(100% - 200px),
        var(--bottomGradient3) 100%
      );
    }
  }
  &.transport-map {
    :deep(.maplibregl-map) {
      &:before {
        opacity: 0.5;
      }
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
    :deep(.maplibregl-map) {
      .maplibregl-control-container {
        .maplibregl-ctrl-bottom-right {
          bottom: calc(248px + env(safe-area-inset-bottom));
          .maplibregl-ctrl-attrib {
            display: none;
          }
        }
      }
    }
  }
}
</style>
