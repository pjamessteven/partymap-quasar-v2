import { defineStore } from 'pinia';
import { default as dayjs } from 'dayjs';
import { Screen, Notify } from 'quasar';

import {
  getPointsRequest,
  getEventDatesRequest,
  getArtistsRequest,
  getTagRequest,
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
import { useAuthStore } from './auth';
import { i18n } from 'src/boot/i18n';
import { useLocalStorage } from '@vueuse/core';

const { t } = i18n.global;
// TODO: improve interface

interface QueryState {
  // control main event date query filters
  startDate: string;
  controlDateRange: { start: string; end: string | null };
  controlDateRangeSelectedOption: { value: string; label: string } | null;
  controlFavorites: boolean;
  controlDuration: string[];
  controlSize: string[];
  controlArtist: Artist[];
  controlTag: Tag[];
  controlCountry: Country | null;
  controlRegion: Region | null;
  controlLocality: Locality | null;
  controlEmptyLineup: boolean;
  controlDateUnconfirmed: boolean;
  // the following state is for dynamic options shown in control dropdowns

  topArtistsInArea: Artist[];
  topRegionsInArea: Region[];

  artistOptions: Artist[];
  artistOptionsHasNext: boolean;
  artistOptionsPerPage: number;
  artistOptionsPage: number;
  artistOptionsLoading: boolean;

  topTagsInArea: Tag[];

  tagOptions: Tag[];
  tagOptionsHasNext: boolean;
  tagOptionsPerPage: number;
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

  // users events
  userEventDates: [EventDate, string][];
  userEventDatesPage: number;
  userEventDatesHasNext: boolean;
  userEventDatesLoading: boolean;
  userEventDatesGroupedByMonth: {
    [key: number]: EventDate[];
  };

  eventDates: [EventDate, string][];
  eventDatesGroupedByMonth: {
    [key: number]: EventDate[];
  };
  eventDatesPage: number;
  eventDatesPages: number;
  eventDatesHasNext: boolean;
  eventDatesLoading: boolean;
  eventDatesRequestId: number | null;
  eventDatesTotal: number | null;
  // artists in bounds
  artists: Artist[];
  artistsHasNext: boolean;
  artistsPage: number;
  artistsLoading: boolean;
}

// when we reset controls we need to reset to this date
// otherwise it triggers a change when we don't want one
const startDate = dayjs().toISOString();

export const useQueryStore = defineStore('query', {
  state: (): QueryState => ({
    startDate,
    controlDateRange: { start: startDate, end: null },
    controlDateRangeSelectedOption: null, // keep state of dynamic date label
    controlFavorites: false,
    controlDuration: [],
    controlSize: [],
    controlArtist: [],
    controlTag: [],
    controlCountry: null,
    controlLocality: null,
    controlRegion: null,
    controlEmptyLineup: false,
    controlDateUnconfirmed: false,

    topRegionsInArea: [],

    topArtistsInArea: [],

    artistOptions: [],
    artistOptionsHasNext: false,
    artistOptionsPerPage: 10,
    artistOptionsPage: 1,
    artistOptionsLoading: false,

    topTagsInArea: [],

    tagOptions: [],
    tagOptionsHasNext: false,
    tagOptionsPerPage: 15,
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

    points: useLocalStorage('points', []),
    loadingPoints: false,

    userEventDates: [],
    userEventDatesGroupedByMonth: {},
    userEventDatesHasNext: false,
    userEventDatesPage: 1,
    userEventDatesLoading: false,

    eventDates: [],
    eventDatesGroupedByMonth: {},
    eventDatesHasNext: false,
    eventDatesPage: 1,
    eventDatesPages: 1,
    eventDatesLoading: false,
    eventDatesRequestId: null,
    eventDatesTotal: null,

    artists: [],
    artistsHasNext: false,
    artistsPage: 1,
    artistsLoading: false,
  }),
  getters: {
    anyFiltersEnabled: (state): boolean => {
      return (
        !!state.controlDateRange.end ||
        state.controlDuration.length > 0 ||
        state.controlSize.length > 0 ||
        state.controlArtist.length > 0 ||
        state.controlTag.length > 0 ||
        !!state.controlCountry ||
        !!state.controlRegion ||
        !!state.controlLocality
      );
    },
  },
  actions: {
    clearResults() {
      this.eventDatesHasNext = true;
      this.eventDatesPage = 1;
      this.eventDatesPages = 1;
      this.eventDatesTotal = null;
      this.eventDates = []; // this is actually quite important
      this.eventDatesGroupedByMonth = {};
    },
    clearDateFilter() {
      this.controlDateRange = { start: dayjs().toISOString(), end: null };
      this.controlDateRangeSelectedOption = null;
    },
    clearAllFilters() {
      this.controlDateRange = {
        start: this.startDate,
        end: null,
      };
      this.controlDateRangeSelectedOption = null;
      this.controlFavorites = false;
      this.controlDuration = [];
      this.controlSize = [];
      this.controlArtist = [];
      this.controlTag = [];
      this.controlCountry = null;
      this.controlLocality = null;
      this.controlRegion = null;
    },
    async loadPoints() {
      try {
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
          this.controlDuration.length > 0
            ? this.controlDuration.map((x) => x.value)
            : undefined,
          this.controlSize.length > 0
            ? this.controlSize.map((x) => x.value)
            : undefined,

          this.controlFavorites ? true : undefined,
          this.controlDateUnconfirmed,
          this.controlEmptyLineup,
        );
        this.points = pointsResponse.data;
        this.loadingPoints = false;
        return;
      } catch (error) {
        this.loadingPoints = false;
        throw error;
      }
    },
    async loadUserEventDates(
      mode: string,
      tense: string,
      username?: string | undefined,
    ) {
      let _username = username;
      if (!username) {
        const authStore = useAuthStore();
        _username = authStore.currentUser?.username;
      }

      try {
        this.userEventDatesLoading = true;
        const response = await getEventDatesRequest({
          radius: undefined,
          bounds: undefined,
          location: null,
          tags: undefined,
          artists: undefined,
          duration_options: null,
          size_options: null,
          date_min:
            tense === 'future'
              ? dayjs().toISOString()
              : dayjs().subtract(10, 'years').toISOString(),
          date_max:
            tense === 'future'
              ? dayjs().add(10, 'years').toISOString()
              : dayjs().toISOString(),
          query: undefined,
          sort: 'start',
          page: this.userEventDatesPage,
          per_page: 20,
          distinct: true,
          all_related_to_user: mode === 'all' ? _username : undefined,
          reviewed_user: mode === 'reviewed' ? _username : undefined,
          going_user: mode === 'going' ? _username : undefined,
          interested_user: mode === 'interested' ? _username : undefined,
          host_user: mode === 'hosting' ? _username : undefined,
          creator_user: mode === 'created' ? _username : undefined,
        });

        if (this.userEventDatesPage === 1) {
          this.userEventDates = response.data.items;

          this.userEventDatesGroupedByMonth = groupEventDatesByMonth(
            {},
            response.data.items,
          );
        } else {
          this.userEventDates = this.userEventDates.concat(response.data.items);

          this.userEventDatesGroupedByMonth = groupEventDatesByMonth(
            this.userEventDatesGroupedByMonth,
            response.data.items,
          );
        }
        this.userEventDatesLoading = false;
        this.userEventDatesHasNext = response.data.has_next;
        return response.data.items;
      } catch (error) {
        this.userEventDatesLoading = false;
        this.userEventDatesHasNext = false;
        throw error;
      }
    },
    async loadEventDates(useBounds, country, region) {
      try {
        const map = useMapStore();
        const main = useMainStore();

        this.eventDatesLoading = true;
        // keep track of request id
        const requestId = Math.random();

        this.eventDatesRequestId = requestId;
        console.log('country', country, region);
        const response = await getEventDatesRequest({
          radius: undefined,
          bounds:
            map.mapBounds && useBounds
              ? JSON.stringify({
                  _northEast: map.mapBounds._ne,
                  _southWest: map.mapBounds._sw,
                })
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
            this.controlDuration.length > 0
              ? this.controlDuration.map((x) => x.value)
              : null,
          size_options:
            this.controlSize.length > 0
              ? this.controlSize.map((x) => x.value)
              : null,
          date_min: this.controlDateRange.start,
          date_max: this.controlDateRange.end,
          country_id: country,
          region_name: region,
          locality_id: this.controlLocality?.id,
          query: undefined,
          favorites: main.sidebarPanel === 'favorites' ? true : undefined,
          sort: 'start',
          page: this.eventDatesPage,
          per_page: Screen.lt.sm ? 10 : 20,
          distinct: true,
          empty_lineup: this.controlEmptyLineup || undefined,
          date_unconfirmed: this.controlDateUnconfirmed || undefined,
        });

        if (this.eventDatesRequestId === requestId) {
          // only save data in store if this is the latest request
          // this prevents the list updating at weird times if there are a lot of
          // calls to the server (even though these calls are debounced, sometimes
          // the round trip takes a while)
          if (this.eventDatesPage === 1) {
            this.eventDates = response.data.items;
            this.eventDatesGroupedByMonth = groupEventDatesByMonth(
              {},
              response.data.items,
            );
            // these things are only returned on first page
            this.topTagsInArea = response.data.top_tags;
            this.topArtistsInArea = response.data.top_artists;
            this.topRegionsInArea = response.data.top_regions;
          } else {
            this.eventDates = this.eventDates?.concat(response.data.items);
            groupEventDatesByMonth(
              this.eventDatesGroupedByMonth,
              response.data.items,
            );
          }
          this.eventDatesLoading = false;
          this.eventDatesHasNext = response.data.has_next;
          this.eventDatesPage += 1;
          this.eventDatesPages = response.data.pages;
          this.eventDatesTotal = response.data.total;
          return response.data.items;
        } else {
          return;
        }
      } catch (error) {
        this.eventDatesLoading = false;
        this.eventDatesHasNext = false;
        Notify.create(t('error_codes.network_error'));
        throw error;
      }
    },
    async loadArtists() {
      try {
        const map = useMapStore();
        this.artistsLoading = true;
        const response = await getArtistsRequest({
          date_min: dayjs().toISOString(),
          date_max: null,
          page: this.artistsPage,
          per_page: 10,
          bounds:
            map.mapBounds && !this.controlFavorites
              ? JSON.stringify({
                  _northEast: map.mapBounds._ne,
                  _southWest: map.mapBounds._sw,
                })
              : undefined,
          radius: undefined,
          sort: 'event_count',
          desc: true,
        });
        if (this.artistsPage === 1) {
          this.artists = response.data.items;
        } else {
          this.artists = this.artists.concat(response.data.items);
        }
        this.artistsHasNext = response.data.has_next;
        this.artistsLoading = false;
        return response.data.items;
      } catch (error) {
        this.artistsLoading = false;
        throw error;
      }
    },
    async loadMoreArtists() {
      this.artistsPage += 1;
      return await this.loadArtists();
    },
    async loadArtistOptions(query: string | null = null) {
      try {
        this.artistOptionsLoading = true;
        const response = await getArtistsRequest({
          query: query,
          page: this.artistOptionsPage,
          per_page: this.artistOptionsPerPage,
          sort: 'event_count',
          desc: true,
        });
        if (this.artistOptionsPage === 1) {
          this.artistOptions = response.data.items;
        } else {
          this.artistOptions = [...this.artistOptions, ...response.data.items];
        }
        this.artistOptionsHasNext = response.data.has_next;
        this.artistOptionsLoading = false;
        this.artistOptionsPage += 1;
        return response.data.items;
      } catch (error) {
        this.artistOptionsLoading = false;
        throw error;
      }
    },
    async loadTagOptions(query: string | null = null) {
      try {
        this.tagOptionsLoading = true;
        const response = await getTagRequest({
          date_min: this.controlDateRange.start,
          date_max: this.controlDateRange.end,
          page: this.tagOptionsPage,
          per_page: this.tagOptionsPerPage,
          tag_name: query,
          sort: 'count',
          desc: true,
        });
        if (this.tagOptionsPage === 1) {
          this.tagOptions = response.data.items;
        } else {
          this.tagOptions = this.tagOptions.concat(response.data.items);
        }
        this.tagOptionsHasNext = response.data.has_next;
        this.tagOptionsLoading = false;
        this.tagOptionsPage += 1;

        return response.data.items;
      } catch (error) {
        this.tagOptionsLoading = false;
        throw error;
      }
    },
  },
});

export const groupEventDatesByMonth = (
  existingDates: { [key: number]: EventDate[] } = {},
  eventDates: EventDate[],
) => {
  for (const ed of eventDates) {
    // assumes eventDates are sorted by time
    const start = dayjs(ed?.start_naive);
    const yearMonth = Number(start.format('YYMM')); // should be int
    if (!existingDates[yearMonth]) {
      existingDates[yearMonth] = [];
    }
    existingDates[yearMonth].push(ed);
  }
  return existingDates;
};
