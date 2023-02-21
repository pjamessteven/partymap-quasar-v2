<template>
  <div class="list-item flex items-center row no-wrap q-mb-md">
    <q-btn @click="deleteItem" size="sm" class="delete-button" round>
      <q-icon size="1em" name="las la-times" />
    </q-btn>
    <div
      class="thumb flex column justify-center items-center"
      :style="getBgImgStyle(item.thumb_url)"
    >
      <div class="overlay" />
      <q-icon
        size="2em"
        name="las la-video"
        class="play-icon"
        v-if="item.v_low_url"
      />
      <div v-if="item.duration" class="duration q-ma-sm" style="color: white">
        {{ getMinutesAndSeconds(item.duration) }}
      </div>
    </div>
    <div class="flex column grow justify-center align-center">
      <q-input
        class="q-ma-sm grow"
        v-model="caption"
        outlined
        dense
        @update:model-value="editing = true"
        :placeholder="$t('media_upload.caption')"
      />
      <div class="flex row q-mb-md" v-if="editing">
        <q-btn flat @click="cancelEditing">
          <q-icon size="2em" name="las la-window-close" />
        </q-btn>
        <q-btn flat @click="updateItem({ caption: caption })">
          <q-icon size="2em" name="las la-save" />
        </q-btn>
      </div>
    </div>
    <div class="flex row no-wrap" v-if="reordering">
      <div class="flex column">
        <q-btn flat @click="repositionItem('up')">
          <q-icon size="1em" name="las la-angle-up" />
        </q-btn>
        <q-btn flat @click="repositionItem('down')">
          <q-icon size="1em" name="las la-angle-down" />
        </q-btn>
      </div>

      <div class="flex column">
        <q-btn flat @click="repositionItem('start')">
          <q-icon size="1em" name="las la-angle-double-up" />
        </q-btn>
        <q-btn flat @click="repositionItem('end')">
          <q-icon size="1em" name="las la-angle-double-down" />
        </q-btn>
      </div>
    </div>

    <q-inner-loading :showing="loading">
      <q-spinner-ios
        :color="$q.dark.isActive ? 'white' : 'black'"
        :size="'lg'"
      />
    </q-inner-loading>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useEventStore } from 'src/stores/event';

import common from 'assets/common';
export default {
  components: {},
  props: {
    item: Object,
    reordering: Boolean,
  },
  data() {
    return {
      caption: this.item.caption,
      loading: false,
      editing: false,
    };
  },
  methods: {
    ...mapActions(useEventStore, [
      'deleteMediaItem',
      'updateMediaItem',
      'setMediaItemPosition',
    ]),
    getBgImgStyle(image = '') {
      return `background-image: url("${image}");
      background-size: cover;
      background-position: center;
      `;
    },
    cancelEditing() {
      this.caption = this.item.caption;
      this.editing = false;
    },
    async updateItem(payload) {
      this.loading = true;
      try {
        await this.updateMediaItem(this.item.id, payload);
        this.editing = false;
      } catch (e) {}
      this.loading = false;
    },
    async deleteItem() {
      this.loading = true;
      await this.deleteMediaItem(this.item.id);
      this.loading = false;
    },
    repositionItem(relativePosition) {
      // relative position can be up, down, top or bottom
      this.setMediaItemPosition(this.item.id, relativePosition);
    },
  },
  watch: {},
  computed: {
    ...mapState(useEventStore, ['event']),
  },

  created() {
    this.getMinutesAndSeconds = common.getMinutesAndSeconds;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .list-item {
    background-color: $bi-3;

    border: 1px solid rgba(255, 255, 255, 0.1);

    .delete-button {
      background-color: $bi-4;
    }
  }
  .ordering-buttons {
    background: $bi-3;
  }
}
.body--light {
  .list-item {
    background-color: $b-2;

    border: 1px solid rgba(0, 0, 0, 0.05);
    &:first-child {
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }
    .delete-button {
      background-color: $b-1;
    }
  }
}
.list-item {
  position: relative;
  border-radius: 9px;
  .delete-button {
    position: absolute;
    left: -10px;
    top: -10px;
    z-index: 2;
  }
  .thumb {
    width: 100px;
    border-radius: 9px;
    overflow: hidden;
    height: 100px;
    position: relative;
    .play-icon {
      color: white;
    }
    .overlay {
      position: absolute;
      height: 100%;
      width: 100%;
      background: rgba(0, 0, 0, 0.2);
    }
    .duration {
      color: white;
      position: absolute;
      bottom: 0px;
      right: 0px;
      pointer-events: none;
    }
  }
}
</style>
