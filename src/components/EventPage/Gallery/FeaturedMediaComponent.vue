<template>
  <div class="featured-media-component flex grow" :class="imageClass">
    <div
      class="flex row justify-center items-center"
      v-if="editing"
      :class="{ 'editing-overlay': !!loaded }"
      style="width: 200px"
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
            @load="loadThumb"
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
    <BackdropBlurDialog v-model="showEditDialog" v-if="currentUserCanEdit">
      <EditGalleryComponent @closeDialog="showEditDialog = false" />
    </BackdropBlurDialog>
    <BackdropBlurDialog
      v-else
      :model-value="showEditDialog"
      @hide="showEditDialog = null"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <UploadNewLogoDialog @closeDialog="() => (showEditDialog = false)" />
    </BackdropBlurDialog>
  </div>
</template>

<script>
import EditGalleryComponent from 'components/EventPage/Gallery/EditGalleryComponent.vue';
import UploadNewLogoDialog from 'components/EventPage/Gallery/UploadNewLogoDialog.vue';

import GalleryDialog from './GalleryDialog.vue';
import { mapState, mapWritableState } from 'pinia';
import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';
import BackdropBlurDialog from '../../BackdropBlurDialog.vue';

export default {
  components: {
    EditGalleryComponent,
    GalleryDialog,
    BackdropBlurDialog,
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
      imageClass: '',
    };
  },
  methods: {
    loadThumb(event) {
      const img = event.target;

      const tolerance = 15;
      const veryWideRatio = 2;

      const { naturalHeight: height, naturalWidth: width } = img;

      if (Math.abs(height - width) <= tolerance) {
        this.imageClass = 'squarish';
      } else if (width / height >= veryWideRatio) {
        this.imageClass = 'very-wide';
      } else if (height > width) {
        this.imageClass = 'tall';
      } else {
        this.imageClass = 'wide';
      }
    },
  },
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
          (x) => x.attributes?.isLineupImage,
        );
      const otherImages = this.event?.media_items?.filter(
        (x) => !x?.attributes?.isLineupImage,
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
  float: right;
  // width: 100%;

  margin-top: 48px;
  margin-right: 48px;
  margin-left: 24px;
  margin-bottom: 32px;
  position: relative;
  .editing-overlay {
    pointer-events: all;
    position: absolute;
    height: 100%;
    width: 100% !important;
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
      filter: drop-shadow(1px 2px 16px rgba(0, 0, 0, 0.3));
      border-radius: 18px !important;
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
        height: auto;
        max-width: 100%;
        height: 100%;
        width: 100%;
        object-position: right;
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

  &.tall {
    width: 350px;

    .item-wrapper {
      .item-wrapper-inner {
        img,
        video {
          max-height: 500px;
        }
      }
    }
  }
  &.wide {
    width: 450px;

    .item-wrapper {
      .item-wrapper-inner {
        img,
        video {
          max-height: 500px;
        }
      }
    }
  }
  &.very-wide {
    width: 490px;

    .item-wrapper {
      .item-wrapper-inner {
        img,
        video {
          max-height: 500px;
        }
      }
    }
  }
  &.squarish {
    width: 400px;
  }
}

@media only screen and (min-width: 599px) and (max-width: 1024px) {
  .featured-media-component {
    &.tall {
      width: 250px;

      .item-wrapper {
        .item-wrapper-inner {
          img,
          video {
            max-height: 400px;
          }
        }
      }
    }
    &.wide {
      width: 390px;

      .item-wrapper {
        .item-wrapper-inner {
          img,
          video {
            max-height: 400px;
          }
        }
      }
    }
    &.very-wide {
      width: 390px;

      .item-wrapper {
        .item-wrapper-inner {
          img,
          video {
            max-height: 400px;
          }
        }
      }
    }
    &.squarish {
      width: 300px;
    }
  }
}

@media only screen and (max-width: 600px) {
  .featured-media-component {
    height: unset;
    width: 100% !important;
    min-height: unset;
    position: relative;
    float: unset;
    margin-top: 24px;
    margin-left: unset;
    margin-right: unset;
    margin-bottom: 16px;
    .item-wrapper {
      height: unset !important;
      width: 100% !important;
      .item-wrapper-inner {
        justify-content: flex-start;
        align-content: flex-start;
        border-radius: 18px;
        max-width: unset;
        max-width: 100%;
        //max-height: 300px;
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
