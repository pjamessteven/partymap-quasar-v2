<template>
  <q-card>
    <q-card-section class="flex items-center sticky-card-header">
      <div class="text-h6">{{ $t('event_dates.set_up_recurring_dates') }}</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section class="flex column no-wrap q-mt-sm">
      <div class="flex row wrap items-baseline">
        <q-icon left size="1em" name="las la-calendar-day" />
        <div class="flex column">
          <div class="card-title q-pr-md">
            {{ $t('add_event_date.date_time_required') }}
          </div>
          <p class="t3">
            {{ $t('event_dates.select_date_time_of_next_event') }}
          </p>
        </div>
      </div>
      <DateTimePicker
        @dateRange="update.date_time = $event"
        :inlineCalendar="true"
        class="q-ml-lg"
        :isRange="true"
      />
    </q-card-section>

    <q-card-section class="flex column justify-between no-wrap">
      <div class="flex row no-wrap items-baseline">
        <q-icon left size="1em" name="las la-redo-alt" />
        <div class="flex column">
          <div class="card-title q-pr-md">
            {{ $t('add.recurrence') }}
          </div>
          <p class="t3">
            {{ $t('add.recurrence_caption') }}
          </p>
        </div>
      </div>
      <RrulePicker
        v-on:updateRrule="update.rrule = $event"
        :dateTime="update.date_time"
        :disableOneOff="true"
        class="q-ml-lg"
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
        v-on:location="update.location = $event"
        :location="update.location"
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
        square
        outlined
        autogrow
        class="q-ml-lg"
        color="bg-grey-7"
        v-model="update.url"
        :label="$t('add.url')"
      />
    </q-card-section>

    <q-card-section class="flex row justify-end no-wrap">
      <q-btn
        @click="updateEvent()"
        color="primary"
        :label="'Finish'"
        :disabled="
          !update.date_time ||
          (update.date_time &&
            update.date_time.start &&
            !update.date_time.end) ||
          !update.location
        "
      />
    </q-card-section>
    <q-inner-loading :showing="loading">
      <q-spinner-ios :color="$q.dark.isActive ? 'white' : 'black'" size="2em" />
    </q-inner-loading>
  </q-card>
</template>

<script>
import { suggestEventEditRequest } from 'src/api';

import common from 'assets/common';

import DateTimePicker from 'components/DateTimePicker.vue';
import GoogleLocationComponent from 'components/GoogleLocationComponent.vue';
import RrulePicker from 'components/RrulePicker.vue';
import SubmitSuggestionPrompt from 'components/EventPage/Suggestions/SubmitSuggestionPrompt.vue';

import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';
import { mapState, mapActions } from 'pinia';

export default {
  components: {
    DateTimePicker,
    RrulePicker,
    GoogleLocationComponent,
  },
  props: {},
  data() {
    return {
      update: {
        rrule: {
          recurringType: 0,
          separationCount: 1,
          weekOfMonth: null,
          dayOfMonth: null,
          dayOfWeek: null,
          monthOfYear: null,
        },
        date_time: {
          date: null,
          startHours: null,
          startMinutes: '00',
          endHours: null,
          endMinutes: null,
          allDay: true,
        },
        location: null,
        url: null,
      },

      loading: false,
      step: 1,
    };
  },
  methods: {
    ...mapActions(useEventStore, ['updateEvent']),
    async updateEvent() {
      if (this.currentUserCanEdit) {
        const progressDialog = this.$q.dialog({
          title: this.$t('event.updating_event'),
          color: 'primary',
          progress: true, // we enable default settings
          cancel: false,
          persistent: true, // we want the user to not be able to close it
          ok: false,
        });
        try {
          await this.updateEvent(this.update);
          progressDialog.hide();
          this.loading = false;
          this.$emit('closeDialog');
        } catch (e) {
          progressDialog.hide();
          this.loading = false;
        }
      } else {
        // make suggestion instead
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
              // include message and token in request
              await suggestEventEditRequest({
                ...messageAndToken,
                ...this.update,
              });
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
              progressDialog.hide();
              this.loading = false;
              this.$emit('closeDialog');
            } catch (e) {
              progressDialog.hide();
              this.loading = false;
            }
          })
          .onDismiss(() => {
            this.$emit('closeDialog');
          });
      }
    },
    validateURL(url) {
      if (url && url.length > 0) {
        var pattern = new RegExp(
          '^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$',
          'i'
        ); // fragment locator
        return !!pattern.test(url);
      } else return true;
    },
  },
  computed: {
    ...mapState(useEventStore, [
      'event',
      'currentUserCanEdit',
      'currentUserIsHost',
    ]),
    ...mapState(useAuthStore, ['currentUser']),
  },

  created() {
    this.recurringPattern = common.recurringPatternKebab;
  },
};
</script>

<style lang="scss" scoped>
.top-section {
  cursor: pointer;
}

.body--dark {
  .weekly-rrule-text {
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
}
.body--light {
  .weekly-rrule-text {
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }
}

@media only screen and (max-width: 1023px) {
  .card {
    margin-top: 0px;
    width: 100%;
    height: 100%;
  }
}
</style>
