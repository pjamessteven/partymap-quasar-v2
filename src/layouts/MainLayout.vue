<template>
  <div class="main-layout">
    <div class="map-container">
      <MainMap />
      <div
        class="map-overlay"
        :class="{
          'nearby-map-overlay-mobile': sidebarPanel === 'nearby',
          'map-overlay-mobile-minimized': sidebarMinimized,
        }"
      />
    </div>
    <div
      class="overlay"
      :class="overlayOpacityTransition ? 'overlay-transition' : ''"
      :style="computedOverlayStyle"
      @click="clickOverlay()"
    />
    <div class="main-inner-layout">
      <MenuBar class="menubar" />

      <!--<ControlsComponent v-if="$q.screen.lt.sm" class="controls-mobile" />-->
      <div
        class="sidebar-component-wrapper"
        :style="$q.screen.lt.md && computedSidebarOpacity"
      >
        <SearchComponent
          class="search-component"
          v-if="$q.screen.lt.md"
          :overlayingMap="!showPanelBackground"
        />
        <PopupSearchComponent
          v-if="false"
          class="search-component"
          :overlayingMap="!showPanelBackground"
        />
        <Transition
          appear
          :enter-active-class="
            $q.screen.gt.xs ? 'animated  fadeIn' : 'animated fadeIn'
          "
          :leave-active-class="
            $q.screen.gt.xs ? 'animated slideOutDown' : undefined
          "
        >
          <SideBar
            class="sidebar-component"
            v-show="
              $q.screen.lt.sm || ($q.screen.gt.xs && $route.name == 'Explore')
            "
            :class="{ hide: $q.screen.lt.sm && $route.name === 'EventPage' }"
          />
        </Transition>
        <div
          v-show="
            $q.screen.lt.sm || ($q.screen.gt.xs && $route.name == 'Explore')
          "
          class="sidebar-overlay"
          :style="computedSidebarOverlayStyle"
        />
      </div>

      <!-- There's two router views beca   we want different transitions for different pages
  and we're lazy... -->

      <router-view
        key="1"
        name="event"
        v-slot="{ Component }"
        class="main-layout-router event-router"
        v-bind:class="{
          'mobile-map-view-router': $q.screen.lt.sm,
        }"
      >
        <Transition
          :name="eventPageTransition && !disableAnimations ? 'event-page' : ''"
          :mode="
            eventPageTransition && !disableAnimations ? 'out-in' : undefined
          "
          :enter-active-class="
            eventPageTransition ? undefined : 'animated fadeIn'
          "
          :leave-active-class="
            eventPageTransition ? undefined : 'animated fadeOut'
          "
        >
          <component :is="Component" />
        </Transition>
      </router-view>
      <router-view
        key="2"
        v-slot="{ Component }"
        class="main-layout-router"
        v-bind:class="{
          'mobile-map-view-router': $q.screen.lt.sm,
        }"
      >
        <Transition
          :enter-active-class="
            $q.screen.gt.xs ? 'animated  fadeIn' : 'animated fadeIn'
          "
          :leave-active-class="
            $q.screen.gt.xs ? 'animated fadeOut' : 'animated fadeOut'
          "
          mode="in-out"
        >
          <keep-alive :include="['BrowsePage', 'UserPage']">
            <component :is="Component" />
          </keep-alive>
        </Transition>
      </router-view>
      <NavigationBar
        class="nav-bar"
        v-if="$q.screen.lt.sm"
        :style="
          $route.name === 'EventPage' ||
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
import MainMap from 'src/components/MainMap/MainMap.vue';
import SideBar from 'components/SideBar/SideBar.vue';
import MenuBar from 'components/MenuBar/MenuBar.vue';
import SearchComponent from 'src/components/Search/DesktopSearchComponent.vue';
import MenuBarLogo from 'src/components/MenuBar/MenuBarLogo.vue';
import NavigationBar from 'src/components/NavigationBar.vue';
import { mapWritableState } from 'pinia';
import { useMapStore } from 'src/stores/map';
import { useMainStore } from 'src/stores/main';
import { useEventStore } from 'src/stores/event';
import PopupSearchComponent from 'src/components/Search/PopupSearchComponent.vue';

export default {
  components: {
    MainMap,
    SideBar,
    MenuBar,
    MenuBarLogo,
    NavigationBar,
    SearchComponent,
    PopupSearchComponent,
  },
  data() {
    return {
      overlayOpacityTransition: true,
      eventPageTransition: false,
    };
  },
  methods: {
    clickOverlay() {
      this.showPanel = false;
      this.sidebarPanel = 'explore';
    },
  },
  beforeRouteUpdate(to, from, next) {
    if (from.name === 'Explore') {
      this.blockUpdates = true;
      // blockUpdates is re-enabled in Map.vue at map.
    }
    if (to.name === 'Explore') {
      this.sidebarOpacity = 1;
      setTimeout(() => {
        this.overlayOpacityTransition = true;

        //   this.blockUpdates = false; // not needed, causes problems with refreshoing list
      }, 500);
    }

    if (to.name === 'EventPage') {
      this.sidebarOpacity = 0;
      this.overlayOpacityTransition = false;
      if (from.name === 'Explore') {
        // dont transition to eventpage from explore/artist pages on desktop
        this.eventPageTransition = true;
      } else {
        this.eventPageTransition = false;
      }
    }
    if (from.name === 'EventPage') {
      this.sidebarOpacity = 1;

      if (to.name === 'Explore') {
        // dont transition to eventpage from explore/artist pages on desktop
        this.eventPageTransition = true;
      } else {
        this.eventPageTransition = false;
      }
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
      'showPanelBackground', //mobile only
      'sidebarPanel',
      'sidebarOpacity',
      'disableAnimations',
      'sidebarMinimized',
    ]),
    ...mapWritableState(useEventStore, ['event']),
    computedSidebarOpacity() {
      return `opacity: ${this.sidebarOpacity}`;
    },
    computedSidebarOverlayStyle() {
      if (!this.showPanelBackground) {
        return 'opacity: 0; pointer-events: none;';
      } else {
        return 'opacity: 1';
      }
    },
    computedOverlayStyle() {
      if (this.$route.name === 'EventPage') {
        if (this.$q.screen.lt.sm) {
          if (this.$q.dark.isActive) {
            return `opacity: ${this.overlayOpacity}; background: linear-gradient(black, black 50%, #060606 50%, #060606 100%)!important`;
          } else {
            return `opacity: ${this.overlayOpacity}; background: linear-gradient(black, black 50%, #f5f5f5 50%, #f5f5f5 100%)!important`;
          }
        } else {
          if (this.$q.dark.isActive) {
            return `opacity: ${this.overlayOpacity}; background: black!important`;
          } else {
            return `opacity: ${this.overlayOpacity}; background: #f5f5f5!important`;
          }
        }
      } else {
        if (
          this.$route.name !== 'Explore' &&
          this.$route.meta.mapOverlay === false &&
          this.$q.screen.gt.xs
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
    .sidebar-component-wrapper {
      .sidebar-overlay {
        background: black;
      }
    }
    .map-overlay {
      background: linear-gradient(
        rgba(0, 0, 0, 0.68),
        rgba(0, 0, 0, 0.6) 48px,
        transparent 112px,
        transparent calc(100vh - 348px),
        rgba(0, 0, 0, 0.68)
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
    .map-overlay {
      background: linear-gradient(
        rgba(0, 0, 0, 0.68),
        rgba(0, 0, 0, 0.6) 48px,
        transparent 112px,
        transparent calc(100vh - 348px),
        rgba(0, 0, 0, 0.68)
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
    .sidebar-component-wrapper {
      .sidebar-overlay {
        background: white;
      }
    }
  }
}

.main-layout {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;

  .map-container {
    z-index: 0;
    .map-overlay {
      z-index: 0;
      position: absolute;
      height: 100%;
      width: 100%;

      pointer-events: none;
    }
  }
  .overlay {
    z-index: 103;
    position: absolute;
    height: 100%;
    width: 100%;
    opacity: 0;
    pointer-events: none;
    //will-change: auto;
    cursor: grab;
    &.overlay-transition {
      transition: opacity 0.4s;
    }
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
      )
      and (max-width: 599px) {
      padding-top: calc(env(safe-area-inset-top) - 8px);
    }

    @supports (top: env(safe-area-inset-bottom)) {
      // we only really care about bottom padding when it's overlaying the nav bar
      //padding-bottom: calc(env(safe-area-inset-bottom) - 16px);
    }
    .sidebar-overlay {
      opacity: 1;
      transition: opacity 0.3s ease;
      z-index: 103;
      position: absolute;
      height: 100%;
      width: 100%;
      pointer-events: all;
      margin-top: calc(0px - var(--safe-area-inset-top)) !important;
    }

    .menubar {
      width: 100%;
      min-height: 62px !important;
      position: absolute;

      pointer-events: none;
      z-index: 5000;
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
    .sidebar-component-wrapper {
      position: relative;
      height: 100%;
      .sidebar-component {
        z-index: 104;
        opacity: 1;
        // transition: opacity 0.3s ease;
        /*
      &.hide {
        opacity: 0;
        pointer-events: none;
      }
      */
      }
    }
    .main-layout-router {
      position: absolute;
      height: 100%;
      width: 100%;
      z-index: 106;
      top: 0px;
      pointer-events: all;
    }
    .event-router {
      z-index: 4000 !important;
    }

    .mobile-map-view-router {
      z-index: 106;
    }
    .nav-bar {
      z-index: 3000 !important;
      opacity: 1;
      transition: opacity 4s;
    }
  }
}

@media only screen and (min-width: 600px) {
  // basic CSS transitions for desktop EventPage
  // mobile uses fancy useMotion/useGesture packages

  .event-page-enter-active {
    transform: translate3d(0, 0, 0) !important;
    transition: transform 0.3s ease-in-out;
    z-index: 5000;
    //opacity: 1;
  }

  .event-page-enter-from {
    transform: translate3d(0, 100vh, 0) !important;
  }

  .event-page-leave-to {
    z-index: 5000;

    transform: translate3d(
      0,
      calc(100vh - Max(calc((100vh - 66vh) - 64px), 0px)),
      0
    ) !important;
    transition: transform 0.2s ease-in-out !important;

    //opacity: 0;
  }
}
@media only screen and (max-width: 1024px) {
  .body--dark {
    .main-layout {
      .overlay {
        background: black;
      }
    }
  }
  .body--light {
    .main-layout {
      .overlay {
        background: white;
      }
    }
  }

  .native-mobile {
    .main-layout {
      .map-container {
        .map-overlay {
          background: linear-gradient(
            rgba(0, 0, 0, 1),
            rgba(0, 0, 0, 0.48) 148px,
            transparent 200px,
            transparent calc(100% - 274px),
            rgba(0, 0, 0, 0.68) calc(100% - 200px),
            rgba(0, 0, 0, 0.68) 100%
          );
          &.nearby-map-overlay-mobile {
            background: linear-gradient(
              rgba(0, 0, 0, 1),
              rgba(0, 0, 0, 0.48) 120px,
              rgba(0, 0, 0, 0.48) 200px,
              rgba(0, 0, 0, 0) 100%
            );
          }
          &.map-overlay-mobile-minimized {
            background: linear-gradient(
              rgba(0, 0, 0, 1),
              rgba(0, 0, 0, 0.48) 148px,
              transparent 200px,
              transparent calc(100% - 200px),
              rgba(0, 0, 0, 0.68) calc(100% - 128px),
              rgba(0, 0, 0, 0.68) 100%
            );
          }
        }
      }
    }
  }
  .main-layout {
    .map-container {
      .map-overlay {
        background: linear-gradient(
          rgba(0, 0, 0, 0.8),
          rgba(0, 0, 0, 0) 168px,
          transparent 200px,
          transparent calc(100% - 274px),
          rgba(0, 0, 0, 0.68) calc(100% - 200px),
          rgba(0, 0, 0, 0.68) 100%
        );
        //transition: background 0.2s ease;

        &.nearby-map-overlay-mobile {
          background: linear-gradient(
            rgba(0, 0, 0, 0.8),
            rgba(0, 0, 0, 0.4) 120px,
            rgba(0, 0, 0, 0.4) 200px,
            rgba(0, 0, 0, 0) 100%
          );
        }
        &.map-overlay-mobile-minimized {
          background: linear-gradient(
            rgba(0, 0, 0, 0.8),
            rgba(0, 0, 0, 0) 168px,
            transparent 200px,
            transparent calc(100% - 200px),
            rgba(0, 0, 0, 0.48) calc(100% - 128px),
            rgba(0, 0, 0, 0.48) 100%
          );
        }
      }
    }
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

    .main-inner-layout {
      .sidebar-component-wrapper {
        position: unset;
        height: unset;
        transition: opacity 0.3s ease;
        // will-change: opacity; breaks blur on controls
        //transform: translate3d(0, 0, 0);
        .search-component {
          position: absolute;

          z-index: 105;
          width: 100vw;
          max-width: 100vw;
          // android
          @supports ((top: var(--safe-area-inset-top))) {
            top: calc(68px + var(--safe-area-inset-top));
          }
          // ios specific padding
          @supports (
            (top: env(safe-area-inset-top)) and (font: -apple-system-body) and
              (-webkit-appearance: none)
          ) {
            top: calc(68px + env(safe-area-inset-top));
          }
        }
      }
    }
  }
  .native-mobile {
    .main-inner-layout {
      .sidebar-component-wrapper {
        // ios specific padding for capcaitor app
        .search-component {
          @supports (
            (top: env(safe-area-inset-top)) and (font: -apple-system-body) and
              (-webkit-appearance: none)
          ) {
            top: calc(68px + env(safe-area-inset-top) - 8px);
          }
        }
      }
    }
  }
}
</style>
