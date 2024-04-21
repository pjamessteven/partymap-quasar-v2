import { defineStore } from 'pinia';
import { getIpInfoRequest } from 'src/api';
import { IpInfo } from 'src/types/ip_info';
import { Geolocation } from '@capacitor/geolocation';
//import HttpsAdapter from 'node-geocoder/lib/httpadapter/fetchadapter';
import { Notify } from 'quasar';
import { Screen, Platform } from 'quasar';
import { RouteLocationNormalizedLoaded } from 'vue-router';
interface MainStoreState {
  safeAreaInsets: { [key: string]: number };
  disableAnimations: boolean;
  darkMode: boolean;
  showSidebar: boolean;
  showSearchBox: boolean;
  sidebarPanel: string;
  showPanel: boolean;
  showPanelBackground: boolean;
  sidebarOpacity: number;
  sidebarExpanded: boolean;
  enablePanelSwipeDown: boolean;
  disablePanelScroll: boolean;
  menubarOpacity: number;
  overlayOpacity: number;
  ipInfo: IpInfo | null;
  userLocationLoading: boolean;
  userLocation: { lat: number; lng: number } | null;
  userLocationFromSearch: boolean;
  userLocationCity: string | null;
  userLocationCountry: string | null;
  fineLocation: boolean;
  groupEventsByMonth: boolean;
  compactView: boolean;
  routerHistory: RouteLocationNormalizedLoaded[];
}
export const useMainStore = defineStore('main', {
  state: (): MainStoreState => ({
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
    disableAnimations: false,
    darkMode: false,
    showSidebar: true,
    showSearchBox: false, // for menubar search
    sidebarPanel: 'nearby',
    showPanel: Screen.lt.sm,
    showPanelBackground: Screen.lt.sm,
    sidebarExpanded: false,
    enablePanelSwipeDown: true,
    disablePanelScroll: false,
    menubarOpacity: 1,
    sidebarOpacity: 1,
    overlayOpacity: 0,
    ipInfo: null,
    userLocationLoading: false,
    userLocation: null,
    userLocationCity: null,
    userLocationCountry: null,
    userLocationFromSearch: false,
    fineLocation: false,
    groupEventsByMonth: true,
    compactView: true,
    routerHistory: [],
  }),
  getters: {},
  actions: {
    async loadIpInfo() {
      try {
        const response = await getIpInfoRequest();
        this.ipInfo = response.data as IpInfo;
        this.userLocation = {
          lat: response.data.lat,
          lng: response.data.lon,
        };
        this.userLocationCity = response.data.city;
        this.userLocationCountry = response.data.country;
        this.userLocationFromSearch = false;
        this.userLocationLoading = false;
        return;
      } catch (error) {
        //fail silently
        console.log(error);
        //throw error;
      }
    },
    async reverseGecodeUserLocation() {
      try {
        console.log('reverse', this.userLocation);
        const response: any = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${this.userLocation.lat}&lon=${this.userLocation.lng}&format=json&addressdetails=1`,
          {
            method: 'GET',
            headers: {
              'user-agent': 'PartyMap <info@partymap.com>',
            },
          }
        );
        const data = await response.json();
        const address = data.address;
        console.log(data);
        if (address?.city?.length > 0) {
          this.userLocationCity = address.city;
        } else if (address?.town?.length > 0) {
          this.userLocationCity = address.town;
        } else if (address?.village?.length > 0) {
          this.userLocationCity = address.village;
        } else if (address.municipality) {
          this.userLocationCity = address.municipality;
        } else if (address.administrativeLevels?.level1short) {
          this.userLocationCity = address.administrativeLevels?.level1short;
        } else if (address.administrativeLevels?.level2short) {
          this.userLocationCity = address.administrativeLevels?.level2short;
        } else if (address.suburb) {
          this.userLocationCity = address.suburb;
        } else if (address.suburb) {
          this.userLocationCity = address.neighbourhood;
        } else if (address.state_district) {
          this.userLocationCity = address.state_district;
        }
        this.userLocationCountry = address.country;
        this.userLocationLoading = false;
        this.userLocationFromSearch = false;
      } catch (e) {
        // just show the co-ords if reverse geocoding fails
        this.userLocationCity =
          this.userLocation?.lat + ', ' + this.userLocation?.lng;
        this.userLocationLoading = false;
      }
    },
    async getFineLocation() {
      return new Promise((resolve, reject) => {
        if (navigator.geolocation && !Platform.is.capacitor) {
          this.userLocationLoading = true;
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              this.fineLocation = true;
              // show coords while loading place name
              if (!this.userLocation) {
                const unknownCityCoords =
                  position.coords.latitude + ', ' + position.coords.longitude;
                this.userLocationCity = unknownCityCoords;
              }

              this.userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              await this.reverseGecodeUserLocation();

              resolve(null);
            },
            () => {
              Notify.create('Cannot get your location');
              reject(null);
            },
            { timeout: 10000 }
          );
        } else if (Platform.is.capacitor) {
          Geolocation.getCurrentPosition()
            .then(async (position) => {
              this.fineLocation = true;
              // show coords while loading place name
              if (!this.userLocation) {
                const unknownCityCoords =
                  position.coords.latitude + ', ' + position.coords.longitude;
                this.userLocationCity = unknownCityCoords;
              }

              this.userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };

              await this.reverseGecodeUserLocation();

              resolve(null);
            })
            .catch((error) => {
              Notify.create('Cannot get your location');
              reject(null);
            });
        } else {
          this.userLocationLoading = false;
          resolve(null);
        }
      });
    },
  },
});
