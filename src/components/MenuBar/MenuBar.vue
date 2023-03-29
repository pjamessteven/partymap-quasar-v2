<template>
  <div class="flex row menubar" :style="computedStyle">
    <MenuBarLogo class="logo" v-if="$q.screen.lt.sm" />
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <MenuBarButtons />
    </transition>
  </div>
</template>

<script>
import MenuBarLogo from './MenuBarLogo.vue';
import MenuBarButtons from './MenuBarButtons.vue';
import { useMainStore } from 'stores/main';
import { mapState } from 'pinia';
// import SearchPopup from './SearchPopup'
export default {
  name: 'MenuBar',
  components: {
    MenuBarLogo,
    MenuBarButtons,
    // SearchPopup
  },

  data() {
    return {};
  },
  methods: {},
  computed: {
    ...mapState(useMainStore, ['showSidebar', 'menuBarOpacity']),
    transparentMenuBar() {
      return (
        this.$route.name === 'EventPage' ||
        this.$route.name === 'Explore' ||
        (this.$route.meta.fullscreenLayout === true && this.$q.screen.gt.xs)
      );
    },

    computedStyle() {
      var opacity = this.menuBarOpacity;
      return `opacity: ${opacity}`;
    },
  },
};
</script>

<style lang="scss" scoped>
/*
.body--dark {
}

.body--light {
}
*/
.menubar {
  //transition: opacity 0.15s;
  height: 62px;
  position: relative;

  .logo {
    position: absolute;
    opacity: 1;
    transition: opacity 0.3s ease;
    pointer-events: all;
  }
}
// sm
@media only screen and (max-width: 1023px) {
}
// xs
@media only screen and (max-width: 600px) {
  .body--dark {
    .menubar {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
  .body--light {
    .menubar {
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      //border-top: none;
      //border-bottom: none;
      box-shadow: none;
    }
  }
  .menubar {
    z-index: 1;

    &.search-expanded {
      .logo {
        opacity: 0;
      }
    }
  }
}
</style>
