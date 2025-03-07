<template>
  <q-scroll-area
    class="custom-q-scroll"
    ref="scroll"
    v-bind="{ ...$attrs, ...$props }"
    :visible="$q.platform.is.mobile ? false : undefined"
    :class="disableScroll && 'disable-scroll'"
    delay="0"
  >
    <slot></slot>
  </q-scroll-area>
</template>

<script>
export default {
  props: ['disableScroll'],
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
  :deep(.scroll) {
    will-change: overflow;

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
