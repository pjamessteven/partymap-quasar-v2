<template>
  <q-menu
    no-parent-event
    v-if="$q.screen.gt.xs"
    transition-show="jump-down"
    transition-hide="jump-up"
    @hide="onHide($event)"
    @show="onShow()"
    @scroll="onScroll($event)"
    :model-value="showing"
    anchor="top middle"
    self="bottom middle"
    :offset="[0, 8]"
    style="min-width: 300px !important"
  >
    <slot></slot>
  </q-menu>
  <MobileMenu
    :showing="showing"
    v-else
    @scroll="onScroll($event)"
    @hide="
      {
        onHide($event);
      }
    "
    @show="this.$emit('show')"
  >
    <slot></slot>
  </MobileMenu>
</template>

<script>
import MobileMenu from './MobileMenu.vue';

export default {
  components: {
    MobileMenu,
  },
  props: {
    showing: { type: Boolean, default: false },
  },
  computed: {},
  methods: {
    onScroll(event) {
      this.$emit('onScroll', event);
    },
    onShow(event) {
      this.$emit('show');
    },
    onHide(event) {
      this.$emit('hide');
    },
  },
};
</script>

<style lang="scss" scoped></style>
