<template>
  <q-card class="add-event-date-dialog dialog-card">
    <!-- DATE AND TIME -->
    <q-card-section class="row items-center dialog-card-header">
      <div class="text-h6">
        {{ $t('add_event_date.add_new_event_date') }}
      </div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>
    <q-card-section class="dialog-card-content">
      <q-card-section class="flex column no-wrap q-mt-sm">
        <div class="flex row wrap items-baseline">
          <q-icon left size="1em" name="las la-calendar-day" />
          <div class="flex column">
            <div class="card-title q-pr-md">
              {{ $t('add_event_date.date_time_required') }}
            </div>
            <p class="t3">
              {{ $t('add.please_select_date_msg') }}
            </p>
          </div>
        </div>
        <DateTimePicker
          class="q-ml-lg"
          :isRange="true"
          @dateRange="eventDate.date_time = $event"
          :inlineCalendar="true"
        />
      </q-card-section>

      <!--LOCATION-->

      <q-card-section class="flex column justify-between no-wrap">
        <div class="flex row no-wrap items-baseline">
          <q-icon left size="1em" name="las la-map-marker" />
          <div class="flex column">
            <div class="card-title q-pr-md">
              {{ $t('add_event_date.location_required') }}
            </div>
            <p class="t3">
              {{ $t('add.location_caption') }}
            </p>
          </div>
        </div>
        <GoogleLocationComponent
          class="q-ml-lg"
          v-on:location="eventDate.location = $event"
          :location="eventDate.location"
        />
      </q-card-section>

      <!-- Detailed Description  -->

      <q-card-section class="flex column no-wrap">
        <div class="flex row no-wrap items-baseline">
          <q-icon left size="1em" name="las la-align-left" />
          <div class="flex column">
            <div class="card-title q-pr-md">
              {{ $t('description.detailed_description') }}
            </div>
            <p class="t3">
              {{ $t('description.detailed_description_msg') }}
            </p>
          </div>
        </div>
        <q-input
          outlined
          autogrow
          :input-style="{ 'min-height': '200px' }"
          color="bg-grey-7"
          v-model="eventDate.description"
          :label="$t('description.detailed_description')"
          style="padding-bottom: 0px"
          class="q-ml-lg"
        />
        <!-- ATRRIBUTE -->

        <q-input
          v-if="!currentUserIsHost"
          outlined
          maxlength="200"
          class="q-mt-sm q-ml-lg"
          :input-style="{ 'min-height': '50px' }"
          color="bg-grey-7"
          v-model="description_attribute"
          label="Description source"
        />
      </q-card-section>

      <!-- Lineup -->

      <q-card-section class="flex column no-wrap">
        <div class="flex row no-wrap items-baseline">
          <q-icon left size="1em" name="las la-external-link-alt" />
          <div class="flex column">
            <div class="card-title q-pr-md">
              {{ $t('suggestions.artists') }}
            </div>
            <p class="t3">
              {{ $t('suggestions.artists_msg') }}
            </p>
          </div>
        </div>
        <SelectArtistsComponent
          class="q-px-lg"
          :mode="'newEvent'"
          @updated="eventDate.artists = $event"
          :eventName="event.name"
          :eventCountry="computedEventDateCountry"
          :eventYear="computedEventDateYear"
        />
      </q-card-section>

      <!-- Size -->

      <q-card-section class="flex column no-wrap">
        <div class="flex row no-wrap items-baseline">
          <q-icon left size="1em" name="las la-user-friends" />
          <div class="flex column">
            <div class="card-title q-pr-md">
              {{ $t('add.size_how_many') }}
            </div>
            <p class="t3">
              {{ $t('add.size_msg') }}
            </p>
          </div>
        </div>
        <q-input
          outlined
          autogrow
          hide-bottom-space
          color="bg-grey-7"
          v-model="eventDate.size"
          :label="$t('add.size')"
          type="number"
          :rules="[
            (val) =>
              !val ||
              Number.isInteger(parseInt(val)) ||
              'Please input a number',
          ]"
          class="q-ml-lg"
        />
      </q-card-section>

      <!-- URL -->

      <q-card-section class="flex column no-wrap">
        <div class="flex row no-wrap items-baseline">
          <q-icon left size="1em" name="las la-external-link-alt" />
          <div class="flex column">
            <div class="card-title q-pr-md">
              {{ $t('add.url') }}
            </div>
            <p class="t3">
              {{ $t('add.url_msg') }}
            </p>
          </div>
        </div>
        <q-input
          outlined
          autogrow
          class="q-ml-lg"
          color="bg-grey-7"
          v-model="eventDate.url"
          :label="$t('add.url')"
        />
      </q-card-section>

      <!-- Ticket URL (admin only) -->

      <q-card-section
        class="flex row justify-between no-wrap"
        v-if="currentUser.role >= 20"
      >
        <div class="flex row wrap items-center">
          <q-icon left size="1em" name="las la-ticket-alt" />
          <div class="card-title q-pr-md">
            {{ $t('event_dates.ticket_url') }}
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none q-ml-lg" v-if="currentUser.role >= 20">
        <q-input
          outlined
          square
          autogrow
          color="bg-grey-7"
          v-model="eventDate.ticket_url"
          :label="$t('add.ticketing_url')"
        />
      </q-card-section>
      <q-card-section class="flex row justify-end">
        <q-btn
          @click="addEd()"
          color="primary"
          :label="$t('add.add_event_date')"
          :disable="
            !eventDate.date_time ||
            (eventDate.date_time && !eventDate.date_time.end) ||
            !eventDate.location
          "
        />
      </q-card-section>
    </q-card-section>
  </q-card>
</template>

<script>
import common from 'assets/common';

import DateTimePicker from 'components/DateTimePicker.vue';
import GoogleLocationComponent from 'components/GoogleLocationComponent.vue';
import SelectArtistsComponent from 'components/EventPage/EventDates/Artists/SelectArtistsComponent.vue';
import SubmitSuggestionPrompt from 'components/EventPage/Suggestions/SubmitSuggestionPrompt.vue';
import { default as dayjs } from 'dayjs';
import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';
import { mapActions, mapState } from 'pinia';
import _ from 'lodash';
export default {
  data() {
    return {
      eventDate: {
        date_time: null,
        location: null,
        description: null,
        size: null,
        url: null,
        ticket_url: null,
        artists: null,
        description_attribute: null,
      },
    };
  },
  components: {
    GoogleLocationComponent,
    DateTimePicker,
    SelectArtistsComponent,
  },
  props: { suggestionMessageAndToken: Object },
  watch: {},
  methods: {
    ...mapActions(useEventStore, [
      'updateEvent',
      'suggestEventEdit',
      'addEventDate',
    ]),
    async addEd() {
      if (this.currentUserCanEdit) {
        const progressDialog = this.$q.dialog({
          title: this.$t('add_event_date.adding_event_date'),
          color: 'primary',
          progress: true, // we enable default settings
          cancel: false,
          persistent: true, // we want the user to not be able to close it
          ok: false,
        });
        try {
          await this.addEventDate(
            // omit empty fields
            _.omitBy(
              this.eventDate,
              (v) => _.isUndefined(v) || _.isNull(v) || v === ''
            )
          );
          progressDialog.hide();
          this.$emit('closeDialog');
        } catch (e) {
          progressDialog.hide();
        }
      } else {
        // make a 'suggestion' instead
        // and ask for message/reason
        this.$q
          .dialog({
            parent: this,
            component: SubmitSuggestionPrompt,
          })
          .onOk(async (messageAndToken) => {
            // suggest edit instead of editing directly
            const progressDialog = this.$q.dialog({
              title: this.$t('edit_event_date.submitting'),
              color: 'primary',
              progress: true, // we enable default settings
              cancel: false,
              persistent: true, // we want the user to not be able to close it
              ok: false,
            });
            try {
              await this.suggestEventEdit({
                // include message and hcaptcha token
                ...messageAndToken,
                ..._.omitBy(
                  this.eventDate,
                  (v) => _.isUndefined(v) || _.isNull(v) || v === ''
                ),
              });
              progressDialog.hide();

              this.$q
                .dialog({
                  title: this.$t('edit_event_date.submitted'),
                  message: this.$t('edit_event_date.submitted_msg'),
                  color: 'primary',
                  persistent: false, // we want the user to not be able to close it
                })
                .onDismiss(() => {
                  this.$emit('closeDialog');
                });
            } catch (e) {
              progressDialog.hide();
            }
          });
      }
    },
  },
  computed: {
    ...mapState(useEventStore, [
      'event',
      'currentUserCanEdit',
      'currentUserIsHost',
    ]),
    ...mapState(useAuthStore, ['currentUser']),
    getOpacity() {
      return `opacity: ${this.opacity};
      transition: all 300ms;`;
    },
    computedEventDateYear() {
      // use end to consider new years festivals
      if (this.eventDate?.date_time?.end) {
        return dayjs(this.eventDate.date_time.end).year();
      } else return null;
    },
    computedEventDateCountry() {
      return this.eventDate?.location?.description?.split(',').pop();
    },
  },
  created() {
    // import common methods
    this.relativeHumanTime = common.relativeHumanTime;
    this.localTime = common.localTime;
    this.localDate = common.localDate;
    this.localDay = common.localDay;
    this.localTimeCompact = common.localTimeCompact;
    this.timeZoneAbbreviention = common.timeZoneAbbreviention;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}

.body--light {
}
</style>
