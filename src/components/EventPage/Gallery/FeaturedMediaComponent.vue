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
      <Flicking
        :key="loadIndex"
        ref="flicking"
        @changed="flickingChanged($event)"
        @move-start="flickingMoveStart($event)"
        @will-restore="flickingWillRestore()"
        :plugins="flickingPlugins"
        :options="flickingOptions"
      >
        <div
          v-for="(item, index) in pswpItems"
          class="item-wrapper"
          :key="index"
          @mouseleave="
            clickedImage = null;
            hoveringImage = false;
          "
        >
          <div class="item-wrapper-inner">
            <div class="hover-overlay" @click="openPswp(index)"></div>
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
            <img v-else :src="item.thumb_url" />
          </div>
        </div>
        <span slot="viewport" class="flicking-arrow-prev is-circle"> </span>
        <span slot="viewport" class="flicking-arrow-next is-circle"> </span>
      </Flicking>
    </div>
    <q-dialog v-model="showEditDialog">
      <EditGalleryComponent />
    </q-dialog>
  </div>
</template>

<script>
import { createApp } from 'vue';

import EditGalleryComponent from 'components/EventPage/Gallery/EditGalleryComponent.vue';
import VideoPlayer from 'components/EventPage/Gallery/VideoPlayer.vue';
import Flicking from '@egjs/vue3-flicking';
import { Arrow, Fade } from '@egjs/flicking-plugins';

import { mapState, mapWritableState } from 'pinia';
import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';
import { defineComponent } from 'vue-demi';

const flickingPlugins = [new Arrow(), new Fade()];

export default {
  components: {
    EditGalleryComponent,
    Flicking,
  },
  props: {
    items: Array,
    editing: Boolean,
  },
  data() {
    return {
      loadIndex: 0, // every time media items changes use new flicking
      loading: false,
      showGallery: false,
      showEditDialog: false,
      currentItemIndex: null, // for photo sidebar,
      previousItemIndex: null,
      pswp: null,
      VideoPlayerClass: VideoPlayer,

      pswpItems: [],
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
    openPswp(index) {
      // set current item
      //
      this.currentItemIndex = index;
      if (this.pswpItems[index].v_low_url) {
        // mount video player

        this.pswpItems[index].video_player_class = new this.VideoPlayerClass({
          propsData: {
            v_low_url: this.pswpItems[index].v_low_url,
            v_med_url: this.pswpItems[index].v_med_url,
            v_high_url: this.pswpItems[index].v_high_url,
            poster_url: this.pswpItems[index].poster_url,
            id: this.pswpItems[index].id,
          },
        }).$mount();
        this.pswpItems[index].html =
          this.pswpItems[ // eslint-disable-line
            index // eslint-disable-line
          ].video_player_class.$el; // eslint-disable-line
      }

      // open and configure pswp
      const pswp = this.$Pswp.open({
        items: this.pswpItems,
        options: {
          index: index,
          showHideOpacity: true,
          isClickableElement: function (el) {
            return el.id === 'slider';
          },
        },
      });

      if (this.pswpItems[index].video_player_class) {
        this.pswpItems[index].video_player_class.playVideo();
      }

      pswp.listen('close', () => {
        if (pswp.currItem.video_player_class) {
          // pause video
          pswp.currItem.video_player_class.pauseVideo();
          // pswp.currItem.video_player_class.$destroy()
        }
        this.currentItemIndex = null;
      });
      pswp.listen('beforeChange', () => {
        this.previousItemIndex = this.currentItemIndex;

        if (this.pswpItems[this.previousItemIndex].video_player_class != null) {
          this.pswpItems[
            this.previousItemIndex
          ].video_player_class.pauseVideo();
        }
      });
      pswp.listen('gettingData', (index, item) => {
        // this.currentItem = item
        if (item.v_low_url) {
          // mount video player
          if (item.video_player_class == null) {
            item.video_player_class = createApp(this.VideoPlayerClass, {
              v_low_url: item.v_low_url,
              v_med_url: item.v_med_url,
              v_high_url: item.v_high_url,
              poster_url: item.poster_url,
              id: item.id,
            }).mount();

            item.html = item.video_player_class.$el; // eslint-disable-line
          }
        }
      });
      pswp.listen('afterChange', () => {
        this.currentItemIndex = pswp.getCurrentIndex();
        if (pswp.currItem.video_player_class) {
          // play video
          pswp.currItem.video_player_class.playVideo();
        }
      });
    },
    closeGallery() {
      this.pswp.close();
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
  watch: {
    items: function (newv) {
      if (newv) {
        this.loadItemsToPswp(newv);
      }
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
        margin-left: -64px;
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
        margin-right: -16px;
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
        position: relative;
        display: flex;
        justify-content: center;
        align-content: center;
        align-items: center;

        img,
        video {
          max-height: 100%;
          max-width: 100%;
          height: auto;
          width: auto;
          display: block;
          box-shadow: 1px 2px 78px 0px rgba(0, 0, 0, 0.68);
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
