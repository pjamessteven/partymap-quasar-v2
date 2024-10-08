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
          <YouTube
            style="position: absolute"
            :key="event.youtube_url"
            v-if="event.youtube_url?.length > 0 && clientWidth > 0 && !editing"
            :src="event.youtube_url"
            :width="clientWidth"
            :height="computedHeight"
            @stateChange="onStateChange"
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
import YouTube from 'vue3-youtube';
import _ from 'lodash';

export default {
  components: { EditYoutubeUrlComponent, YouTube },
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
      console.log('video event', event);
      // playback state of -1 is 'unstarted'
      //  https://developers.google.com/youtube/iframe_api_reference#Events
      // once video is started we want to allow auto rotation on mobile
      if (event.data > -1) {
        window.screen.orientation.unlock();
      }
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
  beforeUnmount: function () {
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
  },
};
</script>

<style lang="scss" scoped>
@media only screen and (max-width: 1023px) {
}
</style>
