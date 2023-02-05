import { defineStore } from 'pinia';
import moment from 'moment';
import {
  getPointsRequest,
  getEventDatesRequest,
  getArtistsRequest,
} from 'src/api';
import {
  Artist,
  Country,
  EventDate,
  Locality,
  Location,
  Region,
  Tag,
} from 'src/types/autogen_types';
import { useMainStore } from './main';
import { useMapStore } from './map';

interface QueryState {
  // control main event date query filters

  controlDateRange: { start: string; end: string };
  controlDateRangeSelectedOption: { value: string; label: string };
  controlFavorites: boolean;
  controlDuration: string[];
  controlSize: string[];
  controlArtist: Artist[];
  controlTag: Tag[];
  controlCountry: Country | null;
  controlRegion: Region | null;
  controlLocality: Locality | null;

  // the following state is for dynamic options shown in control dropdowns

  artistOptions: Artist[];
  artistOptionsHasNext: boolean;
  artistOptionsPage: number;
  artistOptionsLoading: boolean;

  tagOptions: Tag[];
  tagOptionsHasNext: boolean;
  tagOptionsPage: number;
  tagOptionsLoading: boolean;

  countryOptions: Country[];
  countryOptionsHasNext: boolean;
  countryOptionsPage: number;
  countryOptionsLoading: boolean;

  regionOptions: Region[];
  regionOptionsHasNext: boolean;
  regionOptionsPage: number;
  regionOptionsLoading: boolean;

  localityOptions: Locality[];
  localityOptionsHasNext: boolean;
  localityOptionsPage: number;
  localityOptionsLoading: boolean;

  locationOptions: Location[];
  locationOptionsHasNext: boolean;
  locationOptionsPage: number;
  locationOptionsLoading: boolean;

  // map points
  points: Location[];
  loadingPoints: boolean;

  // event dates in bounds/query
  eventDates: EventDate[];
  eventDatesPage: number;
  eventDatesHasNext: boolean;
  eventDatesLoading: boolean;
  eventDatesRequestId: number | null;

  // artists in bounds
  artists: Artist[];
  artistsHasNext: boolean;
  artistsPage: number;
  artistsLoading: boolean;
}

export const useQueryStore = defineStore('query', {
  state: (): QueryState => ({
    controlDateRange: { start: moment().toISOString(), end: null, label: null },
    controlFavorites: false,
    controlDuration: [],
    controlSize: [],
    controlArtist: [],
    controlTag: [],
    controlCountry: null,
    controlLocality: null,
    controlRegion: null,

    artistOptions: [],
    artistOptionsHasNext: false,
    artistOptionsPage: 1,
    artistOptionsLoading: false,

    tagOptions: [],
    tagOptionsHasNext: false,
    tagOptionsPage: 1,
    tagOptionsLoading: false,

    countryOptions: [],
    countryOptionsHasNext: false,
    countryOptionsPage: 1,
    countryOptionsLoading: false,

    regionOptions: [],
    regionOptionsHasNext: false,
    regionOptionsPage: 1,
    regionOptionsLoading: false,

    localityOptions: [],
    localityOptionsHasNext: false,
    localityOptionsPage: 1,
    localityOptionsLoading: false,

    locationOptions: [],
    locationOptionsHasNext: false,
    locationOptionsPage: 1,
    locationOptionsLoading: false,

    points: [],
    loadingPoints: false,

    eventDates: [],
    eventDatesHasNext: false,
    eventDatesPage: 1,
    eventDatesLoading: false,
    eventDatesRequestId: null,

    artists: [],
    artistsHasNext: false,
    artistsPage: 1,
    artistsLoading: false,
  }),
  getters: {},
  actions: {
    async loadPoints() {
      try {
        this.loadingPoints = true;
        const pointsResponse = await getPointsRequest(
          this.controlDateRange.start,
          this.controlDateRange.end,
          undefined, // query string
          this.controlTag.length > 0
            ? this.controlTag.map((tag) => tag.tag)
            : undefined,
          this.controlArtist.length > 0
            ? this.controlArtist.map((artist) => artist.id)
            : undefined,
          this.controlDuration.length > 0 ? this.controlDuration : undefined,
          this.controlSize.length > 0 ? this.controlSize : undefined,

          this.controlFavorites ? true : undefined
        );
        this.points = pointsResponse.data;
        this.loadingPoints = false;
        return;
      } catch (error) {
        this.loadingPoints = false;
        return error;
      }
    },
    async loadEventDates() {
      try {
        const map = useMapStore();
        const main = useMainStore();

        this.eventDatesLoading = true;
        // keep track of request id
        const requestId = Math.random();
        this.eventDatesRequestId = requestId;
        getEventDatesRequest({
          radius: undefined,
          bounds:
            map.mapBounds && !this.controlFavorites
              ? JSON.stringify(map.mapBounds)
              : undefined,
          location: main.userLocation
            ? JSON.stringify(main.userLocation)
            : null,
          tags:
            this.controlTag.length > 0
              ? this.controlTag.map((tag) => tag.tag)
              : undefined,
          artists:
            this.controlArtist.length > 0
              ? this.controlArtist.map((artist) => artist.id)
              : undefined,
          duration_options:
            this.controlDuration.length > 0 ? this.controlDuration : null,
          size_options: this.controlSize.length > 0 ? this.controlSize : null,
          date_min: this.controlDateRange.start,
          date_max: this.controlDateRange.end,
          country_id: this.controlCountry?.short_name,
          region_id: this.controlRegion?.id,
          locality_id: this.controlLocality?.id,
          query: undefined,
          favorites: main.sidebarPanel === 'favorites' ? true : undefined,
          sort_option: 'date',
          page: this.eventDatesPage,
          per_page: 10,
          distinct: true,
        }).then(
          (response) => {
            if (this.eventDatesRequestId === requestId) {
              // only save data in store if this is the latest request
              // this prevents the list updating at weird times if there are a lot of
              // calls to the server (even though these calls are debounced, sometimes
              // the round trip takes a while)
              if (this.eventDatesPage === 1) {
                this.eventDates = response.data.items;
              } else {
                this.eventDates = this.eventDates.concat(response.data.items);
              }
              this.eventDates = response.data.items;
              this.eventDatesLoading = false;
              this.eventDatesHasNext = response.data.has_next;
            }
            return response.data.items;
          },
          (error) => {
            this.eventDatesLoading = false;
            this.eventDatesHasNext = false;
            return error;
          }
        );
      } catch (error) {
        return error;
      }
    },
    async loadArtists() {
      try {
        const map = useMapStore();
        this.artistsLoading = true;
        const response = await getArtistsRequest({
          date_min: moment().toISOString(),
          date_max: null,
          page: this.artistsPage,
          per_page: 10,
          bounds:
            map.mapBounds && !this.controlFavorites
              ? JSON.stringify(map.mapBounds)
              : undefined,
          radius: undefined,
          sort: 'event_count',
          desc: true,
        });
        this.artists = this.artists.concat(response.data.items);
        this.artistsHasNext = response.data.has_next;
        this.artistsLoading = false;
        return response.data.items;
      } catch (error) {
        this.artistsLoading = false;
        return error;
      }
    },
    async loadMoreArtists() {
      this.artistsPage += 1;
      return await this.loadArtists();
    },
    async loadArtistOptions(query: string) {
      try {
        this.artistOptionsLoading = true;
        const response = await getArtistsRequest({
          query: query,
          page: this.artistOptionsPage,
          per_page: 20,
          sort: 'event_count',
          desc: true,
        });
        if (this.artistOptionsPage === 1) {
          this.artistOptions = response.data.items;
        } else {
          this.artistOptions = this.artists.concat(response.data.items);
        }
        this.artistOptionsHasNext = response.data.has_next;
        this.artistOptionsHasNext = false;
        return response.data.items;
      } catch (error) {
        this.artistOptionsLoading = false;
        return error;
      }
    },
    async loadMoreArtistOptions(query: string) {
      this.artistOptionsPage += 1;
      return await this.loadArtistOptions(query);
    },
  },
});
