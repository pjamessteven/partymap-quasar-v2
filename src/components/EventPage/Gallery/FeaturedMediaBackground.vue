<template>
  <div class="featured-media">
    <div class="featured-media-overlay" />
    <div class="media-wrapper" v-if="headerBackground">
      <transition appear enter-active-class="animated fadeIn slower">
        <video
          :key="headerBackground.id"
          v-if="
            headerBackground &&
            headerBackground.v_low_url &&
            headerBackground.v_low_url.length > 0
          "
          class="video item"
          autoplay
          loop
          muted
          :poster="headerBackground.poster_url"
        >
          <source
            :src="headerBackground.v_low_url"
            type="video/webm"
            class="image-thumb"
          />
        </video>
      </transition>

      <transition appear enter-active-class="animated fadeIn slower">
        <img
          :key="headerBackground.thumb_xs_url"
          v-if="
            headerBackground &&
            headerBackground.thumb_xs_url &&
            !headerBackground.v_low_url
          "
          :src="headerBackground.thumb_xs_url"
          class="item"
        />
      </transition>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';

export default {
  components: {},
  props: {
    editing: Boolean,
    thumbXsUrl: String,
  },
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    getBgImgStyle(image = '') {
      return `background-image: url("${image}");
      background-size: cover;
      background-position: center;
      display: inline-block;
      `;
    },
  },
  watch: {},
  computed: {
    ...mapState(useEventStore, ['event', 'backgroundMediaIndex']),
    headerBackground() {
      if (this.thumbXsUrl?.length > 0) {
        return {
          thumb_xs_url: this.thumbXsUrl,
        };
      } else if (this.event?.media_items?.length > 0) {
        return this.event.media_items[this.backgroundMediaIndex];
      } else {
        return null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .featured-media {
    .featured-media-overlay {
      background: linear-gradient(
        0deg,
        rgba(250, 250, 250, 0.3) 0%,
        rgba(0, 0, 0, 0) 150%
      );
    }
  }
}

.body--light {
  .featured-media {
    .featured-media-overlay {
      background: linear-gradient(
        0deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(0, 0, 0, 0) 150%
      );
    }
  }
}

.featured-media {
  max-width: 100%;
  overflow: hidden;
  //min-height: 400px;
  .featured-media-overlay {
    position: absolute;
    pointer-events: none;
    height: 100%;
    width: 100%;
    background: linear-gradient(
      90deg,
      rgba(80, 80, 80, 0.8),
      rgba(0, 0, 0, 0) 150%
    );
    z-index: 20;
  }

  .media-wrapper {
    width: 100%;
    // max-width: 150px;
    position: relative;
    overflow: hidden;
    display: flex;
    // height: Min(calc(100vh - 360px), 548px);
    height: 100%;
    min-height: 300px;
    position: relative;
    //justify-content: center;
    transform: scale(1.2) translateX(1);
    // will-change: auto;
    .video {
      width: 100%;
      object-fit: cover;
      -webkit-backface-visibility: hidden;
      -webkit-transform: translate3d(0, 0, 0);
      -webkit-transform: translateZ(0);
      backface-visibility: hidden;
      transform: translate3d(0, 0, 0);
      transform: translateZ(0);
      filter: blur(50px);
    }
    .item {
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: hidden;
      //  filter: blur(50px);
      -webkit-transform: translateZ(0);
      backface-visibility: hidden;
      transform: translate3d(0, 0, 0);
      transform: translateZ(0) scale(2);
      filter: blur(50px);
      // position by top left corner of image
      left: calc(0px + (100% / 2) - 128px);
      top: calc(0px + (100% / 2) - 128px);

      @supports (font: -apple-system-body) and (-webkit-appearance: none) {
        -webkit-backface-visibility: hidden;
        -webkit-transform: translate3d(0, 0, 0) scale(2);
        // translate3d is a hack for safari to force gpu rendering of blur()
      }
    }
  }
}
@media only screen and (max-width: 599px) {
  .featured-media {
    .media-wrapper {
      .item {
        filter: blur(30px);
      }
    }
  }
}
</style>
