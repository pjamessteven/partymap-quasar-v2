<template>
  <!-- URL -->

  <q-card class="edit-card dialog-card">
    <q-card-section class="flex column no-wrap top-section dialog-card-header">
      <div class="flex items-center no-wrap justify-between grow">
        <div class="text-h6 card-title q-pr-md">
          {{ modeText[mode]?.title }}
        </div>

        <q-btn icon="close" class="q-ml-md" flat round dense v-close-popup />
      </div>
    </q-card-section>
    <q-card-section class="dialog-card-content">
      <div v-if="modeText[mode]?.message" class="t2 q-mb-md">
        {{ modeText[mode].message }}
      </div>

      <div v-if="mode === 'url'">
        <q-input
          outlined
          autogrow
          color="bg-grey-7"
          v-model="url"
          :label="$t('add.url')"
        />
      </div>

      <div v-if="mode === 'ticketUrl'">
        <q-input
          outlined
          autogrow
          color="bg-grey-7"
          v-model="ticketUrl"
          :label="$t('add.ticketing_url')"
        />
      </div>

      <div v-if="mode === 'size'">
        <q-input
          outlined
          autogrow
          color="bg-grey-7"
          v-model="size"
          :label="$t('add.size')"
          type="number"
          :rules="[
            (val) => Number.isInteger(parseInt(val)) || 'Please input a number',
          ]"
        />
      </div>

      <div v-if="mode === 'description'">
        <q-input
          outlined
          autogrow
          :input-style="{ 'min-height': '100px' }"
          color="bg-grey-7"
          v-model="description"
          label="Detailed description"
        />
        <!-- ATRRIBUTE -->
        <q-input
          v-if="!currentUserIsHost"
          outlined
          maxlength="200"
          class="q-mt-sm"
          :input-style="{ 'min-height': '50px' }"
          color="bg-grey-7"
          v-model="descriptionAttribute"
          label="Source"
        />
      </div>

      <!-- DATE TIME -->

      <div v-if="mode === 'date'">
        <DateTimePicker
          :value="dateTime"
          :isRange="true"
          @dateRange="dateTime = $event"
          :inlineCalendar="true"
        />
      </div>

      <!-- LOCATION -->

      <div v-if="mode === 'location'">
        <div ref="placesDiv" />
        <GoogleLocationComponent
          class="q-mt-md"
          @location="location = $event"
          :locationProp="location"
        />
      </div>

      <!-- EVENT CANCELLED -->
      <q-card-actions align="right" class="text-teal" v-if="mode === 'cancel'">
        <q-btn flat color="primary" label="Cancel" v-close-popup />
        <q-btn
          color="primary"
          label="Continue"
          v-on:click="toggleCancelEvent"
          v-close-popup
        />
      </q-card-actions>

      <!-- DELETE ED -->

      <div v-if="mode === 'delete'">
        Are you sure you want to delete this date?
        <p />
        <b>{{ localDateTimeLong(ed.start, ed.tz) }}</b>

        <q-card-actions align="right" class="q-mt-md">
          <q-btn flat color="primary" label="Cancel" v-close-popup />
          <q-btn
            color="primary"
            label="Continue"
            v-on:click="deleteEd"
            v-close-popup
          />
        </q-card-actions>
      </div>
    </q-card-section>

    <q-card-section
      v-if="mode !== 'delete' && mode !== 'cancel'"
      class="dialog-card-footer"
    >
      <div class="flex row justify-end">
        <q-btn
          flat
          color="secondary"
          label="Undo"
          @click="undo()"
          :disabled="this.disableSaveButton"
        />
        <q-btn
          :disabled="disableSaveButton"
          color="primary"
          label="Save changes"
          v-on:click="updateEd()"
          v-close-popup
        />
      </div>
    </q-card-section>

    <q-inner-loading :showing="loading">
      <q-spinner-ios :color="$q.dark.isActive ? 'white' : 'black'" size="2em" />
    </q-inner-loading>
  </q-card>
</template>

<script>
import { suggestDeleteEventDateRequest } from 'src/api';

import common from 'assets/common';
import DateTimePicker from 'components/DateTimePicker.vue';
import GoogleLocationComponent from 'components/GoogleLocationComponent.vue';
import SubmitSuggestionPrompt from 'components/EventPage/Suggestions/SubmitSuggestionPrompt.vue';

import _ from 'lodash';

import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';
import { mapState, mapActions } from 'pinia';

export default {
  components: {
    DateTimePicker,
    GoogleLocationComponent,
  },
  props: {
    ed: Object,
    mode: String,
  },
  data() {
    return {
      size: null,
      cancelled: null,
      edId: null,
      description: null,
      descriptionAttribute: null,
      url: null,
      ticketUrl: null,
      dateTime: null,
      dateTimeUnchanged: null,
      results: [],
      google: null,
      autoCompleteService: null,
      placesService: null,
      autoCompleteSessionToken: null,
      autoCompleteResults: null,
      selectedPlace: null,
      location: null,
      locationUnchanged: null,
      loading: false,
      modeText: {
        url: {
          title: this.$t('edit_event_date.external_url'),
          message: this.$t('edit_event_date.external_url_msg'),
        },
        ticketUrl: {
          title: 'Ticket URL',
          message: 'A link for users to directly access tickets for this event',
        },
        size: {
          title: 'Size',
          message: this.$t('edit_event_date.size_msg'),
        },
        description: {
          title: 'Description',
          message:
            "A detailed description about what's happening on this date. If you are not the host and you did not write this, please provide a source.",
        },
        date: {
          title: this.$t('edit_event_date.date'),
          message:
            'Double click a date to select a single day, or select a range if the event happens over multiple days. Time is in 24hr format.',
        },
        location: {
          title: this.$t('edit_event_date.location'),
          message: this.$t('edit_event_date.location_msg'),
        },
        cancel: {
          title: this.ed.cancelled
            ? 'Mark this date as happening'
            : 'Mark this date as cancelled',
          message: this.ed.cancelled
            ? 'This date was previously marked as cancelled. Are you really sure you want to mark is as happening?'
            : 'Only do this if this date has been cancelled. The event will still show up on PartyMap. Are you sure you want to mark the event as cancelled?',
        },
        delete: {
          title: 'Delete Event Date',
        },
      },
    };
  },
  methods: {
    ...mapActions(useEventStore, [
      'deleteEventDate',
      'updateEventDate',
      'suggestEventDateEdit',
    ]),
    toggleCancelEvent() {
      this.cancelled = !this.ed.cancelled;
      this.updateEd();
    },
    async deleteEd() {
      if (this.currentUserCanEdit) {
        const progressDialog = this.$q.dialog({
          title: this.$t('edit_event.updating_event'),
          color: 'primary',
          progress: true, // we enable default settings
          cancel: false,
          persistent: true, // we want the user to not be able to close it
          ok: false,
        });
        await this.deleteEventDate(id);
        progressDialog.hide();
        this.$emit('closeDialog');
      } else {
        this.$q
          .dialog({
            parent: this,
            component: SubmitSuggestionPrompt,
          })
          .onOk((data) => {
            // suggest edit instead of editing directly
            const progressDialog = this.$q.dialog({
              title: this.$t('edit_event_date.submitting'),
              color: 'primary',
              progress: true, // we enable default settings
              cancel: false,
              persistent: true, // we want the user to not be able to close it
              ok: false,
            });
            suggestDeleteEventDateRequest(this.ed.id, data).then(() => {
              this.loading = false;
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
            });
          });
      }
    },
    async updateEd() {
      this.loading = true;

      let update = {};
      if (this.ed.cancelled !== this.cancelled) {
        update.cancelled = this.cancelled;
      }
      if (this.ed.description !== this.description) {
        update.description = this.description;
      }
      if (this.ed.description_attribute !== this.descriptionAttribute) {
        update.description_attribute = this.descriptionAttribute;
      }
      if (this.ed.size !== this.size) {
        this.size = this.size
          .split('.')
          .join('')
          .split(',')
          .join('')
          .split(' ')
          .join(''); // remove commas, dots and spaces
        update.size = this.size;
      }
      if (this.ed.url !== this.url) {
        update.url = this.url;
      }
      if (this.ed.ticket_url !== this.ticketUrl) {
        update.ticket_url = this.ticketUrl;
      }
      if (this.dateTimeHasChanged) {
        update.date_time = this.dateTime;
      }
      if (this.locationHasChanged) {
        update.location = this.location;
      }
      if (this.currentUserCanEdit) {
        const progressDialog = this.$q.dialog({
          title: this.$t('edit_event_date.updating_event_date'),
          color: 'primary',
          progress: true, // we enable default settings
          cancel: false,
          persistent: true, // we want the user to not be able to close it
          ok: false,
        });
        try {
          await this.updateEventDate(update);
          this.$emit('closeDialog');
        } catch (e) {}
        this.loading = false;

        progressDialog.hide();
      } else {
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
            // include message and token in request
            try {
              await suggestEventDateEdit({
                ...update,
                ...messageAndToken,
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
            } catch (e) {}

            this.loading = false;
            progressDialog.hide();
          });
      }
    },
    loadDateTime() {
      this.dateTime = {
        start: this.ed.start_naive,
        end: this.ed.end_naive,
      };
      this.dateTimeUnchanged = _.cloneDeep(this.dateTime);
    },
    loadLocation() {
      this.location =
        this.ed.location.name +
        ', ' +
        this.ed.location.city +
        ', ' +
        this.ed.location.country_code;
      this.locationUnchanged = _.cloneDeep(this.location);
    },
    loadEverything() {
      this.size = this.ed.size;
      this.url = this.ed.url;
      this.ticketUrl = this.ed.ticket_url;
      this.description = this.ed.description;
      this.descriptionAttribute = this.ed.description_attribute;
      this.edId = this.ed.id;
      this.cancelled = this.ed.cancelled;
      this.loadLocation();
      this.loadDateTime();
      // load revisions
    },
    undo() {
      if (this.mode == 'url') {
        this.url = this.ed.url;
      } else if (this.mode === 'ticketUrl') {
        this.ticketUrl = this.ed.ticketUrl;
      } else if (this.mode === 'size') {
        this.size = this.ed.size;
      } else if (this.mode === 'description') {
        this.description = this.ed.description;
        this.descriptionAttribute = this.ed.descriptionAttribute;
      } else if (this.mode === 'date') {
        this.loadDateTime();
      } else if (this.mode === 'location') {
        this.loadLocation();
      }
    },
  },
  watch: {
    ed: {
      handler: function () {
        this.loadEverything();
      },
    },
  },
  computed: {
    disableSaveButton() {
      if (this.mode === 'url') {
        return this.url == this.ed.url;
      } else if (this.mode === 'ticketUrl') {
        return this.ticketUrl == this.ed.ticketUrl;
      } else if (this.mode === 'size') {
        return this.size === this.ed.size;
      } else if (this.mode === 'description') {
        return this.description === this.ed.description;
      } else if (this.mode === 'date') {
        return !this.dateTimeHasChanged;
      } else if (this.mode === 'location') {
        return !this.locationHasChanged;
      } else return true;
    },
    ...mapState(useEventStore, [
      'event',
      'currentUserCanEdit',
      'currentUserIsHost',
    ]),
    ...mapState(useAuthStore, ['currentUser']),
    dateTimeHasChanged() {
      return !_.isEqual(this.dateTime, this.dateTimeUnchanged);
    },
    locationHasChanged() {
      return this.locationUnchanged !== this.location;
    },
  },
  mounted() {
    this.loadEverything();
  },
  created() {
    this.localDateTimeLong = common.localDateTimeLong;
  },
};
</script>

<style lang="scss" scoped>
.top-section {
  cursor: pointer;
}
.edit-card {
  max-width: 460px;
}

@media only screen and (max-width: 1023px) {
  .card {
    margin-top: 0px;
    width: 100%;
    height: 100%;
  }
}
</style>
