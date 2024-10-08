<template>
  <div class="flex sidebar-wrapper">
    <div
      ref="sidebar"
      class="flex justify-between no-wrap sidebar"
      id="sidebar"
      v-bind:class="{
        shadow: $q.screen.gt.xs && false,
        'sidebar-mobile-expanded': mainStore.showPanelBackground,
        'sidebar-mobile-nearby':
          mainStore.sidebarPanel === 'nearby' && $q.screen.gt.xs,
        'sidebar-mobile-hidden':
          false && $q.screen.lt.sm && $route.name === 'EventPage',
        iphone: $q.platform.is.iphone || $q.platform.is.ipod,
      }"
    >
      <q-btn rounded no-caps class="hide-results-button" v-if="false"
        >Hide Results</q-btn
      >

      <div class="sidebar-content flex column no-wrap">
        <div
          style="height: 100%; width: 100%"
          class="sidebar-content-inner"
          @wheel="handleInnerWheel"
        >
          <NearbyView
            style="height: 100%; width: 100%"
            v-if="mainStore.sidebarPanel === 'nearby'"
          />
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchComponent from 'src/components/Search/SearchComponent.vue';
import TopControlsMenu from 'components/MenuBar/TopControlsMenu.vue';
import { Lethargy } from 'lethargy-ts';
import ExploreView from './ExploreView/ExploreView.vue';
import SearchView from './SearchView/SearchView.vue';
import NearbyView from './NearbyView/NearbyView.vue';
import { useMainStore } from 'src/stores/main';
import { useRouter, useRoute } from 'vue-router';

import { useDrag, useWheel } from '@vueuse/gesture';
import {
  MotionVariants,
  useMotionControls,
  useMotionProperties,
  useMotionTransitions,
  useSpring,
} from '@vueuse/motion';
import { ref, watch, toRaw, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useMapStore } from 'src/stores/map';
const $q = useQuasar();
const { t } = useI18n();
const route = useRoute();

const sidebar = ref();
const resizer = ref();
const mainStore = useMainStore();
const mapStore = useMapStore();

const motion = ref();
const motionProperties = ref();
const motionControls = ref();
const motionTransitions = ref();
const currentYPos = ref(0);

const lethargy = ref(new Lethargy({ sensitivity: 0.5 }));

const variants = ref<MotionVariants>({
  custom: {
    transition: { type: 'spring', stiffness: 100 },
  },
});

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

const hiddenYPosition = () => {
  const iosOffset =
    $q.platform.is.ios &&
    $q.platform.is.capacitor &&
    mainStore.safeAreaInsets.bottom
      ? mainStore.safeAreaInsets.bottom - 24
      : 0;
  if (
    mainStore.sidebarMinimized &&
    mainStore.sidebarPanel === 'explore' &&
    $q.screen.gt.xs
  )
    return window.innerHeight - 62 - mainStore.safeAreaInsets.top - iosOffset;
  else if (
    mainStore.sidebarMinimized &&
    mainStore.sidebarPanel === 'explore' &&
    $q.screen.lt.sm
  )
    return window.innerHeight - 126 - mainStore.safeAreaInsets.top - iosOffset;

  if (mainStore.sidebarPanel === 'nearby') {
    if ($q.screen.gt.xs) {
      return 256 + mainStore.safeAreaInsets.top;
    } else {
      return 200 + mainStore.safeAreaInsets.top;
    }
  }

  if ($q.screen.gt.lg) {
    return window.innerHeight - 362 - mainStore.safeAreaInsets.top;
  }
  if ($q.screen.gt.xs) {
    return window.innerHeight - 260 - mainStore.safeAreaInsets.top;
  }

  return window.innerHeight - 234 - mainStore.safeAreaInsets.top;
};
const showingYPosition = () => {
  return $q.screen.lt.md ? 112 : 76;
};

const showPanel = () => {
  motionTransitions.value.push(
    'y',
    showingYPosition(),
    motionProperties.value,
    {
      type: 'spring',
      stiffness: 600,
      damping: 50,
      mass: 1.8,
    }
  );
  mainStore.showPanelBackground = true;

  mainStore.showPanel = true;
  //motion.value.set({ x: 0, y: showingYPosition(), cursor: 'grab' });
};

const hidePanel = () => {
  motionTransitions.value.push('y', hiddenYPosition(), motionProperties.value, {
    type: 'spring',
    stiffness: 600,
    damping: 50,
    mass: 1.8,
  });
  mainStore.showPanelBackground = false;

  mainStore.showPanel = false;
  //motion.value.set({ x: 0, y: hiddenYPosition(), cursor: 'grab' });
};

const handleInnerWheel = (event) => {
  // even though this is empty this handler helps
};

const wheelHandler = ({
  event,
  movement: [x, y],
  wheeling,
}: {
  event: any;
  movement: [x: number, y: number];
  wheeling: boolean;
}) => {
  // check if scroll is intentional or inertia
  if (lethargy.value.check(event)) {
    // Do something with the scroll event

    if (wheeling && y > 0 && !mainStore.showPanel) {
      // wheeling up from hidden position
      showPanel();
      return;
    } else if (
      wheeling &&
      y < 0 &&
      mainStore.enablePanelSwipeDown &&
      //    y + showingYPosition() > showingYPosition() &&
      mainStore.showPanel
    ) {
      mapStore.preventMapZoom = true;

      // dragging down
      hidePanel();
      setTimeout(() => {
        // wait for animation - stop map from zooming uncontrolably
        mapStore.preventMapZoom = false;
      }, 1000);
      return;
    }
  }
};

// Composable usage
useWheel(wheelHandler, {
  domTarget: sidebar,
  axis: 'y',
});

const dragHandler = ({
  event,
  movement: [x, y],
  dragging,
}: {
  event: any;
  movement: [x: number, y: number];
  dragging: boolean;
}) => {
  // if ($q.screen.lt.sm && mainStore.sidebarPanel === 'explore') {
  if (!dragging) {
    if (mainStore.showPanel && mainStore.enablePanelSwipeDown) {
      if (y > 30) {
        hidePanel();
      } else {
        showPanel();
      }
    } else if (!mainStore.showPanel) {
      if (mainStore.sidebarPanel === 'nearby' && y > 30) {
        mainStore.sidebarPanel = 'explore';
        hidePanel();
        return;
      } else if (mainStore.sidebarMinimized && y < -30 && y > -256) {
        // unminimize
        mainStore.sidebarMinimized = false;
        // hidePanel();
      } else if (mainStore.sidebarMinimized && y < -256) {
        // show panel but keep minimized state
        showPanel();
      } else if (y < -30) {
        // show panel from normal state
        showPanel();
      } else {
        // minimize
        mainStore.sidebarMinimized = true;
        //hidePanel();
      }
    }

    return;
  }

  if (y < 0 && !mainStore.showPanel) {
    // dragging up from hidden position
    if (y + hiddenYPosition() < showingYPosition()) {
      sidebar.value.style.transform = `translate3d(${x}px, ${showingYPosition()}px, 0px)`;

      currentYPos.value = showingYPosition();
      mainStore.showPanelBackground = true;
    } else {
      sidebar.value.style.transform = `translate3d(${x}, ${
        y + hiddenYPosition()
      }px, 0px)`;
      currentYPos.value = y + hiddenYPosition();
      mainStore.showPanelBackground = false;
    }

    // update motion position but don't animate
    motionTransitions.value.push(
      'y',
      currentYPos.value,
      motionProperties.value,
      {
        type: 'keyframes',
        duration: 0,
      }
    );
  } else if (
    mainStore.enablePanelSwipeDown &&
    y + showingYPosition() > showingYPosition() &&
    mainStore.showPanel
  ) {
    // dragging down from showing position

    // show background when dragging back up after drag down started
    if (y + showingYPosition() - 10 <= showingYPosition()) {
      mainStore.showPanelBackground = true;
    } else {
      mainStore.showPanelBackground = false;
    }

    sidebar.value.style.transform = `translate3d(${x}px, ${
      y + showingYPosition()
    }px, 0px)`;
    currentYPos.value = y + showingYPosition();
    // update motion position but don't animate
    motionTransitions.value.push(
      'y',
      currentYPos.value,
      motionProperties.value,
      {
        type: 'keyframes',
        duration: 0,
      }
    );
  } else if (
    y + hiddenYPosition() > hiddenYPosition() &&
    !mainStore.showPanel
  ) {
    // dragging down from hidden position

    sidebar.value.style.transform = `translate3d(${x}px, ${
      y + hiddenYPosition()
    }px, 0px)`;
    currentYPos.value = y + hiddenYPosition();

    // update motion position but don't animate
    motionTransitions.value.push(
      'y',
      currentYPos.value,
      motionProperties.value,
      {
        type: 'keyframes',
        duration: 0,
      }
    );
  }
};

useDrag(dragHandler, {
  domTarget: sidebar,
  axis: 'y',
});

const setupSpring = (initialYPos: number) => {
  const { motionProperties: mp } = useMotionProperties(sidebar, {
    y: initialYPos,
  });
  motionProperties.value = mp;
  motionControls.value = useMotionControls(motionProperties.value);
  motionTransitions.value = useMotionTransitions();
};

onMounted(() => {
  setupSpring(
    mainStore.sidebarPanel === 'Explore'
      ? hiddenYPosition()
      : showingYPosition()
  );
  hidePanel();
  window.addEventListener('resize', () => {
    if (!mainStore.showPanel) {
      hidePanel();
    }
  });
  /*
  // check scroll inertia
  window.addEventListener(
    'mousewheel DOMMouseScroll wheel MozMousePixelScroll',
    function (e) {
      e.preventDefault();
      e.stopPropagation();
      var lethargy = new Lethargy(); // Use defaults
      if (lethargy.check(e) !== false) {
        // Do something with the scroll event
      }
    }
  );
  */
});

const lastx = ref();

const resize = (event: any) => {
  if (event.x > 580 && event.x > lastx.value && !mainStore.sidebarExpanded) {
    mainStore.sidebarExpanded = true;
  } else if (
    event.x < 1000 &&
    event.x < lastx.value &&
    mainStore.sidebarExpanded
  ) {
    mainStore.sidebarExpanded = false;
  }
  lastx.value = event.x;
};

const isMobile = computed(() => {
  return $q.screen.lt.sm;
});

const togglePanel = () => {
  mainStore.showPanel = !mainStore.showPanel;

  if (mainStore.sidebarPanel !== 'explore') {
    mainStore.sidebarPanel = 'explore';
  }
};

watch(
  () => mainStore.showPanel,
  (to: string, from: string) => {
    if (to) {
      showPanel();
    } else {
      hidePanel();
    }
  }
);

watch(
  () => mainStore.sidebarMinimized,
  (to: string, from: string) => {
    hidePanel();
  }
);

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
      hidePanel();

      mainStore.showPanel = false;
      if (from === 'nearby') {
      }
    }
    if (to === 'search') {
      mainStore.showPanel = true;
      if ($q.screen.lt.sm) {
        showPanel();
      }
    }
    if (to === 'nearby') {
      if ($q.screen.lt.sm && false) {
        showPanel();

        mainStore.enablePanelSwipeDown = false;
      } else {
        hidePanel();
        mainStore.showPanel = false;
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
      border-top: 1px solid $bi-4;
      &.sidebar-mobile-expanded {
        border-top-color: black;
      }
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
  justify-content: center;
  display: flex;
  .sidebar {
    cursor: grab;
    position: relative;
    flex-shrink: 0;
    z-index: 500;
    left: 0px;
    //box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.3);
    //box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,
    //  rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
    //box-shadow: rgba(99, 99, 99, 0.3) 0px 2px 8px 0px;
    max-height: 100%;
    height: 100%;
    // max-width: 599px;
    overflow: hidden;
    pointer-events: all;
    transition: width 0.4s ease;
    //transform: translate3d(0, calc(100% - 226px), 0);
    user-select: none;
    //padding-bottom: 64px;
    display: flex;
    justify-content: center;
    border-radius: 18px;
    .resizer {
      position: absolute;
      top: 50%;
      right: 0px;
      padding-right: 4px;
      z-index: 5000;
      cursor: ew-resize;
      opacity: 0.48;
    }
    .hide-results-button {
      position: absolute;
      top: -64px;
      right: calc(50% - 48px);
    }
    .sidebar-content {
      padding-top: 4px;
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

@media only screen and (min-width: 600px) and (max-width: 1280px) {
  .sidebar-wrapper {
    .sidebar {
      width: 96vw;
      padding-bottom: 134px;
    }
  }
}

@media only screen and (min-width: 1024px) {
  .sidebar-wrapper {
    .sidebar {
      padding-bottom: 76px;
      min-width: 920px;
      max-width: 1280px;
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

@media only screen and (min-width: 1280px) {
  .sidebar-wrapper {
    .sidebar {
      width: 1024px;
      min-width: 920px;
      max-width: 1024px;
      .sidebar-content {
      }
      &.sidebar-mobile-expanded {
        //     transform: translate3d(0, 88px, 0);
      }
    }
  }
}
@media only screen and (min-width: 1921px) {
  .sidebar-wrapper {
    .sidebar {
      //  width: 66vw;
      //  max-width: 1200px;
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
        //border-top: none;
        background: black;

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
      width: 100vw;
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
  .native-mobile {
    .sidebar-wrapper {
      .sidebar {
        &.iphone {
          @supports (
            (top: env(safe-area-inset-top)) and (font: -apple-system-body) and
              (-webkit-appearance: none)
          ) {
            @media screen and (max-width: 375px) {
              //  iphone 7
              padding-bottom: calc(180px - 8px + var(--safe-area-inset-top));
            }
            @media screen and (min-width: 376px) {
              padding-bottom: calc(180px + var(--safe-area-inset-top));
            }
          }
        }
      }
    }
  }
}
</style>
