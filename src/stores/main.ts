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
  userLocationCity: string | null;
  userLocationCountry: string | null;
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
    userLocationCity: null,
    userLocationCountry: null,
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
        this.userLocationCity = response.data.city;
        this.userLocationCountry = response.data.country;
        return;
      } catch (error) {
        throw error;
      }
    },
    getFineLocation() {
      console.log('get fine location');
      if (navigator.geolocation) {
        this.userLocationLoading = true;
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            this.fineLocation = true;
            this.userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            const unknownCityCoords =
              position.coords.latitude + ', ' + position.coords.longitude;

            this.userLocationCity = unknownCityCoords;

            this.userLocationLoading = false;
            try {
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
              console.log('add', address);

              if (address?.city?.length > 0) {
                this.userLocationCity = address.city;
              } else if (address.administrativeLevels?.level1short) {
                this.userLocationCity =
                  address.administrativeLevels?.level1short;
              } else if (address.administrativeLevels?.level2short) {
                this.userLocationCity =
                  address.administrativeLevels?.level2short;
              }
              this.userLocationCountry = address.country;
              this.userLocationLoading = false;
            } catch (e) {
              // just show the co-ords if reverse geocoding fails
              this.userLocationCity =
                position.coords.latitude + ', ' + position.coords.longitude;
              this.userLocationLoading = false;
            }
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
