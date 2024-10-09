<template>
  <div
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
          />
        </mgl-geo-json-source>
      </mgl-map>
    </UseDevicePixelRatio>
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
import { LngLatLike, MapLayerMouseEvent } from 'maplibre-gl';
//import markerDarkFilled from 'assets/marker-dark-filled.png';

const mapStore = useMapStore();
const $route = useRoute();
const $router = useRouter();

const mainStore = useMainStore();

const queryStore = useQueryStore();

const map = useMap();

const delayedRouteName = ref();

const mappedPoints = computed(() => ({
  type: 'FeatureCollection',
  features: queryStore.points.map((x) => ({
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
  }
});

watch(
  () => $route.name,
  (to, from) => {
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
        mapStore.blockUpdates = false;
      }

      if (!queryStore.points || queryStore.points.length === 0) {
        queryStore.loadPoints();
      }
    }
  }
);

const movestart = () => {
  if (!mapStore.blockUpdates) {
    mapStore.mapMoving = true;
    mainStore.sidebarPanel = 'explore';
    queryStore.topTagsInArea = [];
    queryStore.topArtistsInArea = [];
  }

  setTimeout(() => {
    if (delayedRouteName.value == 'EventPage' && $route.name === 'EventPage') {
      mapStore.peekMap = true;
    }
  }, 300);
};

const moving = (event) => {
  if (!mapStore.blockUpdates) {
    mainStore.userLocationLoading = false;
    const center = event.map.getCenter();
    // mainStore.userLocationCity =
    //   center.lat.toFixed(1) + ', ' + center.lng.toFixed(1);
  }
};

const debouncedReverseGeocode = debounce(
  async (coords, zoom) => {
    if (mapStore.mapZoomLevel <= 4) {
      mainStore.userLocationCity = 'In this area';
    } else {
      const reverseGeo = await mainStore.reverseGecodeLocation(coords, zoom);
      if (mapStore.mapZoomLevel > 9) {
        const cityOrState = reverseGeo.city || reverseGeo.state;
        if (cityOrState) {
          mainStore.userLocationCity = cityOrState; //+ ', ' + reverseGeo.country;
        } else mainStore.userLocationCity = reverseGeo.country;
      } else if (mapStore.mapZoomLevel > 7) {
        if (reverseGeo.state) {
          mainStore.userLocationCity = reverseGeo.state; // + ', ' + reverseGeo.country;
        } else {
          mainStore.userLocationCity = reverseGeo.country;
        }
      } else {
        mainStore.userLocationCity = reverseGeo.country;
      }

      if (reverseGeo.country)
        mainStore.userLocationCountry = reverseGeo.country;
      mainStore.currentLocationFromSearch = false;
      mainStore.userLocationLoading = false;
    }
  },
  500,
  { leading: false, trailing: true }
);

const moveend = () => {
  mapStore.mapMoving = false;
  if (!mapStore.blockUpdates) {
    if (map.map) {
      const center = map.map.getCenter();
      const zoomLevel = map.map.getZoom();
      mapStore.mapBounds = map.map.getBounds();
      mapStore.mapCenter = center;
      mapStore.mapZoomLevel = zoomLevel;
      mainStore.userLocation = center;
      //mainStore.userLocationCity = '...';
      //mainStore.userLocationLoading = true;
      // mainStore.userLocationCity =
      //  center.lat.toFixed(1) + ', ' + center.lng.toFixed(1);
      //mainStore.userLocationCountry = null;
      debouncedReverseGeocode(center, zoomLevel);
    }
  } else {
    nextTick(() => {
      if ($route.name === 'Explore') {
        mapStore.blockUpdates = false;
      }
    });
  }
};

const mapClick = () => {
  if ($route.name === 'EventPage') {
    if (mapStore.peekMap) {
      mapStore.peekMap = false;
    } else {
      if (mainStore.routerHistory.length > 0) {
        $router.go(-1);
      } else {
        $router.push({ name: 'Explore' });
      }
    }
  }
};

const flyTo = (coords: LngLatLike, zoom = 9) => {
  map.map?.flyTo({ center: coords, zoom });
};

const onClickPoint = (e: MapLayerMouseEvent) => {
  console.log('pooint', e);
  /*
  $router.push({
    name: 'EventPage',
    params: {
      id: e.events[0].event_id,
      eventDateId: e.events[0].event_date_id,
    },
    query: {
      name: e.events[0].name.replace(/ /g, '_'),
    },
  });
  */
};

watch(
  () => map.isLoaded,
  (isLoaded) => {
    console.log('mmm', isLoaded);

    map.map.scrollZoom.setWheelZoomRate(1 / 500);
    map.map.scrollZoom.setZoomRate(1 / 500);
  }
);

watch(
  () => mapStore.focusMarker,
  (newval) => {
    if (newval !== null) {
      mapStore.blockUpdates = true;
      // save current map view so we can return to it
      if (newval.lat && newval.lng) {
        mapStore.exploreMapView = {
          latlng: map.map.getCenter(),
          zoom: map.map.getZoom(),
        };
        mapStore.blockUpdates = true;
        flyTo(newval);
      }
    } else {
      flyTo(mapStore.exploreMapView.latlng, mapStore.exploreMapView.zoom);
    }
  }
);

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
</script>

<style lang="scss">
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

.maplibregl-map {
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

@media only screen and (max-width: 599px) {
  .maplibregl-ctrl-bottom-right {
    bottom: calc(268px + env(safe-area-inset-bottom));
    .maplibregl-ctrl-attrib {
      display: none;
    }
  }
}
</style>
