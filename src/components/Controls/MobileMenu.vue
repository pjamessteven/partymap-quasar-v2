<template>
  <div></div>
</template>

<script>
import MobileMenuDialog from './MobileMenuDialog.vue';

export default {
  components: {},
  props: {
    showing: { type: Boolean, default: false },
  },
  data() {
    return { dialog: null };
  },
  watch: {
    showing(newv) {
      this.$nextTick(() => {
        if (newv) {
          this.showDialog();
        } else if (this.dialog) {
          //  this.dialog.hide();
        }
      });
    },
  },
  computed: {},
  methods: {
    showDialog() {
      this.$emit('show');
      this.dialog = this.$q
        .dialog({
          component: MobileMenuDialog,
          parent: this, // becomes child of this Vue node
          // ("this" points to your Vue component)
          // (prop was called "root" in < 1.1.0 and
          // still works, but recommending to switch
          // to the more appropriate "parent" name)

          transitionShow: 'fade',
          // props forwarded to component
          data: this.$slots.default,
          componentProps: {
            slot: this.$slots.default,
          },
        })
        .onDismiss(() => this.$emit('hide'));
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
