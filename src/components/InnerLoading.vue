<template>
  <transition
    enter-active-class="animated fadeIn"
    leave-active-class="animated fadeOut"
  >
    <div
      class="inner-loading flex justify-center items-center"
      :class="solid ? 'solid' : ''"
    >
      <!--
      <q-spinner-ios color="$a.dark.isActive ? 'white' : 'black'" size="2em" />
      -->
      <q-linear-progress
        indeterminate
        size="2px"
        color="grey-7"
        rounded
        :style="$q.screen.gt.xs ? 'max-width: 200px' : 'max-width: 120px'"
      />
    </div>
  </transition>
</template>

<script>
export default {
  components: {},
  props: {
    solid: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
.body--light {
  .inner-loading {
    &.solid {
      background: white;
      backdrop-filter: none;
    }
  }
}
.body--dark {
  .inner-loading {
    &.solid {
      background: black;
      backdrop-filter: none;
    }
  }
}
.inner-loading {
  z-index: 2000;
  position: absolute;
  top: 0px;
  left: 0px;
  height: 100%;
  width: 100%;
}
</style>
