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
        {{ $t('event.upload_new_logo') }}
      </q-btn>
    </div>
    <GalleryDialog
      v-if="!!otherImages"
      :open="galleryIndex !== null"
      :items="otherImages"
      :showThumbnails="true"
      :currentItemIndex="galleryIndex"
      @onClose="galleryIndex = null"
    />

    <div class="item-wrapper flex column no-wrap">
      <div
        class="item-wrapper-inner justify-start flex"
        ref="itemWrapperInner"
        @click="galleryIndex = 0"
      >
        <div
          class="no-media t4 flex items-center justify-center"
          v-if="!logo && event"
        >
          <div>No logo image... add one?</div>
        </div>
        <!--
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
-->
        <transition appear enter-active-class="animated fadeIn slower">
          <img
            v-if="(!loaded && thumbXsUrl) || true"
            :src="
              thumbXsUrl ||
              logo?.thumb_xxs_url ||
              logo?.thumb_xs_url ||
              logo?.thumb_url
            "
          />
        </transition>
        <transition appear enter-active-class="animated fadeIn slower">
          <img
            style="position: absolute"
            v-show="loaded"
            :src="logo?.image_med_url || logo?.image_url"
            @load="
              () => {
                loaded = true;
                $emit('loaded');
              }
            "
          />
        </transition>
      </div>

      <!--
      <div
        class="flex row no-wrap justify-start grow q-pt-sm"
        style="width: 100%"
      >
        <div
          :class="index > 0 ? 'q-pl-sm' : ''"
          v-for="(media_item, index) of otherImages.slice(1, 4)"
          :key="index"
        >
          <img
            @click="galleryIndex = index + 1"
            style="cursor: pointer; width: 100%; max-height: 150px"
            :src="media_item.image_med_url"
          />
        </div>
      </div>
      -->
    </div>
    <q-dialog v-model="showEditDialog" v-if="currentUserCanEdit">
      <EditGalleryComponent @closeDialog="showEditDialog = false" />
    </q-dialog>
    <q-dialog
      v-else
      :model-value="showEditDialog"
      @hide="showEditDialog = null"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <UploadNewLogoDialog @closeDialog="() => (showEditDialog = false)" />
    </q-dialog>
  </div>
</template>

<script>
import EditGalleryComponent from 'components/EventPage/Gallery/EditGalleryComponent.vue';
import UploadNewLogoDialog from 'components/EventPage/Gallery/UploadNewLogoDialog.vue';

import GalleryDialog from './GalleryDialog.vue';
import { mapState, mapWritableState } from 'pinia';
import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';

export default {
  components: {
    EditGalleryComponent,
    GalleryDialog,
    UploadNewLogoDialog,
  },
  props: {
    item: Object,
    editing: Boolean,
    thumbXsUrl: String,
  },
  data() {
    return {
      galleryIndex: null,
      loaded: false,
      showFullscreen: false,
      showEditDialog: false,
    };
  },
  methods: {},
  watch: {},
  computed: {
    ...mapState(useEventStore, ['event', 'currentUserCanEdit']),
    ...mapState(useAuthStore, ['currentUser']),
    ...mapWritableState(useEventStore, ['backgroundMediaIndex']),
    logo() {
      const logo = this.event?.media_items?.find((x) => x?.attributes?.isLogo);
      return logo || this.event?.media_items?.[0];
    },
    otherImages() {
      const nextEventDateLineupImages =
        this.event?.next_date?.media_items.filter(
          (x) => x.attributes?.isLineupImage
        );
      const otherImages = this.event?.media_items?.filter(
        (x) => !x?.attributes?.isLineupImage
      );
      if (otherImages?.length > 0 && nextEventDateLineupImages?.length > 0) {
        return [
          ...otherImages?.slice(0, 1), // logo
          ...nextEventDateLineupImages, // next lineup images
          ...otherImages?.slice(1), // other images
        ];
      } else if (otherImages?.length > 0) {
        return otherImages;
      } else if (nextEventDateLineupImages?.length > 0) {
        return nextEventDateLineupImages;
      } else return [];
    },
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
      overflow: hidden;
      filter: drop-shadow(1px 2px 78px rgba(0, 0, 0, 0.48));
      // border-radius: 18px !important;

      .no-media {
        background: grey;
        width: 100%;
        height: 100%;
        flex-grow: 1;
      }
      img,
      video {
        cursor: pointer;
        border-radius: 0px !important;
        height: auto;
        max-width: 100%;
        width: 100%;
        max-height: 500px;

        object-fit: contain;
        display: block;
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

@media only screen and (max-width: 600px) {
  .featured-media-component {
    height: unset;
    width: 100%;
    min-height: unset;
    .item-wrapper {
      .item-wrapper-inner {
        justify-content: flex-start;
        align-content: flex-start;
        border-radius: 18px;

        img,
        video {
          border-radius: 18px;

          width: 100%;
          filter: none;
        }
      }
    }
  }
}
</style>
