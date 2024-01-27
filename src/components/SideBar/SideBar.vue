<template>
  <div class="flex sidebar-wrapper">
    <div
      ref="sidebar"
      v-touch-swipe.mouse.up="
        !showPanel && this.sidebarPanel === 'explore' ? handleSwipe : null
      "
      class="flex justify-between no-wrap sidebar"
      id="sidebar"
      :style="computedSidebarWidth"
      v-bind:class="{
        shadow: $q.screen.gt.xs,
        'sidebar-mobile-expanded': showPanel && $q.screen.lt.sm,
        'sidebar-mobile-nearby': sidebarPanel === 'nearby' && $q.screen.gt.xs,
        'sidebar-mobile-hidden': $q.screen.lt.sm && $route.name === 'EventPage',
      }"
    >
      <div
        v-touch-swipe.mouse.down="
          enablePanelSwipeDown && this.sidebarPanel === 'explore' && showPanel
            ? handleSwipe
            : null
        "
        class="sidebar-content flex column no-wrap"
      >
        <div
          class="add-event-wrapper items-center flex justify-center q-px-md"
          v-if="$route.name === 'Explore' && $q.screen.gt.xs"
          style="height: 72px"
        >
          <q-btn
            v-if="false"
            class="inter o-070"
            no-caps
            flat
            @click="showAddEventDialog"
            >Submit
            <q-icon name="mdi-plus" class="q-ml-sm" size="1rem" />
          </q-btn>
          <q-btn
            v-if="false"
            flat
            no-caps
            class="inter nav-button q-ml-sm"
            @click.stop="() => getFineLocation()"
          >
            <template v-slot:default>
              <div v-if="!userLocationLoading" class="flex items-center">
                <q-icon
                  name="mdi-crosshairs-gps"
                  class=""
                  size="1rem"
                  v-if="fineLocation && !userLocationFromSearch"
                />
                <q-icon name="mdi-crosshairs" size="1rem" class="" v-else />
              </div>
              <div v-else style="position: relative" class="flex items-center">
                <q-icon style="z-index: 1" name="mdi-crosshairs" size="1rem" />
                <q-icon
                  style="z-index: 2; left: 0px"
                  size="1rem"
                  class="animated infinite flash slowest absolute"
                  name="mdi-crosshairs-gps"
                />
              </div>
              <q-tooltip
                style="font-size: 1em !important"
                :content-class="
                  $q.dark.isActive
                    ? 'bg-black text-white'
                    : 'bg-white text-black'
                "
                :offset="[10, 10]"
              >
                <span v-if="!fineLocation">
                  Using rough location from your IP address. Click to improve
                  your location.
                </span>
                <span v-else>
                  {{ $t('landing_page.improve_location') }}
                </span>
              </q-tooltip>
            </template>
          </q-btn>
          <q-btn
            v-if="!onlyLogin"
            class="menubar-button"
            icon="mdi-menu"
            flat
            :class="{
              'light-button': color === 'white',
            }"
            style="position: relative"
          >
            <q-menu
              transition-show="jump-down"
              transition-hide="jump-up"
              anchor="bottom right"
              self="top right"
              class="main-menu"
              max-height="100vh"
            >
              <TopControlsMenu :noUserItems="true" />
            </q-menu>
            <q-tooltip
              :content-class="
                $q.dark.isActive ? 'bg-black text-white' : 'bg-white text-black'
              "
              :offset="[10, 10]"
              content-style="font-size: 16px"
            >
              {{ $t('sidebar.more') }}
            </q-tooltip>
          </q-btn>
        </div>

        <SearchComponent class="search-component" v-if="$q.screen.gt.xs" />
        <div style="height: 100%; width: 100%" class="sidebar-content-inner">
          <NearbyView
            style="height: 100%; width: 100%"
            v-if="sidebarPanel === 'nearby'"
          />
          <ExploreView
            style="height: 100%; width: 100%"
            v-show="sidebarPanel === 'explore'"
          />
          <SearchView
            style="height: 100%; width: 100%"
            v-show="sidebarPanel === 'search'"
          />
        </div>
        <NavigationBar
          @click="togglePanel"
          class="nav-bar"
          v-if="$q.screen.gt.xs && $q.screen.lt.md"
        />
      </div>
      <div
        class="resizer flex row items-center"
        ref="resizer"
        v-if="$q.screen.gt.lg"
      >
        <q-icon name="las la-grip-lines-vertical" />
      </div>
    </div>
  </div>
</template>

<script>
import SearchComponent from 'src/components/Search/SearchComponent.vue';
import AddEventDialog from 'components/dialogs/AddEventDialog.vue';
import TopControlsMenu from 'components/MenuBar/TopControlsMenu.vue';
import NavigationBar from 'components/NavigationBar.vue';

import ExploreView from './ExploreView/ExploreView.vue';
import SearchView from './SearchView/SearchView.vue';
import NearbyView from './NearbyView/NearbyView.vue';
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
    NearbyView,
    //MobileSwipeHandle,
    SearchComponent,
    TopControlsMenu,
    NavigationBar,
  },
  async mounted() {
    /*
    this.wheelIndicator = new WheelIndicator({
      elem: this.$refs.sidebar,
      callback: this.onMouseWheel,
      preventMouse: false,
    });
    */
    if (this.$refs.resizer)
      this.$refs.resizer.addEventListener('mousedown', (event) => {
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
        //this.sidebarExpanded = true;
      } else {
        //this.sidebarExpanded = false;
      }
    });
  },
  unmounted() {
    if (this.wheelIndicator) {
      this.wheelIndicator.destroy();
    }
  },
  data() {
    return {
      lastx: 0,
      preventMapInteraction: false,
      wheelIndicator: null,
      panelHiddenDelayed: true,
    };
  },
  methods: {
    resize(event) {
      if (event.x > 580 && event.x > this.lastx && !this.sidebarExpanded) {
        this.sidebarExpanded = true;
      } else if (
        event.x < 1000 &&
        event.x < this.lastx &&
        this.sidebarExpanded
      ) {
        this.sidebarExpanded = false;
      }
      this.lastx = event.x;
    },
    showAddEventDialog() {
      this.$q
        .dialog({
          parent: this,
          component: AddEventDialog,
        })
        .onOk((data) => {
          if (!this.currentUser && data.host) {
            this.$router.push({ name: 'Login' });
          } else if (data.host) {
            this.$router.push({
              name: 'AddEventHost',
            });
          } else {
            this.$router.push({
              name: 'AddEventPublic',
            });
          }
        });
    },
    handleWheel(event) {
      // safari behavior fix
      if (this.$q.platform.is.safari) {
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

          if (this.sidebarPanel !== 'explore' && this.$q.screen.lt.sm) {
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

        if (this.sidebarPanel !== 'explore' && this.$q.screen.lt.sm) {
          this.sidebarPanel = 'explore';
        }
      } else {
        this.showPanel = true;
      }
    },
    togglePanel(event) {
      this.showPanel = !this.showPanel;

      if (this.sidebarPanel !== 'explore') {
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
      // timeouts are so that we wait until the animation is finished
      if (newv === true) {
        this.panelHiddenDelayed = false;
      } else {
        setTimeout(() => {
          this.panelHiddenDelayed = true;
        }, 350);
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
    },
  },
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
    ...mapState(useMainStore, [
      'userLocation',
      'loadingUserLocation',
      'getFineLocation',
      'userLocationLoading',
      'userLocationFromSearch',
      'computedSidebarWidth',
    ]),
    ...mapWritableState(useMainStore, [
      'sidebarExpanded',
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
  .nav-button {
  }
  .hover-indicator-line {
    background: rgba(255, 255, 255, 0.2);
  }

  .sidebar-wrapper {
    .sidebar {
      border: 1px solid black;
      background: black;

      &.shadow {
        border: 1px solid $bi-3;
      }

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

      background: white;
      border: 1px solid white;

      &.shadow {
        border: 1px solid rgba(0, 0, 0, 0.1);
        box-shadow: rgba(0, 0, 0, 0.56) 0px 22px 70px 4px;
        //box-shadow: rgba(100, 100, 100, 0.05) 0px 0px 10px 5px;
      }
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
  justify-content: start;
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
    overflow: hidden;
    height: 100%;
    // max-width: 600px;
    pointer-events: all;
    transition: all 0.4s ease;
    //transform: translate3d(0, calc(100% - 226px), 0);
    user-select: none;
    //padding-bottom: 64px;
    display: flex;
    justify-content: center;

    .resizer {
      position: absolute;
      top: 50%;
      right: 0px;
      padding-right: 4px;
      z-index: 5000;
      cursor: ew-resize;
      opacity: 0.48;
    }
    .sidebar-content {
      padding-top: 128px;
      overflow: hidden;
      position: relative;
      align-items: center;

      .add-event-wrapper {
        position: absolute;
        top: 0px;
        right: 0px;
        z-index: 5000;
      }
      .sidebar-content-inner {
        overflow: hidden;
        isolation: isolate; // lol what?

        .sidebar-content-inner-shadow {
          position: absolute;
          height: 100%;
          width: 100%;
          z-index: 1;
          pointer-events: none;
        }
      }
    }

    &.sidebar-mobile-nearby {
      //transform: translate3d(0, calc(100% - 66vh), 0);
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
      }
    }

    :deep(.sidebar-header) {
      padding-top: 8px;
      padding-bottom: 8px;
      color: white;
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

@media only screen and (min-width: 600px) {
  .body--light {
    .sidebar {
      .search-component {
        box-shadow: none;

        //
        :deep(.controls-wrapper-inner) {
          //border-top: 1px solid $b-3;

          // background: white !important;
          //  background: #f5f5f5 !important;
          // box-shadow: none;
          //background: $b-2;
        }
      }
    }
  }
  .body--dark {
    .sidebar {
      .search-component {
        box-shadow: none;

        :deep(.controls-wrapper-inner) {
          background: $bi-3;
          border: none;
          //border: 1px solid rgba(255, 255, 255, 0.1);
        }
      }
    }
  }
  .sidebar {
    .search-component {
      /// width: unset;
      /// width: 100%;
      /// position: absolute;
      ///top: 0px;
      ///  left: 0px;
      /// padding-top: 78px;
      //background: $b-2;
      border-radius: 9px;
      box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;

      justify-content: center;
      :deep(.controls-wrapper-inner) {
        // width: 100%;

        border-radius: 100px;
        //border-top: none;
        //background: $bi-2;
        ///justify-content: center;
        //. width: 100%;
        /// border-radius: none !important;
        .inner-wrapper {
          .control-scroll-area {
            /// padding-right: 0px !important;
            ///  mask-image: none;
          }
          .scroll-wrapper {
            ///  justify-content: start;
            /// padding-right: 0px;
            ///  height: 48px;
          }
          .search-button {
            // display: none;
          }
        }
      }
    }
  }
}
@media only screen and (min-width: 600px) and (max-width: 1280px) {
  .sidebar-wrapper {
    .sidebar {
      width: 50vw !important;
      // padding-bottom: 134px;

      &.sidebar-mobile-nearby {
        //transform: translate3d(0, calc(100% - 60vh), 0);
      }
      &.sidebar-mobile-expanded {
        //  transform: translate3d(0, 128px, 0);
      }
    }
  }
}

@media only screen and (min-width: 1280px) {
  .sidebar-wrapper {
    .sidebar {
      //padding-bottom: 88px;
      width: 50vw;
      //max-width: 580px;
      .sidebar-content {
      }
      &.sidebar-mobile-expanded {
        transform: translate3d(0, 88px, 0);
      }
    }
  }
}

@media only screen and (min-width: 1080px) {
  .sidebar-wrapper {
    .sidebar {
      width: 50vw;
      .sidebar-content {
      }
    }
  }
}

@media only screen and (max-width: 1681px) {
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

  .sidebar-wrapper {
    .sidebar {
      width: 50vw;
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
    border-radius: 18px;

    .sidebar {
      box-shadow: none;
      transition: transform 0.4s ease;

      width: 100%;
      background: transparent;
      //margin-top: 48px;
      transform: translate3d(0, calc(100% - 228px), 0);
      //will-change: auto;
      padding-bottom: 188px;
      border-left: none;
      border-right: none;
      overflow: none;
      max-width: 100vw;
      width: 100vwv;
      border-radius: 18px;
      will-change: opacity;
      @supports ((top: var(--safe-area-inset-top))) {
        transform: translate3d(
          0,
          calc(100% - 228px - var(--safe-area-inset-top)),
          0
        );
        padding-bottom: calc(180px + var(--safe-area-inset-top));
      }
      @supports (
          (top: env(safe-area-inset-top)) and (font: -apple-system-body) and
            (-webkit-appearance: none)
        )
        and (max-width: 600px) {
        transform: translate3d(
          0,
          calc(
            100% - 228px - env(safe-area-inset-top) -
              env(safe-area-inset-bottom) + 16px
          ),
          0
        );
        // below value -8px is correct for iphone 7, + 16px is correct for iphone x in app mode, 0px correct for iphone x in browser
        // padding-bottom: calc(188px + env(safe-area-inset-top));
      }

      .sidebar-content {
      }
      &.sidebar-mobile-expanded {
        transform: translate3d(0, 120px, 0);
        //padding-bottom: 128px;
        border-radius: 0px;
      }

      &.sidebar-mobile-hidden {
        opacity: 0;
        //transition: opacity 0.s;
        //transform: translate3d(0, Max(calc(100% - 66%), calc(100% - 80%)), 0);
        //transform: translate3d(0, Max(calc(100% - 66%), calc(100% - 0px)), 0);
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
