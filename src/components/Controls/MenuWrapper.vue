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
    max-height="600px"
  >
    <div style="min-width: 200px">
      <slot></slot>
    </div>
  </q-menu>
  <MobileMenuDialog
    v-else
    :showing="showing"
    @scroll="onScroll($event)"
    @hide="onHide($event)"
  >
    <slot></slot>
  </MobileMenuDialog>
</template>

<script>
//import MobileMenu from './MobileMenu.vue';
import MobileMenuDialog from './MobileMenuDialog.vue';

export default {
  components: {
    //MobileMenu,
    MobileMenuDialog,
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
