<template>
  <q-scroll-area
    class="custom-q-scroll"
    ref="scroll"
    v-bind="{ ...$attrs, ...$props }"
    :visible="$q.platform.is.mobile ? false : undefined"
    :class="{
      'disable-scroll': disableScroll,
      vertical,
      horizontal,
    }"
    delay="0"
    @click.stop
  >
    <slot></slot>
  </q-scroll-area>
</template>

<script>
import { JsonProvider } from 'leaflet-geosearch';

export default {
  props: {
    disableScroll: Boolean,
    vertical: Boolean,
    horizontal: Boolean,
  },
  data() {
    return { isScrolling: null };
  },
  watch: {
    disableScroll: function (newv) {
      if (!newv) {
        // this.$refs.scroll.$el.children[0].focus();
      }
    },
  },
  methods: {
    setScrollPosition(direction, offset, duration) {
      this.$refs.scroll.setScrollPosition(direction, offset, duration);
    },
    setScrollPercentage(direction, offset, duration) {
      this.$refs.scroll.setScrollPercentage(direction, offset, duration);
    },
    onScrollEnd() {
      this.$emit('scrollend');
    },
    onScroll() {
      if (this.isScrolling) window.clearTimeout(this.isScrolling);
      this.isScrolling = setTimeout(() => {
        this.onScrollEnd(); // Trigger onScrollEnd after scroll stops
      }, 100); // Adjust the timeout as needed
    },
  },
  computed: {},

  mounted() {
    // safari doesn't support scrollend

    if (this.$q.platform.is.ios || this.$q.platform.is.safari) {
      this.$refs.scroll.$el.firstElementChild.addEventListener(
        'scroll',
        this.onScroll,
      );
    } else {
      this.$refs.scroll.$el.firstElementChild.addEventListener(
        'scrollend',
        this.onScrollEnd,
      );
    }

    // on ios, the mouseover event in the q-scroll component causes users
    // to have to click twice on their target
    // so we remove these events

    if (this.$q.platform.is.ios && this.$refs.scroll.$el._vei) {
      this.$refs.scroll.$el.removeEventListener(
        'mouseleave',
        this.$refs.scroll.$el._vei.onMouseleave,
      );
      this.$refs.scroll.$el.removeEventListener(
        'mouseenter',
        this.$refs.scroll.$el._vei.onMouseenter,
      );
    }
  },
  beforeUnmount() {
    this.$refs.scroll.$el.firstElementChild.removeEventListener(
      'scrollend',
      this.onScrollEnd(),
    );
    if (this.$q.platform.is.ios || this.$q.platform.is.safari) {
      this.$refs.scroll.$el.firstElementChild.removeEventListener(
        'scroll',
        this.onScroll(),
      );
    }
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}

.body--light {
}

.custom-q-scroll {
  /*
  :deep(.q-scrollarea__bar) {
    pointer-events: all;
  }
  :deep(.q-scrollarea__thumb) {
    display: none;
    backdrop-filter: blur(4px) contrast(0.8) invert(50%);
    -webkit-backdrop-filter: blur(4px) contrast(1.2) invert(50%);
    opacity: 1;
    margin-right: 2px;
    width: 8px !important;
    border-radius: 20px !important;
    overflow: hidden;
    &:hover {
      backdrop-filter: blur(4px) contrast(1.2) invert(60%);
      -webkit-backdrop-filter: blur(4px) contrast(1.2) invert(50%);
    }
  }
  */
  :deep(.q-scrollarea__bar) {
    display: none;
  }
  :deep(.q-scrollarea__thumb) {
    display: none;
  }
  :deep(.q-scrollarea__container) {
    scrollbar-width: auto !important;
  }
  &.horizontal {
    :deep(.q-scrollarea__container) {
      overflow-y: hidden !important;
    }
  }
  &.vertical {
    :deep(.q-scrollarea__container) {
      overflow-x: hidden;
    }
  }

  :deep(.scroll) {
    will-change: overflow;
    pointer-events: all;
    @supports (-webkit-overflow-scrolling: touch) {
      overscroll-behavior: none;
      -webkit-overflow-scrolling: touch;
    }
  }
  &.disable-scroll {
    // pointer-events: none;
    :deep(.scroll) {
      overflow: hidden !important;
    }
  }
}

@media only screen and (max-width: 599px) {
  .custom-q-scroll {
    :deep(.q-scrollarea__thumb) {
      display: none;
    }
  }
}
</style>
