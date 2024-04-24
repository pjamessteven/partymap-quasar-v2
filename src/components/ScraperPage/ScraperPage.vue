<template>
  <div class="scraper-page">
    <div class="flex column q-pa-xl">
      <div class="flex row items-center justify-between q-mb-xl">
        <div class="flex row">
          <a
            class="link-hover text-h6"
            :class="mode === 'ticketmaster' ? '' : 'o-050'"
            @click="mode = 'ticketmaster'"
            >Ticketmaster Tool</a
          >
          <a
            class="link-hover text-h6 q-ml-md"
            :class="mode === 'musicbrainz' ? '' : 'o-050'"
            @click="mode = 'musicbrainz'"
            >Musicbrainz Tool</a
          >
          <a
            class="link-hover text-h6 q-ml-md"
            :class="mode === 'gpt' ? '' : 'o-050'"
            @click="mode = 'gpt'"
            >GPT Tool</a
          >
        </div>
        <SelectTagsComponent
          :dense="true"
          :showTopTags="false"
          @valueUpdated="($event) => (universalTags = $event)"
        />
      </div>

      <q-card
        class="flex row q-pa-sm justify-between q-gutter-md"
        :class="{ 'no-wrap': $q.screen.gt.xs }"
        v-if="mode == 'ticketmaster'"
      >
        <div class="flex column grow">
          <q-input dense v-model="ticketMasterSearch.keyword" label="Keyword" />
          <q-input
            dense
            v-model="ticketMasterSearch.classificationName"
            label="Classification name"
          />
          <div class="t3 q-mt-xs flex column s">
            Filter by classification name: name of any segment, genre,
            sub-genre, type, sub-type. Negative filtering is supported by using
            the following format '-'. Be aware that negative filters may cause
            decreased performance.
          </div>
        </div>
        <div class="flex q-gutter-sm column grow q-mt-sm">
          <q-input
            outlined
            dense
            label="From"
            v-model="ticketMasterSearch.dateRange.start"
          >
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover>
                  <q-date v-model="ticketMasterSearch.dateRange.start">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
            <template v-slot:append v-if="ticketMasterSearch.dateRange.start">
              <q-icon
                name="clear"
                class="cursor-pointer"
                @click="ticketMasterSearch.dateRange.start = null"
              />
            </template>
          </q-input>
          <q-input
            outlined
            dense
            label="To"
            v-model="ticketMasterSearch.dateRange.end"
          >
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover>
                  <q-date v-model="ticketMasterSearch.dateRange.end">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
            <template v-slot:append v-if="ticketMasterSearch.dateRange.start">
              <q-icon
                name="clear"
                class="cursor-pointer"
                @click="ticketMasterSearch.dateRange.start = null"
              />
            </template>
          </q-input>
          <q-select
            outlined
            dense
            label="Country"
            style="width: 250px"
            clearable=""
            :options="countryCodes"
            option-value="alpha2"
            option-label="name"
            options-dense
            map-options
            v-model="ticketMasterSearch.countryCode"
          />
        </div>
        <div class="flex grow items-end justify-end">
          <q-btn @click="search()" class="nav-button primary" no-caps
            >Search</q-btn
          >
        </div>
      </q-card>
      <q-card
        class="flex row q-gutter-sm q-pa-sm"
        v-else-if="mode == 'musicbrainz'"
      >
        <!--
        <q-input filled dense label="From" v-model="musicbrainzSearch.begin">
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover>
                <q-date v-model="musicbrainzSearch.begin">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
          <template v-slot:append v-if="musicbrainzSearch.begin">
            <q-icon
              name="clear"
              class="cursor-pointer"
              @click="musicbrainzSearch.begin = null"
            />
          </template>
        </q-input>
-->
        <div class="flex column grow">
          <q-input dense v-model="musicbrainzSearch.name" label="Event name" />
          <q-input dense v-model="musicbrainzSearch.begin" label="Begin" />
        </div>
        <div class="flex column grow">
          <q-input dense v-model="musicbrainzSearch.place" label="Place" />
          <q-input dense v-model="musicbrainzSearch.tag" label="Tag" />
        </div>
        <div class="flex grow items-end justify-end">
          <q-btn class="nav-button primary" no-caps @click="search()"
            >Search Musicbranz</q-btn
          >
        </div>
      </q-card>

      <q-card class="flex row q-gutter-sm q-pa-sm" v-else-if="mode == 'gpt'">
        <div class="flex column grow">
          <q-input type="textarea" v-model="gpt" label="GPT JSON Array" />
          <div class="flex grow justify-end q-mt-md">
            <q-btn class="nav-button primary" no-caps @click="parseGptEvents()"
              >Go</q-btn
            >
          </div>
        </div>
      </q-card>

      <div class="pagination flex row justify-between q-mt-md">
        <div>
          <q-pagination
            v-if="totalPages"
            v-model="page"
            :min="0"
            :max="totalPages - 1 || 0"
            :max-pages="10"
            class="q-py-md"
          />
        </div>
        <q-btn
          class="nav-button"
          :class="validEvents.length > 0 ? 'primary' : ''"
          :label="'add ' + validEvents.length + ' events'"
          @click="addEvents"
        />
      </div>
      <div
        class="results flex column"
        style="min-height: 500px; position: relative"
      >
        <InnerLoading v-if="loading" />
        <ScraperResult
          class="q-mt-md"
          v-for="result in mappedResponse"
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
import ScraperResult from 'src/components/ScraperPage/ScraperResult.vue';
import InnerLoading from 'src/components/InnerLoading.vue';
import AddEventPage from 'src/components/AddEventPage/AddEventPage.vue';
import {
  addEventRequest,
  getMusicBrainzEvents,
  searchTicketmaster,
} from 'src/api';
import SelectTagsComponent from 'components/EventPage/Tags/SelectTagsComponent.vue';
import moment from 'moment';
import countryCodes from 'src/assets/country-code';
import gptSamplePrompt from './gptJsonSample.ts';
export default {
  components: {
    InnerLoading,
    ScraperResult,
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
      totalPages: 0,
      mode: 'ticketmaster',
      events: {},
      universalTags: [],
      ticketMasterSearch: {
        dateRange: { start: null, end: null },
        countryCode: null,
        city: null,
        loading: false,
        classificationName: null,
        keyword: 'music festival',
      },
      musicbrainzSearch: {
        begin: moment().year(),
        name: null,
        place: null,
        tag: null,
      },
      facebook: {
        URL: '',
      },
      page: 0,
      response: null,
      mappedResponse: [],
      selectedResult: null,
      gpt: gptSamplePrompt,
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

      this.events = {};

      progressDialog.hide();
    },
    errorStatusChanged(id, errorStatus) {
      this.events[id] = { ...this.events[id], errorStatus, id };
    },
    eventDataChanged(id, eventData) {
      this.events[id] = { ...this.events[id], eventData, id };
    },
    search() {
      if (this.mode === 'ticketmaster') {
        this.searchTicketmaster();
      } else if (this.mode === 'musicbrainz') {
        this.searchMusicbrainz();
      }
    },
    async searchMusicbrainz() {
      this.loading = true;
      this.response = null;
      this.mappedResponse = null;
      let queryString = 'type:Festival';

      /*
      if (this.musicbrainzSearch.begin) {
        queryString +=
          ' AND begin:' +
          moment(this.musicbrainzSearch.begin).format('yyyy-MM-DD');
      }
      */

      if (this.musicbrainzSearch.begin) {
        queryString += ' AND begin:' + this.musicbrainzSearch.begin;
      }

      if (this.musicbrainzSearch.name) {
        queryString += ' AND name:' + this.musicbrainzSearch.name;
      }
      if (this.musicbrainzSearch.place) {
        queryString += ' AND place:' + this.musicbrainzSearch.place;
      }
      if (this.musicbrainzSearch.tag) {
        queryString += ' AND tag:' + this.musicbrainzSearch.tag;
      }

      const searchResponse = await getMusicBrainzEvents({
        query: queryString,
        offset: this.page * 25,
      }); // 25 is default items per page

      console.log(searchResponse.data);

      this.totalPages = Math.ceil(78 / 25);

      this.mappedResponse = searchResponse.data.events.map((event) => {
        const locationMbid = event.relations.find((x) => x.type === 'held at')
          ?.place?.id;

        const start = event?.['life-span']?.begin
          ? event?.['life-span']?.begin + ' 12:00:00'
          : undefined;
        const end = event?.['life-span']?.end
          ? event?.['life-span']?.end + ' 12:00:00'
          : undefined;
        return {
          id: event.id,
          dates: { start, end },
          locationMbid,
          name: event.name,
          description: event.description,
          url: event.url,
          images: event.images,
          artists: event.relations
            ?.filter((x) => !!x.artist)
            .map((x) => ({
              name: x.artist.name,
              mbid: x.artist.id,
            })),
        };
      });
      this.loading = false;
    },
    async searchTicketmaster() {
      this.loading = true;
      this.response = null;

      const searchResponse = await searchTicketmaster({
        page: this.page,
        keyword: this.ticketMasterSearch.keyword,
        startDateTime: this.ticketMasterSearch.dateRange.start
          ? moment(this.ticketMasterSearch.dateRange.start).format(
              'yyyy-MM-DDTHH:mm:ssZ'
            )
          : undefined,
        endDateTime: this.ticketMasterSearch.dateRange.end
          ? moment(this.ticketMasterSearch.dateRange.end).format(
              'yyyy-MM-DDTHH:mm:ssZ'
            )
          : undefined,
        sort: 'date,asc',
        size: 20,
        city: this.ticketMasterSearch.city,
        countryCode: this.ticketMasterSearch.countryCode?.alpha2,
        classificationName: this.classificationName,
      });
      this.response = searchResponse.data;

      this.totalPages = this.response?.page.totalPages;

      this.mappedResponse = this.response?._embedded?.events.map((event) => {
        let locationString = '';
        const venue = event._embedded?.venues?.[0];
        if (venue) {
          if (venue.name) {
            locationString += venue.name;
          }
          if (venue.address) {
            if (locationString.length > 0) {
              locationString += ', ';
            }
            locationString += venue.address.line1;
            if (venue.address.line2) {
              if (locationString.length > 0) {
                locationString += ', ';
              }
              locationString += venue.address.line2;
            }
          }
          if (venue.city?.name) {
            if (locationString.length > 0) {
              locationString += ', ';
            }
            locationString += venue.city.name;
          }
        }

        let start = event.dates.start.localDate;
        if (event.dates?.start?.localTime) {
          start += ' ' + event.dates?.start?.localTime;
        } else {
          // just set time to midday if time doesn't exist
          start += ' 12:00:00';
        }
        let end = start;
        if (event.dates?.end?.localDate) {
          end = event.dates.end.localDate;
          if (event.dates?.end?.localTime) {
            end += ' ' + event.dates?.end?.localTime;
          } else {
            // just set time to midday if time doesn't exist
            end += ' 12:00:00';
          }
        }
        return {
          id: event.id,
          dates: { start, end },
          locationString: locationString,
          name: event.name,
          description: event.description,
          url: event.url,
          images: event.images,
          artists: event._embedded?.attractions
            ?.filter((x) => x.name !== event.name)
            .map((x) => ({
              name: x.name,
              mbid: x.externalLinks?.musicbrainz?.[0]?.id,
            })),
        };
      });
      console.log(this.mappedResponse);
      this.loading = false;
    },
    parseGptEvents() {
      try {
        this.mappedResponse = JSON.parse(this.gpt).map((event) => {
          console.log('event', event);
          let start = event.dates.start.localDate;
          if (event.dates?.start?.localTime) {
            start += ' ' + event.dates?.start?.localTime;
          } else {
            // just set time to midday if time doesn't exist
            start += ' 12:00:00';
          }
          let end = start;
          if (event.dates?.end?.localDate) {
            end = event.dates.end.localDate;
            if (event.dates?.end?.localTime) {
              end += ' ' + event.dates?.end?.localTime;
            } else {
              // just set time to midday if time doesn't exist
              end += ' 12:00:00';
            }
          }
          return {
            dates: { start, end },
            locationString: event.location,
            name: event.name,
            description: event.description,
            description_attribute: event.description_attribute,
            full_description: event.full_description,
            full_description_attribute: event.full_description_attribute,
            url: event.url,
            youtube_url: event.youtube_url,
            images: event.images?.map((x) => ({
              height: 0,
              width: 0,
              url: x,
            })),
            artists: event.artists.map((x) => ({
              name: x.name,
              mbid: x.mbid,
            })),
            rrule: event.rrule,
            tags: event.tags,
            next_event_date_size: event.size,
          };
        });
      } catch (e) {
        this.$q.notify('Error parsing JSON');
        console.log(e);
      }
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
    this.gptSamplePrompt = gptSamplePrompt;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .pagination {
    background: black;
  }
}

.body--light {
  .pagination {
    background: white;
  }
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
