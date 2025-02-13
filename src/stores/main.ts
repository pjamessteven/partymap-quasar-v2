import { defineStore } from 'pinia';
import { getIpInfoRequest } from 'src/api';
import type { IpInfo } from 'src/types/ip_info';
import { Geolocation } from '@capacitor/geolocation';
//import HttpsAdapter from 'node-geocoder/lib/httpadapter/fetchadapter';
import { Notify } from 'quasar';
import { Screen, Platform, Dark } from 'quasar';
import type { RouteLocationNormalizedLoaded } from 'vue-router';
import type { LngLatLike } from 'maplibre-gl';
import { LngLat } from 'maplibre-gl';
import { i18n } from 'src/boot/i18n';
import { default as dayjs } from 'dayjs';
import importLocale from 'src/import-locale';
import { useLocalStorage } from '@vueuse/core';
import axios from 'axios';
import { NavigationBar } from '@hugotomazi/capacitor-navigation-bar';

const { t, locale } = i18n.global;

interface MainStoreState {
  windowWidth: number;
  safeAreaInsets: { [key: string]: number };
  disableAnimations: boolean;
  darkModePref: boolean | 'auto';
  showSidebar: boolean;
  sidebarWidth: number;
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
  unknownCityCoords: string;
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
  language: string;
  forceUpdate: number;
  isInitialLoad: boolean;
}

export const useMainStore = defineStore('main', {
  state: (): MainStoreState => ({
    windowWidth: 0,
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
    disableAnimations: false,
    darkModePref: useLocalStorage('darkModePref', 'auto'),
    sidebarMinimized: false,
    showSidebar: true,
    sidebarWidth: useLocalStorage('sidebarWidth', '568'),
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
    userLocation: null, // don't store in localStorage as this is sensitive
    userLocationCity: null,
    unknownCityCoords: '',
    userLocationCountry: null,
    currentLocationFromSearch: false,
    currentLocation: null,
    currentLocationCity: Screen.lt.sm ? '...' : t('nearby_view.this_area'),
    currentLocationCountry: null,
    fineLocation: false,
    groupEventsByMonth: true,
    compactView: true,
    routerHistory: [],
    tips: {
      hidePanelTip: true,
      oldAndroid: true,
    },
    languagePref: useLocalStorage('languagePref', null),
    forceUpdate: 0,
    isInitialLoad: true,
  }),
  getters: {
    desktopSidebarShowing: (state): boolean => {
      return (
        Screen.gt.lg &&
        (state.sidebarPanel === 'explore' || state.sidebarPanel === 'nearby')
      );
    },
  },
  actions: {
    setDarkMode(val) {
      // true | false | auto
      Dark.set(val);
      this.darkModePref = val;
      if (Platform.is.android && Platform.is.capacitor) {
        if (Dark.isActive) {
          NavigationBar.setColor({ color: '#000000', darkButtons: false });
        } else {
          NavigationBar.setColor({ color: '#FFFFFF', darkButtons: true });
        }
        NavigationBar.setTransparency({ isTransparent: true });
      }
    },
    forceUpdate() {
      this.forceUpdate += 1;
    },
    async setLocale(localeString: string) {
      const lowercaseLocale = localeString.toLowerCase();

      axios.defaults.headers.common['lang'] = lowercaseLocale;

      try {
        await importLocale(localeString);
        if (localeString === 'en') {
          // handle en-US case with stupid mm/dd/yyyy formatting
          const userLocale = navigator.language || 'en';
          dayjs.locale(userLocale);
        } else {
          dayjs.locale(lowercaseLocale);
        }
      } catch (e) {
        console.log('locale not supported', e);
        await import('dayjs/locale/en');
        dayjs.locale('en');
      }
    },
    restoreUserLocation() {
      this.currentLocation = this.userLocation;
      this.currentLocationCity =
        this.userLocationCity || t('nearby_view.this_area');
      this.currentLocationCountry = this.userLocationCountry;
    },
    persistTipsToLocalStorage() {
      localStorage.setItem('tips', JSON.stringify(this.tips));
    },
    async loadIpInfo() {
      try {
        const response = await getIpInfoRequest();
        console.log('resp', response);
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
        this.currentLocationCity = 'No location!';
        this.userLocationCity = 'No location!';

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
          `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json&addressdetails=1&accept-language=${locale.value},en`,
          {
            method: 'GET',
            headers: {
              'user-agent': 'PartyMap <info@partymap.com>',
            },
          },
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
                  this.unknownCityCoords =
                    position.coords.latitude.toFixed(1) +
                    ', ' +
                    position.coords.longitude.toFixed(1);
                  //  this.currentLocationCity = unknownCityCoords;
                  this.userLocationCity = this.unknownCityCoords;
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
              { timeout: 10000 },
            );
          } else if (Platform.is.capacitor) {
            Geolocation.getCurrentPosition()
              .then(async (position) => {
                // show coords while loading place name
                if (!this.userLocation) {
                  this.unknownCityCoords =
                    position.coords.latitude.toFixed(1) +
                    ', ' +
                    position.coords.longitude.toFixed(1);

                  // this.currentLocationCity = unknownCityCoords;
                  this.userLocationCity = this.unknownCityCoords;
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
        if (!this.currentLocationCity) {
          //  this.currentLocationCity = this.unknownCityCoords;
          this.currentLocationCity = t('nearby_view.this_area');
        }

        this.userLocationLoading = false;
        this.currentLocationFromSearch = false;
      } else {
        this.fineLocation = false;
        Notify.create({
          message: t('error_codes.no_location'),
          icon: 'error',
          closeBtn: true,
        });

        this.userLocationLoading = false;
        throw new Error('Cant get fine location');
      }
    },
  },
});
