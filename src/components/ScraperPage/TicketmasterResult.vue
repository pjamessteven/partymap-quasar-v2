<template>
  <div class="google-event-result q-pa-md flex row">
    <div class="flex column">
      <div class="errors flex column">
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
      <q-input
        class="q-mt-md"
        dense
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
        dense
        color="bg-grey-7"
        v-model="event.url"
        :label="$t('add.url')"
        style="padding-bottom: 0px"
      />

      {{ computedLocationString }}
      <GoogleLocationComponent
        v-if="computedLocationString.length > 0"
        :preSearch="computedLocationString"
      />

      <SelectTagsComponent
        class="q-mt-md"
        @valueUpdated="($event) => (event.tags = $event)"
        :existing-tags="event.tags"
      />

      <div class="t2">Dates: {{ result.dates }}</div>

      <div class="t2" v-if="false">
        Attractions:

        {{ result._embedded.attractions }}
      </div>

      <div v-for="(link, index) of result.externalLinks" :key="index">
        Link: <a :href="link.url" class="t2">{{ link }}</a>
      </div>
      <div class="flex row q-gutter-sm">
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
</template>

<script>
import { getEventsRequest, addEventRequest } from 'src/api';
import GoogleLocationComponent from 'components/GoogleLocationComponent.vue';
import SelectTagsComponent from 'components/EventPage/Tags/SelectTagsComponent.vue';

export default {
  components: { GoogleLocationComponent, SelectTagsComponent },
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
      existingEvents: [],
      selectedImageIndex: null,
      sortedImages: null,
      event: {
        host: false,
        name: this.result.name,
        description: this.result.description?.substring(0, 300),
        description_attribute: this.result.url,
        full_description: this.result.description?.substring(0, 10000),
        full_description_attribute: this.result.url,
        media_items: [],
        url: '',
        ticket_url: this.result.url,
        tags: [],
      },
    };
  },
  methods: {
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
      const data = await fetch(url);
      const blob = await data.blob();
      return new Promise((resolve, reject) => {
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          resolve({
            base64File: reader.result,
            fileName: reader.fileName,
            mimeType: reader.mimeType,
            caption: null,
          });
        };
        reader.onerror = reject;
      });
    },
    findExistingEvent() {
      getEventsRequest({ query: this.event.name, per_page: 1 }).then(
        (response) => {
          this.existingEvents = response.data.items;
        }
      );
    },
  },
  watch: {
    universalTags: {
      handler: function (newv, oldv) {
        this.event.tags = [...new Set([...this.event.tags, ...newv])];
      },
      deep: true,
    },
  },
  computed: {
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
  },
  mounted() {
    // sort images by size (largest first) and select largest
    if (this.result.images) {
      this.sortedImages = this.result.images;
      this.sortedImages.sort(function (a, b) {
        return b.width - a.width;
      });
      this.selectImage(0);
    }
    // already exists?
  },
};
</script>

<style lang="scss" scoped>
.image {
  max-height: 40px;
}
.body--dark {
  .google-event-result {
    border: 1px solid $bi-3;
  }
}

.body--light {
  .google-event-result {
    border: 1px solid $bi-1;
  }
}
.google-event-result {
  &:hover {
    opacity: 0.9;
  }
}
@media only screen and (max-width: 600px) {
}
</style>
