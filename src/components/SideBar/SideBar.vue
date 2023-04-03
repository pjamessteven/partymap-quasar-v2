<template>
  <div class="flex sidebar-wrapper">
    <div
      class="mobile-dismiss-list-background"
      :class="{ expanded: $q.screen.lt.sm && showPanelMobile }"
    />

    <Transition
      appear
      :enter-active-class="
        $q.screen.lt.sm ? 'animated ' : 'animated fast slideInLeft'
      "
      :leave-active-class="
        $q.screen.lt.sm
          ? 'animated slideOutDown'
          : 'animated  fast slideOutLeft'
      "
    >
      <div
        v-show="
          $q.screen.lt.sm ||
          ($q.screen.gt.md &&
            ($route.name === 'Explore' || $route.name === 'EventPage')) ||
          $route.name === 'Explore'
        "
        class="flex column justify-between no-wrap sidebar"
        :style="computedSidebarWidth"
        id="sidebar"
        elevated
        v-bind:class="{
          'sidebar-mobile-expanded': $q.screen.lt.sm && showPanelMobile,
          'sidebar-mobile-hidden':
            $q.screen.lt.sm && this.$route.name !== 'Explore',
        }"
      >
        <MenuBar class="menubar" v-if="$q.screen.gt.xs" />

        <!--
        <div
          class="mobile-dismiss-list q-py-md flex column text-h4 chicago q-pl-md"
          v-if="$q.screen.lt.sm"
          @click="handleSwipe"
          style="text-transform: capitalize"
          v-touch-swipe="handleSwipe"
        >
          {{ sidebarPanel }}
        </div>
-->
        <MobileSwipeHandle
          @swipe="onMobileSwipeHandle($event)"
          v-if="$q.screen.lt.sm"
        />

        <div
          class="sidebar-content flex column"
          :class="{
            'sidebar-desktop-expanded': $q.screen.gt.lg || this.sidebarExpanded,
          }"
        >
          <q-tab-panels
            keep-alive
            v-model="sidebarPanel"
            :animated="$q.screen.gt.xs"
            class="panels"
            style="height: 100%"
          >
            <q-tab-panel name="nearby">
              <NearbyView />
            </q-tab-panel>

            <q-tab-panel name="explore">
              <ExploreView
                style="position: absolute; height: 100%; width: 100%"
              />
            </q-tab-panel>

            <q-tab-panel name="favorites">
              <FavoritesView
                style="position: absolute; height: 100%; width: 100%"
              />
            </q-tab-panel>

            <q-tab-panel name="search">
              <SearchView
                style="position: absolute; height: 100%; width: 100%"
              />
            </q-tab-panel>
          </q-tab-panels>
          <NavigationBar class="nav-bar" v-if="$q.screen.gt.xs" />

          <div
            class="resizer flex row items-center"
            ref="resizer"
            v-if="$q.screen.gt.sm"
          >
            <q-icon name="las la-grip-lines-vertical" />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import ExploreView from './ExploreView/ExploreView.vue';
import SearchView from './SearchView/SearchView.vue';
import FavoritesView from './FavoritesView/FavoritesView.vue';
import NearbyView from './NearbyView/NearbyView.vue';
import NavigationBar from 'components/NavigationBar.vue';
import MenuBar from 'components/MenuBar/MenuBar.vue';

import { mapState, mapWritableState } from 'pinia';
import { useMainStore } from 'src/stores/main';
import { useMapStore } from 'src/stores/map';
import MobileSwipeHandle from '../MobileSwipeHandle.vue';
export default {
  components: {
    ExploreView,
    SearchView,
    MenuBar,
    NavigationBar,
    NearbyView,
    FavoritesView,
    MobileSwipeHandle,
  },
  async mounted() {
    if (this.$q.screen.gt.lg) {
      this.sidebarExpanded = true;
    }
    await this.$nextTick();
    this.$refs.resizer?.addEventListener('mousedown', () => {
      document.addEventListener('mousemove', this.resize, false);
      document.addEventListener(
        'mouseup',
        () => {
          document.removeEventListener('mousemove', this.resize, false);
        },
        false
      );
    });
    window.addEventListener('resize', () => {
      if (this.$q.screen.gt.lg) {
        this.sidebarExpanded = true;
      } else {
        this.sidebarExpanded = false;
      }
    });
  },
  data() {
    return {
      lastx: 0,
    };
  },
  methods: {
    resize(event) {
      console.log(this.$refs.psw.pswp);
      if (event.x > 360 && event.x > this.lastx && !this.sidebarExpanded) {
        this.sidebarExpanded = true;
      } else if (
        event.x < 690 &&
        event.x < this.lastx &&
        this.sidebarExpanded
      ) {
        this.sidebarExpanded = false;
      }
      this.lastx = event.x;
    },
    hideDialog() {
      this.$router.push({ name: 'Explore' });
    },
    handleSwipe({ evt, ...info }) {
      if (info.direction === 'down' || info.direction === 'up') {
        if (
          this.sidebarPanel !== 'explore' &&
          this.sidebarPanel !== 'favorites'
        ) {
          this.sidebarPanel = 'explore';
        }
        this.showPanelMobile = !this.showPanelMobile;
      } else {
        evt.preventDefault();
        evt.stopPropagation();
      }
    },
    onMobileSwipeHandle(direction) {
      if (
        (this.showPanelMobile && direction === 'down') ||
        (!this.showPanelMobile && direction === 'up')
      ) {
        if (this.sidebarPanel !== 'explore') {
          this.sidebarPanel = 'explore';
        }
        this.showPanelMobile = !this.showPanelMobile;
      }
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
  },
  computed: {
    ...mapState(useMainStore, ['userLocation', 'loadingUserLocation']),
    ...mapWritableState(useMainStore, [
      'sidebarExpanded',
      'showPanelMobile',
      'sidebarPanel',
    ]),
    ...mapState(useMapStore, ['mapMoving']),
    computedSidebarWidth() {
      if (this.$q.screen.lt.sm) {
        return 'width: 100%';
      } else if (this.sidebarExpanded && this.$q.screen.gt.sm) {
        return 'width: 800px;';
      } else {
        return 'width: 398px';
      }
    },
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
  .sidebar {
    background: black;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    .mobile-dismiss-list {
    }
    :deep(.content) {
    }

    :deep(.sidebar-header) {
      background: black;
    }

    .handle {
      background: rgba(0, 0, 0, 1);
    }
    .nav-bar {
      background: black;
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
  .sidebar {
    background: white;
    .mobile-dismiss-list {
      color: white;
    }

    :deep(.content) {
    }
    :deep(.sidebar-header) {
      color: $bi-2;
      background: white;
    }
    .nav-bar {
      background: white;
    }
  }
}

.sidebar-wrapper {
  position: absolute;
  height: 100%;
  width: 100%;
  pointer-events: none;
}

.sidebar {
  position: relative;
  flex-shrink: 0;
  z-index: 500;
  left: 0px;
  box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.2);
  max-height: 100%;
  transition: width 0.3s;
  overflow: hidden;
  height: 100%;
  pointer-events: all;

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
    padding-bottom: 16px;
    color: white;
    //position: sticky;
    top: 0px;
    z-index: 100;
  }
  .sidebar-content {
    height: 100%;
    width: 100%;
    padding-bottom: 72px;
    &.sidebar-desktop-expanded {
      padding: 0 16px;
    }
    :deep(.panels) {
      width: 100%;
    }
    :deep(.q-tab-panel) {
      padding: 0px;
    }
  }

  .mobile-dismiss-list {
    padding-top: 0px;
  }
  .nav-bar {
    width: 100%;
    position: absolute;
    bottom: 0;
  }

  .resizer {
    position: absolute;
    top: 50%;
    right: 0px;
    z-index: 5000;
    cursor: ew-resize;
    opacity: 0.48;
  }
  .swipe-capture-overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 501;
  }
}

.sidebar-mobile {
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

@media only screen and (max-width: 600px) {
  .body--dark {
    .hover-indicator-line {
    }
    .sidebar {
      box-shadow: none;

      :deep(.panels) {
        box-shadow: 0px 0px 48px 32px rgba(0, 0, 0, 0.6);
        border-top-right-radius: 18px;
        border-top-left-radius: 18px;
        width: 100%;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
      }
    }
  }
  .body--light {
    .sidebar {
      box-shadow: none;

      :deep(.panels) {
        //box-shadow: 0px 0px 48px 32px rgba(0, 0, 0, 0.6);
      }
    }
  }
  .sidebar-wrapper {
    padding: 0;
    .sidebar {
      box-shadow: 0px 0px 48px 32px rgba(0, 0, 0, 0.6);

      width: 100%;
      background: transparent;
      transition: all 0.3s ease;
      //margin-top: 48px;
      transform: translate3d(0, calc(100% - 320px), 0);
      border-top-right-radius: 18px;
      border-top-left-radius: 18px;
      will-change: transform;
      padding-bottom: 73px;
      border-left: none;
      border-right: none;
      overflow: visible;
      .sidebar-content {
        padding-top: unset;
      }
      :deep(.main-content) {
        padding-top: 0px;
      }
      :deep(.panels) {
        //box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.4);
        border-top-right-radius: 18px;
        border-top-left-radius: 18px;
        width: 100%;
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

  .sidebar-mobile-expanded {
    transform: translate3d(0, 80px, 0) !important;
    .mobile-dismiss-list {
      height: 200px;
    }
  }
  .sidebar-mobile-hidden {
    transform: translate3d(0, calc(100%), 0);
  }
}
</style>
