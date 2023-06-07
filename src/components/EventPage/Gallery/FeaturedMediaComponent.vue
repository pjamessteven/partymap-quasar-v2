<template>
  <div class="pswipe-gallery flex grow">
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
    <div class="image-transition-group flex column justify-center">
      <GalleryDialog
        v-if="items"
        :open="currentItemIndex != null"
        :items="items"
        :showThumbnails="true"
        :currentItemIndex="currentItemIndex"
        @onClose="currentItemIndex = null"
      />
      <Flicking
        :key="loadIndex"
        ref="flicking"
        @changed="flickingChanged($event)"
        @move-start="flickingMoveStart($event)"
        @will-restore="flickingWillRestore()"
        :plugins="flickingPlugins"
        :options="flickingOptions"
      >
        <div v-for="(item, index) in items" class="item-wrapper" :key="index">
          <div class="item-wrapper-inner" ref="itemWrapperInner">
            <div class="hover-overlay" @click="currentItemIndex = index"></div>
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
            <img :src="item.thumb_xs_url" v-if="!loaded.includes(index)" />
            <img
              v-show="loaded.includes(index)"
              :src="item.thumb_url"
              @load="imageLoaded($event, index)"
            />
          </div>
        </div>
        <template #viewport>
          <span class="flicking-arrow-prev"
            ><q-icon name="mdi-chevron-left-circle" size="2rem"
          /></span>
          <span class="flicking-arrow-next"
            ><q-icon name="mdi-chevron-right-circle" size="2rem"
          /></span>
        </template>
      </Flicking>
    </div>
    <q-dialog v-model="showEditDialog">
      <EditGalleryComponent />
    </q-dialog>
  </div>
</template>

<script>
import EditGalleryComponent from 'components/EventPage/Gallery/EditGalleryComponent.vue';
import Flicking from '@egjs/vue3-flicking';
import { Arrow, Fade } from '@egjs/flicking-plugins';

import GalleryDialog from './GalleryDialog.vue';
import { mapState, mapWritableState } from 'pinia';
import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';

const flickingPlugins = [new Arrow(), new Fade()];

export default {
  components: {
    EditGalleryComponent,
    Flicking,
    GalleryDialog,
  },
  props: {
    items: Array,
    editing: Boolean,
  },
  data() {
    return {
      loaded: [],
      loadIndex: 0, // every time media items changes use new flicking
      loading: false,
      showGallery: false,
      showEditDialog: false,
      currentItemIndex: null, // to sync current gallery item with photo sidebar,
      previousItemIndex: null,
      flickingPlugins,
      flickingOptions: {
        align: 'prev',
        bound: false,
        circular: false,
        adaptive: false,
        renderOnlyVisible: false,
      },
      originalIndex: 0,
    };
  },
  methods: {
    imageLoaded(e, index) {
      console.log(e);
      this.loaded.push(index);
      if (index === 0) {
        this.$emit('featuredMediaHeight', e.target.height);
      }
    },
    flickingMoveStart(obj) {
      this.originalIndex = this.$refs.flicking.index;
      if (obj.direction === 'NEXT') {
        this.backgroundMediaIndex = this.backgroundMediaIndex + 1;
      } else if (obj.direction === 'PREV') {
        if (this.backgroundMediaIndex > 0) {
          this.backgroundMediaIndex = this.backgroundMediaIndex - 1;
        }
      }
    },
    flickingWillRestore() {
      this.backgroundMediaIndex = this.originalIndex;
    },
    flickingChanged(obj) {
      this.backgroundMediaIndex = obj.index;
    },
    getBgImgStyle(image = '') {
      return `background-image: url("${image}");
      background-size: cover;
      background-position: center;
      display: inline-block;
      `;
    },

    loadItemsToPswp(items) {
      var pswpItems = [];
      for (let i in items) {
        if (items[i].v_low_url) {
          // this is a video
          // embed html player
          // mount video player

          pswpItems.push({
            ...items[i],
            ...{
              video_player_class: null,
              html: '<div/>',
            },
          });
        } else {
          pswpItems.push({
            ...items[i],
            ...{
              src: items[i].image_url,
              msrc: items[i].thumb_url,
            },
          });
        }
      }
      this.pswpItems = pswpItems;
      this.loadIndex += 1;
    },
  },

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
    mappedItems() {
      return this.items?.map((item) => {
        let bestQualityUrl = '';
        // video cases
        if (item.v_high_url) {
          bestQualityUrl = v_med_url;
        } else if (item.v_med_url) {
          bestQualityUrl = v_med_url;
        } else if (item.v_low_url) {
          bestQualityUrl = v_low_url;
        } else if (item.image_url) {
          bestQualityUrl = item.image_url;
        }
        return { ...item, bestQualityUrl };
      });
    },
  },
  mounted() {
    if (this.items) {
      this.loadItemsToPswp(this.items);
    }
  },
};
</script>

<style lang="scss">
// GLOBAL FLICKING STYLES
.pswp {
  .pswp__top-bar {
    .pswp__button {
      display: none;
    }
  }
}
.body--dark {
  .pswp__bg {
    background: black;
  }

  .gallery-button:hover,
  .gallery-button:focus {
    background: rgba(0, 0, 0, 0.6);
  }
}
.body--light {
  .pswp__bg {
    background: $b-2;
  }
  .pswp__top-bar {
    background: $b-2;
    .pswp__counter {
      color: $t-3;
    }
  }

  .gallery-button:hover,
  .gallery-button:focus {
    background: rgba(255, 255, 255, 0.4);
  }
  .gallery-button {
    font-weight: 700;
    color: white;
    i {
      color: white;
    }
  }
}
</style>

<style scoped>
@import url('@egjs/vue3-flicking/dist/flicking.css');
</style>
<style lang="scss" scoped>
.pswipe-gallery {
  width: 100%;
  height: 100%;
  max-width: 100%;
  position: relative;
  min-height: 200px;
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
  .image-transition-group {
    position: absolute;
    width: 100%;
    height: 100%;
    max-width: 100%;

    .flicking-viewport {
      transition: height 500ms;
      width: 100%;
      overflow: visible;
      height: 100%;
      :deep(.flicking-camera) {
        display: flex;
        max-height: 100%;
        height: 100%;
      }
      .flicking-arrow-prev,
      .flicking-arrow-next {
        position: absolute;
        filter: drop-shadow(0px 2px 5px rgba(0, 0, 0, 0.2));
        cursor: pointer;
        opacity: 0.68;
        transition: opacity 0.3s;
        &:hover {
          opacity: 1;
        }
      }

      .flicking-arrow-prev {
        left: 0px;
        z-index: 100;
        top: calc(50% - 20px);
        width: 20px;
        height: 20px;

        margin-left: -16px;
        // scale: 0.5;
        //top: calc(100% - 32px);

        &:after,
        &:before {
          background-color: white;
        }
      }
      .flicking-arrow-next {
        right: 0px;
        z-index: 100;
        top: calc(50% - 20px);
        width: 20px;
        height: 20px;

        margin-right: 48px;
        //top: calc(100% - 32px);
        //scale: 0.5;
        &:after,
        &:before {
          background-color: white;
        }
      }
      .flicking-arrow-disabled {
        opacity: 0;
      }
    }
    .item-wrapper {
      position: relative;
      margin-left: 16px;
      height: 100%;
      width: 100%;
      max-height: 100%;
      max-width: calc(100% - 48px);
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
          cursor: pointer;
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
}
@media only screen and (max-width: 1024px) {
  .pswipe-gallery {
    height: unset;
    max-width: calc(100vw - 48px);
    min-height: unset;
    width: auto;
    min-height: 200px;
    .image-transition-group {
      position: absolute;
      width: 100%;
      height: 100%;
      max-width: 100%;

      .flicking-viewport {
        transition: height 500ms;
        width: 100%;
        overflow: visible;
        height: 100%;
        .flicking-arrow-prev.is-circle,
        .flicking-arrow-next.is-circle {
          border-radius: 0px;
          height: 100%;
          background: transparent;
          filter: drop-shadow(0px 2px 5px rgba(0, 0, 0, 0.2));
        }

        .flicking-arrow-prev {
          opacity: 0.8;
          transition: opacity 0.3s;
          margin-left: 0px;
          // scale: 0.5;
          //top: calc(100% - 32px);

          &:after,
          &:before {
            background-color: white;
          }
        }
        .flicking-arrow-next {
          opacity: 0.8;
          transition: opacity 0.3s;
          margin-right: -0px;
          //top: calc(100% - 32px);
          //scale: 0.5;
          &:after,
          &:before {
            background-color: white;
          }
        }
        .flicking-arrow-disabled {
          opacity: 0;
        }
      }
      .item-wrapper {
        position: relative;
        vheight: 100%;
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
        }
      }
    }
  }
}
</style>
