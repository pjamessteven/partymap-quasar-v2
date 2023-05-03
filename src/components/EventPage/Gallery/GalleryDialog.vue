<template>
  <q-dialog
    :model-value="open"
    ref="dialog"
    @hide="$emit('onClose')"
    transition-show="jump-up"
    transition-hide="jump-down"
  >
    <div class="gallery-dialog">
      <div class="close-button-wrapper" @click="$emit('onClose')">
        <q-icon size="2em" name="mdi-close"></q-icon>
      </div>
      <q-carousel
        swipeable
        animated
        arrows
        v-model="currentIndex"
        :thumbnails="showThumbnails"
        infinite
        transition-prev="jump-right"
        transition-next="jump-left"
      >
        <q-carousel-slide
          @click="$emit('onClose')"
          v-for="(item, index) in items"
          :key="index"
          :name="index"
          :img-src="item.image_url || item.poster_url"
        >
          <q-linear-progress
            class="linear-progress"
            indeterminate
            v-if="!loaded.includes(index)"
          />

          <div class="image-container">
            <img
              :src="item.thumb_url"
              class="image not-loaded"
              v-show="!loaded.includes(index)"
            />
            <img
              :src="item.image_url"
              class="image"
              @load="() => loaded.push(index)"
              v-show="loaded.includes(index)"
            />
          </div>
        </q-carousel-slide>
      </q-carousel>
    </div>
  </q-dialog>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      loaded: [],
      currentIndex: this.currentItemIndex,
    };
  },
  props: {
    open: { type: Boolean, default: false },
    showThumbnails: { type: Boolean, default: false },
    items: {
      type: Array,
      default: null,
    },
    currentItemIndex: {
      type: Number,
      default: null,
    },
  },
  watch: {
    currentItemIndex(newValue) {
      this.currentIndex = newValue;
    },
  },
  computed: {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.body--dark {
  .gallery-dialog {
    .q-carousel {
      background: black;
    }
  }
}
.body--light {
  .gallery-dialog {
    .q-carousel {
      background: black;
    }
  }
}

.gallery-dialog {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: unset !important;
  position: absolute;
  .close-button-wrapper {
    z-index: 1;
    cursor: pointer;
    position: absolute;
    top: 0px;
    left: 0px;
    padding: 16px;
    color: grey;
    transition: color 0.3s ease;
    &:hover {
      color: white;
    }
  }
  .q-carousel {
    height: 100%;
    width: 100%;
    :deep(.q-carousel__slide) {
      padding: 0px !important;
      background: none !important;
    }
    .linear-progress {
      position: absolute;
      top: 0px;
      z-index: 10;
    }
    .image-container {
      pointer-events: none;
      display: flex;
      justify-content: center;
      align-content: center;
      align-items: center;
      background: none;
      max-height: 100%;
      max-width: 100%;
      position: relative;
      height: 100%;
      width: 100%;
      .image {
        height: 100%;
        width: 100%;
        max-height: 100%;
        max-width: 100%;
        object-fit: contain;
        &.not-loaded {
          //opacity: 0.48;
        }
      }
    }
  }
}
</style>
