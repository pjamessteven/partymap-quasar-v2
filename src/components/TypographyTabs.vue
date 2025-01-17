<template>
  <q-tabs shrink class="typography-tabs" v-bind="{ ...$attrs, ...$props }">
    <slot></slot>
  </q-tabs>
</template>

<script>
export default {
  props: {},
  data() {
    return {};
  },
  methods: {},
  computed: {},
};
</script>

<style lang="scss" scoped>
.body--dark {
  .typography-tabs {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
}

.body--light {
  .typography-tabs {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
}

.typography-tabs {
  :deep(.q-tab) {
    padding: 0 8px;
    text-transform: unset !important;
    opacity: 0.48;
    &.q-router-link--active,
    &.q-tab--active {
      opacity: 1;
    }
    .q-tab__label {
      font-size: 12pt;
      text-transform: unset !important;
      font-weight: 600;
      font-family: metropolis;
    }
    .q-focus-helper {
      display: none;
    }
    .q-ripple {
      display: none;
    }
    .q-tab__indicator {
      // display: none;
    }
    &:hover {
      background-color: transparent;
    }
  }
}
</style>
