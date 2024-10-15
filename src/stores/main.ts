import { defineStore } from 'pinia';
import { getIpInfoRequest } from 'src/api';
import { IpInfo } from 'src/types/ip_info';
import { Geolocation } from '@capacitor/geolocation';
//import HttpsAdapter from 'node-geocoder/lib/httpadapter/fetchadapter';
import { Notify } from 'quasar';
import { Screen, Platform } from 'quasar';
import { RouteLocationNormalizedLoaded } from 'vue-router';
import { LngLat, LngLatLike } from 'maplibre-gl';

interface MainStoreState {
  windowWidth: number;
  safeAreaInsets: { [key: string]: number };
  disableAnimations: boolean;
  darkMode: boolean;
  showSidebar: boolean;
  showSearchBox: boolean;
  sidebarPanel: string;
  sidebarMinimized: boolean;
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
  fineLocation: boolean;
  userLocation: LngLatLike | null;
  userLocationCity: string | null;
  userLocationCountry: string | null;
  currentLocation: LngLatLike | null;
  currentLocationCity: string | null;
  currentLocationCountry: string | null;
  currentLocationFromSearch: boolean;
  groupEventsByMonth: boolean;
  compactView: boolean;
  routerHistory: RouteLocationNormalizedLoaded[];
  tips: {
    [key: string]: boolean;
  };
}
const localTips = localStorage.getItem('tips');

export const useMainStore = defineStore('main', {
  state: (): MainStoreState => ({
    windowWidth: 0,
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
    disableAnimations: false,
    darkMode: false,
    sidebarMinimized: false,
    showSidebar: true,
    showSearchBox: false, // for menubar search
    sidebarPanel: '',
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
    currentLocationFromSearch: false,
    currentLocation: null,
    currentLocationCity: 'In this area',
    currentLocationCountry: null,
    fineLocation: false,
    groupEventsByMonth: true,
    compactView: true,
    routerHistory: [],
    tips: (localTips && JSON.parse(localTips)) || {
      hidePanelTip: true,
      oldAndroid: true,
    },
  }),
  getters: {},
  actions: {
    restoreUserLocation() {
      this.currentLocation = this.userLocation;
      this.currentLocationCity = this.userLocationCity;
      this.currentLocationCountry = this.userLocationCountry;
    },
    persistTipsToLocalStorage() {
      localStorage.setItem('tips', JSON.stringify(this.tips));
    },
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

        this.currentLocation = this.userLocation;
        this.currentLocationCity = this.userLocationCity;
        this.currentLocationCountry = this.userLocationCountry;

        this.currentLocationFromSearch = false;
        this.userLocationLoading = false;
        return;
      } catch (error) {
        //fail silently
        console.log(error);
        this.userLocationLoading = false;
        this.currentLocationCity = 'No IP location!';
        this.userLocationCity = 'No IP location!';

        return;
        //throw error;
      }
    },
    async reverseGecodeLocation(coords: LngLatLike, zoom = 22) {
      //
      let city;
      let country;
      let state;
      try {
        const response: any = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json&addressdetails=1`,
          {
            method: 'GET',
            headers: {
              'user-agent': 'PartyMap <info@partymap.com>',
            },
          }
        );
        const data = await response.json();
        const address = data.address;
        if (address) {
          if (address?.city?.length > 0) {
            city = address.city;
          } else if (address?.town?.length > 0) {
            city = address.town;
          } else if (address?.village?.length > 0) {
            city = address.village;
          } else if (address?.municipality) {
            city = address.municipality;
          } else if (address?.administrativeLevels?.level1short) {
            city = address.administrativeLevels?.level1short;
          } else if (address.administrativeLevels?.level2short) {
            city = address.administrativeLevels?.level2short;
          } else if (address.suburb) {
            city = address.suburb;
          } else if (address.suburb) {
            city = address.neighbourhood;
          } else if (address.county) {
            city = address.county;
          } else if (address.state_district) {
            city = address.state_district;
          }
          country = address.country;
          state = address.state || address.state_district;
        }
      } catch (e) {
        throw e;
        // just show the co-ords if reverse geocoding fails
      }
      return { city, country, state };
    },
    async getFineLocation() {
      let fineLocation;
      try {
        fineLocation = await new Promise<LngLatLike>((resolve, reject) => {
          if (navigator.geolocation && !Platform.is.capacitor) {
            this.userLocationLoading = true;
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                // show coords while loading place name
                if (!this.userLocation) {
                  const unknownCityCoords =
                    position.coords.latitude.toFixed(1) +
                    ', ' +
                    position.coords.longitude.toFixed(1);
                  //  this.currentLocationCity = unknownCityCoords;
                  this.userLocationCity = unknownCityCoords;
                  this.currentLocationCity = this.userLocationCity;
                }

                resolve({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                });
              },
              () => {
                reject(null);
              },
              { timeout: 10000 }
            );
          } else if (Platform.is.capacitor) {
            Geolocation.getCurrentPosition()
              .then(async (position) => {
                // show coords while loading place name
                if (!this.userLocation) {
                  const unknownCityCoords =
                    position.coords.latitude.toFixed(1) +
                    ', ' +
                    position.coords.longitude.toFixed(1);

                  // this.currentLocationCity = unknownCityCoords;
                  this.userLocationCity = unknownCityCoords;
                  this.currentLocationCity = this.userLocationCity;
                }

                resolve({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                });
              })
              .catch((error) => {
                reject(null);
              });
          } else {
            reject(null);
          }
        });
      } catch (e) {}

      if (fineLocation) {
        this.fineLocation = true;
        const revereseGeo = await this.reverseGecodeLocation(fineLocation);

        this.userLocationCountry = revereseGeo.country;
        this.userLocationCity = revereseGeo.city;
        this.userLocation = fineLocation;

        this.currentLocation = fineLocation;
        this.currentLocationCountry = this.userLocationCountry;
        this.currentLocationCity = this.userLocationCity;

        this.userLocationLoading = false;
        this.currentLocationFromSearch = false;
      } else {
        this.fineLocation = false;
        Notify.create({
          message:
            "Can't get your location! \n\n Using IP address location instead...",
          icon: 'error',
        });

        this.userLocationLoading = false;
        throw new Error('Cant get fine location');
      }
    },
  },
});
