<template>
  <div class="flex column">
    <div class="metropolis bolder text-h6 t2 q-pr-md q-mb event-page-header">
      {{ $t('reviews.reviews_and_experiences') }}
    </div>
    <div
      class="no-reviews t4 inter q-mb-sm"
      v-if="event?.event_reviews?.length === 0"
    >
      {{ $t('reviews.no_reviews') }}
    </div>

    <div class="new-review q-mt-md q-pl-md q-pb-md">
      <div class="flex column grow">
        <div class="flex row items-end">
          <q-input
            :label="$t('reviews.share_your_experience')"
            rounded
            autogrow
            class="grow"
            v-model="review.text"
          ></q-input>

          <q-btn
            class="q-my-sm q-ml-md"
            flat
            icon="mdi-camera-plus-outline"
            @click="$refs.mediaSelector.openSelectDialog()"
          />
        </div>

        <q-rating
          v-model="review.rating"
          size="2em"
          :max="5"
          color="primary"
          class="q-mt-md"
        />
        <MultipleMediaSelector
          v-show="review.media_items?.length > 0"
          class="media-select q-mt-lg"
          ref="mediaSelector"
          :showUploadButton="false"
          :showSelectButton="false"
          @filesSelected="review.media_items = $event"
        />
        <div class="t2 q-mt-md" v-show="review.media_items.length > 0">
          {{ $t('reviews.consent_msg') }}
        </div>
        <div class="flex column" v-if="currentUser && review.text.length > 0">
          <div class="flex column items-start">
            <div class="t2 q-mt-sm" v-if="review.rating === 0">
              {{ $t('reviews.select_rating') }}
            </div>
            <div
              class="flex row justify-between items-end grow no-wrap"
              style="width: 100%"
            >
              <q-select
                class="q-mt-md q-mr-md"
                option-label="label"
                style="max-width: 100%"
                outlined
                use-input
                menu-anchor="top left"
                menu-self="bottom left"
                v-model="selectedDate"
                emit-value
                map-options
                :options="pastEventDates"
                label="Select Event Date"
              >
                <template v-slot:append>
                  <q-icon name="mdi-calendar-outline" class="q-pa-md" />
                </template>
              </q-select>
              <q-btn
                class="q-mt-md"
                color="primary"
                :disabled="review.rating === 0 || loading"
                @click="handleSubmitReview"
              >
                {{ $t('reviews.submit') }}
              </q-btn>
            </div>
          </div>
        </div>
        <q-btn
          class="q-mt-md"
          v-if="!currentUser && review.text.length > 0"
          color="primary"
          @click="
            $router.push({
              path: '/login',
              query: { from: $route.path },
            })
          "
        >
          {{ $t('reviews.login_msg') }}
        </q-btn>
        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
        >
          <InnerLoading v-if="loading" class="loading" />
        </transition>
      </div>

      <InnerLoading v-if="loading" />
    </div>

    <div v-if="event?.event_reviews?.length > 0" class="q-mt-md">
      <ReviewComponent
        v-for="(review, index) in event.event_reviews"
        :key="index"
        :review="review"
      />
    </div>
  </div>
</template>

<script>
import MultipleMediaSelector from 'components/MultipleMediaSelector.vue';
import InnerLoading from 'src/components/InnerLoading.vue';
import ReviewComponent from './ReviewComponent.vue';
import { mapState, mapActions } from 'pinia';
import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';
import common from 'src/assets/common';
import * as dayjs from 'dayjs';

export default {
  components: { MultipleMediaSelector, InnerLoading, ReviewComponent },
  props: {
    showing: { type: Boolean, default: false },
  },
  data() {
    return {
      selectedDate: null,

      dialog: null,
      review: { media_items: [], text: '', rating: 0, event_date_id: null },
      loading: false,
      tab: 'review',
    };
  },
  watch: {},
  computed: {
    ...mapState(useAuthStore, ['currentUser', 'currentUserIsStaff']),
    ...mapState(useEventStore, ['event', 'selectedEventDate']),
    pastEventDates() {
      if (this.event.event_dates) {
        return [
          { id: null, label: 'Date not listed' },
          ...this.event?.event_dates
            .filter((x) => dayjs(x.start_naive) < dayjs())
            .map((x) => ({ id: x.id, label: this.getEdLabel(x) })),
        ];
      } else return [];
    },
  },
  methods: {
    getEdLabel(ed) {
      if (this.event.rrule?.recurring_type === 1) {
        // weekly recurring event, return full date
        this.localDay(ed.start_naive, ed.tz) +
          ' ' +
          this.localDate(ed.start_naive, ed.tz);
      } else if (this.event.rrule?.recurring_type === 2) {
        // monthly
        // return month year
        return this.event.name + ' ' + dayjs(ed.start_naive).format('MM YYYY');
      } else if (this.event.rrule?.recurring_type === 3) {
        // yearly
        // return year
        return this.event.name + ' ' + dayjs(ed.start_naive).format('YYYY');
      }
    },
    ...mapActions(useEventStore, ['addReview']),
    async handleSubmitReview() {
      this.loading = true;
      if (!this.review.rating) {
        this.review.rating = 0;
      }
      try {
        await this.addReview({
          ...this.review,
          event_date_id: this.selectedDate?.id || undefined,
        });
        this.review = {
          media_items: [],
          text: '',
          rating: 0,
          event_date_id: null,
        };
      } finally {
        this.loading = false;
      }
    },
  },
  created() {
    this.timeAgo = common.timeAgo;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .new-review {
    background: $bi-1;
    border: 1px solid (rgba(255, 255, 255, 0.1));
    .panel {
      background: $bi-1;
      //border: 1px solid (rgba(0, 0, 0, 0.1));
    }
  }
}
.body--light {
  .new-review {
    background: $b-1;
    border: 1px solid (rgba(0, 0, 0, 0.1));
    box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px 0px;

    .panel {
      background: $b-1;
      //border: 1px solid (rgba(0, 0, 0, 0.1));
    }
  }
}

.new-review {
  position: relative;
  height: auto;
  border-radius: 9px;
  overflow: hidden;
  transition: height 0.3s ease;
  .panel {
    padding-top: 8px !important;
    //  border-radius: 9px;
  }
}
.media-select {
  margin-left: -16px;
}
:deep(.q-field--filled .q-field__control) {
  //border-radius: 100px !important;
}
</style>
