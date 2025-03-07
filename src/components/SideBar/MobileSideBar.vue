<template>
  <div class="flex sidebar-wrapper">
    <div
      ref="sidebar"
      class="flex justify-between no-wrap sidebar"
      id="sidebar"
      v-bind:class="{
        iphone: $q.platform.is.iphone || $q.platform.is.ipod,
      }"
    >
      <div
        class="mobile-panel-handle"
        :class="{ 'o-000': mainStore.showPanelBackground || true }"
      >
        <div class="handle-icon" />
      </div>

      <div
        class="mobile-panel-button flex row items-center"
        v-if="$q.screen.lt.md && mainStore.sidebarPanel === 'explore'"
      >
        <q-icon
          @click="
            () => {
              if (mainStore.showPanel) {
                hidePanel();
              } else {
                showPanel();
              }
            }
          "
          flat
          :size="$q.screen.gt.sm ? '1.7rem' : '1.5rem'"
          class="q-pa-md q-mr-sm t1"
          :class="{ 'rotate-180': mainStore.showPanelBackground }"
          name="mdi-chevron-up"
          style="
            pointer-events: all;
            transition: all 0.3s;
            will-change: transform;
          "
        />
      </div>
      <div
        class="sidebar-content flex column no-wrap"
        v-bind:class="{
          'shadow-strong': mapStore.mapStyle === 'satellite',
          'sidebar-mobile-expanded':
            mainStore.showPanelBackground && $q.screen.lt.md,
        }"
      >
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
import { useQuasar } from 'quasar';
import { useMapStore } from 'src/stores/map';
const $q = useQuasar();
const route = useRoute();

const sidebar = ref();
const sidebarHandle = ref();
const resizer = ref();
const mainStore = useMainStore();
const mapStore = useMapStore();

const motion = ref();
const motionProperties = ref();
const motionControls = ref();
const motionTransitions = ref();
const currentYPos = ref(0);

const lethargy = ref(new Lethargy({ sensitivity: 0.5 }));

const hiddenYPosition = () => {
  let offset = 0;
  if ($q.platform.is.capacitor && mainStore.safeAreaInsets.bottom) {
    if ($q.platform.is.ios) {
      offset = mainStore.safeAreaInsets.bottom - 24;
    } else {
      offset = mainStore.safeAreaInsets.bottom;
    }
  }

  if (
    mainStore.sidebarMinimized &&
    mainStore.sidebarPanel === 'explore' &&
    $q.screen.lt.md
  )
    // SM
    return window.innerHeight - 152 - mainStore.safeAreaInsets.top - offset;

  if (mainStore.sidebarPanel === 'nearby') {
    if ($q.screen.gt.xs) {
      return 256 + mainStore.safeAreaInsets.top;
    } else {
      return 200 + mainStore.safeAreaInsets.top;
    }
  }

  if ($q.screen.gt.xs) {
    return window.innerHeight - 260 - mainStore.safeAreaInsets.top - offset;
  }

  return window.innerHeight - 256 - mainStore.safeAreaInsets.top - offset;
};
const showingYPosition = () => {
  return $q.screen.lt.md ? 82 : 76;
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
    },
  );
  mainStore.showPanelBackground = true;

  mainStore.showPanel = true;
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
};

const handleInnerWheel = (event) => {
  // even though this is empty this handler helps
};

// cause someone might use their phone with a mouse plugged in
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
  if ($q.screen.lt.md) {
    if (!dragging) {
      console.log('top', event, y);

      if (mainStore.showPanel) {
        if (y > 30 && mainStore.enablePanelSwipeDown) {
          hidePanel();
        } else {
          showPanel();
        }
      } else if (!mainStore.showPanel) {
        if (mainStore.sidebarPanel === 'nearby' && y > 30) {
          console.log(1);
          mainStore.sidebarPanel = 'explore';
          hidePanel();
          return;
        } else if (mainStore.sidebarMinimized && y < -30 && y > -256) {
          console.log(2);
          // unminimize
          mainStore.sidebarMinimized = false;
          // hidePanel();
        } else if (mainStore.sidebarMinimized && y < -256) {
          console.log(3);
          // show panel but keep minimized state
          showPanel();
        } else if (y < -30) {
          console.log(4);
          // show pane from normal state
          showPanel();
        } else {
          console.log(5);
          // minimize
          console.log(event, y);

          mainStore.sidebarMinimized = true;
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
        },
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
        },
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
        },
      );
    }
  }
};

useDrag(dragHandler, {
  domTarget: sidebar,
  axis: 'y',
});

/*
useDrag(dragHandler, {
  domTarget: sidebarHandle,
  axis: 'y',
});
*/
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
      : showingYPosition(),
  );
  hidePanel();
  window.addEventListener(
    'resize',
    () => {
      if (!mainStore.showPanel) {
        hidePanel();
      }
    },
    { passive: true },
  );
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
  },
);

watch(
  () => mainStore.sidebarMinimized,
  (to: string, from: string) => {
    hidePanel();
  },
);

watch(
  () => mainStore.sidebarPanel,
  (to: string, from: string) => {
    if (to === 'explore') {
      hidePanel();
      mainStore.showPanel = false;
    }
    if (to === 'search') {
      mainStore.showPanel = true;
      if ($q.screen.lt.md) {
        showPanel();
      }
    }
    if (to === 'nearby') {
      //showPanel();
      hidePanel();
      mainStore.showPanel = false;
    }
  },
);
</script>

<style lang="scss" scoped>
.body--dark {
  .sidebar-wrapper {
    .sidebar {
      &.shadow {
        border: 1px solid $bi-3;
      }

      .sidebar-content {
        border-top: 1px solid $bi-4;

        background: black;
        &.sidebar-mobile-expanded {
          border-top-color: black;
        }
        .sidebar-content-inner {
          .sidebar-content-inner-shadow {
            background: $bi-1;
            z-index: -1 !important;
          }
        }
      }
    }
  }
}

.body--light {
  .sidebar-wrapper {
    .sidebar {
      .sidebar-content {
        //background: rgba(100, 100, 100, 0.2);
        //backdrop-filter: blur(10px);
        background: white;
        .sidebar-content-inner {
          //background: black;
        }
      }
      .sidebar-content {
        box-shadow: rgba(0, 0, 0, 0.1) 1.95px -1.95px 3px !important;
        &.shadow-strong {
          box-shadow: rgba(0, 0, 0, 0.4) 1.95px -1.95px 5px !important;
        }
        &.sidebar-mobile-expanded {
          box-shadow: none !important;
        }
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
    cursor: grab;
    position: relative;
    flex-shrink: 0;
    z-index: 500;
    left: 0px;
    width: 100%;
    max-height: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: all;
    transition: width 0.4s ease;
    user-select: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-top-right-radius: 18px;
    border-top-left-radius: 18px;
    .drag-zone {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 1;
      height: 74px;
      width: 100%;
      background: green;
    }
    .mobile-panel-handle {
      position: relative;
      display: flex;
      justify-content: center;
      z-index: 5000;
      width: 100%;
      height: 32px;
      margin-top: 8px;
      margin-bottom: -16px;
      transform: translate3d(0, 0, 0);
      &.absolute {
        position: absolute;
        width: 100%;
        top: 16px;
      }
      .handle-icon {
        //margin-top: 14px;

        width: 40px;
        height: 2px;
        background: rgb(200, 200, 200);
      }
      &.panel-showing {
        //margin-bottom: -32px;

        //margin-bottom: -18px;
      }
    }

    .mobile-panel-button {
      position: absolute;
      right: 0px;
      top: 24px;
      z-index: 5000;
      @supports (font: -apple-system-body) and (-webkit-appearance: none) {
        -webkit-transform: translate3d(0, 0, 0);
      }
    }
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
      padding-top: 4px;
      overflow: hidden;
      position: relative;
      align-items: center;
      height: 100%;
      width: 100%;

      .sidebar-content-inner {
        overflow: hidden;
        isolation: isolate; // lol what?
      }
    }
  }
}

@media only screen and (min-width: 600px) and (max-width: 1023px) {
  .sidebar-wrapper {
    padding: 0 0px;
    .sidebar {
      .sidebar-content {
        border-top-right-radius: 28px;
        border-top-left-radius: 28px;
      }
      overflow: hidden;
    }
  }
}

@media only screen and (max-width: 599px) {
  .body--dark {
    .sidebar-wrapper {
      .sidebar {
        box-shadow: none;

        .sidebar-content {
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
      }
    }
  }

  .sidebar-wrapper {
    padding: 0;
    overflow: hidden;
    box-shadow: none;

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
      //box-shadow: rgba(0, 0, 0, 0.2) 8px 0px 48px 4px !important;

      will-change: opacity, transform; //important for smoothness on android
      @supports ((top: var(--safe-area-inset-top))) {
        /*
        transform: translate3d(
          0,
          calc(100% - 228px - var(--safe-area-inset-top)),
          0
        );
        */
        padding-bottom: calc(154px + var(--safe-area-inset-top));
      }

      .sidebar-content {
        border-top-right-radius: 18px;
        border-top-left-radius: 18px;

        backdrop-filter: unset !important;
        padding-top: unset;

        .sidebar-content-inner {
          overflow: hidden;
          border-top: none !important;
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
            (top: var(--safe-area-inset-top)) and (font: -apple-system-body) and
              (-webkit-appearance: none)
          ) {
            @media screen and (max-width: 375px) {
              //  iphone 7
              padding-bottom: calc(180px - 8px + var(--safe-area-inset-top));
            }
            @media screen and (min-width: 376px) {
              padding-bottom: calc(164px + var(--safe-area-inset-top));
            }
          }
        }
      }
    }
  }
}
</style>
