<template>
  <div class="flex sidebar-wrapper">
    <div
      ref="sidebar"
      class="flex justify-between no-wrap sidebar"
      id="sidebar"
      v-bind:class="{
        shadow: $q.screen.gt.xs && false,
        'sidebar-mobile-expanded':
          mainStore.showPanelBackground && $q.screen.lt.md,
        iphone: $q.platform.is.iphone || $q.platform.is.ipod,
        dim:
          mainStore.menubarOpacity === 1 &&
          route.name === 'EventPage' &&
          $q.screen.gt.lg &&
          false,
      }"
    >
      <!--
      <div class="desktop-controls-bg" />
-->
      <div class="sidebar-content flex column no-wrap">
        <div style="height: 100%; width: 100%" class="sidebar-content-inner">
          <NearbyView
            style="height: 100%; width: 100%"
            v-if="mainStore.sidebarPanel == 'nearby'"
          />
          <keep-alive>
            <ExploreView
              style="height: 100%; width: 100%"
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
import ExploreView from './ExploreView/ExploreView.vue';
import SearchView from './SearchView/SearchView.vue';
import NearbyView from './NearbyView/NearbyView.vue';
import { useMainStore } from 'src/stores/main';

import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute } from 'vue-router';

const $q = useQuasar();

const route = useRoute();

const sidebar = ref();
const mainStore = useMainStore();
</script>

<style lang="scss" scoped>
.body--dark {
  .sidebar-wrapper {
    .sidebar {
      border: 1px solid black;
      background: black;
      border-top: 1px solid $bi-4;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      .desktop-controls-bg {
        background: $bi-2;
        border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      }
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
      //  rgba(0, 0, 0, 0.15) 0px 7px 20px 3px,
      //  rgba(0, 0, 0, 0.1) 0px -3px 0px inset;

      box-shadow: rgba(0, 0, 0, 0.48) 8px 0px 48px 4px;

      background: white;
      //: 1px solid white;
      .desktop-controls-bg {
        // border-bottom: 1px solid rgba(0, 0, 0, 0.15);
        box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,
          rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
      }
      &.shadow {
        border: 1px solid rgba(0, 0, 0, 0.1);
        box-shadow: rgba(0, 0, 0, 0.56) 0px 22px 70px 4px;
        //box-shadow: rgba(100, 100, 100, 0.05) 0px 0px 10px 5px;
      }
      .sidebar-content {
        //background: rgba(100, 100, 100, 0.2);
        //backdrop-filter: blur(10px);
        //  background: white;
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
    position: relative;
    flex-shrink: 0;
    z-index: 500;
    left: 0px;
    padding-top: 64px;
    width: 568px;
    max-width: 50vw;
    max-height: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: all;
    transition: width 0.4s ease;
    user-select: none;
    display: flex;
    justify-content: center;
    transition: opacity 0.3s ease;
    &.dim {
      opacity: 0.68;
    }
    &:hover {
      opacity: 1;
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
    .desktop-controls-bg {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 136px;
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

@media only screen and (max-width: 1023px) {
  .body--dark {
    .sidebar-wrapper {
      .sidebar {
      }
    }
  }
  .body--light {
    .sidebar-wrapper {
      .sidebar {
      }
    }
  }

  .sidebar-wrapper {
    .sidebar {
      @supports ((top: var(--safe-area-inset-top))) {
        //padding-bottom: calc(180px + var(--safe-area-inset-top));
      }

      &.sidebar-mobile-expanded {
        border-radius: 0px;
      }

      .sidebar-content {
        .sidebar-content-inner {
        }
      }
      :deep(.main-content) {
      }
    }
  }
  .native-mobile {
    .sidebar-wrapper {
      .sidebar {
        &.iphone {
        }
      }
    }
  }
}
</style>
