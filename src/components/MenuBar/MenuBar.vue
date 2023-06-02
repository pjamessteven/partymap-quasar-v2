<template>
  <div class="flex row menubar">
    <div
      class="menubar-background"
      :style="computedStyle"
      v-if="
        !$route.meta.mapOverlay ||
        ($q.screen.lt.sm && this.$route.name !== 'Explore')
      "
    />
    <MenuBarLogo class="logo" />
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
    ...mapState(useMainStore, ['showSidebar', 'menubarOpacity']),
    transparentMenuBar() {
      return (
        this.$route.name === 'EventPage' ||
        this.$route.name === 'Explore' ||
        (this.$route.meta.fullscreenLayout === true && this.$q.screen.gt.xs)
      );
    },

    computedStyle() {
      if (this.$q.screen.lt.sm && this.$route.name === 'EventPage') {
        var opacity = this.menubarOpacity;
        return `opacity: ${opacity}; background: black!important`;
      } else if (
        !this.$route.meta.mapOverlay ||
        (this.$q.screen.lt.sm && this.$route.name !== 'Explore')
      ) {
        return 'opacity: 1';
      } else return 'opacity: 0';
    },
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .menubar {
    .menubar-background {
      background: black;
    }
  }
}

.body--light {
  .menubar {
    .menubar-background {
      background: white;
    }
  }
}

.menubar {
  //transition: opacity 0.15s;
  height: 62px;
  position: relative;
  .menubar-background {
    position: absolute;
    height: 100%;
    width: 100%;
  }
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
