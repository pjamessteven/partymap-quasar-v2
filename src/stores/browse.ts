import { defineStore } from 'pinia';
import { default as dayjs } from 'dayjs';
import { Screen, Notify } from 'quasar';

import { getEventDatesRequest } from 'src/api';
import { EventDate } from 'src/types/autogen_types';
import { useMainStore } from './main';

import { groupEventDatesByMonth } from './query';
import { i18n } from 'src/boot/i18n';
import { getCountriesRequest } from 'src/api';
import { getCountryRegionsRequest } from 'src/api';

const { t } = i18n.global;

// TODO: improve interface

interface BrowseState {
  countries: {
    short_name: string;
    event_count: number;
  }[];
  taggedEvents: {
    [key: string]: {
      eventDates: [EventDate, string][];
      eventDatesGroupedByMonth: {
        [key: number]: [EventDate, string][];
      };
      eventDatesPage: number;
      eventDatesHasNext: boolean;
      eventDatesLoading: boolean;
      eventDatesRequestId: number | null;
      eventDatesTotal: number | null;
    };
  };
}

// when we reset controls we need to reset to this date
// otherwise it triggers a change when we don't want one
const startDate = dayjs().toISOString();

export const useBrowseStore = defineStore('browse', {
  state: (): BrowseState => ({
    countries: [],
    taggedEvents: {},
  }),
  getters: {},
  actions: {
    async loadCountries() {
      if (this.countries.length === 0) {
        const response = await getCountriesRequest();
        this.countries = response.data;
      }
    },
    async loadCountryRegions(country_id) {
      const country = this.countries.find((x) => x.short_name === country_id);
      if (country) {
        country.loading = true;
        const response = await getCountryRegionsRequest(country_id);
        country.regions = response.data;
        country.loading = false;
      }
    },
    async loadCountryLocalities() {},
    async loadEventDates(tag: string) {
      // already in object?
      let item = this.taggedEvents[tag];
      if (!item) {
        item = {
          eventDates: [],
          eventDatesGroupedByMonth: {},
          eventDatesHasNext: false,
          eventDatesPage: 1,
          eventDatesLoading: false,
          eventDatesRequestId: null,
          eventDatesTotal: null,
        };
      }

      try {
        const main = useMainStore();

        item.eventDatesLoading = true;

        const response = await getEventDatesRequest({
          location: main.currentLocation
            ? JSON.stringify(main.currentLocation)
            : null,
          tags: [tag],
          date_min: startDate,
          sort_option: 'date',
          page: item.eventDatesPage,
          per_page: Screen.lt.sm ? 10 : 20,
          distinct: true,
        });
        if (item.eventDatesPage === 1) {
          item.eventDates = response.data.items;
          item.eventDatesGroupedByMonth = groupEventDatesByMonth(
            {},
            response.data.items,
          );
        } else {
          item.eventDates = item.eventDates?.concat(response.data.items);
          groupEventDatesByMonth(
            item.eventDatesGroupedByMonth,
            response.data.items,
          );
        }
        item.eventDatesLoading = false;
        item.eventDatesHasNext = response.data.has_next;
        item.eventDatesPage += 1;
        item.eventDatesTotal = response.data.total;
      } catch (error) {
        item.eventDatesLoading = false;
        item.eventDatesHasNext = false;
        Notify.create(t('error_codes.network_error'));

        throw error;
      }
      this.taggedEvents[tag] = item;
      return;
    },
  },
});
