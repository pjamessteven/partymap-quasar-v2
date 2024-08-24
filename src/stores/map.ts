import { defineStore } from 'pinia';
import { LatLngBounds, LatLng } from 'leaflet';
import { Coordinates, HoverMarker, MapView } from 'src/types/map';
import { Dark } from 'quasar';
import L from 'leaflet';

interface MapStoreState {
  map: null | L.Map;
  mapStyle: 'satellite' | 'transport' | 'toner';
  mapBounds: LatLngBounds | null;
  mapCenter: LatLng | null;
  focusMarker: Coordinates | null;
  eventDateHoverMarker: HoverMarker | null;
  exploreMapView: MapView | null;
  mapMoving: boolean;
  blockUpdates: boolean;
  preventMapZoom: boolean;
  defaultIcon: L.DivIcon;
  locationIcon: L.DivIcon;
  mapZoomLevel: number;
  peekMap: boolean;
}

export const useMapStore = defineStore('map', {
  state: (): MapStoreState => ({
    map: null,
    mapStyle: 'satellite',
    mapBounds: null, // calculated visible bounds (minus sidebar/mobile nav)
    mapCenter: null, // calculated center (minus sidebar/mobile nav)
    focusMarker: null, // previously eventPageFocus
    eventDateHoverMarker: null,
    exploreMapView: null,
    mapMoving: false,
    blockUpdates: false,
    peekMap: false,
    preventMapZoom: false,
    defaultIcon: L.divIcon({
      className: 'marker-icon', // style defined in App.vue
      iconAnchor: [12, 30],
      iconSize: [25, 30],
      tooltipAnchor: [3, -32],
    }),
    locationIcon: L.divIcon({
      className: 'location-marker-icon', // style defined in App.vue
      iconAnchor: [9, 9],
      iconSize: [18, 18],
      tooltipAnchor: [0, 0],
    }),
    mapZoomLevel: 3,
  }),
  getters: {
    showResults: (state): boolean => {
      return (state.mapMoving && state.blockUpdates) || !state.mapMoving;
    },
    tonerMapTileUrl: (): string => {
      if (Dark.isActive) {
        return (
          // 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}' +
          'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}' +
          (L.Browser.retina ? '@2x' : '') +
          '.png'
        );
      } else {
        return (
          'https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}' +
          (L.Browser.retina ? '@2x' : '') +
          '.png'
        );
      }
    },
    satelliteMapTileUrl: (): string => {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    },
    labelsMapTileUrl: (): string => {
      // this semi-transparent layer is overlaid ontop of the label-less satellite map to make it more usable
      // return 'https://tiles.stadiamaps.com/tiles/stamen_toner_hybrid/{z}/{x}/{y}';
      const apiKey = process.env.TOMTOM_KEY;

      return (
        'https://{s}.api.tomtom.com/map/1/tile/hybrid/night/{z}/{x}/{y}' +
        `.png?key=${apiKey}&tileSize=${
          L.Browser.retina ? '512' : '256'
        }&language=en-US`
      );
    },
    transportMapTileUrl: (): string => {
      const res = L.Browser.retina ? '512' : '256';
      const ppi = L.Browser.retina ? '&ppi=320' : '';
      const apiKey = process.env.HERE_API_KEY;
      if (Dark.isActive) {
        const style = 'normal.night.transit';
        return `https://2.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/${style}/{z}/{x}/{y}/${res}/png8?apiKey=${apiKey}${ppi}`;
      } else {
        const style = 'normal.day.transit';
        return `https://2.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/${style}/{z}/{x}/{y}/${res}/png8?apiKey=${apiKey}${ppi}`;
      }
    },
    tonerMapTileAttribution: (): string => {
      return '<a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.';
    },
    transportMapTileAttribution: (): string => {
      return '&copy; HERE ' + new Date().getFullYear();
    },
    satelliteMapTileAttribution: (): string => {
      return '&copy; Satellite imagery by <a href="http://arcgisonline.com">Esri</a> under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>, labels by <a href="http://tomtom.com">TomTom</a>';
    },
    currentMapTileUrl(state): string {
      if (state.mapStyle === 'toner') {
        return this.tonerMapTileUrl;
      } else if (state.mapStyle === 'transport') {
        return this.transportMapTileUrl;
      } else {
        return this.satelliteMapTileUrl;
      }
    },
    currentMapTileAttribution(state): string {
      if (state.mapStyle === 'toner') {
        return this.tonerMapTileAttribution;
      } else if (state.mapStyle === 'transport') {
        return this.transportMapTileAttribution;
      } else {
        return this.satelliteMapTileAttribution;
      }
    },
  },
});
