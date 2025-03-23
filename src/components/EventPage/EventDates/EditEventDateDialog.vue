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
        <q-btn @click="addTicketUrl">{{
          $t('event_dates.add_ticket_url')
        }}</q-btn>
        <q-card
          class="flex column q-pa-sm q-mt-sm"
          v-for="(ticket, index) of tickets"
          :key="index"
        >
          <q-btn
            @click="removeTicketUrl(key)"
            size="sm"
            class="delete-button"
            round
            color="red"
          >
            <q-icon size="1em" name="las la-times" />
          </q-btn>
          <q-input
            class="q-mb-sm"
            outlined
            autogrow
            color="bg-grey-7"
            v-model="ticket.url"
            :label="$t('add.ticketing_url')"
          />
          <q-input
            class="q-mb-sm"
            outlined
            autogrow
            color="bg-grey-7"
            v-model="ticket.description"
            :label="$t('edit_event_date.ticket_description')"
          />
          <div class="flex row no-wrap">
            <q-input
              class="q-mr-sm"
              dense
              outlined
              autogrow
              color="bg-grey-7"
              v-model="ticket.price_min"
              :label="$t('edit_event_date.min_price')"
            />
            <q-input
              class="q-mr-sm"
              dense
              outlined
              autogrow
              color="bg-grey-7"
              v-model="ticket.price_max"
              :label="$t('edit_event_date.max_price')"
            />
            <q-input
              dense
              outlined
              autogrow
              color="bg-grey-7"
              v-model="ticket.price_currency_code"
              :label="$t('edit_event_date.ticket_currency')"
            />
          </div>
        </q-card>
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
        {{ $t('event_dates.delete_are_you_sure') }}
        <p />
        <b>{{ localDateTimeLong(ed.start_naive) }}</b>

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
          class="q-mr-sm"
          color="secondary"
          label="Undo"
          @click="undo()"
          :disabled="disableSaveButton"
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
      // ticketUrl: null,
      tickets: [],
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
          title: this.$t('edit_event_date.tickets'),
          message: this.$t('edit_event_date.tickets_msg'),
        },
        size: {
          title: this.$t('edit_event_date.size'),
          message: this.$t('edit_event_date.size_msg'),
        },
        description: {
          title: this.$t('edit_event_date.description'),
          message: this.$t('edit_event_date.description_msg'),
        },
        date: {
          title: this.$t('edit_event_date.date'),
          message: this.$t('edit_event_date.date_msg'),
        },
        location: {
          title: this.$t('edit_event_date.location'),
          message: this.$t('edit_event_date.location_msg'),
        },
        cancel: {
          title: this.ed.cancelled
            ? this.$t('edit_event_date.cancelled')
            : this.$t('edit_event_date.cancel'),
          message: this.ed.cancelled
            ? this.$t('edit_event_date.cancelled_msg')
            : this.$t('edit_event_date.cancel_msg'),
        },
        delete: {
          title: this.$t('edit_event_date.delete'),
        },
      },
    };
  },
  methods: {
    ...mapActions(useEventStore, [
      'deleteEventDate',
      'updateSelectedEventDate',
      'suggestSelectedEventDateEdit',
    ]),
    toggleCancelEvent() {
      this.cancelled = !this.ed.cancelled;
      this.updateEd();
    },
    addTicketUrl() {
      this.tickets.push({
        description: '',
        url: '',
        price_min: 0,
        price_max: 0,
        price_currency_code: 'USD',
      });
    },
    removeTicketUrl(index) {
      this.tickets.splice(index, 1);
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
                  this.$nextTick(() => {
                    this.$emit('closeDialog'); // close parent dialog
                  });
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
      if (this.ticketsHasChanged) {
        update.tickets = this.tickets;
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
          await this.updateSelectedEventDate(update);
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
              await this.suggestSelectedEventDateEdit({
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
                  this.$nextTick(() => {
                    this.$emit('closeDialog'); // close parent dialog
                  });
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
      this.tickets = _.cloneDeep(this.ed.tickets) || [];
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
        this.tickets = this.ed.tickets;
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
        return _.isEqual(this.tickets, this.ed.tickets);
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
    ticketsHasChanged() {
      return (
        (!this.ed.tickets && this.tickets.length > 0) ||
        (this.ed.tickets && !_.isEqual(this.tickets, this.ed.tickets))
      );
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

.delete-button {
  position: absolute;
  right: -10px;
  top: -10px;
  z-index: 2;
  border-radius: 100px !important;
}

@media only screen and (max-width: 1023px) {
  .card {
    margin-top: 0px;
    width: 100%;
    height: 100%;
  }
}
</style>
