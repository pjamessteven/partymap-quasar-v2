<template>
  <q-scroll-area
    class="custom-q-scroll"
    ref="scroll"
    v-bind="{ ...$attrs, ...$props }"
    :class="disableScroll && 'disable-scroll'"
  >
    <slot></slot>
  </q-scroll-area>
</template>

<script>
export default {
  props: ['disableScroll'],
  data() {
    return {};
  },
  watch: {
    disableScroll: function (newv) {
      if (!newv) {
        // this.$refs.scroll.$el.children[0].focus();
      }
    },
  },
  methods: {
    onScroll(event) {
      console.log(event);
    },
    setScrollPosition(direction, offset, duration) {
      this.$refs.scroll.setScrollPosition(direction, offset, duration);
    },
    setScrollPercentage(direction, offset, duration) {
      this.$refs.scroll.setScrollPercentage(direction, offset, duration);
    },
  },
  computed: {},

  mounted() {
    // on ios, the mouseover event in the q-scroll component causes users
    // to have to click twice on their target
    // so we remove these events
    if (this.$q.platform.is.ios && this.$refs.scroll.$el._vei) {
      this.$refs.scroll.$el.removeEventListener(
        'mouseleave',
        this.$refs.scroll.$el._vei.onMouseleave
      );
      this.$refs.scroll.$el.removeEventListener(
        'mouseenter',
        this.$refs.scroll.$el._vei.onMouseenter
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
  }
  &.disable-scroll {
    // pointer-events: none;
    :deep(.scroll) {
      overflow: hidden !important;
    }
  }
}
</style>
