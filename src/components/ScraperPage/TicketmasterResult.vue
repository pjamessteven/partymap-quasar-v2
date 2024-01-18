<template>
  <div
    class="ticketmaster-result q-pa-md flex row"
    :class="Object.keys(errors).length > 0 ? 'error' : ''"
  >
    <div class="flex column" @click="expanded = !expanded">
      <div class="flex row justify-between grow">
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
              <q-btn label="Don't care" @click="eventExistsWarning = false" />
            </div>
            <div v-for="(event, index) of existingEvents" :key="index">
              <router-link
                :to="{
                  name: 'EventPage',
                  params: { id: event.id },
                }"
                >{{ event.name }}</router-link
              >
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
          @input="findExistingEvent"
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
          maxlength="400"
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
          v-model="event.ticket_url"
          label="Ticket URL"
          style="padding-bottom: 0px"
        />

        <div class="flex row items-center">
          <GoogleLocationComponent
            v-if="computedLocationString"
            :preSearch="computedLocationString"
            @location="event.location = $event"
            :error-message="errors.location"
          />
          <div class="q-ml-md t3">{{ computedLocationString }}</div>
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
          Start: {{ event.date_time?.start }} <br />
          End: {{ event.date_time?.end }}
          <DateTimePicker
            v-if="computedDateValue"
            :inlineCalendar="true"
            :isRange="true"
            :value="computedDateValue"
            @dateRange="event.date_time = $event"
          />
          <DateTimePicker
            v-else
            :inlineCalendar="true"
            :isRange="true"
            @dateRange="event.date_time = $event"
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
import { getEventsRequest, addEventRequest } from 'src/api';
import GoogleLocationComponent from 'components/GoogleLocationComponent.vue';
import SelectTagsComponent from 'components/EventPage/Tags/SelectTagsComponent.vue';
import DateTimePicker from 'components/DateTimePicker.vue';
import SelectArtistsInput from 'components/EventPage/EventDates/Artists/SelectArtistsInput.vue';
export default {
  components: {
    GoogleLocationComponent,
    SelectTagsComponent,
    DateTimePicker,
    SelectArtistsInput,
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
      event: {
        host: false,
        name: this.result.name,
        description: this.result.description?.substring(0, 300),
        description_attribute:
          this.result.description?.length > 0 ? this.result.url : undefined,
        full_description: this.result.description?.substring(0, 10000) || '',
        full_description_attribute:
          this.result.description?.length > 0 ? this.result.url : '',
        media_items: [],
        date_time: null,
        location: null,
        url: '',
        ticket_url: this.result.url,
        tags: [],
        next_event_date_artists: [],
        next_event_date_size: null,
        rrule: {
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
    expanded(newv, oldv) {
      if (newv && !this.hasBeenExpanded) {
        this.hasBeenExpanded = true;
        // sort images by size (largest first) and select largest
        if (this.result.images) {
          this.sortedImages = this.result.images;
          this.sortedImages.sort(function (a, b) {
            return b.width - a.width;
          });
          this.selectImage(0);
        }

        if (this.result?._embedded?.attractions) {
          this.event.next_event_date_artists =
            this.result?._embedded?.attractions
              .filter((x) => x.name !== this.event.name)
              .map((x) => ({
                name: x.name,
                mbid: x.externalLinks?.musicbrainz?.[0]?.id,
              }));
        }
        // already exists?
        this.findExistingEvent();

        // tags
        this.event.tags = [
          ...new Set([...this.event.tags, ...this.universalTags]),
        ];
      }
    },
  },
  computed: {
    errors() {
      let errors = {};
      if (!this.computedDateValue && !this.event.date_time) {
        errors.dateTime = 'Date missing';
      }
      if (!this.event.location) {
        errors.location = 'Location missing';
      }
      if (this.event.media_items.length === 0) {
        errors.media = 'Media missing';
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
    computedLocationString() {
      let string = '';
      const venue = this.result._embedded?.venues?.[0];
      if (venue) {
        if (venue.name) {
          string += venue.name;
        }
        if (venue.address) {
          if (string.length > 0) {
            string += ', ';
          }
          string += venue.address.line1;
          if (venue.address.line2) {
            if (string.length > 0) {
              string += ', ';
            }
            string += venue.address.line2;
          }
        }
        if (venue.city?.name) {
          if (string.length > 0) {
            string += ', ';
          }
          string += venue.city.name;
        }
      }
      return string;
    },
    computedDateValue() {
      if (this.result.dates?.start?.localDate) {
        let start = this.result.dates.start.localDate;
        if (this.result.dates?.start?.localTime) {
          start += ' ' + this.result.dates?.start?.localTime;
        } else {
          // just set time to midday if time doesn't exist
          start += ' 12:00:00';
        }
        let end = start;
        if (this.result.dates?.end?.localDate) {
          end = this.result.dates.end.localDate;
          if (this.result.dates?.end?.localTime) {
            end += ' ' + this.result.dates?.end?.localTime;
          } else {
            // just set time to midday if time doesn't exist
            end += ' 12:00:00';
          }
        }
        return { start, end };
      }
      return null;
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
  &.error {
    border-color: red;
  }
}
@media only screen and (max-width: 600px) {
}
</style>
