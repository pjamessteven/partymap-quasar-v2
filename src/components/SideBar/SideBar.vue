<template>
  <div class="flex sidebar-wrapper">
    <div
      ref="sidebar"
      v-touch-swipe.mouse.up="!showPanel ? handleSwipe : null"
      class="flex column justify-between no-wrap sidebar"
      id="sidebar"
      v-bind:class="{
        'sidebar-mobile-expanded': showPanel,
        'sidebar-mobile-nearby': sidebarPanel === 'nearby' && $q.screen.gt.xs,
        'sidebar-mobile-expanded-fullscreen': sidebarPanel === 'favorites',
        'sidebar-mobile-hidden': $q.screen.lt.sm && $route.name === 'EventPage',
      }"
    >
      <!--
        <span
          v-if="$route.name === 'Explore' && sidebarPanel === 'nearby'"
          class="welcome-message inter bolder text-large q-mb-xl q-mt-lg"
          >Welcome to the global map of festivals and events!</span
        >
        -->
      <!--
      <MobileSwipeHandle
        @swipe="onMobileSwipeHandle($event)"
        v-show="$q.screen.lt.sm && sidebarPanel === 'explore'"
      />
      -->
      <div
        v-touch-swipe.mouse.down="
          enablePanelSwipeDown && showPanel ? handleSwipe : null
        "
        class="sidebar-content flex column no-wrap"
      >
        <NavigationBar
          @click="togglePanel"
          class="nav-bar"
          v-if="$q.screen.gt.xs && false"
        />
        <div
          style="height: 100%; width: 100%"
          class="sidebar-content-inner"
          @wheel="handleWheel"
        >
          <!--<div class="sidebar-content-inner-shadow" />-->
          <NearbyView
            style="height: 100%; width: 100%"
            v-if="sidebarPanel === 'nearby'"
          />

          <ExploreView
            style="height: 100%; width: 100%"
            v-if="sidebarPanel === 'explore'"
          />

          <FavoritesView
            style="height: 100%; width: 100%"
            v-if="sidebarPanel === 'favorites'"
          />

          <SearchView
            style="height: 100%; width: 100%"
            v-show="sidebarPanel === 'search'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ExploreView from './ExploreView/ExploreView.vue';
import SearchView from './SearchView/SearchView.vue';
import FavoritesView from './FavoritesView/FavoritesView.vue';
import NearbyView from './NearbyView/NearbyView.vue';
import NavigationBar from 'components/NavigationBar.vue';
import MobileSwipeHandle from '../MobileSwipeHandle.vue';
import { useAuthStore } from 'src/stores/auth';
import { mapState, mapWritableState } from 'pinia';
import { useMainStore } from 'src/stores/main';
import { useMapStore } from 'src/stores/map';
import { useQueryStore } from 'src/stores/query';

import WheelIndicator from 'wheel-indicator';

export default {
  components: {
    ExploreView,
    SearchView,
    NavigationBar,
    NearbyView,
    FavoritesView,
    //MobileSwipeHandle,
  },
  async mounted() {
    this.wheelIndicator = new WheelIndicator({
      elem: this.$refs.sidebar,
      callback: this.onMouseWheel,
      preventMouse: false,
    });
  },
  beforeUnmount() {
    this.wheelIndicator.destroy();
  },
  data() {
    return {
      lastx: 0,
      preventMapInteraction: false,
      wheelIndicator: null,
      pointerEvents: 'pointer-events: none;',
    };
  },
  methods: {
    handleWheel(event) {
      // safari behavior fix
      if (
        this.pointerEvents === 'pointer-events: none;' &&
        this.$q.platform.is.safari
      ) {
        event.preventDefault();
        return false;
      }
    },
    onMouseWheel(e) {
      const up = e.direction === 'up';
      const down = e.direction === 'down';
      console.log(e);
      if (e.wheelDeltaY > 2 || e.wheelDeltaY < -2)
        if (!this.showPanel && down) {
          // defined minimum sensitivity
          this.showPanel = true;
        } else if (this.enablePanelSwipeDown && up && !this.preventMapZoom) {
          this.preventMapZoom = true;
          this.showPanel = false;

          setTimeout(() => {
            // wait for animation - stop map from zooming uncontrolably

            this.preventMapZoom = false;
          }, 1000);

          if (
            this.sidebarPanel !== 'explore' &&
            this.sidebarPanel !== 'favorites' &&
            this.$q.screen.lt.sm
          ) {
            this.sidebarPanel = 'explore';
          }
          return false;
        }
    },

    hideDialog() {
      this.$router.push({ name: 'Explore' });
    },
    handleSwipe({ evt, ...info }) {
      if (info.direction === 'down' && this.showPanel) {
        this.showPanel = false;

        if (
          this.sidebarPanel !== 'explore' &&
          this.sidebarPanel !== 'favorites' &&
          this.$q.screen.lt.sm
        ) {
          this.sidebarPanel = 'explore';
        }
      } else {
        this.showPanel = true;
      }
    },
    togglePanel(event) {
      this.showPanel = !this.showPanel;

      if (
        this.sidebarPanel !== 'explore' &&
        this.sidebarPanel !== 'favorites'
      ) {
        this.sidebarPanel = 'explore';
      }
    },
    onMobileSwipeHandle(direction) {
      if (!direction) {
        this.showPanel = !this.showPanel;
      }

      if (this.sidebarPanel !== 'explore') {
        this.sidebarPanel = 'explore';
      }
      this.showPanel = !this.showPanel;
    },
  },
  watch: {
    showPanel(newv) {
      if (newv === true) {
        setTimeout(() => (this.pointerEvents = 'pointer-events: all;'), 350);
      } else {
        this.pointerEvents = 'pointer-events: none;';
      }
    },
    route(newv, oldv) {
      if (newv.name === 'Explore' && oldv.name === 'Explore') {
        // simulate route change back to nearby view
        this.sidebarPanel = 'nearby';
        this.showPanel = true;
      }
    },
    mapMoving() {
      if (this.view === 'nearby' && !this.loadingUserLocation) {
        this.view = 'explore';
      }
    },
    userLocation() {
      if (this.view === 'explore') {
        this.view = 'nearby';
      }
    },

    sidebarPanel(to, from) {
      if (from === 'explore') {
        /*
        this.eventDates = [];
        this.eventDatesGroupedByMonth = {};
        this.eventDatesLoading = true;
        */
      }
      if (to === 'explore') {
        this.showPanel = false;
        if (from === 'nearby') {
        }
      }
      if (to === 'search') {
        this.showPanel = true;
      }
      if (to === 'nearby') {
        if (this.$q.screen.lt.sm) {
          this.showPanel = true;
          this.enablePanelSwipeDown = true;
        } else {
          this.showPanel = false;
          this.enablePanelSwipeDown = true;
        }
      }
      if (to === 'favorites' || to === 'profile') {
        if (this.currentUser) {
          this.controlFavorites = true;
          this.showPanel = true;
        } else {
          this.sidebarPanel = from;

          this.$router.push({ name: 'Login' });
        }
      } else if (from === 'favorites') {
        this.controlFavorites = false;
      }
    },
  },
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
    ...mapState(useMainStore, ['userLocation', 'loadingUserLocation']),
    ...mapWritableState(useMainStore, [
      'showPanel',
      'sidebarPanel',
      'enablePanelSwipeDown',
    ]),
    ...mapState(useMapStore, ['mapMoving']),
    ...mapWritableState(useMapStore, ['preventMapZoom']),
    ...mapWritableState(useQueryStore, [
      'eventDates',
      'eventDatesGroupedByMonth',
      'eventDatesLoading',
    ]),
    route() {
      return this.$route;
    },
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .hover-indicator-line {
    background: rgba(255, 255, 255, 0.2);
  }

  .sidebar-wrapper {
    .sidebar {
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: $bi-1;

      :deep(.sidebar-header) {
        // background: black;
      }

      .handle {
        background: rgba(0, 0, 0, 1);
      }

      .sidebar-content {
        // background: $bi-2;
        //background: rgba(18, 18, 18, 0.68);
        //background: rgba(0, 0, 0, 0.4);

        //backdrop-filter: blur(10px);
        //color: white;

        :deep(.nav-bar) {
        }
      }
      .sidebar-content-inner {
        // background: black;
        //border: 1px solid rgba(255, 255, 255, 0.1);
        border-top: 1px solid rgba(255, 255, 255, 0.05);

        .sidebar-content-inner-shadow {
          background: $bi-1;
          z-index: -1 !important;
        }
      }
    }
  }
}

.body--light {
  .hover-indicator-line {
    background: rgba(0, 0, 0, 0.2);
  }
  .sidebar-wrapper {
    .sidebar {
      //box-shadow: rgb(38, 57, 77) 0px 8px 30px -10px;
      //box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 4px,
      // rgba(0, 0, 0, 0.15) 0px 7px 20px 3px,
      // rgba(0, 0, 0, 0.1) 0px -3px 0px inset;

      //box-shadow: rgba(50, 50, 105, 0.15) 0px 0px 5px 0px,
      //  rgba(0, 0, 0, 0.05) 0px 1px 1px 0px;
      box-shadow: rgba(100, 100, 100, 0.05) 0px 0px 10px 5px;

      background: white;
      border: 1px solid rgba(0, 0, 0, 0.1);

      .sidebar-content {
        //background: rgba(100, 100, 100, 0.2);
        //backdrop-filter: blur(10px);
        background: white;
        .sidebar-content-inner {
          //background: black;
          .sidebar-content-inner-shadow {
            //box-shadow: inset rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
            // heavy box-shadow: inset rgba(100, 100, 111, 0.1) 0px 7px 29px 0px;
            //box-shadow: inset rgba(100, 100, 100, 0.1) 0px 8px 10px -5px;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
          }
        }
      }
      .menubar {
        background: white;
        //border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        //box-shadow: rgba(100, 100, 111, 0.15) 0px 7px 29px 0px;
      }

      :deep(.sidebar-header) {
        color: $bi-1;

        background: white;
      }
    }
  }
}

.sidebar-wrapper {
  position: absolute;
  height: 100%;
  width: 100%;
  pointer-events: none;
  justify-content: center;
  display: flex;

  .sidebar {
    position: relative;
    flex-shrink: 0;
    z-index: 500;
    left: 0px;
    //box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.3);
    //box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,
    //  rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
    //box-shadow: rgba(99, 99, 99, 0.3) 0px 2px 8px 0px;
    max-height: 100%;
    transition: width 0.3s;
    overflow: hidden;
    height: 100%;
    pointer-events: all;
    border-top-left-radius: 18px;
    border-top-right-radius: 18px;
    transition: all 0.3s ease;
    transform: translate3d(0, calc(100% - 226px), 0);
    user-select: none;
    will-change: auto;
    padding-bottom: 64px;

    //box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 46px -6px,
    //  rgba(0, 0, 0, 0.2) 10px -10px 46px -6px,
    //  rgba(0, 0, 0, 0.2) -10px -10px 40px -6px !important;
    .sidebar-content {
      border-top-left-radius: 18px;
      border-top-right-radius: 18px;
      .sidebar-content-inner {
        border-top-left-radius: 18px;
        border-top-right-radius: 18px;
        overflow: hidden;
        isolation: isolate;
        .sidebar-content-inner-shadow {
          position: absolute;
          height: 100%;
          width: 100%;
          z-index: 1;
          pointer-events: none;
          border-top-left-radius: 18px;
          border-top-right-radius: 18px;
        }
      }
    }

    &.sidebar-mobile-nearby {
      transform: translate3d(0, calc(100% - 66vh), 0);
    }

    &.sidebar-mobile-expanded {
      transform: translate3d(0, 64px, 0);
    }

    &:not(.sidebar-mobile-expanded):hover {
      //transform: translate3d(0, 80px, 0) !important;
      // transform: translate3d(0, calc(100% - 286px), 0);
    }

    .welcome-message {
      color: white;
      text-align: center;
      text-shadow: 1px 1px 5px rgba(0, 0, 0, 1);
    }

    .menubar {
      position: relative;
      width: 100%;
    }

    :deep(.scroll-area) {
      overflow: hidden;
      .scroll-content {
        //padding-top: 32px;
      }
    }

    :deep(.sidebar-header) {
      padding-top: 8px;
      padding-bottom: 8px;
      color: white;
      //position: sticky;
      top: 0px;
      z-index: 99;
    }
    .sidebar-content {
      height: 100%;
      width: 100%;
      position: relative;

      overflow: hidden;
      //box-shadow: 0px 0px 64px 32px rgba(0, 0, 0, 0.2);
      .nav-bar {
        width: 100%;
        position: sticky;
        top: 0;
        z-index: 1000;
        border-top-right-radius: 18px;
        border-top-left-radius: 18px;
      }
      &.sidebar-desktop-expanded {
        padding: 0 16px;
      }

      :deep(.q-tab-panel) {
        padding: 0px;
        :deep(.panels) {
        }
      }

      :deep(.panels) {
        //-webkit-backface-visibility: hidden;
        //-webkit-transform: translate3d(0, 0, 0);
        width: 100%;
      }
    }
    .swipe-capture-overlay {
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: 501;
    }
  }
}

.hover-trigger {
  height: 100%;
  width: 40px;
  display: flex;
  position: absolute;
  z-index: 3000;
  pointer-events: auto;
  justify-content: center;
  align-items: center;
  align-content: center;
  .hover-indicator-wrapper {
    display: flex;

    .hover-indicator-line {
      height: 40px;
      width: 1px;
      margin-left: 2px;
    }
  }
}

/*
      if (this.$q.screen.gt.md) {
        return 'width: 66vw; min-width: 854px; max-width: 1024px';
      } else if (this.$q.screen.gt.sm) {
        return 'width: 66vw; min-width: 854px; max-width: 960px';
      } else if (this.$q.screen.gt.xs) {
        return 'width: 66vw; min-width: 640px; max-width: 100%';
      } else {
        return 'width: 100%';
      }
      */

@media only screen and (min-width: 600px) and (max-width: 1024px) {
  .sidebar-wrapper {
    .sidebar {
      width: 96vw;
      padding-bottom: 134px;
      &.sidebar-mobile-nearby {
        transform: translate3d(0, calc(100% - 60vh), 0);
      }
      &.sidebar-mobile-expanded {
        transform: translate3d(0, 134px, 0);
      }
    }
  }
}

@media only screen and (min-width: 1024px) {
  .sidebar-wrapper {
    .sidebar {
      width: 66vw;
      min-width: 920px;
      max-width: 1024px;
      padding-bottom: 96px;

      &.sidebar-mobile-expanded {
        transform: translate3d(0, 96px, 0);
      }
    }
  }
}

@media only screen and (min-width: 1080px) {
  .sidebar-wrapper {
    .sidebar {
      width: 66vw;
      max-width: 1024px;
    }
  }
}

@media only screen and (min-width: 1921px) {
  .sidebar-wrapper {
    .sidebar {
      max-width: 1280px;
      padding-bottom: 128px;
      transform: translate3d(0, calc(100% - 298px), 0);

      &.sidebar-mobile-expanded {
        transform: translate3d(0, 128px, 0);
      }
    }
  }
}
@media only screen and (max-width: 1024px) {
  .body--dark {
    .sidebar-wrapper {
      .hover-indicator-line {
      }
      .sidebar {
        border: none;
        box-shadow: none;
        border-top: 1px solid transparent;
        border-top: none;

        .sidebar-content {
          background: black;

          .sidebar-content-inner {
            .sidebar-content-inner-shadow {
              background: black;
            }
          }
        }
        :deep(.panels) {
          width: 100%;
        }
      }
    }
  }
  .body--light {
    .sidebar-wrapper {
      .sidebar {
        box-shadow: none;
        border: none;
        .sidebar-content {
          background: white;
          .sidebar-content-inner {
            .sidebar-content-inner-shadow {
              display: none;
            }
          }
        }
        :deep(.panels) {
          //box-shadow: 0px 0px 48px 32px rgba(0, 0, 0, 0.6);
          border-top: none !important;
        }
      }
    }
  }
}

@media only screen and (max-width: 600px) {
  .body--dark {
    .sidebar-wrapper {
      .hover-indicator-line {
      }
      .sidebar {
        //border: none;
        box-shadow: none;
        border-top: 1px solid $bi-4;
        //border-top: none;
        background: black;
        &.sidebar-mobile-expanded {
          border-top-color: black;
        }
        .sidebar-content {
          background: black;

          .sidebar-content-inner {
            .sidebar-content-inner-shadow {
              background: black;
            }
          }
        }
        :deep(.panels) {
          width: 100%;
        }
      }
    }
  }
  .body--light {
    .sidebar-wrapper {
      .sidebar {
        box-shadow: none;
        border-color: transparent;
        .sidebar-content {
          background: white;
          .sidebar-content-inner {
            .sidebar-content-inner-shadow {
              display: none;
            }
          }
        }
        :deep(.panels) {
          //box-shadow: 0px 0px 48px 32px rgba(0, 0, 0, 0.6);
          border-top: none !important;
        }
      }
    }
  }

  .sidebar-wrapper {
    padding: 0;
    overflow: hidden;
    box-shadow: none;
    .sidebar {
      box-shadow: none;

      width: 100%;
      background: transparent;
      //margin-top: 48px;
      transform: translate3d(0, calc(100% - 228px), 0);

      will-change: auto;
      padding-bottom: 188px;
      border-left: none;
      border-right: none;
      overflow: visible;

      &.sidebar-mobile-expanded {
        transform: translate3d(0, 120px, 0);
        //padding-bottom: 128px;
      }
      &.sidebar-mobile-expanded-fullscreen {
        transform: translate3d(0, 0px, 0);
        padding-bottom: 68px;
        border-top-left-radius: 0px;
        border-top-right-radius: 0px;
        .sidebar-content {
          border-top-left-radius: 0px;
          border-top-right-radius: 0px;
          .sidebar-content-inner {
            border-top-left-radius: 0px;
            border-top-right-radius: 0px;
          }
        }
      }
      &.sidebar-mobile-hidden {
        transform: translate3d(0, calc(100%), 0);
      }

      .sidebar-content {
        backdrop-filter: unset !important;
        padding-top: unset;
        background: none !important;

        .sidebar-content-inner {
          overflow: hidden;
          border-top: none !important;

          .sidebar-content-inner-shadow {
            //display: none;
          }
        }
      }
      :deep(.main-content) {
        padding-top: 0px;
      }

      .lights-wrapper {
        top: 70px;

        .lights-image {
          width: 100%;
        }
      }
    }
  }
}
</style>
