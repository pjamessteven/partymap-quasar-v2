<template>
  <div
    class="main-map"
    :class="{
      'nearby-map-overlay-mobile': mainStore.sidebarPanel === 'nearby',
      'map-overlay-mobile-minimized': mainStore.sidebarMinimized,
      'transport-map': mapStore.mapStyle !== 'satellite',
    }"
  >
    <transition
      appear
      enter-active-class="animated fadeIn fast"
      leave
      leave-active-class="animated fadeOut fast"
    >
      <div
        :style="popupStyle"
        v-if="hoveredPointEvents"
        :key="hoveredPointEvents[0].event_id"
      >
        <EventDateCardLoader
          class="hover-popup"
          v-if="hoveredPointEvents?.length === 1"
          :eventId="hoveredPointEvents[0].event_id"
          :name="hoveredPointEvents[0].name"
          :coords="
            JSON.stringify({
              lat: hoverPointerCoords?.[1],
              lng: hoverPointerCoords?.[0],
            })
          "
          @mousemove="cancelHoverTimeout"
          @mouseenter="cancelHoverTimeout"
          @mouseleave="() => setHoverTimeout()"
          @click="hoveredPointEvents = null"
        />

        <q-card
          class="hover-popup-multiple"
          v-else
          @mouseenter="cancelHoverTimeout"
          @mouseleave="() => setHoverTimeout()"
          @mousemove="cancelHoverTimeout"
        >
          <div
            class="ti-3 text-bold"
            style="padding: 16px; padding-bottom: 4px"
          >
            {{ hoveredPointEvents?.length }} {{ t('general.events') }}
          </div>
          <div class="q-py-xs">
            <RouterLink
              v-for="event in hoveredPointEvents"
              class=""
              style="text-decoration: none; color: white; z-index: 1"
              :to="{
                name: 'EventPage',
                params: {
                  id: event.event_id,
                },
                query: {
                  name: event.name.replace(/ /g, '_'),
                  location: JSON.stringify({
                    lat: hoverPointerCoords?.[1],
                    lng: hoverPointerCoords?.[0],
                  }),
                },
              }"
              :key="event.event_id"
            >
              <q-item
                clickable
                @click="hoveredPointEvents = null"
                class="metropolis ti-1 flex items-center"
              >
                {{ event.name }}
              </q-item>
            </RouterLink>
          </div>
        </q-card>
      </div>
    </transition>

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
        :hash="
          $route.name === 'Explore' &&
          mainStore.sidebarPanel !== 'nearby' &&
          'state'
        "
        :attribution-control="false"
      >
        <mgl-navigation-control :position="'bottom-right'" v-if="false" />

        <mgl-geo-json-source
          source-id="points"
          :data="mappedPoints"
          :cluster="true"
          :clusterRadius="60"
        >
          <!-- Cluster count labels -->
          <mgl-symbol-layer
            layer-id="clusters"
            @mouseenter="mouseEnterClusterPoint"
            @click="onClickCluster"
            @mousemove="cancelHoverTimeout"
            @mouseleave="mouseLeaveClusterPoint"
            :filter="
              mappedPoints && currentEventFilter.length > 0
                ? ['all', ['has', 'point_count'], currentEventFilter]
                : ['has', 'point_count']
            "
            :layout="clusterCountLayout"
            :paint="computedPaintStyle"
          />

          <!-- Unclustered points -->
          <mgl-symbol-layer
            layer-id="unclustered-points"
            :filter="
              mappedPoints && currentEventFilter.length > 0
                ? ['all', ['!', ['has', 'point_count']], currentEventFilter]
                : ['!', ['has', 'point_count']]
            "
            :layout="unclusteredPointLayout"
            :paint="computedPaintStyle"
            @click="onClickPoint"
            @mousemove="cancelHoverTimeout"
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
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div class="event-page-overlay" v-if="$route.name === 'EventPage'"></div>
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
import type {
  LngLat,
  LngLatLike,
  Map,
  MapLayerMouseEvent,
  PaddingOptions,
  Point,
} from 'maplibre-gl';
import { LngLatBounds, MapGeoJsonFeature } from 'maplibre-gl';
import { storeToRefs } from 'pinia';
import { Dark, Dialog, Platform, Screen } from 'quasar';
import EventDateCardLoader from 'components/EventDateCardLoader.vue';
import EventSelectionComponent from './EventSelectionComponent.vue';
import { useDevicePixelRatio } from '@vueuse/core';
import { API_URL, IS_LOCALHOST } from 'src/api';
import { useSearchStore } from 'src/stores/search';
import { useI18n } from 'vue-i18n';
import { CapacitorHttp } from '@capacitor/core';
import markerImage from '/src/assets/marker-dark-shadow.webp';
import clusterMarkerImage from '/src/assets/marker-dark-shadow-cluster7.webp';
import { FeatureCollection, Geometry } from 'geojson';

const { t } = useI18n();

const mapStore = useMapStore();
const searchStore = useSearchStore();

const { blockUpdates, peekMap, focusMarker, currentMapStyleUrl, mapStyle } =
  storeToRefs(mapStore);

const { pixelRatio } = useDevicePixelRatio();

const $route = useRoute();
const $router = useRouter();

const showPoints = ref(true);

const mainStore = useMainStore();

const queryStore = useQueryStore();

const blockPeekMap = ref(false);

const hoveredPointEvents = ref(null);
const hoverPointerCoords = ref<LngLat | null>(null);

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

const mappedPoints = computed<FeatureCollection<Geometry>>(() => ({
  type: 'FeatureCollection',
  features: points.value.map((x: any) => ({
    // TODO update type
    type: 'Feature',
    properties: {
      ...x,
      label:
        x.events.length > 1
          ? x.name + ' (' + x.events.length + ' ' + t('general.events') + ')'
          : x.events[0].name,
    },
    geometry: {
      type: 'Point',
      coordinates: [x.lng, x.lat], // geojson [lng, lat] format.. wtf.
    },
  })),
}));

const updateMarkers = () => {
  const source = map.map?.getSource('points') as maplibregl.GeoJSONSource;
  source?.setData(mappedPoints.value);
};

const updateLocationMarker = (userLocation: LngLat) => {
  const userLocationData: FeatureCollection<Geometry> = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: [],
        geometry: {
          type: 'Point',
          coordinates: [userLocation.lng, userLocation.lat],
        },
      },
    ],
  };

  const existingSource = map.map?.getSource(
    'userLocation',
  ) as maplibregl.GeoJSONSource;

  if (existingSource) {
    existingSource.setData(userLocationData);
  } else {
    map.map?.addSource('userLocation', {
      type: 'geojson',
      data: userLocationData,
    });
    map.map?.addLayer({
      id: 'userLocation',
      type: 'symbol',
      source: 'userLocation',
      layout: {
        'icon-image': 'pulsing-dot',
        'icon-ignore-placement': true,
      },
    });
  }
};

onMounted(async () => {
  queryStore.loadPoints();

  if (focusMarker.value) {
    setFocusMarker(focusMarker.value);
  }

  if (map.map) {
    mapStateToStore();

    let marker;
    let clusterMarker;

    marker = await map.map.loadImage(markerImage);
    clusterMarker = await map.map.loadImage(clusterMarkerImage);

    if (marker)
      map.map?.addImage('marker-dark', marker.data, {
        pixelRatio: 5,
        content: [16, 16, 50, 50], // place text over left half of image, avoiding the 16px border
      });

    if (clusterMarker)
      map.map?.addImage('cluster-marker', clusterMarker.data, {
        pixelRatio: 5,
        content: [16, 16, 50, 50], // place text over left half of image, avoiding the 16px border
      });

    map.map?.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
    mapStore.map = map.map;
  }

  if ($route.name !== 'EventPage') {
    if (mainStore.sidebarPanel === 'nearby') {
      map.map?.flyTo(
        {
          padding: getNearbyPagePadding(),
          duration: 0,
          center: mainStore.userLocation || undefined,
          zoom: mainStore.userLocation ? 7 : undefined,
        },
        { ignoreMoveEvents: true },
      );
    } else {
      map.map?.flyTo(
        {
          padding: getDefaultPadding(),
          duration: 0,
        },
        { ignoreMoveEvents: true },
      );

      if (Screen.gt.xs && mainStore.sidebarPanel == 'explore') {
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
  },
);

watch(
  () => mainStore.userLocation,
  (newv: LngLat | null) => {
    if (
      mainStore.sidebarPanel === 'nearby' &&
      newv &&
      $route.name === 'Explore'
    ) {
      blockUpdates.value = true;
      flyTo({
        center: newv,
        padding: getNearbyPagePadding(),
        zoom: 6,
      });
    }
    if (newv) {
      updateLocationMarker(newv);
    }
  },
);

watch(
  () => mainStore.sidebarPanel,
  (newv: string, oldv: string) => {
    if (mainStore.userLocation && newv === 'nearby') {
      blockUpdates.value = true;
      flyTo({
        center: mainStore.userLocation,
        padding: getNearbyPagePadding(),
        zoom: 6,
      });
      if (Screen.lt.sm) {
        showPoints.value = false;
      }
    }
    if (newv === 'explore') {
      showPoints.value = true;
      blockUpdates.value = false;
      if (
        oldv === 'nearby' &&
        mainStore.userLocation &&
        !mainStore.currentLocationFromSearch &&
        Screen.lt.sm
      ) {
        flyTo({ center: mainStore.userLocation, zoom: 6 });
      }
    }
  },
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
  { deep: true },
);

const movestart = (e: any) => {
  if ($route.name === 'EventPage' || $route.name === 'Explore') {
    if (e.event.ignoreMoveEvents) {
      return;
    }
    if (!blockUpdates.value) {
      mapStore.mapMoving = true;
      mainStore.sidebarPanel = 'explore';
      topTagsInArea.value = [];
      topArtistsInArea.value = [];
    }
  }
};

const moving = (event) => {
  if (!blockUpdates.value) {
    mainStore.userLocationLoading = false;
  }
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

  mapStateToStore();

  // sometimes the marker data source needs to be manually set..
  // hack for weird inconsisent behavior that I can't work out
  setTimeout(() => {
    updateMarkers();
  }, 1000);
};

const debouncedClearMarkersAndLoadPoints = debounce(
  async () => {
    points.value = [];
    queryStore.loadingPoints = true;
    queryStore.loadPoints();
  },
  300,
  { leading: false, trailing: true },
);

const debouncedReverseGeocode = debounce(
  async (coords, zoom) => {
    if (zoom <= 4) {
      mainStore.currentLocationCity = t('nearby_view.this_area');
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
  { leading: false, trailing: true },
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

const moveend = (e: any) => {
  if ($route.name === 'EventPage' || $route.name === 'Explore') {
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
  }
};

const mapClick = () => {
  if ($route.name === 'EventPage') {
    if (mapStore.peekMap) {
      peekMap.value = false;
      if (focusMarker.value) blockPeekMap.value = true;
      $router.go(-1);
    } else {
      if (mainStore.routerHistory.length > 2) {
        $router.go(-1);
      } else {
        $router.push({ name: 'Explore', query: { view: 'explore' } });
      }
    }
  } else {
    mainStore.sidebarPanel = 'explore';
  }
};

const getEventPagePadding = (): PaddingOptions => {
  if (peekMap.value) {
    return {
      ...getDefaultPadding(),
      bottom: window.innerHeight / 4,
    };
  }
  if (Screen.lt.sm) {
    return {
      top: 0,
      bottom: window.innerHeight * 0.76 - 64,
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
    let bottom = 150;

    return {
      top: 0,
      bottom:
        window.innerHeight -
        (window.innerHeight / 2 - 32 + mainStore.safeAreaInsets.top),
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
    let bottom = 150 - mainStore.safeAreaInsets.top;
    return { top: 0, bottom, left: 0, right: 0 };
  } else if (Screen.gt.sm) {
    return { top: 0, bottom: 0, left: 568, right: 0 };
  } else {
    // lt.md
    let bottom = 150;
    if (Platform.is.capacitor) {
      bottom -= mainStore.safeAreaInsets.top;
    }
    return { top: 0, bottom, left: 0, right: 0 };
  }
};

const getPaddedBounds = (map: Map, padding: PaddingOptions) => {
  const bounds = map.getBounds();

  if (map.getZoom() > 4) {
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
  //map.map?.setPadding();
  map.map?.flyTo({
    center,
    zoom,
    padding: padding || getDefaultPadding(),
    speed: 2.4,
  });
};

const popupStyle = ref({
  position: 'absolute',
  left: '0px',
  top: '0px',
  'z-index': 1,
  'max-width': '450px',
  display: 'flex',
  'justify-content': 'center',
  'pointer-events': 'auto',
  width: '450px',
});

const hoverTimeout = ref();

const cancelHoverTimeout = () => {
  clearTimeout(hoverTimeout.value);
};

const setHoverTimeout = () => {
  hoverTimeout.value = setTimeout(() => {
    hoveredPointEvents.value = null;
  }, 300);
};

const mouseEnterPoint = (e: MapLayerMouseEvent) => {
  const canvas = map.map?.getCanvas();
  if (canvas) {
    canvas.style.cursor = 'pointer';
  }
  /*
  const eventsAtPoint = JSON.parse(e?.features?.[0]?.properties.events);
  const coords = e?.features?.[0]?.geometry.coordinates;
  showPopup(eventsAtPoint, coords);
  */
};

const mouseLeavePoint = (e: MapLayerMouseEvent) => {
  const canvas = map.map?.getCanvas();
  if (canvas) {
    canvas.style.cursor = '';
  }
  /*
  setHoverTimeout();
  */
};

const mouseEnterClusterPoint = async (e: MapLayerMouseEvent) => {
  const canvas = map.map?.getCanvas();
  if (canvas) {
    canvas.style.cursor = 'zoom-in';
  }
  const source = map.map?.getSource('points');
  const clusterId = e?.features?.[0]?.properties.cluster_id;
  const pointCount = e?.features?.[0]?.properties.point_count;
  const coords = e?.features?.[0]?.geometry.coordinates;
  const features = await source.getClusterLeaves(clusterId, pointCount);
  /*
  const eventsAtPoint = features.reduce((accumulator, currentObject) => {
    return [...accumulator, ...currentObject.properties.events];
  }, []);

  showPopup(eventsAtPoint, coords);
  */
};

const mouseLeaveClusterPoint = (e: MapLayerMouseEvent) => {
  const canvas = map.map?.getCanvas();
  if (canvas) {
    canvas.style.cursor = '';
  }
  /*
  mouseLeavePoint();
  */
};

const showPopup = (
  eventsAtPoint: { event_id: number; name: string }[],
  pointCoords,
) => {
  // show popup on large screens
  if (Screen.gt.sm) {
    if (eventsAtPoint[0].event_id === hoveredPointEvents.value?.[0]?.event_id) {
      cancelHoverTimeout();
    } else {
      hoveredPointEvents.value = eventsAtPoint;
    }

    // update popup location
    hoverPointerCoords.value = pointCoords;
    const pointPx = map?.map.project(pointCoords);

    popupStyle.value.left = // fix thiss
      Math.min(pointPx.x - 225, window.innerWidth - 450) + 'px';

    if (pointPx.y - 286 < 86) {
      // if too high, put popup below
      popupStyle.value.top = pointPx.y + 48 + 'px';
    } else {
      popupStyle.value.top = Math.max(pointPx.y - 270, 0) + 'px';
    }
  }
};

const onClickCluster = async (e: MapLayerMouseEvent) => {
  hoveredPointEvents.value = null;

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

const currentEventFilter = computed(() => {
  if (focusMarker.value && mappedPoints.value) {
    return ['==', ['get', 'place_id'], focusMarker.value.place_id];
  } else return [];
});

const searchEventFilter = computed(() => {
  if (searchStore.query && searchStore.query.length > 0) {
    return ['==', ['get', 'name'], searchStore.query];
  } else return [];
});

const onClickPoint = (e: MapLayerMouseEvent) => {
  hoveredPointEvents.value = null;

  const properties = e?.features?.[0]?.properties;
  if (properties?.events) {
    const events = JSON.parse(properties.events);
    if (events.length > 1) {
      Dialog.create({
        component: EventSelectionComponent,
        // props forwarded to component
        componentProps: {
          data: { ...properties, events: events },
        },
      });
    } else {
      // filter markers
      map.map?.setFilter('clusters', [
        '==',
        ['get', 'place_id'],
        properties.place_id,
      ]);
      map.map?.setFilter('unclustered-points', [
        '==',
        ['get', 'place_id'],
        properties.place_id,
      ]);
      // show event page
      focusMarker.value = {
        lat: properties.lat,
        lng: properties.lng,
        place_id: properties.place_id,
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
  () => mapStore.peekMap,
  (to: boolean, from: boolean) => {
    if (!to) {
      blockPeekMap.value = true;
      flyTo({ center: focusMarker.value, padding: getEventPagePadding() });
    } else {
      flyTo({ center: focusMarker.value, padding: getEventPagePadding() });
    }
  },
);

watch(
  () => map.isLoaded,
  (isLoaded: boolean) => {
    if (map.map && isLoaded) {
      map.map.scrollZoom.setWheelZoomRate(1 / 500);
      map.map.scrollZoom.setZoomRate(1 / 500);
    }
  },
);

watch(
  () => mainStore.currentLocation,
  (newv: LngLatLike | null) => {
    if (newv && mainStore.currentLocationFromSearch) {
      flyTo({ center: newv });
    }
  },
);

watch(focusMarker, (newval: LngLat | null) => {
  if (newval) {
    setFocusMarker(newval);
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

const setFocusMarker = (coords: LngLat) => {
  blockUpdates.value = true;
  blockPeekMap.value = true;
  const currentZoom = map?.map?.getZoom();
  mapStore.exploreMapView = {
    latlng: map?.map?.getCenter(),
    zoom: currentZoom,
  };
  blockUpdates.value = true;

  flyTo({
    center: coords,
    padding: getEventPagePadding(),
    zoom: currentZoom && currentZoom > 9 ? currentZoom : 9,
  });
};

const pulsingDotSize = 86;
const pulsingDot = {
  width: pulsingDotSize,
  height: pulsingDotSize,
  data: new Uint8Array(pulsingDotSize * pulsingDotSize * 4),

  // get rendering context for the map canvas when layer is added to the map
  onAdd() {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    this.context = canvas.getContext('2d');
  },

  // called once before every frame where the icon will be used
  render() {
    const duration = 2000;
    const t = (performance.now() % duration) / duration;

    const radius = (pulsingDotSize / 2) * 0.3;
    const outerRadius = (pulsingDotSize / 2) * 0.7 * t + radius;
    const context = this.context;

    // draw outer circle
    context.clearRect(0, 0, this.width, this.height);
    context.beginPath();
    context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
    context.fillStyle = `rgba(0, 100, 255,${1 - t})`;
    context.fill();

    // draw inner circle
    context.beginPath();
    context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
    context.fillStyle = 'rgba(0, 100, 255, 1)';
    context.strokeStyle = 'white';
    context.lineWidth = 2 + 4 * (1 - t);
    context.fill();
    context.stroke();

    // update this image's data with data from the canvas
    this.data = context.getImageData(0, 0, this.width, this.height).data;

    // continuously repaint the map, resulting in the smooth animation of the dot
    map.map?.triggerRepaint();

    // return `true` to let the map know that the image was updated
    return true;
  },
};

const computedPaintStyle = computed(() => {
  if (mapStyle.value === 'satellite') {
    return lightLabelPaint;
  } else if (mapStyle.value === 'classic') {
    return darkLabelPaint;
  } else if (Dark.isActive) {
    return lightLabelPaint;
  } else {
    return darkLabelPaint;
  }
});
const lightLabelPaint = {
  'text-color': '#FFFFFF',
  'icon-halo-color': 'rgba(0, 0, 0, 1)',
  'icon-halo-width': 2,
  'icon-halo-blur': 0,
  'text-halo-color': '#000000',
  'text-halo-width': 1,
  'text-halo-blur': 1,
};

const darkLabelPaint = {
  'text-color': '#000000',
  'icon-halo-color': 'rgba(0, 0, 0, 1)',
  'icon-halo-width': 2,
  'icon-halo-blur': 0,
  'text-halo-color': '#FFFFFF',
  'text-halo-width': 1,
  'text-halo-blur': 1,
};

const unclusteredPointLayout = {
  'text-size': [
    'interpolate',
    ['exponential', 1.5], // You can adjust the base of the exponential function
    ['zoom'],
    1,
    12, // At zoom level 10
    4,
    13, // At zoom level 10
    5,
    13, // At zoom level 8
    8,
    13, // At zoom level 20
  ],
  'text-field': '{label}',
  'text-font': ['Metropolis Regular'],
  'text-offset': [0, 2], // Offset text below the icon
  'text-allow-overlap': false,
  // 'text-ignore-placement': false,
  'text-anchor': 'top',
  'text-optional': true,
  //'icon-ignore-placement': true,
  'icon-allow-overlap': false,
  'text-allow-overlap': true,
  'text-ignore-placement': true,
  'symbol-avoid-edges': false,
  'icon-image': 'marker-dark',
  'icon-size': [
    'interpolate',
    ['exponential', 1.5], // You can adjust the base of the exponential function
    ['zoom'],
    1,
    0.7, // At zoom level 10
    6,
    0.7, // At zoom level 8
    20,
    1.2, // At zoom level 20
  ],
  /*
  'icon-size': [
    'interpolate',
    ['exponential', 1.5], // You can adjust the base of the exponential function
    ['zoom'],
    1,
    0.2, // At zoom level 10
    6,
    0.8, // At zoom level 8
    20,
    1, // At zoom level 20
  ],
  */
};

const clusterCountLayout = {
  ...unclusteredPointLayout,
  'text-field': '{point_count_abbreviated} ' + t('general.events'),
  'text-allow-overlap': true,
  'text-ignore-placement': true,
  'symbol-avoid-edges': false,
  /*
  'text-font': ['Metropolis Bold'],
  'text-size': 15,
  'text-offset': [0, 0.25], // Offset text below the icon
  */
  'icon-image': 'cluster-marker',
  /*
  'icon-size': [
    'interpolate',
    ['exponential', 1.5], // You can adjust the base of the exponential function
    ['zoom'],
    1,
    1, // At zoom level 10
    6,
    1, // At zoom level 8
    20,
    1.2, // At zoom level 20
  ],
  */
  //'text-offset': [0, 2.5], // Offset text below the icon

  //'icon-allow-overlap': true,
};

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

  .hover-popup: {
    pointer-events: 'all';
  }
  .hover-popup-multiple {
    pointer-events: 'all';
    overflow-y: auto;
    max-height: 250px;
    width: 250px;
    //font-size: 1rem;
    background: linear-gradient($bi-2, $bi-1);

    color: $ti-1;
  }
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
        transparent 200px,
        transparent calc(100% - 200px),
        rgba(0, 0, 0, 0.48) 100%
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

  .event-page-overlay {
    background: linear-gradient(
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 0) 20%,
      rgba(0, 0, 0, 1) 100%
    );
    position: absolute;
    z-index: 2000;
    height: 100%;
    width: 100%;
    pointer-events: none;
  }
}

@media only screen and (max-width: 599px) {
  .main-map {
    :deep(.maplibregl-map) {
      .maplibregl-control-container {
        .maplibregl-ctrl-bottom-right {
          bottom: calc(248px + var(--safe-area-inset-bottom));
          .maplibregl-ctrl-attrib {
            display: none;
          }
        }
      }
    }
  }
}
</style>
