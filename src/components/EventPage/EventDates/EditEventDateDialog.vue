<template>
  <div>
    <!-- URL -->

    <q-card v-if="mode === 'url'" class="edit-card">
      <q-card-section class="flex column no-wrap top-section">
        <div class="flex items-start no-wrap justify-start grow">
          <div class="flex column">
            <div class="text-h6 card-title q-pr-md">
              {{ $t('edit_event_date.external_url') }}
            </div>
            <div class="t2 q-mb-md q-mt-sm">
              {{ $t('edit_event_date.external_url_msg') }}
            </div>
          </div>
          <q-btn icon="close" class="q-ml-md" flat round dense v-close-popup />
        </div>
        <q-input
          outlined
          square
          autogrow
          color="bg-grey-7"
          v-model="url"
          :label="$t('add.url')"
        />
      </q-card-section>
      <q-card-section>
        <div class="flex grow justify-end">
          <q-btn
            icon="las la-undo"
            color="primary"
            no-caps
            @click="url = ed.url"
            v-close-popup
            :label="$t('general.undo')"
            v-if="url != ed.url"
          />
          <q-btn
            icon="las la-cloud-upload-alt"
            class="q-ml-sm"
            color="primary"
            no-caps
            square
            @click="updateEd"
            v-close-popup
            :label="$t('general.save_changes')"
            :disabled="url == ed.url"
          />
        </div>
        <q-space />
      </q-card-section>
    </q-card>

    <q-card v-if="mode === 'ticketUrl'" class="edit-card">
      <q-card-section class="flex row justify-between no-wrap top-section">
        <div class="flex row wrap items-center justify-between grow">
          <div class="text-h6 card-title q-pr-md">Ticket URL</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
      </q-card-section>
      <q-card-section>
        <q-input
          outlined
          autogrow
          color="bg-grey-7"
          v-model="ticketUrl"
          :label="$t('add.ticketing_url')"
        />
        <div class="flex grow justify-end q-mt-md">
          <q-btn
            icon="las la-undo"
            color="primary"
            no-caps
            @click="ticketUrl = ed.ticket_url"
            v-close-popup
            :label="$t('general.undo')"
            v-if="ticketUrl != ed.ticket_url"
          />
          <q-btn
            icon="las la-cloud-upload-alt"
            class="q-ml-sm"
            color="primary"
            no-caps
            @click="updateEd"
            v-close-popup
            :label="$t('general.save_changes')"
            :disabled="ticketUrl == ed.ticket_url"
          />
        </div>
        <q-space />
      </q-card-section>
    </q-card>

    <!-- SIZE -->

    <q-card v-if="mode === 'size'" class="edit-card">
      <q-card-section class="flex column justify-between no-wrap top-section">
        <div class="flex row wrap items-start no-wrap justify-start grow">
          <div class="flex column">
            <div class="text-h6 card-title q-pr-md">
              {{ $t('edit_event_date.size') }}
            </div>
            <div class="t2 q-mb-md q-mt-sm">
              {{ $t('edit_event_date.size_msg') }}
            </div>
          </div>
          <q-btn icon="close" class="q-ml-md" flat round dense v-close-popup />
        </div>
        <q-input
          outlined
          autogrow
          square
          color="bg-grey-7"
          v-model="size"
          :label="$t('add.size')"
          type="number"
          :rules="[
            (val) => Number.isInteger(parseInt(val)) || 'Please input a number',
          ]"
        />
        <div class="flex grow justify-end q-mt-md">
          <q-btn
            icon="las la-undo"
            color="primary"
            no-caps
            @click="size = ed.size"
            v-close-popup
            :label="$t('general.undo')"
            v-if="size != ed.size"
          />
          <q-btn
            icon="las la-cloud-upload-alt"
            class="q-ml-sm"
            color="primary"
            no-caps
            @click="updateEd"
            v-close-popup
            :label="$t('general.save_changes')"
            :disabled="size == ed.size"
          />
        </div>
        <q-space />
      </q-card-section>
    </q-card>
    <!-- DESCRIPTION -->

    <q-card v-if="mode === 'description'" class="edit-card">
      <q-card-section class="flex column no-wrap top-section">
        <div
          class="flex row wrap items-start no-wrap justify-between grow q-mb-md"
        >
          <div class="flex column">
            <div class="text-h6 card-title q-pr-md">
              {{ $t('edit_event_date.description') }}
            </div>
          </div>
          <q-btn icon="close" class="q-ml-md" flat round dense v-close-popup />
        </div>
        <q-input
          outlined
          autogrow
          square
          :input-style="{ 'min-height': '100px' }"
          color="bg-grey-7"
          v-model="description"
          :label="$t('event_dates.description')"
        />
        <!-- ATRRIBUTE -->
        <q-input
          v-if="!currentUserIsHost"
          square
          dense
          outlined
          maxlength="200"
          class="q-mt-sm"
          :input-style="{ 'min-height': '50px' }"
          color="bg-grey-7"
          v-model="descriptionAttribute"
          :label="$t('description.attribute_msg_long')"
        />
      </q-card-section>
      <q-card-section>
        <div class="flex grow justify-end">
          <q-btn
            icon="las la-undo"
            color="primary"
            no-caps
            v-if="description != ed.description"
            @click="description = ed.description"
            :label="$t('general.undo')"
            v-close-popup
          />
          <q-btn
            icon="las la-cloud-upload-alt"
            color="primary"
            class="q-ml-sm"
            no-caps
            @click="updateEd"
            :label="$t('general.save_changes')"
            v-close-popup
          />
        </div>
        <q-space />
      </q-card-section>
    </q-card>

    <!-- DATE TIME -->

    <q-card v-if="mode === 'date'" class="edit-card">
      <q-card-section class="flex column top-section">
        <div class="flex row wrap items-start no-wrap justify-start grow">
          <div class="flex column">
            <div class="text-h6 card-title q-pr-md">
              {{ $t('edit_event_date.date') }}
            </div>
            <div class="t2 q-mb-md q-mt-sm">
              {{ $t('edit_event_date.date_msg') }}
            </div>
          </div>
          <q-btn icon="close" class="q-ml-md" flat round dense v-close-popup />
        </div>
      </q-card-section>
      <q-card-section v-if="dateTime" class="flex column q-pt-none">
        <DateTimePicker
          :value="dateTime"
          :isRange="true"
          @dateRange="dateTime = $event"
          :inlineCalendar="true"
        />
        <div class="flex grow justify-end q-mt-lg">
          <q-btn
            icon="las la-undo"
            color="primary"
            no-caps
            @click="loadDateTime"
            :label="$t('general.undo')"
            v-close-popup
            v-if="dateTimeHasChanged"
          />
          <q-btn
            icon="las la-cloud-upload-alt"
            color="primary"
            class="q-ml-sm"
            no-caps
            @click="updateEd"
            :label="$t('general.save_changes')"
            :disabled="!dateTimeHasChanged"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- LOCATION -->

    <q-card v-if="mode === 'location'" class="eventdate-container edit-card">
      <q-card-section class="flex column no-wrap top-section">
        <div class="flex row wrap items-start no-wrap justify-start grow">
          <div class="flex column">
            <div class="text-h6 card-title q-pr-md">
              {{ $t('edit_event_date.location') }}
            </div>
            <div class="t2 q-mt-sm">
              {{ $t('edit_event_date.location_msg') }}
            </div>
          </div>
          <q-btn icon="close" class="q-ml-md" flat round dense v-close-popup />
        </div>
        <GoogleLocationComponent
          class="q-mt-md"
          v-on:location="location = $event"
          :locationProp="location"
        />
      </q-card-section>
      <q-card-section>
        <div class="flex grow justify-end">
          <q-btn
            icon="las la-undo"
            color="primary"
            no-caps
            @click="loadLocation"
            v-close-popup
            :label="$t('general.undo')"
            v-if="locationHasChanged"
          />
          <q-btn
            icon="las la-cloud-upload-alt"
            color="primary"
            class="q-ml-sm"
            no-caps
            @click="updateEd"
            v-close-popup
            :label="$t('general.save_changes')"
            :disabled="!locationHasChanged"
          />
        </div>
        <div ref="placesDiv" />
      </q-card-section>
    </q-card>

    <!-- EVENT CANCELLED -->
    <q-card style="width: 300px" class="edit-card" v-if="mode === 'cancel'">
      <q-card-section v-if="ed.cancelled">
        <div class="text-h6">
          Mark this date as 'happening'
          <p />
        </div>
        <span> Only do this if this event date is no longer cancelled. </span>
      </q-card-section>
      <q-card-section v-else>
        <div class="text-h6">
          Mark this date as cancelled
          <p />
        </div>
        <span v-if="!currentUserIsHost">
          Don't be a bloody dickhead, only do this if this date has been
          cancelled.
        </span>
        <span v-else>
          Only do this if this date has been cancelled. Your event will still
          show up on PartyMap.
        </span>
      </q-card-section>
      <!--
      <q-card-section class="q-pt-none">
        Tell everyone why this event was cancelled:
        <q-input
          outlined
          autogrow
          :input-style="{ 'min-height': '100px' }"
          color="bg-grey-7"
          v-model="description"
          :label="$t('add.description')"
          style="padding-bottom: 0px;"
        />
      </q-card-section>
    -->
      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn flat color="primary" label="Cancel" v-close-popup />
        <q-btn
          color="primary"
          label="Continue"
          v-on:click="toggleCancelEvent"
          v-close-popup
        />
      </q-card-actions>
    </q-card>

    <!-- EVENT UNCANCELLED -->

    <q-card style="width: 300px" v-if="mode === 'uncancel'" class="edit-card">
      <q-card-section>
        <div class="text-h6">
          Mark this date as happening
          <p />
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        This date was previously marked as cancelled. Are you really sure you
        want to mark is as 'happening'?
      </q-card-section>

      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn flat color="primary" label="Cancel" v-close-popup />
        <q-btn
          color="primary"
          label="Continue"
          v-on:click="toggleCancelEvent"
          v-close-popup
        />
      </q-card-actions>
    </q-card>

    <!-- DELETE ED -->

    <q-card style="width: 300px" v-if="mode === 'delete'" class="edit-card">
      <q-card-section>
        <div class="text-h6">Delete event date</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        You are about to delete the event date
        <p />
        <b>{{ localDateTimeLong(ed.start, ed.tz) }}</b>
        <p />
        Are you sure you want to continue?
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat color="primary" label="Cancel" v-close-popup />
        <q-btn
          color="primary"
          label="Continue"
          v-on:click="deleteEd"
          v-close-popup
        />
      </q-card-actions>
    </q-card>

    <q-inner-loading :showing="loading">
      <q-spinner-ios :color="$q.dark.isActive ? 'white' : 'black'" size="2em" />
    </q-inner-loading>
  </div>
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
    };
  },
  methods: {
    ...mapActions(useEventStore, ['deleteEventDate', 'updateEventDate']),
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
    toggleCancelEvent() {
      this.cancelled = !this.cancelled;
      this.updateEd();
    },
    async updateEd() {
      this.loading = true;

      var update = {};
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
        this.size = this.size.replace(/,/g, ''); // remove commas
        this.size = this.size.replace(/./g, ''); // remove dots
        this.size = this.size.replace(/\s/g, ''); // remove spaces
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
      if (this.currentUserIsHost) {
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
  },
  watch: {
    ed: {
      handler: function () {
        this.loadEverything();
      },
    },
  },
  computed: {
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
  min-width: 400px;
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
