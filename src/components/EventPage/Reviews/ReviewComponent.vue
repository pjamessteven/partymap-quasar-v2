<template>
  <div class="review flex column q-mt-md">
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
    <q-scroll-area
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
    </q-scroll-area>
    <GalleryDialog
      v-if="review.media_items?.length > 0"
      :open="currentMediaItemIndex != null"
      :items="review.media_items"
      :showThumbnails="true"
      :currentItemIndex="currentMediaItemIndex"
      @onClose="currentMediaItemIndex = null"
    />
  </div>
</template>

<script>
import common from 'src/assets/common';
import GalleryDialog from 'components/EventPage/Gallery/GalleryDialog.vue';

export default {
  components: {
    //InnerLoading
    GalleryDialog,
  },
  props: {
    review: { type: Object },
  },
  data() {
    return {
      currentMediaItemIndex: null,
      loading: false,
    };
  },
  watch: {},
  computed: {},
  methods: {},
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
