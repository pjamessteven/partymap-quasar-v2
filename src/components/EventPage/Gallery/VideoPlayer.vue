<template>
  <div class="pswp-video">
    <div class="video-wrapper" v-if="computedVideoUrl">
      <video
        controls
        :key="computedVideoUrl"
        :id="id"
        class="video"
        ref="videoElement"
        :muted="muted"
        :poster="poster_url"
      >
        <source :src="computedVideoUrl + noCache" type="video/webm" />
      </video>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';

export default {
  components: {},
  props: {
    v_low_url: String,
    v_med_url: String,
    v_high_url: String,
    poster_url: String,
    id: String,
  },
  data() {
    return {
      quality: 'low',
      muted: true,
      state: 'paused',
      percentage: 0,
    };
  },
  methods: {
    playVideo() {
      var video = document.getElementById(this.id);
      if (video) {
        video.play();
        this.state = 'playing';
      }
    },
    pauseVideo() {
      var video = document.getElementById(this.id);

      if (video) {
        this.muted = true;
        video.pause();
        this.state = 'paused';
      }
    },
    updateVideoProgress(value) {
      var video = document.getElementById(this.id);
      if (video) {
        video.currentTime = video.duration * (value / 100);
      }
    },
  },
  watch: {},
  computed: {
    ...mapState(useEventStore, ['event']),
    ...mapState(useAuthStore, ['currentUser']),

    computedVideoUrl() {
      if (this.quality === 'low') {
        return this.v_low_url;
      } else if (this.quality === 'med' && this.v_med_url) {
        return this.v_med_url;
      } else if (this.quality === 'high' && this.v_high_url) {
        return this.v_high_url;
      } else {
        return null;
      }
    },
    noCache() {
      // disable cache if it's the event creator
      // because the server side conversion process make it seem like it fucked up
      // by caching the partially converted video file
      if (
        this.event &&
        this.currentUser &&
        this.event.creator.username === this.currentUser.username
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
.body--light {
}
.body--dark {
}
.pswp-video {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  .video-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: all;
    position: relative;
    .video {
      max-width: 100%;
    }
    .video-controls-wrapper {
      height: 100%;
      width: 100%;
      position: absolute;
      display: flex;
      justify-content: flex-end;
      align-items: flex-start;

      pointer-events: none;
      .video-controls {
        pointer-events: all;
        display: flex;
        justify-content: flex-end;
        align-items: flex-start;
        .control {
          background: $bi-1;
          color: $ti-2;
        }
      }
    }
  }
}

@media only screen and (max-width: 1023px) {
}
</style>
