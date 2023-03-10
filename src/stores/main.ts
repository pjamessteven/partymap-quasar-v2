import { defineStore } from 'pinia';
import { getIpInfoRequest } from 'src/api';
import { IpInfo } from 'src/types/ip_info';
import { Coordinates } from 'src/types/map';
import NodeGeocoder from 'node-geocoder';
//import HttpsAdapter from 'node-geocoder/lib/httpadapter/fetchadapter';
import { Notify } from 'quasar';
interface MainStoreState {
  darkMode: boolean;
  mapStyle: 'satellite' | 'transport' | 'high_contrast';
  showSidebar: boolean;
  showSearchBox: boolean;
  sidebarExpanded: boolean;
  sidebarPanel: string;
  showPanelMobile: boolean;
  menubarOpacity: number;
  overlayOpacity: number;
  ipInfo: IpInfo | null;
  userLocationLoading: boolean;
  userLocation: Coordinates | null;
  userLocationName: string | null;
  userLocationCity: string | null;
  fineLocation: boolean;
}

export const useMainStore = defineStore('main', {
  state: (): MainStoreState => ({
    darkMode: false,
    mapStyle: 'satellite',
    showSidebar: true,
    showSearchBox: false, // for menubar search
    sidebarExpanded: false,
    sidebarPanel: 'nearby',
    showPanelMobile: true,
    menubarOpacity: 1,
    overlayOpacity: 0,
    ipInfo: null,
    userLocationLoading: false,
    userLocation: null,
    userLocationName: null,
    userLocationCity: null,
    fineLocation: false,
  }),
  actions: {
    darkModeToggle() {
      this.darkMode = !this.darkMode;
    },
    async loadIpInfo() {
      try {
        const response = await getIpInfoRequest();
        this.ipInfo = response.data as IpInfo;
        this.userLocation = {
          lat: response.data.lat,
          lng: response.data.lon,
        };
        this.userLocationName =
          response.data.city + ', ' + response.data.country;
        this.userLocationCity = response.data.city;
        return;
      } catch (error) {
        return error;
      }
    },
    getFineLocation() {
      console.log('get fine location');
      if (navigator.geolocation) {
        this.userLocationLoading = true;
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.fineLocation = true;
            this.userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            const unknownCityCoords =
              position.coords.latitude + ', ' + position.coords.longitude;

            this.userLocationName = unknownCityCoords;
            this.userLocationCity = 'test';

            this.userLocationLoading = false;
            /*
            TODO: fix this shit: get current location name

            const fetchAdapter = require('node-geocoder/lib/httpadapter/fetchadapter');

            const geocoder = NodeGeocoder({
              provider: 'openstreetmap',
              fetch: function fetch(url, options) {
                return fetchAdapter(url, {
                  ...options,
                  headers: {
                    'user-agent': 'PartyMap <info@partymap.com>',
                  },
                });
              },
            });
            console.log('create geocoder');

            geocoder
              .reverse({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
              })
              .then(async (res: NodeGeocoder.Entry[]) => {
                if (res[0].city && res[0].city.length > 0) {
                  this.userLocationName = res[0].city;
                } else if (res[0].administrativeLevels?.level1short) {
                  this.userLocationName =
                    res[0].administrativeLevels?.level1short;
                } else if (res[0].administrativeLevels?.level2short) {
                  this.userLocationName =
                    res[0].administrativeLevels?.level2short;
                }
                if (res[0].country) {
                  this.userLocationName =
                    this.userLocationName + ', ' + res[0].country;
                }
                this.userLocationLoading = false;
              })
              .catch(() => {
                const unknownCityCoords =
                  position.coords.latitude + ', ' + position.coords.longitude;

                this.userLocationName = unknownCityCoords;

                this.userLocationLoading = false;
              }); */
          },
          () => {
            Notify.create('Cannot get your location');
            this.userLocationLoading = false;
          },
          { timeout: 10000 }
        );
      } else {
        this.userLocationLoading = false;
      }
    },
  },
});
