<template>
  <div class="flex sidebar-wrapper">
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
        <div
          class="mobile-dismiss-list q-py-md flex column"
          v-if="$q.screen.lt.sm"
          @click="handleSwipe"
          v-touch-swipe="handleSwipe"
        ></div>

        <div class="flex column menubar">
          <NavigationBar class="nav-bar" v-if="$q.screen.gt.xs" />

          <div class="logo-padding" />
        </div>

        <q-tab-panels
          keep-alive
          v-model="sidebarPanel"
          animated
          class="shadow-2 rounded-borders"
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

          <q-tab-panel name="search">
            <SearchView style="position: absolute; height: 100%; width: 100%" />
          </q-tab-panel>
        </q-tab-panels>

        <div
          class="resizer flex row items-center"
          ref="resizer"
          v-if="$q.screen.gt.sm"
        >
          <q-icon name="las la-grip-lines-vertical" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import ExploreView from './ExploreView/ExploreView.vue';
import SearchView from './SearchView/SearchView.vue';
import NearbyView from './NearbyView/NearbyView.vue';
import NavigationBar from 'components/NavigationBar.vue';
import { mapState, mapWritableState } from 'pinia';
import { useMainStore } from 'src/stores/main';
import { useMapStore } from 'src/stores/map';
export default {
  components: {
    ExploreView,
    SearchView,
    NavigationBar,
    NearbyView,
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
    handleSwipe() {
      if (this.sidebarPanel !== 'explore') {
        this.sidebarPanel = 'explore';
      }
      this.showPanelMobile = !this.showPanelMobile;
      // native Javascript event
    },
    handleSwipeDown() {
      this.showPanelMobile = !this.showPanelMobile;
      // native Javascript event
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
        return 'width: 736px;';
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
  .sidebar {
    background: black;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    .mobile-dismiss-list {
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
    }
    :deep(.content) {
    }

    :deep(.sidebar-header) {
      background: black;
    }

    .handle {
      background: rgba(0, 0, 0, 1);
    }
  }
}

.body--light {
  .hover-indicator-line {
    background: rgba(0, 0, 0, 0.2);
  }
  .sidebar {
    background: white;
    .mobile-dismiss-list {
      background: rgba(150, 150, 150, 0.2);
      color: white;
      backdrop-filter: blur(10px);
    }

    :deep(.content) {
      background: white;
    }
    :deep(.sidebar-header) {
      color: $bi-2;
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

  :deep(.q-tab-panel) {
    padding: 0px;
  }
  :deep(.main-content) {
    padding-top: 64px;
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
  :deep(.content) {
    width: 100%;
  }

  .mobile-dismiss-list {
    padding-top: 96px;
  }
  .nav-bar {
    position: absolute;
    top: 0px;
    right: 0px;
    height: 63px;
    width: 204px;
  }
  .handle {
    width: 100%;
    height: 32px;
    margin-top: -32px;
    border-top-left-radius: 18px;
    display: none;
    border-top-right-radius: 18px;
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
  .logo-padding {
    min-height: 63px;
    height: 63px;
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
      background: transparent;
    }
  }
  .body--light {
    .sidebar {
      box-shadow: none;
      background: transparent;
    }
  }
  .sidebar-wrapper {
    padding: 0;
    .sidebar {
      width: 100%;
      background: transparent;
      transition: all 0.3s ease;
      //margin-top: 48px;
      transform: translate3d(0, calc(100% - 320px), 0);
      //border-top-right-radius: 18px;
      //border-top-left-radius: 18px;
      will-change: transform;
      padding-bottom: 73px;
      overflow: hidden !important;
      border: none !important;
      :deep(.content) {
        //box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.4);

        //border-top-right-radius: 18px;
        //border-top-left-radius: 18px;
        overflow: hidden;
        width: 100%;
      }
      .logo-padding {
        display: none;
      }
      .lights-wrapper {
        top: 70px;

        .lights-image {
          width: 100%;
        }
      }
      .nav-bar {
        position: fixed;
        bottom: 0px;
        width: 100%;
        z-index: 100;
      }
      .mobile-dismiss-list {
        height: 100px;
        will-change: height;
        justify-content: flex-end;
        transition: all 0.3s;
      }
    }
  }

  .sidebar-mobile-expanded {
    //margin-top: 24px;
    transform: translate3d(0, 0, 0);
    .mobile-dismiss-list {
      height: 200px;
    }
  }
  .sidebar-mobile-hidden {
    transform: translate3d(0, calc(100%), 0);
  }
}
</style>
