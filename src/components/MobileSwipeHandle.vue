<template>
  <div
    @click="this.$emit('swipe', undefined)"
    v-touch-swipe.mouse.vertical="handleSwipe"
    :class="{ 'solid-bg': solidBg }"
    class="handle-container flex justify-center items-center q-py-md"
  >
    <div class="handle-container-bg" />
    <div class="handle" />
  </div>
</template>

<script>
export default {
  props: ['solidBg'],

  data() {
    return {
      menuShowing: false,
    };
  },
  methods: {
    handleSwipe({ ...info }) {
      this.$emit('swipe', info.direction);
    },
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .handle-container {
    .handle-container-bg {
      border-top: 1px solid rgba(255, 255, 255, 0.4) !important;

      //background: rgba(24, 24, 24, 0.48);
      //backdrop-filter: blur(10px);
    }
    .handle {
      background: rgba(255, 255, 255, 0.8);
    }
    &.solid-bg {
      .handle-container-bg {
        background: black;
      }
      .handle {
        background: rgba(255, 255, 255, 0.4);
      }
    }
  }
}
.body--light {
  .handle-container {
    .handle-container-bg {
      border-top: 1px solid rgba(255, 255, 255, 0.4) !important;

      //background: rgb(26,26,26);
      //backdrop-filter: blur(10px);
    }
    .handle {
      background: rgba(255, 255, 255, 1);
    }
    &.solid-bg {
      .handle-container-bg {
        background: #fafafa;
      }
      .handle {
        background: rgba(0, 0, 0, 0.2);
      }
    }
  }
}
.handle-container {
  display: flex;
  position: relative;
  top: 0px;
  width: 100%;
  height: 16px;
  pointer-events: all;

  .handle-container-bg {
    overflow: hidden;
    border-top-right-radius: 18px;
    border-top-left-radius: 18px;
    position: absolute;
    width: 100%;
    height: 64px;
    top: 0px;
  }
  .handle {
    z-index: 1;

    height: 2px;
    width: 32px;
  }
}
</style>
