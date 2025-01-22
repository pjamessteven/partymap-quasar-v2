<template>
  <div class="flex sidebar-wrapper">
    <div
      ref="sidebar"
      class="flex justify-between no-wrap sidebar"
      id="sidebar"
      v-bind:class="{
        shadow: Screen.gt.xs && false,
        'sidebar-mobile-expanded':
          mainStore.showPanelBackground && Screen.lt.md,
        iphone: Platform.is.iphone || Platform.is.ipod,
        dim:
          mainStore.menubarOpacity === 1 &&
          route.name === 'EventPage' &&
          Screen.gt.lg &&
          false,
      }"
    >
      <!--
      <div class="desktop-controls-bg" />
-->
      <!--
      <q-btn
        @click="showAddEventDialog"
        no-caps
        flat
        rounded
        class="add-button nav-button o-080"
        v-if="Screen.gt.sm && false"
        style="font-size: 0.8rem"
      >
        <q-tooltip
          :offset="[10, 10]"
          style="font-size: 14px !important"
          :class="Dark.isActive ? 'b3 text-white' : 'b2 text-black'"
        >
          {{ t('top_controls.submit_event') }}
        </q-tooltip>

        <q-icon
          name="las la-plus"
          size="xs"
          style="margin-left: -12px; margin-right: -12px; padding: 0"
        ></q-icon>
      </q-btn>
      -->
      <q-btn
        class="button-control add-button"
        flat
        v-if="authStore.currentUserIsStaff"
        :class="{
          active:
            queryStore.controlDateUnconfirmed || queryStore.controlEmptyLineup,
        }"
      >
        <q-icon
          name="mdi-dots-vertical"
          size="xs"
          style="margin-left: -12px; margin-right: -12px; padding: 0"
        ></q-icon>
        <q-menu
          transition-show="jump-down"
          transition-hide="jump-up"
          anchor="bottom right"
          self="top right"
          class="more-menu"
          max-height="100vh"
        >
          <div class="column q-pa-sm">
            <div class="q-ma-sm inter bold">Help keep PartyMap updated!</div>

            <q-checkbox
              v-model="queryStore.controlDateUnconfirmed"
              label="Date unconfirmed"
            />

            <q-checkbox
              v-model="queryStore.controlEmptyLineup"
              label="Empty lineup"
            />

            <div class="q-ma-sm inter bold">View options</div>
            <q-toggle
              v-model="mainStore.compactView"
              :true-value="false"
              :false-value="true"
              label="Poster view"
            />
            <q-toggle
              v-model="mainStore.groupEventsByMonth"
              label="Group by Month"
            />
          </div>
        </q-menu>
      </q-btn>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ExploreView from './ExploreView/ExploreView.vue';
import NearbyView from './NearbyView/NearbyView.vue';
import { useMainStore } from 'src/stores/main';
import { useQueryStore } from 'src/stores/query';
import AddEventDialog from 'components/dialogs/AddEventDialog.vue';

import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Screen, Dialog, Dark, Platform } from 'quasar';
import { useAuthStore } from 'src/stores/auth';
import { useRouter } from 'vue-router';

const router = useRouter();
const { t } = useI18n();

const route = useRoute();

const sidebar = ref();
const mainStore = useMainStore();
const authStore = useAuthStore();
const queryStore = useQueryStore();

const showAddEventDialog = () => {
  Dialog.create({
    component: AddEventDialog,
  }).onOk((data) => {
    if (!authStore.currentUser && data.host) {
      router.push({ name: 'Login' });
    } else if (data.host) {
      router.push({
        name: 'AddEventHost',
      });
    } else {
      router.push({
        name: 'AddEventPublic',
      });
    }
  });
};
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
        box-shadow:
          rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,
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
    .add-button {
      position: absolute;
      right: 16px;
      top: 18px;
      border-radius: 100px !important;
      &::before {
        //border-color: $b-4 !important;
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
