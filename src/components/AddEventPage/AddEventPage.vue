<template>
  <SolidPage @scrollPercentage="onScrollPercentage($event)">
    <template v-slot:title>
      <div v-if="event.host">
        {{ $t('add_event.add_your_event') }} &nbsp;<i
          class="mdi mdi-check-decagram-outline"
        />
      </div>
      <div v-else>
        {{ $t('add_event.add_public_event') }}
      </div>
    </template>
    <template v-slot>
      <div class="flex column">
        <div
          v-if="event.host"
          :class="$q.screen.lt.sm ? ' q-mt-md' : 'q-pt-lg'"
        >
          <div class="t2">
            {{ $t('report.claim_message') }}
            <a
              href="https://www.facebook.com/partymap.official"
              target="_blank"
              class="link-hover underline"
              >Facebook</a
            >
            {{ $t('report.or') }}
            <a
              href="https://www.instagram.com/partymap.official"
              class="link-hover underline"
              target="_blank"
              >Instagram</a
            >&nbsp;{{ $t('report.or_from_your_email') }}
          </div>
          <div class="t2 q-mt-md">
            {{ $t('report.claim_message_2') }}
          </div>
        </div>
        <div v-else :class="$q.screen.lt.sm ? ' q-mt-sm' : 'q-pt-lg'">
          <p class="t2">
            {{ $t('add_event.event_i_know_about_msg_long') }}
          </p>
          <p />
          <p class="t2">
            Please do not upload copyrighted content to Partymap. If you do it
            will be removed from the website.
          </p>
        </div>
        <div class="flex column">
          <div class="sticky-header flex column">
            <p class="text-large inter bolder t1 q-mb-md q-mt-md">
              Event Details:
            </p>
          </div>

          <div
            class="flex column"
            :class="{
              'q-pa-sm q-pb-md': $q.screen.lt.sm,
              'q-px-lg q-pb-lg q-pt-sm': $q.screen.gt.xs,
            }"
          >
            <!-- TITLE -->
            <p />
            <div class="flex row grow no-wrap items-baseline">
              <q-icon size="xs" name="las la-bullhorn" />
              <div class="flex column grow q-ml-lg">
                <p class="text-large inter bold">Event name</p>
                <q-input
                  class="grow"
                  :error="!!validationErrors.name && showValidationErrors"
                  :errorMessage="validationErrors.name"
                  style="padding-bottom: 0px"
                  outlined
                  debounce="500"
                  @input="findExistingEvent"
                  v-model="event.name"
                  :label="$t('add.name')"
                  color="bg-grey-7"
                  :rules="[(val) => !!val]"
                />
                <p />
                <div
                  class="flex column"
                  v-if="existingEvents && existingEvents.length > 0"
                >
                  <div class="t2 flex row items-baseline no-wrap">
                    <q-icon name="mdi-alert-circle-outline" />
                    <div>
                      <p class="q-ml-sm">
                        {{ $t('add.an_event_already_exists') }}(
                        <router-link
                          :to="{
                            name: 'EventPage',
                            params: { id: existingEvents[0].id },
                          }"
                          >{{ existingEvents[0].name }}</router-link
                        >).
                        <br />
                        {{ $t('add.dont_add_same_twice') }}
                        <br />
                        {{ $t('add.dont_add_same_twice2') }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- MEDIA -->
            <div class="flex row grow no-wrap items-baseline q-mt-md">
              <q-icon size="xs" name="las la-images" />
              <div class="flex column grow q-ml-lg">
                <span class="text-large inter bold">Event poster</span>
                <span class="t2">Upload an image for this event</span>
                <MultipleMediaSelector
                  :singleSelectMode="event.host === false"
                  :showUploadButton="false"
                  :disableCaption="true"
                  @filesSelected="event.media_items = $event"
                />
                <div
                  v-if="!!validationErrors.media_items && showValidationErrors"
                  class="inter no-wrap flex items-center q-mt-md text-negative"
                >
                  <q-icon name="mdi-alert-circle" size="1.5em" />
                  <div class="q-ml-sm">
                    {{ validationErrors.media_items }}
                  </div>
                </div>
                <p />
              </div>
            </div>

            <!-- Event Description (mandatory for both)-->

            <div class="flex row grow no-wrap items-baseline q-mt-md">
              <q-icon size="xs" name="las la-align-left" />
              <div class="flex column grow q-ml-lg">
                <span class="text-large inter bold">
                  {{ $t('description.summary') }}
                </span>
                <span class="t2 q-mb-md">
                  {{ $t('description.summary_msg') }}
                </span>
                <q-input
                  outlined
                  autogrow
                  counter
                  :error="
                    !!validationErrors.description && showValidationErrors
                  "
                  maxlength="400"
                  :input-style="{ 'min-height': '50px' }"
                  color="bg-grey-7"
                  :rules="[(val) => !!val]"
                  v-model="event.description"
                  :label="$t('description.summary')"
                  style="padding-bottom: 0px"
                />
                <div class="flex row q-mt-sm" v-if="event.host === false">
                  <p />
                  <q-option-group
                    v-model="descriptionAttributeOption"
                    :options="attributeOptions"
                    color="primary"
                  />
                </div>
                <q-input
                  v-if="descriptionAttributeOption === 'other'"
                  dense
                  outlined
                  maxlength="200"
                  class="q-mt-sm"
                  :input-style="{ 'min-height': '50px' }"
                  color="bg-grey-7"
                  v-model="descriptionAttribute"
                  :label="$t('description.attribute_msg')"
                  :rules="[(val) => !!val]"
                  style="padding-bottom: 0px"
                />
                <p />
              </div>
            </div>

            <!-- Full Description -->

            <div class="flex row grow no-wrap items-baseline q-mt-md">
              <q-icon size="xs" name="las la-align-left" />
              <div class="flex column grow q-ml-lg">
                <span class="text-large inter bold">
                  {{ $t('description.detailed_description') }}&nbsp;(Optional)
                </span>
                <span class="t2 q-mb-sm">
                  Here you can tell people what they can expect in detail.
                  Please also provide an
                  <u> English translation</u>
                  if the description is in another languge.
                </span>

                <q-input
                  outlined
                  autogrow
                  counter
                  :input-style="{ 'min-height': '100px' }"
                  color="bg-grey-7"
                  maxlength="10000"
                  v-model="event.full_description"
                  :label="$t('description.detailed_description')"
                  style="padding-bottom: 0px"
                />
                <div v-if="event.host === false">
                  <p />
                  <q-option-group
                    v-model="FullDescriptionAttributeOption"
                    :options="attributeOptions"
                    color="primary"
                  />
                </div>
                <p />
                <q-input
                  v-if="FullDescriptionAttributeOption === 'other'"
                  dense
                  outlined
                  maxlength="200"
                  :input-style="{ 'min-height': '50px' }"
                  color="bg-grey-7"
                  v-model="fullDescriptionAttribute"
                  :label="$t('description.attribute_msg')"
                  :rules="[(val) => !!val]"
                  style="padding-bottom: 0px"
                />
                <p />
              </div>
            </div>
            <!-- URL (Mandatory if no host) -->

            <div
              class="flex row grow no-wrap items-baseline"
              v-if="!event.host"
            >
              <q-icon size="xs" name="las la-external-link-alt" />
              <div class="flex column grow q-ml-lg">
                <span class="text-large inter bold">
                  {{ $t('add.url') }}
                </span>
                <span class="t2 q-mb-md">
                  {{ $t('add.url_msg') }}
                </span>
                <q-input
                  :error="!!validationErrors.url && showValidationErrors"
                  :error-message="validationErrors.url"
                  outlined
                  :rules="[(val) => !!val]"
                  color="bg-grey-7"
                  v-model="event.url"
                  :label="$t('add.url')"
                  style="padding-bottom: 0px"
                />
                <p />
              </div>
            </div>

            <!--LOCATION-->

            <div class="flex row grow no-wrap items-baseline q-mt-md">
              <q-icon size="xs" name="las la-map-marker" />
              <div class="flex column grow q-ml-lg">
                <span class="text-large inter bold">
                  {{ $t('add.location') }}
                </span>
                <span class="t2 q-mb-md">
                  {{ $t('add.location_caption') }}
                </span>

                <GoogleLocationComponent
                  @:location="event.location = $event"
                  :locationProp="event.location"
                  :error-message="
                    showValidationErrors ? validationErrors.location : undefined
                  "
                />

                <div
                  class="location-map-wrapper satellite-enabled q-mt-md q-mb-lg"
                  v-show="!!event.location"
                >
                  <div class="map" ref="map" />
                  <div
                    class="location-map-select-msg flex justify-center items-center"
                  >
                    <div class="inter bold o-o50">Location preview</div>
                  </div>
                </div>

                <p />
              </div>
            </div>

            <!-- DATE AND TIME -->

            <div class="flex row grow no-wrap items-baseline q-mt-">
              <q-icon size="xs" name="las la-calendar-day" />
              <div class="flex column grow q-ml-lg">
                <span class="text-large inter bold">Date and Time</span>
                <span class="t2 q-mb-md">
                  Select a date range. {{ $t('add.please_select_date_msg_2') }}
                </span>
                <div
                  v-if="!!validationErrors.date_time && showValidationErrors"
                  class="inter no-wrap flex items-center q-mb-md text-negative"
                >
                  <q-icon name="mdi-alert-circle" size="1.5em" />
                  <div class="q-ml-sm">
                    {{ validationErrors.date_time }}
                  </div>
                </div>
                <DateTimePicker
                  @dateRange="event.date_time = $event"
                  :inlineCalendar="true"
                  :isRange="true"
                />

                <p />
              </div>
            </div>
            <!-- RECURRENCE -->

            <div class="flex row grow no-wrap items-baseline q-mt-md">
              <q-icon size="xs" name="las la-external-link-alt" />
              <div class="flex column grow q-ml-lg">
                <span class="text-large inter bold">
                  {{ $t('add.recurrence') }}
                </span>
                <span class="t2">
                  Will this event happen again, or is it a one-off?
                </span>
                <div
                  v-if="
                    event.date_time &&
                    event.date_time.start &&
                    event.date_time.end
                  "
                >
                  <p />
                  <RrulePicker
                    v-on:updateRrule="event.rrule = $event"
                    :dateTime="event.date_time"
                    :disableOneOff="false"
                  />
                </div>
                <p v-else class="t2 q-mt-sm">
                  <u>{{ $t('add.please_select_date_first') }}</u>
                </p>
              </div>
            </div>
          </div>

          <div class="sticky-header flex column">
            <p class="text-large inter bolder t1 q-mb-md q-mt-md" :class="{}">
              {{ $t('add.additional_information') }}:
            </p>
          </div>
          <div
            class="flex column"
            :class="{
              'card-disabled': event.host === null,
              'q-pa-sm q-pb-md': $q.screen.lt.sm,
              'q-px-lg q-pb-lg q-pt-sm': $q.screen.gt.xs,
            }"
          >
            <!-- TAGS -->

            <div class="flex row grow no-wrap items-baseline q-mt-md">
              <q-icon size="xs" name="las la-tags" />
              <div class="flex column grow q-ml-lg">
                <span class="text-large inter bold">Tags</span>
                <span class="t2 q-mb-md">
                  What makes this event stand out, and what music can one
                  expect?
                </span>
                <SelectTagsComponent
                  :showTopTags="true"
                  @valueUpdated="($event) => (event.tags = $event)"
                  :mode="'emit'"
                />
                <p />
              </div>
            </div>

            <!-- URL -->

            <div
              class="flex row grow no-wrap items-baseline q-mt-md"
              v-if="event.host"
            >
              <q-icon size="xs" name="las la-external-link-alt" />
              <div class="flex column grow q-ml-lg">
                <span class="text-large inter bold">
                  {{ $t('add.url') }}
                </span>
                <span class="t2 q-mb-md">
                  {{ $t('add.url_msg') }}
                </span>
                <q-input
                  outlined
                  autogrow
                  color="bg-grey-7"
                  v-model="event.url"
                  :label="$t('add.url')"
                />
                <p />
              </div>
            </div>

            <!-- Lineup (for next event date) -->

            <div class="flex row grow no-wrap items-baseline">
              <q-icon size="xs" name="las la-align-left" />
              <div class="flex column grow q-ml-lg">
                <span class="text-large inter bold">
                  {{ $t('add.lineup') }}
                </span>
                <div
                  class="flex column"
                  v-if="
                    event.date_time &&
                    event.date_time.start &&
                    event.date_time.end
                  "
                >
                  <span class="t2 q-mb-md">
                    Search for the talented artists that are playing at this
                    event.
                  </span>
                  <SelectArtistsComponent
                    :mode="'emit'"
                    @updated="event.next_event_date_artists = $event"
                    :defaultDate="event.date_time.start"
                    class="q-mb-md"
                  />
                </div>
                <span v-else class="t2 q-mb-md q-mt-sm">
                  <u>{{ $t('add.please_select_date_first') }}</u>
                </span>
              </div>
            </div>

            <!-- Size -->

            <div class="flex row grow no-wrap items-baseline q-mt-md">
              <q-icon size="xs" name="las la-user-friends" />
              <div class="flex column grow q-ml-lg">
                <span class="text-large inter bold">
                  {{ $t('add.size_how_many') }}
                </span>
                <span class="t2 q-mb-md">
                  Give a rough estimate of how many people will be attending
                  this event.
                </span>
                <q-input
                  outlined
                  hide-bottom-space
                  color="bg-grey-7"
                  style="max-width: 300px"
                  v-model="event.next_event_date_size"
                  :label="$t('add.size')"
                  type="number"
                  :rules="[
                    (val) =>
                      !val ||
                      val.length == 0 ||
                      Number.isInteger(parseInt(val)) ||
                      'Please input a number',
                  ]"
                />
                <p />
              </div>
            </div>
          </div>

          <!-- Ticket URL (removed from this release)

          <q-card-section class="flex row justify-between no-wrap">
            <div class=" text-large flex row wrap items-center">
              <q-icon left size="1em" name="las la-ticket-alt" />
              <div class=" card-title q-pr-md">
                Ticketing URL
              </div>
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none q-ml-lg">
            <q-input

              outlined
              autogrow
              color="bg-grey-7"
              v-model="event.ticket_url"
              :label="$t('add.ticketing_url')"
            />
          </q-card-section>
-->
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <div
        class="flex solid-page-footer-content items-center"
        :class="
          $q.screen.lt.sm ? 'column justify-center ' : 'row justify-between'
        "
      >
        <div>
          <div
            v-if="Object.keys(validationErrors).length > 0"
            class="t1 inter bold text-large no-wrap flex items-center"
            :class="$q.screen.gt.xs ? 'q-ml-lg' : 'q-mt-lg'"
          >
            <q-icon name="mdi-alert-circle" size="2em" style="color: red" />
            <div class="q-ml-md t1">Missing required information...</div>
          </div>
          <div
            v-else
            class="t1 inter bold text-large no-wrap flex items-center"
            :class="$q.screen.gt.xs ? 'q-ml-lg' : 'q-mt-lg'"
          >
            <q-icon name="mdi-check" size="2em" style="color: green" />
            <div class="q-ml-md t1">
              Looks good! Thank you for contributing!
            </div>
          </div>
          <!--
  <div
      v-for="(errorMessage, index) of Object.values(validationErrors)"
      :key="index"
    >
      {{ errorMessage }}
    </div>
  </div>
  -->
        </div>
        <q-btn
          :class="event.host === null ? 'card-disabled' : ''"
          icon-right="mdi-chevron-right"
          color="primary"
          class="soft-button-shadow inter bold q-ma-lg"
          label="Submit Event"
          :disable="Object.keys(validationErrors).length > 0"
          v-on:click="submitEvent"
        />
      </div>
    </template>
  </SolidPage>
</template>

<script>
import SolidPage from 'src/components/dialogs/SolidPage.vue';
import DateTimePicker from 'components/DateTimePicker.vue';
import GoogleLocationComponent from 'components/GoogleLocationComponent.vue';
import MultipleMediaSelector from 'components/MultipleMediaSelector.vue';
import RrulePicker from 'components/RrulePicker.vue';
import SelectArtistsComponent from 'components/EventPage/EventDates/Artists/SelectArtistsComponent.vue';
import SelectTagsComponent from 'components/EventPage/Tags/SelectTagsComponent.vue';
import { getEventsRequest, addEventRequest } from 'src/api';
import { useAuthStore } from 'src/stores/auth';
import { mapState } from 'pinia';
import { useMapStore } from 'src/stores/map';
import { toRaw } from 'vue';

export default {
  components: {
    SolidPage,
    DateTimePicker,
    RrulePicker,
    MultipleMediaSelector,
    GoogleLocationComponent,
    SelectTagsComponent,
    SelectArtistsComponent,
  },
  props: {
    host: { type: Boolean, default: false },
  },
  data() {
    return {
      showValidationErrors: false,
      descriptionAttribute: null,
      fullDescriptionAttribute: null,
      existingEvents: null,
      descriptionAttributeOption: 'self',
      FullDescriptionAttributeOption: 'self',
      attributeOptions: [
        {
          label: 'I wrote this myself',
          value: 'self',
        },
        {
          label: 'This is from the linked event page',
          value: 'official',
        },
        {
          label: 'This is from somewhere else',
          value: 'other',
        },
      ],
      event: {
        host: this.host !== undefined ? this.host : false,
        name: '',
        description: '',
        description_attribute: null,
        full_description: '',
        full_description_attribute: null,
        next_event_date_size: null,
        next_event_date_artists: null,
        media_items: [],
        url: '',
        ticket_url: null,
        tags: [],
        location: null,
        date_time: null,
        rrule: {
          recurringType: 1,
          separationCount: 0,
          weekOfMonth: null,
          dayOfMonth: null,
          dayOfWeek: null,
          monthOfYear: null,
        },
      },
      mainContentScrollPosition: 0,
      map: null,
      tileLayer: null,
      labelLayer: null,
      mapMarkers: null,
    };
  },
  methods: {
    onScrollPercentage(percentage) {
      if (percentage === 1) {
        this.showValidationErrors = true;
      }
    },
    findExistingEvent() {
      getEventsRequest({ query: this.event.name, per_page: 1 }).then(
        (response) => {
          this.existingEvents = response.data.items;
        }
      );
    },
    selectHostMode() {
      if (this.currentUser) {
        this.event.host = true;
      } else {
        this.$router.push({
          path: '/login',
          query: { from: this.$route.path },
        });
      }
    },

    async submitEvent() {
      const progressDialog = this.$q.dialog({
        title: this.$t('add.uploading_event'),
        color: 'primary',
        progress: true, // we enable default settings
        cancel: false,
        persistent: true, // we want the user to not be able to close it
        ok: false,
      });

      if (this.descriptionAttributeOption === 'official') {
        this.event.description_attribute = this.event.url;
      } else if (this.descriptionAttributeOption === 'other') {
        this.event.description_attribute = this.descriptionAttribute;
      }
      if (this.FullDescriptionAttributeOption === 'official') {
        this.event.full_description_attribute = this.event.url;
      } else if (this.FullDescriptionAttributeOption === 'other') {
        this.event.full_description_attribute = this.fullDescriptionAttribute;
      }
      try {
        const response = await addEventRequest(this.event);
        this.$q
          .dialog({
            title: this.$t('add.pending_moderation'),
            message: this.$t('add.pending_moderation_msg'),
            color: 'primary',
            persistent: false, // we want the user to not be able to close it
          })
          .onDismiss(() => {
            this.$emit('closeDialog');
            // go to event page
            this.$router.push({
              name: 'EventPage',
              params: {
                id: response.data.id,
              },
              query: {
                name: response.data.name.replace(/ /g, '_'),
              },
            });
          });
      } catch {}
      progressDialog.hide();
    },

    initMap() {
      this.map = null;
      this.map = L.map(this.$refs.map, this.mapOptions);
      // enable zooming after clicking map
      this.map.on('click', () => {
        this.map.scrollWheelZoom.enable();
      });
      this.map.on('mouseout', () => {
        this.map.scrollWheelZoom.disable();
      });

      // tile layers

      // style specific parameters
      const detectRetina = this.mapStyle === 'satellite';

      let opacity = 1;
      if (this.mapStyle === 'toner') opacity = 0.68;

      let filter = [];
      if (this.mapStyle === 'transport' && this.$q.dark.isActive) {
        filter = ['saturate:150%', 'brightness:100%'];
      }

      this.tileLayer = L.tileLayer(this.currentMapTileUrl, {
        attribution: this.currentMapTileAttribution,
        detectRetina,
        filter,
      });
      this.tileLayer.setOpacity(opacity);
      this.tileLayer.addTo(this.map);

      if (this.mapStyle === 'satellite') {
        // add additional label layer for satellite map
        this.labelLayer = L.tileLayer(this.labelsMapTileUrl, {
          detectRetina: false,
        });
        this.labelLayer.addTo(this.map);
        this.labelLayer.setOpacity(0.68);
      }
    },
  },
  watch: {
    eventLocation: {
      handler(newv) {
        if (newv) {
          setTimeout(() => {
            this.map.invalidateSize();

            const lat = newv.geometry.location.lat();
            const lng = newv.geometry.location.lng();

            // remove previous marker
            if (this.markers && this.map.hasLayer(this.markers)) {
              toRaw(this.map).removeLayer(this.markers);
            }
            // add location preview marker
            this.map.setView([lat, lng], 12);
            let marker = L.marker([lat, lng], {
              icon: this.defaultIcon,
              zIndexOffset: 5000,
            });
            this.mapMarkers = L.featureGroup([marker]);
            this.mapMarkers.addTo(toRaw(this.map));
          }, 100);
        }
      },
      deep: true,
    },
  },
  computed: {
    ...mapState(useMapStore, [
      'currentMapTileAttribution',
      'currentMapTileUrl',
      'labelsMapTileUrl',
      'defaultIcon',
      'mapStyle',
    ]),
    ...mapState(useAuthStore, ['currentUser']),
    eventLocation() {
      return this.event.location;
    },
    validationErrors() {
      let errors = {};

      if (!this.event.name || this.event.name.length === 0) {
        errors.name = 'Event name is required';
      }
      if (!this.event.description || this.event.description.length === 0) {
        errors.description = 'Summary is required';
      }
      if (!this.event.location || !this.event.location.name) {
        errors.location = 'Location is required';
      }
      if (!this.event.date_time || !this.event.date_time.start) {
        errors.date_time = 'Date is required';
      } else if (!this.event.date_time.end) {
        errors.date_time = 'End date is required';
      }
      if (!this.event.media_items || this.event.media_items.length === 0) {
        errors.media_items = 'Event poster is required';
      }
      if (!this.event.host) {
        if (!this.event.url || this.event.url.length == 0) {
          errors.url = 'URL is required';
        }
      }
      return errors;
    },
  },
  mounted() {
    this.initMap();
  },
};
</script>

<style lang="scss" scoped>
.add-event-card {
  max-width: 600px;
}

.body--dark {
  .hover-option {
    &:hover {
      background: $bi-3;
    }
  }
}

.body--light {
  .host-options {
    .host-option {
      color: $t-1;
      &:hover {
        background: $b-3;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }
      &.host-option-active {
        //color: $primary;
      }
    }
  }

  .q-card {
    border-top: none !important;
  }
}

.solid-page {
  :deep(.solid-page-content) {
    .hover-option {
      cursor: pointer;
    }

    .location-map-wrapper {
      width: 100%;
      height: 256px;
      position: relative;
      overflow: hidden;
      border-radius: 18px;
      .map {
        position: absolute;
        width: 100%;
        height: 100%;
      }
      .location-map-select-msg {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 1;
        background: rgba(0, 0, 0, 0.5);
        color: white;
      }
    }
    .upload-component {
      .bottom-buttons {
        justify-content: flex-start;
      }
    }
  }
}

// sm
@media only screen and (max-width: 600px) {
  .solid-page {
    .q-card {
      box-shadow: none;
    }
  }
}
</style>
