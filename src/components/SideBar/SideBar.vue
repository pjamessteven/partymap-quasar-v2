<template>
  <div class="flex sidebar-wrapper">
    <div
      ref="sidebar"
      class="flex justify-between no-wrap sidebar"
      id="sidebar"
      v-bind:class="{
        shadow: $q.screen.gt.xs && false,
        'sidebar-mobile-expanded':
          mainStore.showPanelBackground && $q.screen.lt.sm,
        iphone: $q.platform.is.iphone || $q.platform.is.ipod,
      }"
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

const lastx = ref();
</script>

<style lang="scss" scoped>
.body--dark {
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

      .sidebar-content {
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
    padding-top: 64px;
    width: 532px;
    max-height: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: all;
    transition: width 0.4s ease;
    user-select: none;
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

@media only screen and (min-width: 1080px) {
  .sidebar-wrapper {
    .sidebar {
    }
  }
}

@media only screen and (min-width: 1280px) {
  .sidebar-wrapper {
    .sidebar {
    }
  }
}
@media only screen and (min-width: 1921px) {
  .sidebar-wrapper {
    .sidebar {
    }
  }
}

@media only screen and (max-width: 599px) {
  .body--dark {
    .sidebar-wrapper {
      .sidebar {
        box-shadow: none;
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

      &.sidebar-mobile-expanded {
        //  transform: translate3d(0, 120px, 0);
        //padding-bottom: 128px;
        border-radius: 0px;
      }

      .sidebar-content {
        backdrop-filter: unset !important;
        padding-top: unset;
        background: none !important;

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
