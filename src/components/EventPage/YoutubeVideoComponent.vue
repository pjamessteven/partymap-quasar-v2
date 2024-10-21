<template>
  <div>
    <div class="flex column" ref="container">
      <div class="description text-large" :class="editing ? 'editing ' : ''">
        <div
          :style="
            editing ? '' : `position: relative; height: ${computedHeight}px`
          "
          @click="openEditorDialog()"
          class="editing-outline"
          :class="editing ? 'q-pa-md' : ''"
        >
          <youtube-iframe
            :video-id="videoId"
            @ready="onStateChange"
            :style="`position: absolute;`"
            :width="clientWidth"
            :height="computedHeight"
            :key="event.youtube_url"
            v-if="videoId?.length > 0 && clientWidth > 0 && !editing"
          />

          <div v-else-if="editing" class="t4 flex items-center">
            <q-icon
              :size="$q.screen.gt.sm ? '2em' : '1.5rem'"
              class="t4 q-mr-md"
              name="las la-video"
            />
            <div class="inter text-large">
              <span v-if="event.youtube_url?.length > 0">{{
                event.youtube_url
              }}</span>
              <u v-else>Add a YouTube video to this event page</u>
            </div>
          </div>
        </div>
      </div>
    </div>
    <q-dialog
      v-model="showEditingDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <EditYoutubeUrlComponent @closeDialog="showEditingDialog = false" />
    </q-dialog>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';
import EditYoutubeUrlComponent from './EditYoutubeUrlComponent.vue';
//import LazyYoutubeVideo from 'vue-lazy-youtube-video';
import { YoutubeIframe } from '@vue-youtube/component';
import _ from 'lodash';

export default {
  components: { YoutubeIframe, EditYoutubeUrlComponent },
  props: {
    editing: Boolean,
  },
  data() {
    return {
      showEditingDialog: false,
      clientWidth: 0,
    };
  },
  methods: {
    onStateChange(event) {
      // playback state of -1 is 'unstarted'
      //  https://developers.google.com/youtube/iframe_api_reference#Events
      // once video is started we want to allow auto rotation on mobile
      //  if (event.data > -1) {
      if (window.screen?.orientation) window.screen.orientation.unlock();
      // }
    },
    openEditorDialog() {
      if (this.editing) {
        this.showEditingDialog = true;
      }
    },
    handleResize() {
      if (this.$refs.container) {
        this.clientWidth = this.$refs.container.clientWidth;
      }
    },
    getYouTubeVideoId(url) {
      // Regular expression pattern to match YouTube URL formats
      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

      // Try to match the URL with the regular expression
      const match = url.match(regExp);

      // If a match is found and the captured group is 11 characters long (standard YouTube ID length)
      if (match && match[2].length === 11) {
        return match[2];
      } else {
        return null; // Return null if no valid YouTube ID is found
      }
    },
  },
  watch: {},
  created() {
    this.debouncedHandleResize = _.debounce(this.handleResize, 150, {
      leading: false,
      trailing: true,
    });
  },
  mounted() {
    window.addEventListener('resize', this.debouncedHandleResize);
    this.clientWidth = this.$refs.container.clientWidth;
  },
  beforeUnmount() {
    if (this.$q.platform.is.capacitor && this.$q.screen.lt.sm) {
      window.screen.orientation.lock('portrait');
    }
    window.removeEventListener('resize', this.debouncedHandleResize);
  },

  computed: {
    ...mapState(useEventStore, ['event']),

    computedHeight() {
      return this.clientWidth * (9 / 16);
    },
    videoId() {
      return this.getYouTubeVideoId(this.event.youtube_url);
    },
  },
};
</script>

<style lang="scss" scoped>
@media only screen and (max-width: 1023px) {
}
</style>
