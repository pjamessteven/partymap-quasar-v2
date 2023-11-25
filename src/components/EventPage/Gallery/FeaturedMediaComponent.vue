<template>
  <div class="featured-media-component flex grow">
    <div
      class="editing-overlay flex row justify-center items-center"
      v-if="editing"
    >
      <q-btn
        outline
        @click="showEditDialog = true"
        color="white"
        class="border-radius"
      >
        {{ $t('event.edit_media_gallery') }}
      </q-btn>
    </div>
    <GalleryDialog
      v-if="item"
      :open="showFullscreen"
      :items="[item]"
      :showThumbnails="false"
      :currentItemIndex="0"
      @onClose="showFullscreen = false"
    />

    <div class="item-wrapper">
      <div
        class="item-wrapper-inner"
        ref="itemWrapperInner"
        @click="showFullscreen = true"
      >
        <div
          class="no-media t4 flex items-center justify-center"
          v-if="!item && event"
        >
          <div>No poster image... add one?</div>
        </div>
        <video
          v-if="item?.v_low_url && item?.v_low_url.length > 0"
          class="video"
          autoplay
          loop
          muted
          :poster="item?.poster_url + noCache"
        >
          <source
            :src="item?.v_low_url + noCache"
            type="video/webm"
            class="image-thumb"
          />
        </video>
        <img
          style="width: 100%"
          :src="item?.thumb_xs_url"
          v-if="!loaded && item?.thumb_xs_url"
        />
        <img v-show="loaded" :src="item?.thumb_url" @load="loaded = true" />
      </div>
    </div>
    <q-dialog v-model="showEditDialog" v-if="currentUserCanEdit">
      <EditGalleryComponent />
    </q-dialog>
    <q-dialog
      v-else
      :model-value="showEditDialog"
      @hide="showEditDialog = null"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <SuggestNewCoverDialog @closeDialog="() => (showEditDialog = false)" />
    </q-dialog>
  </div>
</template>

<script>
import EditGalleryComponent from 'components/EventPage/Gallery/EditGalleryComponent.vue';
import SuggestNewCoverDialog from 'components/EventPage/Gallery/SuggestNewCoverDialog.vue';

import GalleryDialog from './GalleryDialog.vue';
import { mapState, mapWritableState } from 'pinia';
import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';

export default {
  components: {
    EditGalleryComponent,
    GalleryDialog,
    SuggestNewCoverDialog,
  },
  props: {
    item: Object,
    editing: Boolean,
    preview: String,
  },
  data() {
    return {
      loaded: false,
      showFullscreen: false,
      showEditDialog: false,
    };
  },
  methods: {},

  computed: {
    ...mapState(useEventStore, ['event', 'currentUserCanEdit']),
    ...mapState(useAuthStore, ['currentUser']),
    ...mapWritableState(useEventStore, ['backgroundMediaIndex']),
    noCache() {
      // disable cache if it's the event creator
      // because the server side conversion process make it seem like it fucked up
      // by caching the partially converted video file
      if (
        this.currentUser &&
        this.event?.creator?.username === this.currentUser.username
      ) {
        return '?' + Math.random();
      } else {
        return '';
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.featured-media-component {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 400px;

  .editing-overlay {
    pointer-events: all;
    position: absolute;
    height: 100%;
    width: 100%;
    background: radial-gradient(rgba(0, 0, 0, 1), transparent 80%);
    z-index: 4;
    :deep(.q-btn) {
      // background: black !important;
      .q-btn__wrapper::before {
        border-style: dashed;
      }
    }
  }

  .item-wrapper {
    position: relative;
    height: 100%;
    width: 100%;
    max-height: 100%;
    overflow: visible;
    display: flex;
    justify-content: center;
    align-content: center;
    align-items: center;

    .item-wrapper-inner {
      height: 100%;
      max-height: 100%;
      width: 100%;
      position: relative;
      display: flex;
      justify-content: center;
      align-content: center;
      align-items: center;
      cursor: pointer;
      // background: white;
      .no-media {
        background: grey;
        width: 100%;
        height: 100%;
        flex-grow: 1;
      }
      img,
      video {
        cursor: pointer;
        // border-radius: 18px !important;

        max-height: 100%;
        max-width: 100%;
        object-fit: contain;
        display: block;
        filter: drop-shadow(1px 2px 78px rgba(0, 0, 0, 0.48));
        transition: opacity 0.3s;
        opacity: 1;
        pointer-events: none;
        @supports (font: -apple-system-body) and (-webkit-appearance: none) {
          -webkit-backface-visibility: hidden;
          -webkit-transform: translate3d(0, 0, 0);
          // translate3d is a hack for safari to force gpu rendering of blur()
        }
        &:hover {
          opacity: 0.9;
        }
      }
    }
  }
}

@media only screen and (max-width: 1024px) {
  .featured-media-component {
    height: unset;
    max-width: calc(100vw - 48px);
    width: auto;
    min-height: unset;
    min-width: 600px;
    .item-wrapper {
      position: relative;
      max-height: 100%;
      max-width: 100%;
      overflow: visible;
      display: flex;
      justify-content: flex-start;
      align-content: center;
      align-items: start;
      .item-wrapper-inner {
        justify-content: flex-start;

        img,
        video {
          width: unset;
          filter: none;
          border-radius: 18px;
        }
      }
    }
  }
}

@media only screen and (max-width: 600px) {
  .featured-media-component {
    max-width: unset;
    min-height: unset;
    min-width: 100%;
    .item-wrapper {
      justify-content: flex-start;
      .item-wrapper-inner {
        //width: unset;
        max-height: unset;
        img,
        video {
          border-radius: 18px;
        }
      }
    }
  }
}
</style>
