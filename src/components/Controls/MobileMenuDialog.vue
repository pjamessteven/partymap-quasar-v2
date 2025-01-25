<template>
  <BackdropBlurDialog
    ref="dialog"
    transition-show="slide-up"
    transition-hide="slide-down"
    :model-value="showing"
    @hide="$emit('hide')"
  >
    <div class="flex column no-wrap menu">
      <DragWrapper
        :enableDrag="true"
        :hiddenYPosition="hiddenYPosition"
        @hide="$emit('hide')"
      >
        <MobileSwipeHandle @swipe="hide()" :solidBg="true" />

        <q-card class="card">
          <div class="component-wrapper">
            <slot />
          </div>
        </q-card>
      </DragWrapper>
    </div>
  </BackdropBlurDialog>
</template>

<script>
import BackdropBlurDialog from '../BackdropBlurDialog.vue';
import DragWrapper from '../DragWrapper.vue';
import MobileSwipeHandle from '../MobileSwipeHandle.vue';

export default {
  components: {
    MobileSwipeHandle,
    BackdropBlurDialog,
    DragWrapper,
  },
  props: ['showing'], // bit of a hack, passing slot as a prop
  data() {
    return {
      hiddenYPosition: window.innerHeight,
    };
  },
  watch: {},
  computed: {},
  methods: {},
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
  max-height: 600px;
  position: absolute;
  bottom: 0px;
  overflow: visible;
  border-radius: 0px !important;
  .card {
    border: none;
    flex-grow: 1;
    width: 100%;
    backdrop-filter: none;
    box-shadow: none;
    height: 100%;
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
    .component-wrapper {
      overflow: hidden;
      border-top-right-radius: 18px !important;
      border-top-left-radius: 18px !important;
    }
  }
}
</style>
