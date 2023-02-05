import { defineStore } from 'pinia';
import moment from 'moment';
import {
  getArtistsRequest,
  getEventDatesRequest,
  getTagRequest,
} from 'src/api';
import { Artist, EventDate, Tag } from 'src/types/autogen_types';
import { useMainStore } from 'src/stores/main';
interface NearbyState {
  loadingEverything: boolean;

  queryRadius: number | null;
  nearbyTags: Tag[];
  nearbyTagsHasNext: boolean;
  nearbyTagsPage: number;

  nearbyArtists: Artist[];
  nearbyArtistsHasNext: boolean;
  nearbyArtistsPage: number;

  nearbyEventDates: EventDate[];
  nearbyEventDatesHasNext: boolean;
  nearbyEventDatesPage: number;

  // global event dates for SEO
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
    nearbyTagsHasNext: false,
    nearbyTagsPage: 1,

    nearbyArtists: [],
    nearbyArtistsHasNext: false,
    nearbyArtistsPage: 1,

    nearbyEventDates: [],
    nearbyEventDatesHasNext: false,
    nearbyEventDatesPage: 1,

    // global event dates for SEO
    eventDates: [],
    eventDatesHasNext: false,
    eventDatesPage: 1,
    eventDatesPages: 1, // total pages
  }),
  getters: {},
  actions: {
    async loadEverything() {
      this.loadingEverything = true;
      this.nearbyArtistsPage = 1;
      this.nearbyEventDatesPage = 1;
      this.nearbyArtistsPage = 1;
      this.nearbyArtists = [];
      this.nearbyTags = [];
      this.nearbyEventDates = [];

      // this first request will return the radius
      // needed for the following requests
      await this.loadNearbyEventDates();

      // do the following concurrently
      await Promise.all([this.loadNearbyArtists(), this.loadNearbyTags()]);

      this.loadingEverything = false;
    },
    async loadNearbyTags() {
      const main = useMainStore();
      try {
        const response = await getTagRequest({
          date_min: moment().toISOString(),
          date_max: null,
          page: this.nearbyTagsPage,
          per_page: 10,
          desc: true,
          sort: 'count',
          location: main.userLocation,
          radius: this.queryRadius ? this.queryRadius : undefined,
        });
        this.nearbyTags = this.nearbyTags.concat(response.data.items);
        this.nearbyTagsHasNext = response.data.has_next;
        return;
      } catch (error) {
        return error;
      }
    },
    async loadMoreNearbyTags() {
      this.nearbyTagsPage += 1;
      return await this.loadNearbyTags();
    },
    async loadNearbyArtists() {
      const main = useMainStore();
      try {
        const response = await getArtistsRequest({
          date_min: moment().toISOString(),
          date_max: null,
          page: this.nearbyArtistsPage,
          per_page: 10,
          location: main.userLocation,
          radius: this.queryRadius,
          sort: 'event_count',
          desc: true,
        });
        this.nearbyArtists = this.nearbyArtists.concat(response.data.items);
        this.nearbyArtistsHasNext = response.data.has_next;
        return;
      } catch (error) {
        return error;
      }
    },
    async loadMoreNearbyArtists() {
      this.nearbyArtistsPage += 1;
      return await this.loadNearbyArtists();
    },
    async loadNearbyEventDates() {
      const main = useMainStore();
      try {
        const response = await getEventDatesRequest({
          location: main.userLocation,
          date_min: moment().toISOString(),
          date_max: null,
          radius: this.queryRadius,
          page: this.eventDatesPage,
          per_page: 10,
          distinct: true,
        });
        if (this.eventDatesPage === 1) {
          this.nearbyEventDates = response.data.items;
        } else {
          this.nearbyEventDates = this.nearbyEventDates.concat(
            response.data.items
          );
        }
        if (this.queryRadius === null && response.data.radius) {
          // server will calculate a fitting query radius
          // if user has not selected one
          this.queryRadius = response.data.radius;
        }
        this.nearbyEventDatesHasNext = response.data.has_next;
        return;
      } catch (error) {
        return error;
      }
    },
    async loadMoreNearbyEventDates() {
      this.nearbyEventDatesPage += 1;
      return await this.loadNearbyEventDates();
    },
    // load all event dates for SEO
    async loadEventDates() {
      const main = useMainStore();
      try {
        const response = await getEventDatesRequest({
          date_min: moment().toISOString(),
          date_max: null,
          location: main.userLocation,
          page: this.eventDatesPage,
          per_page: 10,
          distinct: true,
        });
        this.eventDates = this.eventDates.concat(response.data.items);
        this.eventDatesHasNext = response.data.has_next;
      } catch (error) {
        return error;
      }
    },
    async loadMoreEventDates() {
      this.eventDatesPage += 1;
      return await this.loadEventDates();
    },
  },
});
