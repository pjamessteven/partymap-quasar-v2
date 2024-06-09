<template>
  <div
    class="ticketmaster-result q-pa-md flex row"
    style="width: 100%"
    :class="Object.keys(errors).length > 0 ? 'error' : ''"
  >
    <div class="flex column" @click="expanded = !expanded" style="width: 100%">
      <div
        class="scraper-header flex row justify-between grow"
        style="width: 100%"
      >
        <div class="errors flex column">
          <div
            style="color: darkred"
            class="inter bold q-mb-md flex items-center"
          >
            <q-icon name="mdi-alert-circle-outline" class="q-mr-md" />

            <span :key="index" v-for="(error, index) of Object.values(errors)"
              >{{ error
              }}<span v-if="index !== Object.keys(errors).length - 1"
                >,&nbsp;
              </span></span
            >

            <span
              :key="index + 'w'"
              v-for="(error, index) of Object.values(warnings)"
              >WARN: {{ error
              }}<span v-if="index !== Object.keys(errors).length - 1"
                >,&nbsp;
              </span></span
            >
          </div>
          <div
            class="flex column items-baseline no-wrap q-mb-lg"
            v-if="existingEvents && existingEvents.length > 0"
            :style="eventExistsWarning ? 'color: darkred' : undefined"
          >
            <div class="flex row justify-between items-center">
              <div class="flex row items-center q-mr-md inter bold">
                <q-icon name="mdi-alert-circle-outline" class="q-mr-md" />
                {{ $t('add.an_event_already_exists') }}
              </div>
              <q-btn
                label="Don't care"
                @click.stop="eventExistsWarning = false"
              />
            </div>
            <div v-for="(event, index) of existingEvents" :key="index">
              <router-link
                :to="{
                  name: 'EventPage',
                  params: { id: event.id },
                }"
                >{{ event.name }}</router-link
              >
              -
              <a @click.stop="copyInfoFromExistingEvent(event)">[Copy info]</a>
            </div>
          </div>
        </div>
        <q-icon name="mdi-chevron-down" v-if="!expanded"></q-icon>
        <q-icon name="mdi-chevron-down" v-else></q-icon>
      </div>
      <div @click.stop>
        <q-input
          dense
          class="grow"
          style="padding-bottom: 0px"
          outlined
          debounce="500"
          @update:model-value="findExistingEvent"
          v-model="event.name"
          :label="$t('add.name')"
          color="bg-grey-7"
        />
      </div>
      <div v-if="expanded" @click.stop>
        <q-input
          class="q-mt-md"
          dense
          :error="!!errors.summary"
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
        <q-input
          dense
          outlined
          maxlength="200"
          :input-style="{ 'min-height': '50px' }"
          color="bg-grey-7"
          v-model="event.description_attribute"
          :label="$t('description.attribute_msg')"
          style="padding-bottom: 0px"
        />
        <q-input
          class="q-mt-md"
          dense
          outlined
          autogrow
          counter
          maxlength="10000"
          :input-style="{ 'min-height': '50px' }"
          color="bg-grey-7"
          v-model="event.full_description"
          :label="$t('description.detailed_description')"
          style="padding-bottom: 0px"
        />
        <q-input
          dense
          outlined
          maxlength="200"
          :input-style="{ 'min-height': '50px' }"
          color="bg-grey-7"
          v-model="event.full_description_attribute"
          :label="$t('description.attribute_msg')"
          style="padding-bottom: 0px"
        />

        <q-input
          class="q-my-md"
          outlined
          :error="!!errors.url"
          dense
          color="bg-grey-7"
          v-model="event.url"
          :label="$t('add.url')"
          style="padding-bottom: 0px"
        />

        <q-input
          class="q-mb-md"
          outlined
          dense
          color="bg-grey-7"
          v-model="event.youtube_url"
          label="Youtube URL"
          style="padding-bottom: 0px"
        />

        <div class="flex row items-center">
          <GoogleLocationComponent
            v-if="locationString"
            :preSearch="locationString"
            @location="event.location = $event"
            :error-message="errors.location"
          />
          <div class="q-ml-md t3">{{ locationString }}</div>
        </div>

        <SelectTagsComponent
          class="q-mt-md"
          @valueUpdated="($event) => (event.tags = $event)"
          :existing-tags="event.tags"
        />

        <q-input
          class="q-mb-md"
          outlined
          dense
          color="bg-grey-7"
          v-model="event.next_event_date_size"
          label="Size"
          style="padding-bottom: 0px"
        />

        <div class="q-mt-md">Dates:</div>
        <div class="flex column" @click="showDatePicker = !showDatePicker">
          Start: {{ result.dates?.start }} <br />
          End: {{ result.dates?.end }}
          <DateTimePicker
            v-if="result.dates"
            :inlineCalendar="true"
            :isRange="true"
            :value="result.dates"
            @dateRange="event.date_time = $event"
          />
          <DateTimePicker
            v-else
            :inlineCalendar="true"
            :isRange="true"
            @dateRange="event.date_time = $event"
          />
        </div>

        <div
          v-if="event.date_time && event.date_time.start && event.date_time.end"
        >
          <p />
          <RrulePicker
            v-on:updateRrule="event.rrule = $event"
            :dateTime="event.date_time"
            :disableOneOff="false"
          />
        </div>

        <div v-for="(link, index) of result.externalLinks" :key="index">
          Link: <a :href="link.url" class="t2">{{ link }}</a>
        </div>

        <div class="flex column grow q-ml-lg">
          <div
            :key="artist.name"
            v-for="(artist, index) of event.next_event_date_artists"
          >
            <q-item>
              <q-item-section>
                <q-item-label>{{ artist.name }}</q-item-label>
                <q-item-label caption>{{ artist.mbid }}</q-item-label>
              </q-item-section>

              <q-item-section v-if="editArtist === index">
                <div class="flex row items-stretch no-wrap">
                  <SelectArtistsInput
                    @selectedArtist="replaceArtist(index, $event)"
                    :prefill="artist.name"
                  />
                  <q-btn @click="editArtist = null"
                    ><q-icon name="mdi-close"></q-icon
                  ></q-btn>
                </div>
              </q-item-section>
              <q-item-section v-else>
                <div class="flex row items-stretch no-wrap">
                  <q-btn @click="deleteArtist(index)"
                    ><q-icon name="mdi-delete"></q-icon
                  ></q-btn>
                  <q-btn @click="editArtist = index"
                    ><q-icon name="mdi-pencil"></q-icon
                  ></q-btn>
                </div>
              </q-item-section>
            </q-item>
          </div>
        </div>

        <div class="flex row q-gutter-sm">
          {{ selectedImageIndex }}
          <div
            v-for="(image, index) in sortedImages"
            :key="index"
            class="flex column"
          >
            <img
              :style="
                selectedImageIndex === index ? 'border: 3px solid blue' : ''
              "
              @click="selectImage(index)"
              :src="image.url"
              class="image"
            />
            {{ image.ratio }}, {{ image.width }} x {{ image.height }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getEventsRequest, getMusicBrainzPlace } from 'src/api';
import GoogleLocationComponent from 'components/GoogleLocationComponent.vue';
import SelectTagsComponent from 'components/EventPage/Tags/SelectTagsComponent.vue';
import DateTimePicker from 'components/DateTimePicker.vue';
import SelectArtistsInput from 'components/EventPage/EventDates/Artists/SelectArtistsInput.vue';
import RrulePicker from 'components/RrulePicker.vue';
export default {
  components: {
    GoogleLocationComponent,
    SelectTagsComponent,
    DateTimePicker,
    SelectArtistsInput,
    RrulePicker,
  },
  props: {
    result: {
      default: null,
    },
    universalTags: {
      default: null,
    },
  },
  data() {
    return {
      expanded: false,
      hasBeenExpanded: false,
      editArtist: null,
      showDatePicker: false,
      existingEvents: [],
      selectedImageIndex: null,
      sortedImages: null,
      eventExistsWarning: false,
      locationString: this.result.locationString,
      event: {
        host: false,
        name: this.result.name,
        description: this.result.description?.substring(0, 300),
        description_attribute:
          this.result.description_attribute ||
          this.result.description?.length > 0
            ? this.result.url
            : undefined,
        full_description:
          this.result.full_description ||
          this.result.description?.substring(0, 10000) ||
          '',
        full_description_attribute:
          this.result.full_description_attribute ||
          this.result.description?.length > 0
            ? this.result.url
            : '',
        media_items: [],
        date_time: null,
        location: null,
        url: this.result.url || '',
        ticket_url: this.result.ticket_url || '',
        youtube_url: this.result.youtube_url || '',
        tags: this.result.tags || [],
        next_event_date_artists: this.result.artists || [],
        next_event_date_size: null,
        rrule: this.result.rrule || {
          recurringType: 1,
          separationCount: 0,
          weekOfMonth: null,
          dayOfMonth: null,
          dayOfWeek: null,
          monthOfYear: null,
        },
      },
    };
  },
  methods: {
    copyInfoFromExistingEvent(event) {
      this.event.description = event.description;
      this.event.description_attribute = event.description_attribute;
      this.event.full_description = event.full_description;
      this.event.full_description_attribute = event.full_description_attribute;
      this.event.url = event.next_date.url;
      this.event.youtube_url = event.youtube_url;
    },
    deleteArtist(index) {
      this.event.next_event_date_artists.splice(index, 1);
      this.editArtist = null;
    },
    replaceArtist(index, artist) {
      this.event.next_event_date_artists[index] = artist;
      this.editArtist = null;
    },
    async selectImage(index) {
      this.selectedImageIndex = index;
      try {
        const mediaItem = await this.imageUrlToBase64(
          this.sortedImages[index].url
        );

        this.event.media_items = [mediaItem];
      } catch (e) {
        this.selectedImageIndex = null;
      }
    },
    async imageUrlToBase64(url) {
      return fetch(url)
        .then((response) => response.blob())
        .then(
          (blob) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () =>
                resolve({
                  base64File: reader.result,
                  fileName: reader.fileName,
                  mimeType: reader.mimeType,
                  caption: null,
                });
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            })
        );
    },
    findExistingEvent() {
      getEventsRequest({
        query: this.event.name.replace(/[^a-z0-9]/gi, ' '),
        per_page: 1,
      }).then((response) => {
        this.existingEvents = response.data.items;
        if (response.data.items.length > 0) {
          this.eventExistsWarning = true;
        } else {
          this.eventExistsWarning = false;
        }
      });
    },
  },
  watch: {
    universalTags: {
      handler: function (newv, oldv) {
        this.event.tags = [...new Set([...this.event.tags, ...newv])];
      },
      deep: true,
    },
    errors: {
      handler: function (newv, oldv) {
        if (Object.keys(newv).length === 0) {
          this.$emit('errorStateChanged', false);
          this.$emit('eventData', this.event);
        } else {
          this.$emit('errorStateChanged', true);
        }
      },
      deep: true,
    },
    async expanded(newv, oldv) {
      if (newv && !this.hasBeenExpanded) {
        this.hasBeenExpanded = true;
        // sort images by size (largest first) and select largest
        /*
        if (this.result.images) {
          this.sortedImages = this.result.images;
          this.sortedImages.sort(function (a, b) {
            return b.width - a.width;
          });
          this.selectImage(0);
        }
*/
        // already exists?
        this.findExistingEvent();

        // tags
        this.event.tags = [
          ...new Set([...this.event.tags, ...this.universalTags]),
        ];

        // location lookup for musicbrainz results
        if (this.result.locationMbid) {
          const response = await getMusicBrainzPlace(
            `pid:${this.result.locationMbid}`
          );
          this.locationString =
            response.data.places?.[0]?.name +
            ' ' +
            response.data.places?.[0]?.address;
        }
      }
    },
  },
  computed: {
    warnings() {
      let warnings = {};

      if (this.event.media_items.length === 0) {
        warnings.media = 'Media missing';
      }
      return warnings;
    },
    errors() {
      let errors = {};
      if (!this.computedDateValue && !this.event.date_time) {
        errors.dateTime = 'Date missing';
      }
      if (!this.event.location) {
        errors.location = 'Location missing';
      }

      if (!this.event.url || this.event.url.length === 0) {
        errors.url = 'URL missing';
      }
      if (!this.event.description || this.event.description?.length === 0) {
        errors.summary = 'Summary missing';
      }
      if (this.eventExistsWarning) {
        errors.eventExistsWarning = 'Similar event exists';
      }
      return errors;
    },
  },
};
</script>

<style lang="scss" scoped>
.image {
  max-height: 40px;
}
.body--dark {
  .ticketmaster-result {
    background: $bi-3;
    border: 1px solid $bi-3;
  }
}

.body--light {
  .ticketmaster-result {
    background: $b-2;
    border: 1px solid $bi-1;
  }
}

.ticketmaster-result {
  border-radius: 9px;
  &.error {
    border-color: red;
  }
}

.scraper-header {
}

@media only screen and (max-width: 599px) {
}
</style>
