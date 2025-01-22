<template>
  <q-dialog
    class="backdrop-blur-dialog"
    ref="dialog"
    backdrop-filter="blur(4px) saturate(150%)"
    v-bind="{ ...$attrs, ...$props }"
    delay="0"
  >
    <slot></slot>
  </q-dialog>
</template>

<script>
export default {
  methods: {
    show() {
      this.$refs.dialog.show(); // Calls `show` on q-dialog
    },
    hide() {
      this.$refs.dialog.hide(); // Calls `hide` on q-dialog
    },
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}

.body--light {
}
</style>
