<template>
  <DialogPage>
    <template v-slot:title>
      <div class="text-h6 chicago" v-if="event.host">
        {{ $t('add_event.add_your_event') }} &nbsp;<i
          class="mdi mdi-check-decagram-outline"
        />
      </div>
      <div class="text-h6 chicago" v-else>
        {{ $t('add_event.add_public_event') }}
      </div>
    </template>
    <template v-slot>
      <div
        class="flex row justify-center q-pb-xl"
        :class="$q.screen.gt.xs ? 'q-px-lg' : ''"
      >
        <transition
          appear
          enter-active-class="animated fadeIn slow"
          leave-active-class="animated fadeOut"
        >
          <div>
            <div
              v-if="event.host"
              :class="$q.screen.lt.sm ? 'q-pa-md q-mt-md' : 'q-pt-lg'"
            >
              <div class="t3">
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
              <div class="t3 q-mt-md">
                {{ $t('report.claim_message_2') }}
              </div>
              <br />
            </div>
            <div
              v-else
              :class="$q.screen.lt.sm ? 'q-pa-sm q-mt-sm' : 'q-pt-lg'"
            >
              <p class="t3">
                {{ $t('add_event.event_i_know_about_msg_long') }}
              </p>
              <p />
              <p class="t3">
                Please do not upload copyrighted content to Partymap. If you do
                it may be removed from the website.
              </p>
            </div>

            <div class="flex column">
              <div class="sticky-header flex column">
                <p class="text-large chicago t1 q-mb-md q-mt-md">
                  {{ $t('add.required_information') }}:
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
                    <p class="text-large chicago">Event name</p>
                    <q-input
                      class="grow"
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

                <!-- Event Description (mandatory if host)-->

                <div
                  class="flex row grow no-wrap items-baseline q-mt-md"
                  v-if="event.host"
                >
                  <q-icon size="xs" name="las la-align-left" />
                  <div class="flex column grow q-ml-lg">
                    <p class="text-large chicago">
                      {{ $t('description.summary') }}
                    </p>
                    <p class="t3">
                      {{ $t('description.summary_msg') }}
                    </p>
                    <q-input
                      outlined
                      autogrow
                      counter
                      maxlength="400"
                      :input-style="{ 'min-height': '50px' }"
                      color="bg-grey-7"
                      :rules="[(val) => !!val]"
                      v-model="event.description"
                      :label="$t('description.summary')"
                      style="padding-bottom: 0px"
                    />
                    <div class="flex row" v-if="event.host === false">
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

                <!-- URL (Mandatory if no host) -->

                <div
                  class="flex row grow no-wrap items-baseline q-mt-md"
                  v-if="!event.host"
                >
                  <q-icon size="xs" name="las la-external-link-alt" />
                  <div class="flex column grow q-ml-lg">
                    <p class="text-large chicago">
                      {{ $t('add.url') }}
                    </p>
                    <p class="t3">
                      {{ $t('add.url_msg') }}
                    </p>
                    <q-input
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
                    <p class="text-large chicago">
                      {{ $t('add.location') }}
                    </p>
                    <p class="t3">
                      {{ $t('add.location_caption') }}
                    </p>
                    <GoogleLocationComponent
                      v-on:location="event.location = $event"
                      :location="event.location"
                    />
                    <p />
                  </div>
                </div>

                <!-- DATE AND TIME -->

                <div class="flex row grow no-wrap items-baseline q-mt-md">
                  <q-icon size="xs" name="las la-calendar-day" />
                  <div class="flex column grow q-ml-lg">
                    <p class="text-large chicago">Date and Time</p>
                    <p class="t3">
                      {{ $t('add.please_select_date_msg') }}
                      <br />
                      {{ $t('add.please_select_date_msg_2') }}
                    </p>

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
                    <p class="text-large chicago">
                      {{ $t('add.recurrence') }}
                    </p>

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
                    <p v-else class="t3">
                      {{ $t('add.please_select_date_first') }}
                    </p>
                  </div>
                </div>

                <div
                  class="flex row grow no-wrap items-baseline q-mt-md"
                  v-if="event.host"
                >
                  <q-icon size="xs" name="las la-images" />
                  <div class="flex column grow q-ml-lg">
                    <p class="text-large chicago">Event poster image</p>
                    <p class="t3">Upload an image for this event</p>
                    <MultipleMediaSelector
                      :singleSelectMode="event.host === false"
                      :showUploadButton="false"
                      :disableCaption="true"
                      @filesSelected="event.media_items = $event"
                    />
                    <p />
                  </div>
                </div>
              </div>

              <div class="sticky-header flex column">
                <p class="text-large chicago t1 q-mb-md q-mt-md" :class="{}">
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
                    <p class="text-large chicago">Tags</p>
                    <p class="t3">
                      {{ $t('add.suggested_tags') }}
                    </p>
                    <SelectTagsComponent
                      @valueUpdated="event.tags = $event"
                      :mode="'emit'"
                    />
                    <p />
                  </div>
                </div>
                <!-- Event Description -->

                <div class="flex row grow no-wrap items-baseline q-mt-md">
                  <q-icon size="xs" name="las la-align-left" />
                  <div class="flex column grow q-ml-lg">
                    <p class="text-large chicago">
                      {{ $t('description.summary') }}
                    </p>
                    <p class="t3">
                      {{ $t('description.summary_msg') }}
                    </p>
                    <br />

                    <q-input
                      outlined
                      autogrow
                      counter
                      maxlength="400"
                      :input-style="{ 'min-height': '50px' }"
                      color="bg-grey-7"
                      v-model="event.description"
                      :label="$t('description.summary')"
                      style="padding-bottom: 0px"
                    />
                    <div v-if="event.host === false">
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
                <!-- Detailed Description (for next event date) -->

                <div class="flex row grow no-wrap items-baseline q-mt-md">
                  <q-icon size="xs" name="las la-align-left" />
                  <div class="flex column grow q-ml-lg">
                    <p class="text-large chicago">
                      {{ $t('description.detailed_description') }}
                    </p>
                    <p class="t3">
                      {{ $t('description.detailed_description_msg') }}
                    </p>
                    <br />
                    <q-input
                      outlined
                      autogrow
                      :input-style="{ 'min-height': '100px' }"
                      color="bg-grey-7"
                      v-model="event.next_event_date_description"
                      :label="$t('description.detailed_description')"
                      style="padding-bottom: 0px"
                    />
                    <div v-if="event.host === false">
                      <p />
                      <q-option-group
                        v-model="detailedDescriptionAttributeOption"
                        :options="attributeOptions"
                        color="primary"
                      />
                    </div>
                    <p />
                    <q-input
                      v-if="detailedDescriptionAttributeOption === 'other'"
                      dense
                      outlined
                      maxlength="200"
                      :input-style="{ 'min-height': '50px' }"
                      color="bg-grey-7"
                      v-model="detailedDescriptionAttribute"
                      :label="$t('description.attribute_msg')"
                      :rules="[(val) => !!val]"
                      style="padding-bottom: 0px"
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
                    <p class="text-large chicago">
                      {{ $t('add.url') }}
                    </p>
                    <p class="t3">
                      {{ $t('add.url_msg') }}
                    </p>
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

                <!-- MOBILE DATE AND TIME
              <div class="flex column" v-else>
                <div class="flex row grow no-wrap items-baseline q-mt-md">
                  <q-icon size="xs" name="las la-calendar-day" />
                  <div class="flex column grow q-ml-lg">
                    <div
                      class="text-large card-title  flex row no-wrap items-baseline"
                    >
                      Date and Time
                    </div>
                    <div class="t3">
                      {{ $t('add.please_select_date_msg') }}
                    </div>
                  </div>
                </div>
                <DateTimePicker
                  class="q-mt-md"
                  @dateRange="event.date_time = $event"
                  :inlineCalendar="true"
                  :isRange="true"
                />
              </div>
              -->

                <!-- Lineup (for next event date) -->

                <div class="flex row grow no-wrap items-baseline q-mt-md">
                  <q-icon size="xs" name="las la-align-left" />
                  <div class="flex column grow q-ml-lg">
                    <p class="text-large chicago">
                      {{ $t('add.lineup') }}
                    </p>
                    <div
                      class="flex column"
                      v-if="
                        event.date_time &&
                        event.date_time.start &&
                        event.date_time.end
                      "
                    >
                      <p class="t3">
                        {{ $t('add.lineup_msg') }}
                      </p>
                      <br />
                      <SelectArtistsComponent
                        :mode="'emit'"
                        @updated="event.next_event_date_artists = $event"
                        :defaultDate="event.date_time.start"
                      />
                    </div>
                    <p v-else class="t3">
                      {{ $t('add.please_select_date_first') }}
                    </p>
                  </div>
                </div>

                <!-- Size -->

                <div class="flex row grow no-wrap items-baseline q-mt-md">
                  <q-icon size="xs" name="las la-user-friends" />
                  <div class="flex column grow q-ml-lg">
                    <p class="text-large chicago">
                      {{ $t('add.size_how_many') }}
                    </p>
                    <p class="t3">
                      {{ $t('add.size_msg') }}
                      <br />
                      {{ $t('add.size_msg2') }}
                    </p>
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

                <!-- IMAGES -->

                <div
                  class="flex row grow no-wrap items-baseline q-mt-md q-mb-lg"
                  v-if="!event.host"
                >
                  <q-icon size="xs" name="las la-images" />
                  <div class="flex column grow q-ml-lg">
                    <p class="text-large chicago">
                      {{ $t('add.event_poster_image') }}
                    </p>
                    <p class="t3">
                      {{ $t('add.event_poster_image_msg') }}
                    </p>
                    <MultipleMediaSelector
                      :singleSelectMode="event.host === false"
                      :showUploadButton="false"
                      :disableCaption="true"
                      @filesSelected="event.media_items = $event"
                    />
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
        </transition>
      </div>
      <div
        class="flex row submit-footer items-center"
        :class="$q.screen.lt.sm ? 'justify-center ' : 'justify-between'"
      >
        <div
          v-if="!validation"
          class="t1 chicago"
          :class="$q.screen.gt.xs ? 'q-ml-lg' : 'q-mt-lg'"
        >
          Please fill out all of the required fields
        </div>
        <q-btn
          :class="event.host === null ? 'card-disabled' : ''"
          icon-right="mdi-chevron-right"
          color="primary"
          class="soft-button-shadow chicago q-ma-lg"
          label="Submit"
          :disabled="!validation"
          v-on:click="submitEvent"
        />
      </div>
    </template>
  </DialogPage>
</template>

<script>
import DialogPage from 'components/dialogs/DialogPage.vue';
import DateTimePicker from 'components/DateTimePicker.vue';
import GoogleLocationComponent from 'components/GoogleLocationComponent.vue';
import MultipleMediaSelector from 'components/MultipleMediaSelector.vue';
import RrulePicker from 'components/RrulePicker.vue';
import SelectArtistsComponent from 'components/EventPage/EventDates/Artists/SelectArtistsComponent.vue';
import SelectTagsComponent from 'components/EventPage/Tags/SelectTagsComponent.vue';
import { getEventsRequest } from 'src/api';
import { useAuthStore } from 'src/stores/auth';
import { mapState } from 'pinia';

export default {
  components: {
    DialogPage,
    DateTimePicker,
    RrulePicker,
    MultipleMediaSelector,
    GoogleLocationComponent,
    SelectTagsComponent,
    SelectArtistsComponent,
  },
  props: { host: { default: false } },
  data() {
    return {
      descriptionAttribute: null,
      detailedDescriptionAttribute: null,
      existingEvents: null,
      descriptionAttributeOption: 'self',
      detailedDescriptionAttributeOption: 'self',
      attributeOptions: [
        {
          label: 'I wrote this myself',
          value: 'self',
        },
        {
          label: 'This is from the official page linked to below',
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
        next_event_date_description: '',
        next_event_date_description_attribute: null,
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
    };
  },
  methods: {
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
        this.$router.push({ name: 'Login' });
      }
    },
    goBack() {
      this.$router.push({ name: 'Explore' });
      this.showSidebar = true;
    },
    submitEvent() {
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
      if (this.detailedDescriptionAttributeOption === 'official') {
        this.event.next_event_date_description_attribute = this.event.url;
      } else if (this.detailedDescriptionAttributeOption === 'other') {
        this.event.next_event_date_description_attribute =
          this.detailedDescriptionAttribute;
      }

      this.$store
        .dispatch('main/addEvent', this.event)
        .then((response) => {
          progressDialog.hide();
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
        })
        .catch(() => {
          progressDialog.hide();
        });
    },
    onScrollMainContent(info) {
      this.mainContentScrollPosition = info.verticalPosition;
    },
  },
  watch: {},
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
    validation() {
      if (this.event.host) {
        // don't require URL if host
        if (
          this.event.name &&
          this.event.name.length > 1 &&
          this.event.description &&
          this.event.description.length > 0 &&
          this.event.location &&
          this.event.location.name &&
          this.event.date_time &&
          this.event.date_time.start &&
          this.event.date_time.end &&
          this.event.media_items.length > 0
        ) {
          return true;
        } else {
          return false;
        }
      } else if (
        this.event.name &&
        this.event.name.length > 1 &&
        this.event.url &&
        this.event.url.length > 0 &&
        this.event.location &&
        this.event.location.name &&
        this.event.date_time &&
        this.event.date_time.start &&
        this.event.date_time.end
      ) {
        return true;
      } else {
        return false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.add-event-card {
  max-width: 600px;
}

.body--dark {
  .sticky-header {
    background: black;
  }
  .hover-option {
    &:hover {
      background: $bi-3;
      //color: $primary;
    }
  }
}

.body--light {
  .sticky-header {
    background: white;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }
  .host-options {
    .host-option {
      border: 1px solid rgba(0, 0, 0, 0);
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
  .submit-footer {
    background: $b-2;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
  .q-card {
    border-top: none !important;
  }
}

.hover-option {
  cursor: pointer;
}

.sticky-header {
  position: sticky;
  top: 0px;
  z-index: 1000;
}

// sm
@media only screen and (max-width: 600px) {
  .solid-page {
    padding-left: 0px !important;
    padding-right: 0px !important;
    .q-card {
      box-shadow: none;
    }
  }
}
</style>
