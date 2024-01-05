<template>
  <SolidPage>
    <template v-slot>
      <div class="scraper-page flex column">
        <div class="text-h6">Ticketmaster Tool</div>
        <q-input v-model="query" label="Query" />
        <q-input v-model="keyword" label="Keyword" />
        <q-input v-model="classificationName" label="Classification name" />
        <div class="t3 q-mt-xs">
          Filter by classification name: name of any segment, genre, sub-genre,
          type, sub-type. Negative filtering is supported by using the following
          format '-'. Be aware that negative filters may cause decreased
          performance.
        </div>
        <div class="flex row q-mt-sm">
          <q-input filled label="From" v-model="dateRange.start">
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover>
                  <q-date v-model="dateRange.start">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
            <template v-slot:append v-if="dateRange.start">
              <q-icon
                name="clear"
                class="cursor-pointer"
                @click="dateRange.start = null"
              />
            </template>
          </q-input>
          <q-input filled label="To" v-model="dateRange.to" class="q-ml-sm">
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover>
                  <q-date v-model="dateRange.to">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
            <template v-slot:append v-if="dateRange.start">
              <q-icon
                name="clear"
                class="cursor-pointer"
                @click="dateRange.start = null"
              />
            </template>
          </q-input>
          <q-select
            filled
            class="q-ml-sm"
            label="Country"
            style="width: 250px"
            clearable=""
            :options="countryCodes"
            option-value="alpha2"
            option-label="name"
            options-dense
            map-options
            v-model="countryCode"
          />
        </div>
        <div class="q-mt-md">
          <q-btn @click="search()">Search</q-btn>
        </div>
        <q-pagination
          v-if="response?.page.totalPages"
          v-model="page"
          :min="0"
          :max="response?.page.totalPages || 0"
        />
        <div class="results flex column" v-if="response?._embedded?.events">
          <TicketmasterResult
            v-for="(result, index) in response?._embedded?.events"
            :result="result"
            :key="index"
            @click="selectedResult = result"
          />
        </div>
        <InnerLoading v-if="loading" />
        <q-dialog :model-value="!!mappedSelectedResult">
          {{ result.dates }}
          <br />
          {{ result._embedded?.venues }}
          <AddEventPage :prepopulate="mappedSelectedResult" />
        </q-dialog>
      </div>
    </template>
  </SolidPage>
</template>

<script>
import common from 'assets/common';
import SolidPage from 'src/components/dialogs/SolidPage.vue';
import TicketmasterResult from 'src/components/ScraperPage/TicketmasterResult.vue';
import InnerLoading from 'src/components/InnerLoading.vue';
import AddEventPage from 'src/components/AddEventPage/AddEventPage.vue';
import { searchTicketmaster } from 'src/api';

import countryCodes from 'src/assets/country-code';
export default {
  components: {
    SolidPage,
    InnerLoading,
    TicketmasterResult,
    AddEventPage,
  },
  props: {
    username: {
      default: null,
    },
  },
  data() {
    return {
      dateRange: { start: null, end: null },
      countryCode: null,
      city: null,
      loading: false,
      query: null,
      classificationName: null,
      keyword: undefined,
      page: 0,
      response: null,
      selectedResult: null,
    };
  },
  methods: {
    async search() {
      this.loading = true;
      this.response = await searchTicketmaster({
        page: this.page,
        keyword: this.keyword,
        countryCode: this.countryCode,
        startDateTime: this.dateRange.start,
        endDateTime: this.dateRange.end,
        city: this.city,
        countryCode: this.countryCode,
        classificationName: this.classificationName,
      })?.data?.events_results;
      this.loading = false;
    },
  },
  computed: {
    mappedSelectedResult() {
      if (this.selectedResult || false) {
        // date
        return {
          name: this.selectedResult.title,
          description: this.selectedResult.description,
          location:
            this.selectedResult.address?.[0] +
            ', ' +
            this.selectedResult.address?.[1],
          url: this.selectedResult.url,
          date_time: {
            start: this.selectedResult.dates.start.localDate,
            end: this.selectedResult.dates.end.localDate,
          },
        };
      } else return null;
    },
    mappedSelectedGoogleResult() {
      if (this.selectedResult) {
        // date
        let start = null;
        if (this.selectedResult.date.start_date) {
          start = moment(this.selectedResult.start_date, 'MMM, D');
        }

        let end = null;

        // start time
        if (this.selectedResult.date.when) {
          const hasTime =
            this.selectedResult.date.when.indexOf('PM') > 0 ||
            this.selectedResult.date.when.indexOf('AM') > 0;
          if (hasTime) {
            let hasEndTime = false;
            let timeSection = this.selectedResult.date.when.split(', ').pop();
            let timeSectionParts = timeSection.split(' ');
            const endAmPm = timeSectionParts.pop();
            let endTime = timeSectionParts.pop();
            let endMinutes = 0;
            if (endTime.indexOf(':') > 0) {
              // includes minutes
              endTime = endTime.split(':');
              endMinutes = endTime.pop();
              endTime = endTime.pop();
            }
            // in the case and end date is not specified
            let startAmPm = endAmPm;
            let startTime = endTime;
            let startMinutes = endMinutes;

            if (timeSectionParts.length > 0) {
              hasEndTime = true;
              if (
                timeSectionParts.indexOf('PM') > 0 ||
                timeSectionParts.indexOf('AM') > 0
              ) {
                // has am/pm for first time
                startAmPm = timeSectionParts.pop();
              }
              startTime = timeSectionParts.pop();
              if (startTime.indexOf(':') > 0) {
                // includes minutes
                startTime = endTime.split(':');
                startMinutes = endTime.pop();
                startTime = endTime.pop();
              }
            }

            if (endAmPm === 'PM') {
              endTime += 12;
            }
            if (startAmPm === 'PM') {
              startTime += 12;
            }

            start = start.set({ hours: startTime, minutes: startMinutes });
            if (hasEndTime) {
              end = moment(start).set({ hours: endTime, minutes: endMinutes });
            }
          } else {
            // we can assume it has an end date but no time
            const to = this.selectedResult.date.when
              .split(' - ')
              .pop()
              .split(' ');
            if (to && to.length > 0) {
              let toDay = to.pop();
              let toMonth = to.pop();
              let toYear = toMonth < start.month ? start.year + 1 : start.year;
              end = moment(start).set({
                day: toDay,
                month: toMonth,
                year: toYear,
              });
            }
          }
        }
        return {
          name: this.selectedResult.title,
          description: this.selectedResult.description,
          location:
            this.selectedResult.address?.[0] +
            ', ' +
            this.selectedResult.address?.[1],
          url: this.selectedResult.url,
          date_time: {
            start,
            end,
          },
        };
      } else return null;
    },
  },
  created() {
    this.timeAgo = common.timeAgo;
    this.dateUTCToLocal = common.dateUTCToLocal;
    this.countryCodes = countryCodes;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}

.body--light {
}
@media only screen and (max-width: 600px) {
}
</style>
