import { defineStore } from 'pinia';
import { HoverMarker, MapView } from 'src/types/map';
import { Dark } from 'quasar';
import {
  LngLat,
  LngLatBounds,
  LngLatBoundsLike,
  LngLatLike,
  Map,
} from 'maplibre-gl';

interface MapStoreState {
  map: null | Map;
  mapStyle: 'satellite' | 'transport' | 'toner';
  mapBounds: LngLatBounds | null;
  mapCenter: LngLatLike | null;
  focusMarker: { lat: number; lng: number; place_id: number } | null;
  eventDateHoverMarker: HoverMarker | null;
  exploreMapView: MapView | null;
  mapMoving: boolean;
  blockUpdates: boolean;
  preventMapZoom: boolean;

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

    mapZoomLevel: 3,
  }),
  getters: {
    showResults: (state): boolean => {
      return (state.mapMoving && state.blockUpdates) || !state.mapMoving;
    },

    satelliteMapStyleUrl: (): string => {
      return 'https://maps.partymap.com/styles/satellite-hybrid-globe/style.json';
    },
    classicMapStyleUrl: (): string => {
      return 'https://maps.partymap.com/styles/outdoors/style.json';
    },
    transportMapStyleUrl: (): string => {
      if (Dark.isActive) {
        return 'https://maps.partymap.com/styles/dark_matter/style.json';
      } else {
        return 'https://maps.partymap.com/styles/dark_matter_inverted/style.json';
      }

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
    currentMapStyleUrl(state): string {
      if (state.mapStyle === 'monochrome') {
        return this.transportMapStyleUrl;
      } else if (state.mapStyle === 'classic') {
        return this.classicMapStyleUrl;
      } else {
        return this.satelliteMapStyleUrl;
      }
    },
    currentMapTileAttribution(state): string {
      if (state.mapStyle === 'classic') {
        return this.tonerMapTileAttribution;
      } else if (state.mapStyle === 'monochrome') {
        return this.transportMapTileAttribution;
      } else {
        return this.satelliteMapTileAttribution;
      }
    },
  },
});
