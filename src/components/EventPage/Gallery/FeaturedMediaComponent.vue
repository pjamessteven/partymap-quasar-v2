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
      <div class="item-wrapper-inner" ref="itemWrapperInner">
        <div class="hover-overlay" @click="showFullscreen = true"></div>
        <video
          v-if="item.v_low_url && item.v_low_url.length > 0"
          class="video"
          autoplay
          loop
          muted
          :poster="item.poster_url + noCache"
        >
          <source
            :src="item.v_low_url + noCache"
            type="video/webm"
            class="image-thumb"
          />
        </video>
        <img :src="item.thumb_xs_url" v-if="!loaded" />
        <img v-show="loaded" :src="item.thumb_url" @load="loaded = true" />
      </div>
    </div>
    <q-dialog v-model="showEditDialog">
      <EditGalleryComponent />
    </q-dialog>
  </div>
</template>

<script>
import EditGalleryComponent from 'components/EventPage/Gallery/EditGalleryComponent.vue';

import GalleryDialog from './GalleryDialog.vue';
import { mapState, mapWritableState } from 'pinia';
import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';

export default {
  components: {
    EditGalleryComponent,
    GalleryDialog,
  },
  props: {
    item: Object,
    editing: Boolean,
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
    ...mapState(useEventStore, ['event']),
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
      max-height: 100%;
      height: 100%;
      width: 100%;
      position: relative;
      display: flex;
      justify-content: center;
      align-content: center;
      align-items: center;

      img,
      video {
        cursor: pointer;

        max-height: 100%;
        max-width: 100%;
        height: 100%;
        width: 100%;
        object-fit: contain;
        display: block;
        filter: drop-shadow(1px 2px 78px rgba(0, 0, 0, 0.48));
      }

      .hover-overlay {
        z-index: 1;
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        opacity: 0;
        /*
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.2),
            rgba(0, 0, 0, 0.8)
          );
          transition: opacity 0.3s;
          */
        &:hover {
          opacity: 1;
        }
        .las {
          font-size: 3rem;
          color: white;
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

    .item-wrapper {
      position: relative;
      width: 100%;
      max-height: 100%;
      max-width: 100%;
      overflow: visible;
      display: flex;
      justify-content: flex-start;
      align-content: center;
      align-items: start;
      .item-wrapper-inner {
        justify-content: flex-start;
        img {
          width: unset;
        }
      }
    }
  }
}
</style>
