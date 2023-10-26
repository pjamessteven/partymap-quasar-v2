<template>
  <div class="main-layout">
    <MainMap />
    <div class="default-overlay" />
    <div
      class="overlay"
      :style="computedOverlayStyle"
      @click="clickOverlay()"
    />
    <div class="main-inner-layout">
      <MenuBar class="menubar" />

      <!--<ControlsComponent v-if="$q.screen.lt.sm" class="controls-mobile" />-->
      <Transition
        appear
        :enter-active-class="
          $q.screen.gt.xs ? 'animated  slideInLeft' : 'animated fadeIn'
        "
        :leave-active-class="
          $q.screen.gt.xs ? 'animated slideOutLeft' : undefined
        "
      >
        <SideBar
          class="sidebar-component"
          v-show="
            $q.screen.lt.sm || ($q.screen.gt.xs && $route.name == 'Explore')
          "
        />
      </Transition>

      <SearchComponent
        v-show="
          (false && $route.name === 'Explore') ||
          ($q.screen.gt.sm && $route.name === 'BrowsePage')
        "
      />
      <!-- There's two router views because we want different transitions for different pages
  and we're lazy... -->
      <router-view
        name="event"
        v-slot="{ Component }"
        class="main-layout-router"
        v-bind:class="{
          'mobile-map-view-router': $q.screen.lt.sm,
        }"
      >
        <transition
          enter-active-class="animated slideInUp"
          leave-active-class="animated slideOutDown"
        >
          <component :is="Component" />
        </transition>
      </router-view>
      <router-view
        v-slot="{ Component }"
        class="main-layout-router"
        v-bind:class="{
          'mobile-map-view-router': $q.screen.lt.sm,
        }"
      >
        <transition
          :enter-active-class="
            $q.screen.lt.sm ? 'animated fadeIn' : 'animated fadeIn'
          "
          :leave-active-class="
            $q.screen.lt.sm ? 'animated fadeOut' : 'animated fadeOut'
          "
        >
          <component :is="Component" />
        </transition>
      </router-view>
      <NavigationBar
        class="nav-bar"
        v-if="$q.screen.lt.sm"
        :style="
          $route.name === 'Explore' ||
          $route.name === 'UserPage' ||
          $route.name === 'BrowsePage'
            ? ''
            : 'display: none'
        "
      />
    </div>
  </div>
</template>

<script lang="ts">
import MainMap from 'components/MainMap/MainMap.vue';
import SideBar from 'components/SideBar/SideBar.vue';
import MenuBar from 'components/MenuBar/MenuBar.vue';
import SearchComponent from 'src/components/Search/SearchComponent.vue';
import MenuBarLogo from 'src/components/MenuBar/MenuBarLogo.vue';
import NavigationBar from 'src/components/NavigationBar.vue';
import { mapWritableState } from 'pinia';
import { useMapStore } from 'src/stores/map';
import { useMainStore } from 'src/stores/main';
import { SafeAreaController } from '@aashu-dubey/capacitor-statusbar-safe-area';
import { SafeArea } from '@aashu-dubey/capacitor-statusbar-safe-area';

export default {
  components: {
    MainMap,
    SideBar,
    MenuBar,
    MenuBarLogo,
    NavigationBar,
    SearchComponent,
  },
  data() {
    return {
      androidStatusbarHeight: 0,
      insets: {},
    };
  },
  methods: {
    clickOverlay() {
      this.showPanel = false;
      this.sidebarPanel = 'explore';
    },
  },
  async beforeMount() {
    // this package is specifically to get the statusbar padding on android
    SafeAreaController.injectCSSVariables();
    const { height } = await SafeArea.getStatusBarHeight();
    this.androidStatusbarHeight = height;
    const insets = await SafeArea.getSafeAreaInsets();
    this.insets = insets;
  },
  beforeRouteUpdate(to, from, next) {
    if (from.name === 'Explore') {
      this.blockUpdates = true;
      // blockUpdates is re-enabled in Map.vue at map.
    }
    if (to.name === 'Explore') {
      setTimeout(() => (this.blockUpdates = false), 500);
    }
    this.$nextTick(() => {
      next();
    });
  },
  computed: {
    ...mapWritableState(useMapStore, ['blockUpdates']),
    ...mapWritableState(useMainStore, [
      'showSidebar',
      'overlayOpacity',
      'showPanel',
      'sidebarPanel',
    ]),
    computedOverlayStyle() {
      if (this.$route.name === 'EventPage') {
        if (this.$q.screen.lt.sm) {
          return `opacity: ${this.overlayOpacity}; background: black!important`;
        } else {
          if (this.$q.dark.isActive) {
            return `opacity: ${this.overlayOpacity}; background: black!important`;
          } else {
            return `opacity: ${this.overlayOpacity}; background: #f5f5f5!important`;
          }
        }
      } else {
        if (
          (this.showPanel && this.$route.name === 'Explore') ||
          (this.$q.screen.lt.md && this.showPanel) ||
          (this.$route.name !== 'Explore' &&
            this.$route.meta.mapOverlay === false)
        )
          return 'opacity: 1; pointer-events: all';
        else return 'opacity: 0';
      }
    },
  },
};
</script>
<style lang="scss">
.body--dark {
  .main-layout {
    .default-overlay {
      background: linear-gradient(
        rgba(0, 0, 0, 0.68),
        rgba(0, 0, 0, 0.6) 48px,
        transparent 128px,
        transparent
      );
    }
    .overlay {
      //background: linear-gradient($bi-2, $bi-2 62px, black 62px, black);
      background: black;
      //background: linear-gradient(transparent 5%, white 15%);
      /*
      background: linear-gradient(
        rgba(0, 0, 0, 0.78) 0px,
        rgba(0, 0, 0, 0.78) 64px,
        rgba(0, 0, 0, 0.58) 128px,
        rgba(0, 0, 0, 0) calc(100% - 256px),
        rgba(0, 0, 0, 0.78) 100%
      );
      */
    }
  }
}
.body--light {
  .main-layout {
    .default-overlay {
      background: linear-gradient(
        rgba(0, 0, 0, 0.68),
        rgba(0, 0, 0, 0.6) 48px,
        transparent 112px,
        transparent
      );
    }
    .overlay {
      //background: linear-gradient(#fafafa, #fafafa 64px, white 64px, white);
      background: white;
      //backdrop-filter: blur(2px);
      //background: linear-gradient(transparent 5%, white 15%);
      /*
      background: linear-gradient(
        rgba(0, 0, 0, 0.48) 0px,
        rgba(0, 0, 0, 0.48) 64px,
        rgba(0, 0, 0, 0.3) 128px,
        rgba(0, 0, 0, 0) calc(100% - 256px),
        rgba(0, 0, 0, 0.48) 100%
      );*/
    }
  }
  .splash-screen {
    background: green;
  }
}

.main-layout {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;

  .default-overlay {
    z-index: 103;
    position: absolute;
    height: 100%;
    width: 100%;

    pointer-events: none;
  }
  .overlay {
    z-index: 103;
    position: absolute;
    height: 100%;
    width: 100%;
    opacity: 0;
    pointer-events: none;
    //will-change: auto;
    transition: opacity 0.3s;
    cursor: grab;
    @supports (font: -apple-system-body) and (-webkit-appearance: none) {
      -webkit-backface-visibility: hidden;
      -webkit-transform: translate3d(0, 0, 0);
      // translate3d is a hack for safari to force gpu rendering of blur()
    }
  }
  .main-inner-layout {
    height: 100%;
    pointer-events: none;
    width: 100%;
    // android
    @supports ((top: var(--safe-area-inset-top))) {
      padding-top: var(--safe-area-inset-top);
    }
    // ios specific top padding
    @supports (
      (top: env(safe-area-inset-top)) and (font: -apple-system-body) and
        (-webkit-appearance: none)
    ) {
      padding-top: calc(env(safe-area-inset-top) - 8px);
    }
    @supports (top: env(safe-area-inset-bottom)) {
      // we only really care about bottom padding when it's overlaying the nav bar
      //padding-bottom: calc(env(safe-area-inset-bottom) - 16px);
    }

    .menubar {
      width: 100%;
      min-height: 62px !important;
      position: absolute;
      z-index: 1000 !important;
      pointer-events: none;
      z-index: 102;
    }
    .menubar-logo {
      position: absolute;
      z-index: 1000;
    }
    .controls-mobile {
      position: absolute;
      z-index: 103;
      top: 64px;
      width: 100%;
    }
    .sidebar-component {
      z-index: 104;
    }
    .main-layout-router {
      position: absolute;
      height: 100%;
      width: 100%;
      z-index: 105;
      top: 0px;
      pointer-events: all;
    }
    .mobile-map-view-router {
      z-index: 104;
    }
    .nav-bar {
      opacity: 1;
      transition: opacity 4s;
    }
  }
}
@media only screen and (max-width: 1024px) {
  .body--dark {
    .main-layout {
      .overlay {
        background: black;
      }
      .default-overlay {
        background: linear-gradient(
          rgba(0, 0, 0, 0.68),
          rgba(0, 0, 0, 0.6) 62px,
          transparent 128px,
          transparent calc(100% - 274px),
          rgba(0, 0, 0, 0.68) calc(100% - 200px),
          rgba(0, 0, 0, 0.68) 100%
        );
      }
    }
  }
  .body--light {
    .main-layout {
      .overlay {
        background: white;
      }
      .default-overlay {
        background: linear-gradient(
          rgba(0, 0, 0, 0.68),
          rgba(0, 0, 0, 0.6) 62px,
          transparent 128px,
          transparent calc(100% - 274px),
          rgba(0, 0, 0, 0.68) calc(100% - 200px),
          rgba(0, 0, 0, 0.68) 100%
        );
      }
    }
  }
  .main-layout {
    .main-layout-router {
      padding-top: calc(62px + var(--safe-area-inset-top));
      // ios specific top padding
      @supports (
        (top: env(safe-area-inset-top)) and (font: -apple-system-body) and
          (-webkit-appearance: none)
      ) {
        padding-top: calc(62px + var(--safe-area-inset-top) - 8px);
      }

      @supports (top: env(safe-area-inset-bottom)) {
        // we only really care about bottom padding when it's overlaying the nav bar
        // padding-bottom: calc(env(safe-area-inset-bottom) - 16px);
      }
    }

    .overlay {
      // transition: opacity 0.3s;
    }
  }
}
</style>
