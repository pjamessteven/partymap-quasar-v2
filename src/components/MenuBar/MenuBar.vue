<template>
  <div
    class="flex row menubar justify-between items-center"
    :class="{
      iphone: $q.platform.is.iphone || $q.platform.is.ipod,
      ipad: $q.platform.is.ipad && $q.platform.is.capacitor,
    }"
  >
    <div
      class="menubar-background"
      :style="computedStyle"
      v-if="$q.screen.gt.xs || $route.name !== 'EventPage'"
    />

    <MenuBarLogo
      class="logo"
      :color="$q.screen.gt.xs ? leftIconColor : iconColor"
      v-if="!previousRouteName || swipingDownMenuPageMobile"
    />

    <div
      class="tab-wrapper flex items-center"
      v-if="!previousRouteName && $q.screen.gt.sm"
    >
      <div
        class="q-py-md q-mr-sm"
        v-if="$q.screen.gt.xs && false"
        style="height: 100%"
      >
        <div class="separator vertical" />
      </div>
      <NavigationBar :color="leftIconColor" />
    </div>
    <transition
      appear
      enter-active-class="animated fadeIn slow"
      leave-active-class="animated fadeOut"
    >
      <div
        class="back-button-wrapper flex items-center no-wrap"
        v-if="
          previousRouteName &&
          this.$route.name !== 'Explore' &&
          !swipingDownMenuPageMobile
        "
      >
        <div class="separator vertical" v-if="$q.screen.gt.xs" />
        <q-btn
          class="back-button"
          style="cursor: pointer"
          :ripple="false"
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
      <MenuBarButtons
        :color="iconColor"
        class="right-buttons"
        :onlyLogin="$q.screen.gt.xs"
      />
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
    if (this.$q.platform.is.ipad) {
      StatusBar.hide();
    } else if (this.$q.platform.is.capacitor) {
      if (this.iconColor === 'black') {
        StatusBar.setStyle({ style: Style.Light });
      } else {
        StatusBar.setStyle({ style: Style.Dark });
      }
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
      if (
        this.$route.name === 'Explore' ||
        this.$route.name === 'BrowsePage' ||
        this.$route.name === 'UserPage' ||
        !previousRoute
      ) {
        return null;
      }
      if (previousRoute.name === 'Explore') {
        if (this.sidebarPanel === 'explore' || this.sidebarPanel === 'search') {
          return this.$q.screen.lt.md ? 'Back' : 'Back to results';
        } else if (this.sidebarPanel === 'nearby') {
          return this.$q.screen.lt.md ? 'Back' : 'Back home';
        } else if (this.sidebarPanel === 'profile') {
          return this.$q.screen.lt.md ? 'Back' : 'Back';
        } else return 'null';
      } else if (
        previousRoute.name === 'EventPage' ||
        previousRoute.name === 'ArtistPage'
      ) {
        return this.$q.screen.lt.md
          ? 'Back'
          : 'Back to ' + previousRoute.query.name.replace(/_/g, ' ');
      } else if (previousRoute?.meta['friendlyName']) {
        return this.$q.screen.lt.md
          ? 'Back'
          : previousRoute.meta['friendlyName'];
      } else {
        return 'Back';
      }
    },
  },
  computed: {
    ...mapState(useMainStore, [
      'showSidebar',
      'menubarOpacity',
      'sidebarOpacity',
      'routerHistory',
    ]),
    ...mapWritableState(useMainStore, ['sidebarPanel', 'showPanel']),

    ...mapWritableState(useMainStore, ['routerHistory']),
    swipingDownMenuPageMobile() {
      return (
        this.$route.name === 'EventPage' &&
        this.$q.screen.lt.sm &&
        this.sidebarOpacity === 1
      );
    },
    previousRouteName() {
      if (this.routerHistory.length == 1) return null;
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
        this.$route.name === 'ArtistPage' ||
        this.$route.name === 'Explore' ||
        (this.$route.meta.fullscreenLayout === true && this.$q.screen.gt.xs)
      );
    },

    computedStyle() {
      if (
        this.$route.name === 'EventPage' ||
        this.$route.name === 'ArtistPage'
      ) {
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
    leftIconColor() {
      if (
        ((this.$route.name === 'EventPage' ||
          this.$route.name === 'ArtistPage') &&
          this.menubarOpacity === 1 &&
          !this.$q.dark.isActive) ||
        (this.$route.name === 'Explore' && !this.$q.dark.isActive)
      ) {
        return 'black';
      } else if (
        this.$q.dark.isActive ||
        this.$route.name === 'EventPage' ||
        this.$route.name === 'ArtistPage' ||
        this.$route.name === 'Explore' ||
        this.$route.meta.mapOverlay === true
      ) {
        return 'white';
      } else {
        return 'black';
      }
    },
    iconColor() {
      if (
        ((this.$route.name === 'EventPage' ||
          this.$route.name === 'ArtistPage') &&
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
          this.showPanel) ||
        (this.swipingDownMenuPageMobile &&
          !this.$q.dark.isActive &&
          this.showPanel)
      ) {
        return 'black';
      } else if (
        this.$q.dark.isActive ||
        this.$route.name === 'EventPage' ||
        this.$route.name === 'ArtistPage' ||
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
    .separator {
      border-color: rgba(255, 255, 255, 0.2);
    }
    .menubar-background {
      background: black;
      //border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      //
    }
  }
}

.body--light {
  .menubar {
    .separator {
      //   border-color: rgba(0, 0, 0, 0.2);
    }
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
  height: 72px;
  position: relative;
  transition: height 0.3s ease;
  padding-left: 8px;
  // android
  @supports ((top: var(--safe-area-inset-top))) {
    //padding-top: calc(env(safe-area-inset-top));
    //height: calc(env(safe-area-inset-top) + 62px);
    top: var(--safe-area-inset-top);
  }
  // ios specific top padding
  @supports (
    (top: var(--safe-area-inset-top)) and (font: -apple-system-body) and
      (-webkit-appearance: none)
  ) {
    top: calc(var(--safe-area-inset-top) - 0px);
  }

  &.ipad {
    top: 0px !important;
  }
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
    left: 164px;
    top: 0px;
    height: 72px;
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
    position: fixed;
    top: 0px;
    padding-left: unset;
    @supports ((top: var(--safe-area-inset-top))) {
      top: var(--safe-area-inset-top);
    }

    .menubar-background {
      @supports ((top: var(--safe-area-inset-top))) {
        padding-top: var(--safe-area-inset-top);
        height: calc(env(safe-area-inset-top) + 62px);
        position: fixed;
        top: 0px;
      }
    }

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

  .native-mobile {
    // ios specific padding for capcaitor app
    .menubar {
      .menubar-background {
        // android
        @supports ((top: var(--safe-area-inset-top))) {
          padding-top: var(--safe-area-inset-top);
          height: calc(env(safe-area-inset-top) + 100px);
          position: fixed;
          top: 0px;
        }
      }
      &.iphone {
        @supports ((top: var(--safe-area-inset-top))) {
          @media screen and (max-width: 375px) {
            //  iphone 7
            top: env(safe-area-inset-top);
          }
          @media screen and (min-width: 376px) {
            top: calc(env(safe-area-inset-top) - 8px);
          }
        }
        .menubar-background {
          @supports ((top: var(--safe-area-inset-top))) {
            @media screen and (max-width: 375px) {
              //  iphone 7
              padding-top: var(--safe-area-inset-top);
              height: calc(env(safe-area-inset-top) + 62px);
              top: 0px;
            }
            @media screen and (min-width: 376px) {
              padding-top: var(--safe-area-inset-top);
              height: calc(env(safe-area-inset-top) + 62px - 8px);
              position: fixed;
              top: 0px;
            }
          }
        }
      }
    }
  }
}
</style>
