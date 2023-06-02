<template>
  <div class="flex column">
    <div class="inter bolder text-large t2 q-pr-md q-mb event-page-header">
      Reviews:
    </div>
    <div class="new-review flex column q-mt-lg grow">
      <div class="flex row items-end">
        <q-input
          label="Share your experience!"
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
        v-show="review.media_items.length > 0"
        class="media-select q-mt-lg"
        ref="mediaSelector"
        :showUploadButton="false"
        :showSelectButton="false"
        @filesSelected="review.media_items = $event"
      />
      <div class="t4 q-mt-md" v-show="review.media_items.length > 0">
        Please make sure that you have the consent of all people in your photos
        before uploading.
      </div>
      <div class="flex column" v-if="currentUser && review.text.length > 0">
        <div class="flex column items-start">
          <div class="t2 q-mt-md" v-if="!review.rating">Select a rating</div>
          <q-btn
            class="q-mt-md"
            color="primary"
            :disabled="!review.rating"
            @click="handleSubmitReview"
            >Submit review</q-btn
          >
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
        >Login to post reviews</q-btn
      >
      <transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <InnerLoading v-if="loading" class="loading" />
      </transition>
    </div>
    <div
      class="no-reviews t4 inter bold text-large q-mt-lg"
      v-if="event?.event_contributions?.length === 0"
    >
      No reviews yet - be the first!
    </div>
    <div v-else class="q-mt-sm">
      <div
        v-for="(review, index) in event.event_contributions"
        :key="index"
        class="flex column q-mt-lg"
      >
        <div class="flex row t3 items-center">
          <RouterLink
            class="link-hover"
            :to="{ name: 'UserPage', params: { id: review.creator.username } }"
            >{{ review.creator.username }}</RouterLink
          >&nbsp;({{ timeAgo(review.created_at) }})
        </div>
        <q-rating
          :model-value="review.rating"
          size="1rem"
          :max="5"
          readonly
          color="primary"
          class="q-my-sm"
        />
        <div>
          {{ review.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MultipleMediaSelector from 'components/MultipleMediaSelector.vue';
import InnerLoading from 'src/components/InnerLoading.vue';

import { mapState, mapActions } from 'pinia';
import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';
import common from 'src/assets/common';

export default {
  components: { MultipleMediaSelector, InnerLoading },
  props: {
    showing: { type: Boolean, default: false },
  },
  data() {
    return {
      dialog: null,
      review: { media_items: [], text: '', rating: undefined },
      loading: false,
    };
  },
  watch: {},
  computed: {
    ...mapState(useAuthStore, ['currentUser', 'currentUserIsStaff']),
    ...mapState(useEventStore, ['event', 'selectedEventDate']),
  },
  methods: {
    ...mapActions(useEventStore, ['addReview']),
    async handleSubmitReview() {
      this.loading = true;
      await this.addReview(this.review);
      this.loading = false;
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
    background: $bi-2;
    border: 1px solid (rgba(255, 255, 255, 0.05));
  }
}
.body--light {
  .new-review {
    background: $b-2;
    border: 1px solid (rgba(0, 0, 0, 0.05));
  }
}

.new-review {
  position: relative;
  border-radius: 4px;
  padding: 16px;
  height: auto;
  padding-top: 4px;
  overflow: none;
  transition: height 0.3s ease;
}
.media-select {
  margin-left: -16px;
}
:deep(.q-field--filled .q-field__control) {
  //border-radius: 100px !important;
}
</style>
