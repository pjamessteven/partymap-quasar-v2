<template>
  <q-scroll-area ref="scroll" v-bind="{ ...$attrs, ...$props }">
    <slot></slot>
  </q-scroll-area>
</template>

<script>
export default {
  props: {},
  data() {
    return {};
  },
  methods: {
    setScrollPosition(direction, x, y) {
      this.$refs.scroll.setScrollPosition(direction, x, y);
    },
    setScrollPercentage(direction, percentage) {
      this.$refs.scroll.setScrollPercentage(direction, percentage);
    },
  },
  computed: {},
  mounted() {
    // on ios, the mouseover event in the q-scroll component causes users
    // to have to click twice on their target
    // so we remove these events
    if (this.$q.platform.is.ios) {
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
</style>
