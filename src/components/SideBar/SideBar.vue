<template>
  <div class="flex sidebar-wrapper">
    <div
      class="mobile-dismiss-list-background"
      :class="{ expanded: showPanel }"
    />

    <div
      ref="sidebar"
      v-touch-swipe.mouse.up="!showPanel ? handleSwipe : null"
      class="flex column justify-between no-wrap sidebar"
      id="sidebar"
      v-bind:class="{
        'sidebar-mobile-expanded': showPanel,
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
      <MobileSwipeHandle
        @swipe="onMobileSwipeHandle($event)"
        v-if="$q.screen.lt.sm"
      />
      <div
        v-touch-swipe.mouse.down="
          enablePanelSwipeDown && showPanel ? handleSwipe : null
        "
        class="sidebar-content flex column no-wrap"
      >
        <NavigationBar @click="togglePanel" class="nav-bar" />
        <div style="height: 100%; width: 100%" class="sidebar-content-inner">
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
    MobileSwipeHandle,
  },
  async mounted() {
    this.wheelIndicator = new WheelIndicator({
      elem: this.$refs.sidebar,
      callback: this.onMouseWheel,
      preventMouse: false,
    });
  },
  data() {
    return {
      lastx: 0,
      preventMapInteraction: false,
      wheelIndicator: null,
    };
  },
  methods: {
    onMouseWheel(e) {
      const up = e.direction === 'up';
      const down = e.direction === 'down';
      if (!this.showPanel && down) {
        this.showPanel = true;
      } else if (
        this.enablePanelSwipeDown &&
        up &&
        !this.preventMapZoom &&
        this.sidebarPanel === 'explore'
      ) {
        this.preventMapZoom = true;
        this.showPanel = false;

        setTimeout(() => {
          // wait for animation - stop map from zooming uncontrolably

          this.preventMapZoom = false;
        }, 1000);

        if (
          this.sidebarPanel !== 'explore' &&
          this.sidebarPanel !== 'favorites'
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
          this.sidebarPanel !== 'favorites'
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
      if (to === 'explore') {
        this.eventDates = [];
        this.eventDatesGroupedByMonth = {};
        this.eventDatesLoading = true;
        this.showPanel = false;
      }
      if (to === 'search') {
        this.showPanel = true;
      }
      if (to === 'nearby') {
        this.showPanel = true;
        this.enablePanelSwipeDown = true;
      }
      if (to === 'favorites') {
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
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .hover-indicator-line {
    background: rgba(255, 255, 255, 0.2);
  }
  .mobile-dismiss-list-background {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
  }
  .sidebar-wrapper {
    .sidebar {
      :deep(.sidebar-header) {
        background: black;
      }

      .handle {
        background: rgba(0, 0, 0, 1);
      }

      .sidebar-content {
        background: black;
        :deep(.nav-bar) {
          background: $bi-2;
        }
      }
      .sidebar-content-inner {
        border-top: 1px solid rgba(255, 255, 255, 0.2);
      }
    }
  }
}

.body--light {
  .hover-indicator-line {
    background: rgba(0, 0, 0, 0.2);
  }
  .mobile-dismiss-list-background {
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
  }
  .sidebar-wrapper {
    .sidebar {
      .sidebar-content {
        background: white;
      }
      .sidebar-content-inner {
        border-top: 1px solid rgba(0, 0, 0, 0.2);
      }
      .menubar {
        background: white;
        //border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        //box-shadow: rgba(100, 100, 111, 0.15) 0px 7px 29px 0px;
      }
      .mobile-dismiss-list {
        color: white;
      }

      :deep(.sidebar-header) {
        color: $bi-2;

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
    box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.2);
    max-height: 100%;
    transition: width 0.3s;
    overflow: visible;
    height: 100%;
    pointer-events: all;
    border-top-left-radius: 9px;
    border-top-right-radius: 9px;
    transition: all 0.3s ease;
    transform: translate3d(0, calc(100% - 234px), 0);
    user-select: none;
    will-change: transform;
    padding-bottom: 96px;

    box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 46px -6px,
      rgba(0, 0, 0, 0.2) 10px -10px 46px -6px,
      rgba(0, 0, 0, 0.2) -10px -10px 40px -6px !important;

    .sidebar-content-inner {
    }
    &.sidebar-mobile-expanded {
      transform: translate3d(0, 96px, 0);
      .mobile-dismiss-list {
        height: 200px;
      }
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
      border-top-left-radius: 18px;
      border-top-right-radius: 18px;
      overflow: hidden;
      box-shadow: 0px 0px 64px 32px rgba(0, 0, 0, 0.2);

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

    .mobile-dismiss-list {
      padding-top: 0px;
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

@media only screen and (min-width: 600px) {
  .sidebar-wrapper {
    .sidebar {
      width: 90vw;
    }
  }
}

@media only screen and (min-width: 1024px) {
  .sidebar-wrapper {
    .sidebar {
      width: 66vw;
      min-width: 920px;
      max-width: 1024px;
    }
  }
}

@media only screen and (min-width: 1080px) {
  .sidebar-wrapper {
    .sidebar {
      width: 66vw;
      max-width: 1280px;
    }
  }
}

@media only screen and (min-width: 1920px) {
  .sidebar-wrapper {
    .sidebar {
      padding-bottom: 128px;
      transform: translate3d(0, calc(100% - 298px), 0);

      &.sidebar-mobile-expanded {
        transform: translate3d(0, 128px, 0);
      }
    }
  }
}
@media only screen and (max-width: 600px) {
  .body--dark {
    .hover-indicator-line {
    }
    .sidebar {
      box-shadow: none;

      :deep(.panels) {
        box-shadow: 0px 0px 48px 32px rgba(0, 0, 0, 0.6);
        width: 100%;
      }
    }
  }
  .body--light {
    .sidebar {
      box-shadow: none;

      :deep(.panels) {
        //box-shadow: 0px 0px 48px 32px rgba(0, 0, 0, 0.6);
        border-top: none !important;
      }
    }
  }

  .sidebar-wrapper {
    padding: 0;
    overflow: hidden;

    .sidebar {
      box-shadow: 0px 0px 48px 32px rgba(0, 0, 0, 0.6);

      width: 100%;
      background: transparent;
      //margin-top: 48px;
      transform: translate3d(0, calc(100% - 248px), 0);

      will-change: transform;
      padding-bottom: 73px;
      border-left: none;
      border-right: none;
      overflow: visible;

      &.sidebar-mobile-expanded {
        transform: translate3d(0, 80px, 0);
        .mobile-dismiss-list {
          height: 200px;
        }
      }
      &.sidebar-mobile-hidden {
        transform: translate3d(0, calc(100%), 0);
      }

      .sidebar-content {
        padding-top: unset;
        .sidebar-content-inner {
          overflow: hidden;
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

      .mobile-dismiss-list {
        height: 100px;
        will-change: height;
        justify-content: flex-end;
        transition: all 0.3s;
      }
    }
    .mobile-dismiss-list-background {
      display: none;
      transition: all 0.2s ease;
      width: 100%;
      z-index: 1;
      height: 200px;
      //margin-top: 48px;
      transform: translate3d(0, calc(100% + 240px), 0);
      //border-top-right-radius: 18px;
      //border-top-left-radius: 18px;
      position: absolute;
      //top: calc(100% - 320px);

      will-change: transform;
      &.expanded {
        transform: translate3d(0, 0, 0) !important;
      }
    }
  }
}
</style>
