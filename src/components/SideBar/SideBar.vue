<template>
  <div class="flex sidebar-wrapper">
    <!--
    <div
      class="hover-trigger"
      @mouseover="showSidebar = true"
      v-if="$q.screen.gt.sm"
    >
      <div class="hover-indicator-wrapper">
        <div class="hover-indicator-line" />
        <div class="hover-indicator-line" />
      </div>
    </div>
  -->
    <transition
      appear
      :enter-active-class="
        $q.screen.lt.sm ? 'animated ' : 'animated slideInLeft'
      "
      :leave-active-class="
        $q.screen.lt.sm ? 'animated slideOutDown' : 'animated slideOutLeft'
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
        >
          <!--
          <div class="flex items-center justify-center"
            <div class="swipe-nav-bar"></div>
          </div>
          -->
          <div
            class="chicago text-h4"
            :class="$q.screen.lt.sm ? 'q-pl-sm q-my-sm ' : 'q-pl-md q-mb-sm'"
          >
            <span v-if="sidebarPanel === 'favorites'">My favorites:</span>
            <span v-else> Explore </span>
          </div>
        </div>

        <div class="flex column menubar">
          <NavigationBar class="nav-bar" v-if="$q.screen.gt.xs" />

          <div class="logo-padding" />
        </div>

        <div style="height: 100%; width: 100%; overflow: hidden">
          <div
            style="
              position: relative;
              height: 100%;
              width: 100%;
              overflow: hidden;
            "
          >
            <transition
              :enter-active-class="
                $q.screen.gt.xs && !sidebarExpanded
                  ? enterTransition
                  : 'animated fadeIn'
              "
              :leave-active-class="
                $q.screen.gt.xs && !sidebarExpanded
                  ? leaveTransition
                  : 'animated fadeOut'
              "
            >
              <NearbyView
                v-show="currentSidebarPanel === 'nearby'"
                style="position: absolute; height: 100%; width: 100%"
              />
            </transition>

            <transition
              :enter-active-class="
                $q.screen.gt.xs && !sidebarExpanded
                  ? enterTransition
                  : 'animated fadeIn'
              "
              :leave-active-class="
                $q.screen.gt.xs && !sidebarExpanded
                  ? leaveTransition
                  : ' animated fadeOut '
              "
            >
              <EventDateListVertical
                class="event-date-list"
                style="position: absolute; height: 100%; width: 100%"
                v-if="
                  currentSidebarPanel === 'explore' ||
                  currentSidebarPanel === 'favorites'
                "
              />
            </transition>

            <transition
              :enter-active-class="
                $q.screen.gt.xs && !sidebarExpanded
                  ? enterTransition
                  : 'animated fadeIn'
              "
              :leave-active-class="
                $q.screen.gt.xs && !sidebarExpanded
                  ? leaveTransition
                  : 'animated fadeOut'
              "
            >
              <SearchView
                v-if="currentSidebarPanel === 'search'"
                style="position: absolute; height: 100%; width: 100%"
              />
            </transition>
          </div>
        </div>

        <div
          class="resizer flex row items-center"
          ref="resizer"
          v-if="$q.screen.gt.sm"
        >
          <q-icon name="las la-grip-lines-vertical" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import EventDateListVertical from './ExploreView/EventDateListVertical.vue';
import SearchView from './SearchView/SearchView.vue';
import NearbyView from './NearbyView/NearbyView.vue';
import NavigationBar from '/components/NavigationBar.vue';

export default {
  components: {
    EventDateListVertical,
    SearchView,
    NavigationBar,
    NearbyView,
  },
  mounted() {
    if (this.$q.screen.gt.lg) {
      this.sidebarExpanded = true;
    }
    this.$refs.resizer.addEventListener('mousedown', () => {
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
      enterTransition: 'animated fadeIn',
      leaveTransition: '',
      currentSidebarPanel: 'nearby',
    };
  },
  methods: {
    resize(event) {
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
      if (this.currentSidebarPanel !== 'explore') {
        this.currentSidebarPanel = 'explore';
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
    sidebarPanel: {
      handler: function (newval, oldval) {
        if (oldval === 'nearby') {
          // from nearby we always goes right
          this.enterTransition = 'animated slideInRight ';
          this.leaveTransition = 'animated slideOutLeft';
        } else if (oldval === 'explore' || oldval === 'favorites') {
          // we're in the middle, can go left or right
          if (newval === 'search') {
            this.enterTransition = 'animated slideInRight ';
            this.leaveTransition = 'animated slideOutLeft ';
          } else if (newval === 'nearby') {
            this.enterTransition = 'animated slideInLeft ';
            this.leaveTransition = 'animated slideOutRight ';
          }
        } else if (oldval === 'search') {
          // from search we always go left
          this.enterTransition = 'animated slideInLeft ';
          this.leaveTransition = 'animated slideOutRight ';
        }
        this.$nextTick(() => {
          this.currentSidebarPanel = newval;
        });
        // watch sidebar panel so we can derive the correct transition
        // before component view updates
      },
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
        return 'width: 370px';
      }
    },
    currentRoute() {
      return this.$router.currentRoute.name;
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
    //background: rgba(0, 0, 0, 1);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    background: $bi-2;
    .mobile-dismiss-list {
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
    }
    /deep/.content {
      background: black;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    /deep/.sidebar-header {
      background: $bi-2;
    }
    /*
    @supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {
      background: rgba(0, 0, 0, 0.9);
      -webkit-backdrop-filter: blur(10px);
      backdrop-filter: blur(10px);
    }
    */
    // border-right: 1px solid rgba(255, 255, 255, 0.1);
    .logo-padding {
      //border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      //background: black;
    }
    .handle {
      background: rgba(0, 0, 0, 1);
    }
  }
  /*
  @supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {
    .sidebar {
      background: -webkit-linear-gradient(
        rgba(0, 0, 0, 0.48),
        rgba(0, 0, 0, 68)
      );
      -webkit-backdrop-filter: blur(20px);
      backdrop-filter: blur(20px);
      border-right: none;
    }
  }
  */
}

.body--light {
  .hover-indicator-line {
    background: rgba(0, 0, 0, 0.2);
  }
  .sidebar {
    .mobile-dismiss-list {
      background: rgba(150, 150, 150, 0.2);
      color: white;
      backdrop-filter: blur(10px);
    }
    background: #fafafa;
    //background: rgba(80, 80, 80, 0.2);
    //backdrop-filter: blur(10px);
    /*
    @supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {
      background: rgba(255, 255, 255, 0.9);
      -webkit-backdrop-filter: blur(10px);
      backdrop-filter: blur(10px);
    }
    */
    /deep/.content {
      background: white;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
    }
    /deep/.sidebar-header {
      color: $bi-2;
      background: #fafafa;
    }
    .logo-padding {
      //background: white;
    }
    .handle {
      // background: rgba(255, 255, 255, 1);
    }
  }
  /*
  @supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {
    .sidebar {
      background: -webkit-linear-gradient(
        rgba(255, 255, 255, 0.68),
        rgba(255, 255, 255, 0.68)
      );
      -webkit-backdrop-filter: blur(10px) brightness(2);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.48);
      // border: none;
    }
  }
  */
}

.sidebar-wrapper {
  position: absolute;
  height: 100%;
  width: 100%;
  //z-index: 5000;
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
  /deep/.scroll-area {
    //border-radius: 18px;
    overflow: hidden;
    .scroll-content {
      padding-top: 32px;
    }
  }

  /deep/.sidebar-header {
    padding-top: 8px;
    padding-bottom: 16px;
    color: white;
    position: sticky;
    top: 0px;
    z-index: 100;
  }
  /deep/.content {
    width: 100%;
    //border-radius: 18px !important;
  }
  /*
  .menubar {
    position: absolute;
    top: 0px;
    width: 100%;
  }
  */
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

    // box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.15);
    //border-bottom: 1px solid rgba(0, 0, 0, 0.1);
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

      //border-top: 1px solid rgba(255, 255, 255, 0.1);
      background: transparent;
      /*
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      */
    }
  }
  .body--light {
    .sidebar {
      box-shadow: none;
      //border-top: 1px solid rgba(255, 255, 255, 0.1);
      background: transparent;
      /*
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      */
      /*
      @supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {
        background: rgba(255, 255, 255, 0.8);
      }
      */
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
      /deep/.content {
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
