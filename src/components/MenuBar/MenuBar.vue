<template>
  <div class="flex row menubar justify-between items-center">
    <div class="menubar-background" :style="computedStyle" />
    <MenuBarLogo class="logo" :color="iconColor" v-if="!previousRouteName" />
    <div class="tab-wrapper" v-if="!previousRouteName && $q.screen.gt.xs">
      <NavigationBar :color="iconColor" />
    </div>
    <transition
      appear
      enter-active-class="animated fadeIn slow"
      leave-active-class="animated fadeOut"
    >
      <div
        class="back-button-wrapper flex items-center no-wrap"
        v-if="previousRouteName && this.$route.name !== 'Explore'"
      >
        <div class="separator vertical" v-if="$q.screen.gt.xs" />
        <q-btn
          class="back-button"
          flat
          icon="mdi-chevron-left"
          :label="previousRouteName"
          :color="iconColor"
          no-caps
          @click="back()"
        />
      </div>
    </transition>
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <MenuBarButtons :color="iconColor" class="right-buttons" />
    </transition>
  </div>
</template>

<script>
import MenuBarLogo from './MenuBarLogo.vue';
import MenuBarButtons from './MenuBarButtons.vue';
import NavigationBar from 'src/components/NavigationBar.vue';
import { useMainStore } from 'stores/main';
import { mapState, mapWritableState } from 'pinia';
import { StatusBar, Style } from '@capacitor/status-bar';

export default {
  name: 'MenuBar',
  components: {
    MenuBarLogo,
    MenuBarButtons,
    NavigationBar,
  },

  data() {
    return {};
  },
  watch: {
    iconColor(newv, oldv) {
      if (this.$q.platform.is.capacitor) {
        if (newv === 'black') {
          StatusBar.setStyle({ style: Style.Light });
        } else {
          StatusBar.setStyle({ style: Style.Dark });
        }
      }
    },
  },
  mounted() {
    if (this.$q.platform.is.capacitor) {
      // Display content under transparent status bar (Android only)
      StatusBar.setOverlaysWebView({ overlay: true });
    }
  },
  methods: {
    updateNav(val) {
      // sidebarpanel should always be set to something
      // if using vmodel it will change to null when route changes
      if (val) {
        this.sidebarPanel = val;
      }
    },
    back() {
      this.$router.go(-1);
    },
    getPreviousRouteName(previousRoute) {
      console.log('pte', previousRoute);
      if (
        this.$route.name === 'Explore' ||
        this.$route.name === 'BrowsePage' ||
        this.$route.name === 'UserPage'
      ) {
        return null;
      }
      if (previousRoute.name === 'Explore') {
        if (this.sidebarPanel === 'explore' || this.sidebarPanel === 'search') {
          return 'Back to results';
        } else if (this.sidebarPanel === 'nearby') {
          return 'Back home';
        } else if (this.sidebarPanel === 'profile') {
          return 'Back';
        } else return 'null';
      } else if (
        previousRoute.name === 'EventPage' ||
        previousRoute.name === 'ArtistPage'
      ) {
        return 'Back to ' + previousRoute.query.name.replace(/_/g, ' ');
      } else if (previousRoute?.meta['friendlyName']) {
        return previousRoute.meta['friendlyName'];
      } else {
        return 'Back';
      }
    },
  },
  computed: {
    ...mapState(useMainStore, [
      'showSidebar',
      'menubarOpacity',
      'routerHistory',
    ]),
    ...mapWritableState(useMainStore, ['sidebarPanel', 'showPanel']),

    ...mapWritableState(useMainStore, ['routerHistory']),

    previousRouteName() {
      if (this.routerHistory.length == 0) return null;
      const previousRoute = this.routerHistory[this.routerHistory.length - 1];
      if (previousRoute) {
        if (previousRoute.meta?.noBackNavigation) {
          return null;
        } else return this.getPreviousRouteName(previousRoute);
      } else return null;
    },
    transparentMenuBar() {
      return (
        this.$route.name === 'EventPage' ||
        this.$route.name === 'Explore' ||
        (this.$route.meta.fullscreenLayout === true && this.$q.screen.gt.xs)
      );
    },

    computedStyle() {
      if (this.$route.name === 'EventPage') {
        var opacity = this.menubarOpacity;
        if (this.$q.screen.gt.xs) {
          if (this.$q.dark.isActive) {
            return `opacity: ${opacity}; background: #181818!important; border-bottom: 1px solid rgba(255, 255, 255, 0.1);`;
          } else {
            return `opacity: ${opacity}; background: white!important; border-bottom: 1px solid rgba(0, 0, 0, 0.1);`;
          }
        } else {
          return `opacity: ${opacity}; background: black!important;`;
        }
      } else if (
        !this.$route.meta.mapOverlay ||
        (this.$q.screen.lt.sm && this.$route.name !== 'Explore')
      ) {
        return 'opacity: 1;  border: none!important';
      } /*else if (
        this.$route.name === 'Explore' &&
        this.$q.screen.gt.xs &&
        this.showPanel
      ) {
        // explore view
        if (this.$q.dark.isActive) {
          return 'background: black';
        } else {
          return 'background: white';
        }
      } */ else return 'opacity: 0';
    },
    iconColor() {
      if (
        (this.$route.name === 'EventPage' &&
          this.$q.screen.gt.xs &&
          this.menubarOpacity === 1 &&
          !this.$q.dark.isActive) ||
        (this.$route.name === 'Explore' &&
          !this.$q.dark.isActive &&
          this.$q.screen.gt.xs &&
          this.showPanel) ||
        (this.$route.name === 'Explore' &&
          !this.$q.dark.isActive &&
          this.$q.screen.lt.sm &&
          this.showPanel)
      ) {
        return 'black';
      } else if (
        this.$q.dark.isActive ||
        this.$route.name === 'EventPage' ||
        this.$route.name === 'Explore' ||
        (this.$route.meta.mapOverlay === true && this.$q.screen.gt.xs)
      ) {
        return 'white';
      } else {
        return 'black';
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .menubar {
    .menubar-background {
      background: black;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      //
    }
  }
}

.body--light {
  .menubar {
    .menubar-background {
      background: white;
      //`border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      //box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
      //box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
    }
  }
}

.menubar {
  //transition: opacity 0.15s;
  height: 64px;
  position: relative;
  transition: height 0.3s ease;

  .menubar-background {
    position: absolute;
    height: 100%;
    width: 100%;
    transition: all 0.3s ease;
  }
  .logo {
    z-index: 1;
    opacity: 1;
    transition: opacity 0.3s ease;
    pointer-events: all;
    min-height: 62px;
  }
  .tab-wrapper {
    pointer-events: all;
    position: absolute;
    left: 155px;
    top: 0px;
    height: 64px;
    display: flex;
    align-items: center;
  }

  .back-button-wrapper {
    position: absolute;
    left: 0px;
    .separator {
      height: 24px;
    }
    .back-button {
      opacity: 1;
      transition: opacity 0.3s ease;
      pointer-events: all;
      min-height: 64px;
      border-radius: 0px !important;
    }
  }

  .right-buttons {
    position: absolute;
    right: 0px;
    height: 100%;
  }
}
// sm
@media only screen and (max-width: 1023px) {
}
// xs
@media only screen and (max-width: 1023px) {
  .body--dark {
    .menubar {
      //border-top: 1px solid rgba(255, 255, 255, 0.1);
      .menubar-background {
        border-bottom: none;
      }
    }
  }
  .body--light {
    .menubar {
      //border-top: 1px solid rgba(0, 0, 0, 0.05);
      //border-top: none;
      //border-bottom: none;
      box-shadow: none;
      .menubar-background {
        border-bottom: none;
      }
    }
  }
  .menubar {
    height: 62px;
    z-index: 1;
    .back-button-wrapper {
      left: 0px;

      .back-button {
      }
    }
    &.search-expanded {
      .logo {
        opacity: 0;
      }
    }
  }
}
</style>
