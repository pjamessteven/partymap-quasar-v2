<template>
  <div class="review flex column q-mt-md">
    <div class="flex row t3 items-center justify-between">
      <span>
        <RouterLink
          class="link-hover"
          :to="{
            name: 'UserPage',
            params: { username: review.creator.username },
          }"
          >{{ review.creator.username }}</RouterLink
        >&nbsp;({{ timeAgo(review.created_at) }})
      </span>
      <q-btn flat icon="mdi-dots-vertical" class="q-px-sm t4" size="sm">
        <q-tooltip
          :content-class="
            $q.dark.isActive ? 'bg-black text-white' : 'bg-white text-black'
          "
          :offset="[10, 10]"
          content-style="font-size: 16px"
        >
          {{ $t('sidebar.more') }}
        </q-tooltip>
        <q-menu
          transition-show="jump-down"
          transition-hide="jump-up"
          anchor="bottom right"
          self="top right"
        >
          <!-- SHOW REPORT if not creator -->
          <q-item
            v-if="review.creator_id !== currentUser.id"
            v-close-popup
            v-ripple
            v-on:click="showingReportDialog = true"
            clickable
          >
            <q-item-section avatar>
              <q-icon name="mdi-alert-circle-outline" />
            </q-item-section>
            <q-item-section>
              <q-item-label> {{ $t('reviews.report') }} </q-item-label>
            </q-item-section>
          </q-item>
          <!-- SHOW delete if admin or creator -->
          <q-item
            v-if="review.creator_id == currentUser.id || currentUser.role > 20"
            v-close-popup
            v-ripple
            v-on:click="handleDeleteReview"
            clickable
          >
            <q-item-section avatar>
              <q-icon name="mdi-delete" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('reviews.delete') }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-menu>
      </q-btn>
    </div>
    <q-rating
      v-if="review.rating !== 0"
      :model-value="review.rating"
      size="1rem"
      :max="5"
      readonly
      color="primary"
      class="q-my-sm"
    />
    <div>
      <span v-if="showOriginal"> {{ review.text }} </span
      ><span v-else>
        {{ review.text_t || review.text }}
      </span>
      <span v-if="isTranslation">
        <p />

        <span class="o-040" v-if="!showOriginal">
          - {{ $t('translate.translated') }}&nbsp;</span
        >
        <span class="o-040 link-hover" @click="showOriginal = !showOriginal"
          >[<span v-if="!showOriginal">{{ $t('translate.show_original') }}</span
          ><span v-else>{{ $t('translate.show_translation') }}</span
          >]</span
        >
      </span>
    </div>
    <CustomQScroll
      horizontal
      class="media-scroll-area q-mt-md"
      style="width: 100%; height: 148px"
      v-if="review.media_items?.length > 0"
    >
      <div class="flex row grow no-wrap items-start">
        <div
          v-for="(item, index) in review.media_items"
          class="item-wrapper"
          :key="index"
        >
          <div
            class="item-wrapper-inner"
            ref="itemWrapperInner"
            @click="currentMediaItemIndex = index"
          >
            <video
              v-if="item.v_low_url && item.v_low_url.length > 0"
              class="video"
              loop
              muted
              :poster="item.poster_url"
            >
              <source
                :src="item.v_low_url"
                type="video/webm"
                class="image-thumb"
              />
            </video>
            <img :src="item.thumb_xs_url" v-else />
          </div>
        </div>
      </div>
    </CustomQScroll>
    <GalleryDialog
      v-if="review.media_items?.length > 0"
      :open="currentMediaItemIndex != null"
      :items="review.media_items"
      :showThumbnails="true"
      :currentItemIndex="currentMediaItemIndex"
      @onClose="currentMediaItemIndex = null"
    />
    <q-dialog v-model="showingReportDialog">
      <ReportDialog
        :reviewId="review.id"
        :mode="'reportReview'"
        @closeDialog="showingReportDialog = false"
      />
    </q-dialog>
  </div>
</template>

<script>
import { useAuthStore } from 'src/stores/auth';
import { mapState, mapWritableState, mapActions } from 'pinia';
import CustomQScroll from 'components/CustomQScroll.vue';

import common from 'src/assets/common';
import GalleryDialog from 'components/EventPage/Gallery/GalleryDialog.vue';
import ReportDialog from 'components/EventPage/ReportDialog.vue';
import { deleteReviewRequest } from 'src/api';
import { useEventStore } from 'src/stores/event';

export default {
  components: {
    ReportDialog,
    GalleryDialog,
    CustomQScroll,
  },
  props: {
    review: { type: Object },
  },
  data() {
    return {
      currentMediaItemIndex: null,
      loading: false,
      showingReportDialog: false,
      showOriginal: false,
    };
  },
  watch: {},
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
    ...mapWritableState(useEventStore, ['event']),
    currentUserIsCreator() {
      return this.currentUser.username === this.review.creator.username;
    },
    isTranslation() {
      return this.review?.text_t && this.review.text !== this.review?.text_t;
    },
  },
  methods: {
    ...mapActions(useEventStore, ['reloadEvent']),
    handleDeleteReview() {
      this.$q
        .dialog({
          title: 'Delete review',
          message: 'Are you sure? ',
          color: 'primary',
          cancel: true,
        })
        .onOk(async () => {
          const progressDialog = this.$q.dialog({
            title: 'Deleting...',
            color: 'primary',
            progress: true, // we enable default settings
            cancel: false,
            persistent: true, // we want the user to not be able to close it
            ok: false,
          });
          try {
            await deleteReviewRequest(this.review.id);
            this.reloadEvent();
          } catch {}

          progressDialog.hide();
        });
    },
  },
  created() {
    this.timeAgo = common.timeAgo;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  :not(:last-child).review {
    //border-left: 1px solid rgba(255, 255, 255, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    padding-bottom: 16px;
  }
}
.body--light {
  :not(:last-child).review {
    //border-left: 1px solid rgba(255, 255, 255, 0.3);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    padding-bottom: 16px;
  }
}

:not(:last-child).review {
  //border-left: 1px solid rgba(255, 255, 255, 0.3);
  padding-bottom: 16px;
}

.item-wrapper {
  position: relative;
  margin-right: 16px;
  height: 128px;
  width: 128px;
  overflow: visible;
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;

  .item-wrapper-inner {
    max-height: 100%;
    height: 100%;
    width: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-content: center;
    align-items: center;
    background: white;

    img,
    video {
      cursor: pointer;
      max-height: 100%;
      max-width: 100%;
      height: 100%;
      width: 100%;
      object-fit: cover;
      display: block;
      opacity: 1;
      transition: opacity 0.3s;
      &:hover {
        opacity: 0.8;
      }
    }
  }
}

:deep(.q-field--filled .q-field__control) {
  //border-radius: 100px !important;
}
</style>
