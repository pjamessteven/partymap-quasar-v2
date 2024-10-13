import { defineStore } from 'pinia';
import { toRaw } from 'vue';
import moment from 'moment';
import {
  getArtistsRequest,
  getEventDatesRequest,
  getTagRequest,
} from 'src/api';
import { Artist, EventDate, Tag } from 'src/types/autogen_types';
import { useMainStore } from 'src/stores/main';
import { useQueryStore } from 'src/stores/query';
import { useAuthStore } from './auth';
import { useMapStore } from './map';
import { O } from 'app/dist/spa/assets/index.bdd54828';
import L from 'leaflet';
interface NearbyState {
  loadingEverything: boolean;

  queryRadius: number | null;

  nearbyTags: Tag[];
  nearbyTagsHasNext: boolean;
  nearbyTagsPage: number;
  nearbyTagsSuccess: boolean;

  nearbyArtists: Artist[];
  nearbyArtistsHasNext: boolean;
  nearbyArtistsPage: number;
  nearbyArtistsSuccess: boolean;

  nearbyEventDates: EventDate[];
  nearbyEventDatesHasNext: boolean;
  nearbyEventDatesPage: number;
  nearbyEventDatesSuccess: boolean;

  // global event dates for SEO
  eventDatesRequestId: number | null;
  eventDates: EventDate[];
  eventDatesHasNext: boolean;
  eventDatesPage: number;

  eventDatesPages: number; // total pages
}
export const useNearbyStore = defineStore('nearby', {
  state: (): NearbyState => ({
    loadingEverything: false,

    queryRadius: null,
    nearbyTags: [],
    nearbyTagsHasNext: true,
    nearbyTagsPage: 1,
    nearbyTagsSuccess: false,

    nearbyArtists: [],
    nearbyArtistsHasNext: true,
    nearbyArtistsPage: 1,
    nearbyArtistsSuccess: false,

    nearbyEventDates: [],
    nearbyEventDatesHasNext: true,
    nearbyEventDatesPage: 1,
    nearbyEventDatesSuccess: false,

    // global event dates for SEO
    eventDatesRequestId: null,
    eventDates: [],
    eventDatesHasNext: true,
    eventDatesPage: 1,
    eventDatesPages: 1, // total pages
  }),
  getters: {},
  actions: {
    async loadEverything() {
      const authStore = useAuthStore();
      const queryStore = useQueryStore();

      this.loadingEverything = true;

      this.nearbyArtistsPage = 1;
      this.nearbyEventDatesPage = 1;
      this.nearbyTagsPage = 1;
      this.eventDatesPage = 1;

      this.nearbyArtists = [];
      this.nearbyTags = [];
      this.nearbyEventDates = [];
      this.eventDates = [];

      // this first request will return the radius
      // needed for the following requests
      const main = useMainStore();

      try {
        if (main.currentLocation) await this.loadNearbyEventDates();

        // do the following concurrently
        if (main.currentLocation) {
          await Promise.all([
            this.loadNearbyArtists(),
            this.loadNearbyTags(),
            this.loadEventDates(),
            authStore.currentUser
              ? queryStore.loadUserEventDates('all', 'future')
              : undefined,
          ]);
        } else {
          await Promise.all([
            this.loadEventDates(),
            authStore.currentUser
              ? queryStore.loadUserEventDates('all', 'future')
              : undefined,
          ]);
        }

        // show global top tags/top artists if there are no few local results
        if (
          this.nearbyArtists.length < 6 ||
          this.nearbyTags.length < 10 ||
          !main.currentLocation
        ) {
          const queryStore = useQueryStore();
          if (
            this.nearbyArtists.length < 6 &&
            queryStore.artistOptions.length === 0
          )
            await queryStore.loadArtistOptions();
          if (this.nearbyTags.length < 10 && queryStore.tagOptions.length === 0)
            await queryStore.loadTagOptions();
        }
        this.loadingEverything = false;
      } catch (e) {
        this.loadingEverything = false;
      }
    },
    async loadNearbyTags() {
      const main = useMainStore();
      try {
        const response = await getTagRequest({
          date_min: moment().toISOString(),
          date_max: null,
          page: this.nearbyTagsPage,
          per_page: 20,
          desc: true,
          sort: 'count',
          location: JSON.stringify(main.currentLocation),
          radius: this.queryRadius ? this.queryRadius : undefined,
        });
        this.nearbyTags = this.nearbyTags.concat(response.data.items);
        this.nearbyTagsHasNext = response.data.has_next;
        this.nearbyTagsPage += 1;
        this.nearbyTagsSuccess = true;
        return Promise.resolve();
      } catch (error) {
        throw error;
      }
    },

    async loadNearbyArtists() {
      const main = useMainStore();
      try {
        const response = await getArtistsRequest({
          date_min: moment().toISOString(),
          date_max: null,
          page: this.nearbyArtistsPage,
          per_page: 10,
          location: JSON.stringify(main.currentLocation),
          radius: this.queryRadius,
          sort: 'event_count',
          desc: true,
        });
        this.nearbyArtists = this.nearbyArtists.concat(response.data.items);
        this.nearbyArtistsHasNext = response.data.has_next;
        this.nearbyArtistsPage += 1;
        this.nearbyArtistsSuccess = true;
        return Promise.resolve();
      } catch (error) {
        throw error;
      }
    },
    setMapBoundsNearby() {
      /*
      const mappedPoints = this.nearbyEventDates.map((item: any) =>
        item?.[0]?.location?.lat
          ? {
              lat: item?.[0]?.location.lat,
              lng: item?.[0]?.location.lng,
            }
          : {
              lat: undefined,
              lng: undefined,
            }
      );
      const mapStore = useMapStore();

      if (mapStore.map) {
        const bounds = L.latLngBounds(mappedPoints);
        toRaw(mapStore.map).fitBounds(bounds);
      }
      */
    },
    async loadNearbyEventDates() {
      const main = useMainStore();
      try {
        const response = await getEventDatesRequest({
          location: JSON.stringify(main.currentLocation),
          date_min: moment().toISOString(),
          date_max: null,
          radius: this.queryRadius,
          page: this.nearbyEventDatesPage,
          per_page: 20,
          distinct: true,
        });
        if (this.nearbyEventDatesPage === 1) {
          this.nearbyEventDates = response.data.items;
        } else {
          this.nearbyEventDates = this.nearbyEventDates.concat(
            response.data.items
          );
        }

        if (this.nearbyEventDatesPage === 1 && response.data.radius) {
          // server will calculate a fitting query radius
          // if user has not selected one
          this.queryRadius = response.data.radius;
        }
        this.nearbyEventDatesHasNext = response.data.has_next;
        this.nearbyEventDatesPage += 1;
        this.nearbyArtistsSuccess = true;

        // don't do this when searching for locations
        if (!main.currentLocationFromSearch) {
          this.setMapBoundsNearby();
        }

        return;
      } catch (error) {
        throw error;
      }
    },
    // load all event dates for SEO
    async loadEventDates() {
      const main = useMainStore();
      try {
        // keep track of request id
        const requestId = Math.random();
        this.eventDatesRequestId = requestId;

        const response = await getEventDatesRequest({
          date_min: moment().toISOString(),
          date_max: null,
          page: this.eventDatesPage,
          per_page: 10,
          distinct: true,
        });
        if (this.eventDatesRequestId === requestId) {
          if (this.eventDatesPage === 1) {
            this.eventDates = response.data.items;
          } else {
            this.eventDates = this.eventDates?.concat(response.data.items);
          }
          this.eventDatesPages = response.data.pages;
          this.eventDatesHasNext = response.data.has_next;
          this.eventDatesPage += 1;
          return;
        } else {
          return;
        }
      } catch (error) {
        throw error;
      }
    },
  },
});
