<template>
  <div class="flex sidebar-wrapper">
    <div
      ref="sidebar"
      class="flex justify-between no-wrap sidebar"
      id="sidebar"
      :style="mainStore.computedSidebarWidth"
      v-bind:class="{
        shadow: $q.screen.gt.xs,
        'sidebar-mobile-expanded': mainStore.showPanel && $q.screen.lt.sm,
        'sidebar-mobile-nearby':
          mainStore.sidebarPanel === 'nearby' && $q.screen.gt.xs,
        'sidebar-mobile-hidden':
          false && $q.screen.lt.sm && $route.name === 'EventPage',
      }"
    >
      <div class="sidebar-content flex column no-wrap">
        <div
          class="add-event-wrapper items-center flex justify-center q-px-md"
          v-if="$route.name === 'Explore' && $q.screen.gt.xs"
          style="height: 72px"
        >
          <!--
          <q-btn
            v-if="false"
            class="inter o-070"
            no-caps
            flat
            @click="showAddEventDialog"
            >Submit
            <q-icon name="mdi-plus" class="q-ml-sm" size="1rem" />
          </q-btn>
          -->
          <q-btn
            v-if="false"
            flat
            no-caps
            class="inter nav-button q-ml-sm"
            @click.stop="() => mainStore.getFineLocation()"
          >
            <template v-slot:default>
              <div
                v-if="!mainStore.userLocationLoading"
                class="flex items-center"
              >
                <q-icon
                  name="mdi-crosshairs-gps"
                  class=""
                  size="1rem"
                  v-if="
                    mainStore.fineLocation && !mainStore.userLocationFromSearch
                  "
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
                <span v-if="!mainStore.fineLocation">
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
            class="menubar-button"
            icon="mdi-menu"
            flat
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
          <keep-alive>
            <NearbyView
              style="height: 100%; width: 100%"
              v-if="mainStore.sidebarPanel === 'nearby'"
            />
          </keep-alive>
          <keep-alive>
            <ExploreView
              style="height: 100%; width: 100%"
              @hidePanel="hidePanel"
              @showPanel="showPanel"
              v-if="mainStore.sidebarPanel === 'explore'"
            />
          </keep-alive>
          <keep-alive>
            <SearchView
              style="height: 100%; width: 100%"
              v-if="mainStore.sidebarPanel === 'search'"
            />
          </keep-alive>
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

<script setup lang="ts">
import SearchComponent from 'src/components/Search/SearchComponent.vue';
import TopControlsMenu from 'components/MenuBar/TopControlsMenu.vue';
import NavigationBar from 'components/NavigationBar.vue';

import ExploreView from './ExploreView/ExploreView.vue';
import SearchView from './SearchView/SearchView.vue';
import NearbyView from './NearbyView/NearbyView.vue';
import { useMainStore } from 'src/stores/main';
import { useRouter, useRoute } from 'vue-router';

import { useDrag } from '@vueuse/gesture';
import { useMotionProperties, useSpring } from '@vueuse/motion';
import { ref, watch, toRaw, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { SafeArea } from '@aashu-dubey/capacitor-statusbar-safe-area';

const $q = useQuasar();
const { t } = useI18n();
const route = useRoute();

const sidebar = ref();
const mainStore = useMainStore();

const spring = ref();

const preventSwipe = (event) => {
  if (
    mainStore.enablePanelSwipeDown &&
    mainStore.sidebarPanel === 'explore' &&
    mainStore.showPanel
  ) {
    return;
  } else {
    return;
  }
};
const hiddenYPosition = window.innerHeight - 228 - mainStore.safeAreaInsets.top;
const showingYPosition = 120;

const showPanel = () => {
  mainStore.showPanel = true;
  spring.value.set({ x: 0, y: showingYPosition, cursor: 'grab' });
};

const hidePanel = () => {
  mainStore.showPanel = false;
  spring.value.set({ x: 0, y: hiddenYPosition, cursor: 'grab' });
};

const dragHandler = ({
  event,
  movement: [x, y],
  dragging,
}: {
  event: any;
  movement: [x: number, y: number];
  dragging: boolean;
}) => {
  if ($q.screen.lt.sm && mainStore.sidebarPanel === 'explore') {
    if (!dragging) {
      if (y > 100 && mainStore.enablePanelSwipeDown) {
        hidePanel();
      } else {
        if (mainStore.showPanel) {
          spring.value.set({
            cursor: 'grabbing',
            x,
            y: showingYPosition,
          });
        } else {
          showPanel();
        }
      }
      return;
    }
    if (y < 0 && !mainStore.showPanel) {
      // dragging up from hidden position
      if (y + hiddenYPosition < showingYPosition) {
        spring.value.set({
          cursor: 'grabbing',
          x,
          y: showingYPosition,
        });
      } else {
        spring.value.set({
          cursor: 'grabbing',
          x,
          y: y + hiddenYPosition,
        });
      }
    } else if (
      mainStore.enablePanelSwipeDown &&
      y + showingYPosition > showingYPosition
    ) {
      // dragging down

      mainStore.showPanel = false;

      spring.value.set({
        cursor: 'grabbing',
        x,
        y: y + showingYPosition,
      });
    }
  }
};
useDrag(dragHandler, {
  domTarget: sidebar,
  axis: 'y',
});

const setupSpring = () => {
  const { motionProperties } = useMotionProperties(sidebar, {
    y:
      mainStore.sidebarPanel === 'Explore' ? hiddenYPosition : showingYPosition,
  });

  spring.value = useSpring(motionProperties, {
    stiffness: 600,
    damping: 50,
    mass: 1.8,
  });
};

onMounted(() => {
  if ($q.screen.lt.sm) {
    setupSpring();
  }
});

const isMobile = computed(() => {
  return $q.screen.lt.sm;
});

watch(isMobile, (newv) => {
  if (newv) {
    setupSpring();
  }
});

const togglePanel = () => {
  mainStore.showPanel = !mainStore.showPanel;

  if (mainStore.sidebarPanel !== 'explore') {
    mainStore.sidebarPanel = 'explore';
  }
};

/*
watch(
  () => mainStore.showPanel,
  (to: string, from: string) => {
    if (to) {
      spring.set({ x: 0, y: showingYPosition, cursor: 'grab' });
    } else {
      spring.set({ x: 0, y: hiddenYPosition, cursor: 'grab' });
    }
  }
);
*/

watch(
  () => mainStore.sidebarPanel,
  (to: string, from: string) => {
    if (from === 'explore') {
      /*
        this.eventDates = [];
        this.eventDatesGroupedByMonth = {};
        this.eventDatesLoading = true;
        */
    }
    if (to === 'explore') {
      if ($q.screen.lt.sm) {
        spring.value?.set({ x: 0, y: hiddenYPosition, cursor: 'grab' });
      }
      mainStore.showPanel = false;
      if (from === 'nearby') {
      }
    }
    if (to === 'search') {
      mainStore.showPanel = true;
      if ($q.screen.lt.sm) {
        spring.value?.set({ x: 0, y: showingYPosition, cursor: 'grab' });
      }
    }
    if (to === 'nearby') {
      if ($q.screen.lt.sm) {
        spring.value?.set({ x: 0, y: showingYPosition, cursor: 'grab' });
        mainStore.showPanel = true;
        mainStore.enablePanelSwipeDown = true;
      } else {
        mainStore.showPanel = false;
        mainStore.enablePanelSwipeDown = true;
      }
    }
  }
);
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
    // max-width: 599px;
    pointer-events: all;
    // transition: all 0.4s ease;
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
      //   transform: translate3d(0, 64px, 0);
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
      // overflow: hidden;
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
        //     transform: translate3d(0, 88px, 0);
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

@media only screen and (max-width: 599px) {
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
      //  transition: transform 0.4s ease, opacity 0s ease;

      width: 100%;
      background: transparent;
      //margin-top: 48px;
      //     transform: translate3d(0, calc(100% - 228px), 0);
      //will-change: auto;
      padding-bottom: 188px;
      border-left: none;
      border-right: none;
      overflow: none;
      max-width: 100vw;
      width: 100vwv;
      border-radius: 18px;
      will-change: opacity, transform; //important for smoothness on android
      @supports ((top: var(--safe-area-inset-top))) {
        /*
        transform: translate3d(
          0,
          calc(100% - 228px - var(--safe-area-inset-top)),
          0
        );
        */
        padding-bottom: calc(180px + var(--safe-area-inset-top));
      }
      @supports (
          (top: env(safe-area-inset-top)) and (font: -apple-system-body) and
            (-webkit-appearance: none)
        )
        and (max-width: 599px) {
        /*
        transform: translate3d(
          0,
          calc(
            100% - 228px - env(safe-area-inset-top) -
              env(safe-area-inset-bottom) + 16px
          ),
          0
        );
        */
        // below value -8px is correct for iphone 7, + 16px is correct for iphone x in app mode, 0px correct for iphone x in browser
        // padding-bottom: calc(188px + env(safe-area-inset-top));
      }

      .sidebar-content {
      }
      &.sidebar-mobile-expanded {
        //  transform: translate3d(0, 120px, 0);
        //padding-bottom: 128px;
        border-radius: 0px;
      }

      &.sidebar-mobile-hidden {
        opacity: 0;
        //=transition: opacity 0.s;
        //transform: translate3d(0, Max(calc(100% - 66%), calc(100% - 80%)), 0);
        //transform: translate3d(0, Max(calc(100% - 66%), calc(100% - 0px)), 0);
        // transform: translate3d(0, calc(100% - 228px), 0);
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
