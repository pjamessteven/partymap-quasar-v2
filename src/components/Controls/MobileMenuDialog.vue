<template>
  <q-dialog
    ref="dialog"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <div class="flex column no-wrap menu">
      <MobileSwipeHandle @swipe="hide()" :solidBg="true" />

      <q-card class="card">
        <div class="component-wrapper"><component :is="slot" /></div>
      </q-card>
    </div>
  </q-dialog>
</template>

<script>
import MobileSwipeHandle from '../MobileSwipeHandle.vue';

export default {
  components: {
    MobileSwipeHandle,
  },
  props: ['slot'], // bit of a hack, passing slot as a prop
  data() {
    return {};
  },
  watch: {},
  computed: {},
  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.dialog.show();
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      console.log('hide');
      this.$refs.dialog.hide();
    },
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .menu {
    background: transparent;

    .card {
      background: black !important;
      .component-wrapper {
        border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
      }
    }
  }
}
.body--light {
  .menu {
    background: transparent;
    .card {
      color: black;
      background: white !important;
      .component-wrapper {
        border-top: 1px solid rgba(0, 0, 0, 0.1) !important;
      }
    }
  }
}

.menu {
  width: 100vw;
  max-height: 500px;
  position: absolute;
  bottom: 0px;
  .card {
    border: none;
    flex-grow: 1;
    width: 100%;
    backdrop-filter: none;
    box-shadow: none;
    height: 100%;

    .component-wrapper {
      overflow: hidden;
      border-top-right-radius: 18px !important;
      border-top-left-radius: 18px !important;
    }
  }
}
</style>
