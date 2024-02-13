<template>
  <div class="scraper-page">
    <div class="flex column q-pa-xl">
      <div class="text-h6 q-mb-md">Ticketmaster Tool</div>
      <q-input dense v-model="keyword" label="Keyword" />
      <q-input dense v-model="classificationName" label="Classification name" />
      <div class="t3 q-mt-xs">
        Filter by classification name: name of any segment, genre, sub-genre,
        type, sub-type. Negative filtering is supported by using the following
        format '-'. Be aware that negative filters may cause decreased
        performance.
      </div>
      <div class="flex q-gutter-sm row q-mt-sm">
        <q-input filled dense label="From" v-model="dateRange.start">
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
        <q-input filled dense label="To" v-model="dateRange.end">
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover>
                <q-date v-model="dateRange.end">
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
          dense
          filled
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
      <q-separator class="q-my-md" />
      <SelectTagsComponent
        :showTopTags="false"
        @valueUpdated="($event) => (universalTags = $event)"
      />
      <q-separator class="q-my-md" />
      <div class="pagination flex row justify-between">
        <q-pagination
          v-if="response?.page?.totalPages"
          v-model="page"
          :min="0"
          :max="response?.page.totalPages - 1 || 0"
          :max-pages="10"
          class="q-py-md"
        />
        <q-btn
          :label="'add ' + validEvents.length + ' events'"
          @click="addEvents"
        />
      </div>
      <div
        class="results flex column"
        style="min-height: 500px; position: relative"
      >
        <InnerLoading v-if="loading" />

        <TicketmasterResult
          class="q-mt-xl"
          v-for="result in response?._embedded?.events"
          :result="result"
          :universalTags="universalTags"
          :key="result.id"
          @errorStateChanged="errorStatusChanged(result.id, $event)"
          @eventData="eventDataChanged(result.id, $event)"
        />
      </div>
      <q-dialog :model-value="!!mappedSelectedResult">
        {{ selectedResult.dates }}
        <br />
        {{ selectedResult._embedded?.venues }}
        <AddEventPage :prepopulate="mappedSelectedResult" />
      </q-dialog>
    </div>
  </div>
</template>

<script>
import common from 'assets/common';
import TicketmasterResult from 'src/components/ScraperPage/TicketmasterResult.vue';
import InnerLoading from 'src/components/InnerLoading.vue';
import AddEventPage from 'src/components/AddEventPage/AddEventPage.vue';
import { addEventRequest, searchTicketmaster } from 'src/api';
import SelectTagsComponent from 'components/EventPage/Tags/SelectTagsComponent.vue';
import moment from 'moment';
import countryCodes from 'src/assets/country-code';
export default {
  components: {
    InnerLoading,
    TicketmasterResult,
    AddEventPage,
    SelectTagsComponent,
  },
  props: {
    username: {
      default: null,
    },
  },
  data() {
    return {
      events: {},
      universalTags: [],
      dateRange: { start: null, end: null },
      countryCode: null,
      city: null,
      loading: false,
      classificationName: null,
      keyword: undefined,
      page: 0,
      response: null,
      selectedResult: null,
    };
  },
  watch: {
    page(newv, oldv) {
      this.search();
    },
  },
  methods: {
    async addEvents() {
      const progressDialog = this.$q.dialog({
        title: this.$t('add.uploading_event'),
        color: 'primary',
        message: 'Adding event 1 of' + this.validEvents.length,
        progress: true, // we enable default settings
        cancel: true,
        persistent: false, // we want the user to not be able to close it
        ok: false,
      });

      for (const [i, value] of this.validEvents.entries()) {
        progressDialog.update({
          message: `Uploading event ${i} of ${this.validEvents.length}`,
        });
        await addEventRequest(value.eventData);
      }

      progressDialog.hide();
    },
    errorStatusChanged(id, errorStatus) {
      this.events[id] = { ...this.events[id], errorStatus, id };
    },
    eventDataChanged(id, eventData) {
      this.events[id] = { ...this.events[id], eventData, id };
    },
    async search() {
      this.loading = true;
      this.response = null;
      const searchResponse = await searchTicketmaster({
        page: this.page,
        keyword: this.keyword,
        startDateTime: this.dateRange.start
          ? moment(this.dateRange.start).format('yyyy-MM-DDTHH:mm:ssZ')
          : undefined,
        endDateTime: this.dateRange.end
          ? moment(this.dateRange.end).format('yyyy-MM-DDTHH:mm:ssZ')
          : undefined,
        sort: 'date,asc',
        size: 20,
        city: this.city,
        countryCode: this.countryCode?.alpha2,
        classificationName: this.classificationName,
      });
      this.response = searchResponse.data;
      this.loading = false;
    },
  },
  computed: {
    validEvents() {
      return Object.values(this.events).filter((x) => !x.errorStatus);
    },
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

.scraper-page {
  overflow: auto;
  height: 100%;

  display: block;
}
.pagination {
  position: sticky;
  top: 0px;
  background: white;
  z-index: 100;
}
@media only screen and (max-width: 599px) {
}
</style>
