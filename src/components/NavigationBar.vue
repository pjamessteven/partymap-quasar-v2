<template>
  <div
    class="navigation-bar flex row no-wrap"
    :class="$q.screen.gt.sm ? 'justify-between' : ''"
  >
    <div
      class="flex items-center"
      :class="{ 'q-pl-lg': $q.screen.gt.sm, 'q-pl-md': $q.screen.lt.md }"
    >
      <div :class="$q.screen.gt.xs ? 'q-mr-sm' : ''" style="margin-left: -8px">
        <q-btn
          v-if="sidebarPanel === 'nearby'"
          flat
          class="q-px-md q-py-md"
          @click.stop="clickNearbyButton"
        >
          <div v-if="!userLocationLoading" class="flex">
            <q-icon
              name="mdi-crosshairs-gps"
              class=""
              v-if="sidebarPanel === 'nearby'"
            />
            <q-icon name="mdi-crosshairs" class="" v-else />
          </div>
          <div v-else style="position: relative" class="flex">
            <q-icon style="z-index: 1" name="mdi-crosshairs" />
            <q-icon
              style="z-index: 2; left: 0px"
              class="animated infinite flash slowest absolute"
              name="mdi-crosshairs-gps"
            />
          </div>
        </q-btn>
        <q-btn
          v-else-if="sidebarPanel !== 'nearby'"
          flat
          class="q-px-md q-py-md"
          @click.stop="() => (sidebarPanel = 'nearby')"
        >
          <q-icon name="mdi-chevron-left" />
        </q-btn>
      </div>
      <div
        class="q-pr-md inter bolder"
        :class="$q.screen.gt.xs ? 'text-h6 q-py-lg' : 'text-large q-py-md'"
        style="text-transform: capitalize"
      >
        <span
          v-if="sidebarPanel !== 'nearby'"
          class="t4"
          @click.stop="() => (sidebarPanel = 'nearby')"
        >
        </span>
        {{ computedPanelName }}
      </div>
      <q-btn
        v-if="sidebarPanel === 'explore'"
        flat
        style="margin-left: -8px"
        class="q-px-sm q-m-sm"
        @click.stop="() => getFineLocation()"
      >
        <template v-slot:default>
          <q-tooltip
            class=""
            :content-class="
              $q.dark.isActive ? 'bg-black text-white' : 'bg-white text-black'
            "
            :offset="[10, 10]"
          >
            {{ $t('landing_page.improve_location') }}
          </q-tooltip>
        </template>
      </q-btn>
    </div>
    <div class="flex row items-center">
      <div
        class="nav-button-container flex row items-center o-wrap q-px-md inter bold t1"
        :class="{
          'q-mt-sm q-gutter-sm': $q.screen.lt.sm,
          'text-large q-px-lg q-gutter-md': $q.screen.gt.xs,
        }"
      >
        <div
          v-if="sidebarPanel === 'nearby' && $q.screen.gt.sm"
          @click.stop="showAddEventDialog()"
          class="q-pl-lg q-pr-md q-py-sm nav-button flex items-center justify-between"
        >
          <span v-if="$q.screen.lt.sm">Add</span
          ><span v-else>Add an event</span>
          <q-icon name="mdi-plus" size="1.5rem" class="q-ml-sm" />
        </div>

        <div
          v-if="sidebarPanel === 'nearby' && $q.screen.gt.sm"
          class="q-pl-lg q-pr-md q-py-sm nav-button flex items-center justify-between"
        >
          Explore the map
          <q-icon name="mdi-chevron-right" size="1.5rem" class="q-ml-sm" />
        </div>
        <div
          v-if="sidebarPanel === 'explore' && $q.screen.gt.xs"
          class="q-pl-lg q-pr-md q-py-sm nav-button flex items-center justify-between"
        >
          <span v-if="showPanel">Hide results</span>
          <span v-else>Show results</span>
          <q-icon
            size="1.5rem"
            class="q-ml-sm"
            :class="{ 'rotate-180': showPanel }"
            name="mdi-chevron-up"
          />
        </div>
      </div>
    </div>
    <!--
    <q-tabs
      @click.stop
      :content-class="$q.screen.gt.lg ? '' : ''"
      v-model="sidebarPanel"
      no-caps
      :indicator-color="
        $q.screen.lt.sm
          ? $route.name === 'Explore'
            ? undefined
            : 'transparent'
          : 'transparent'
      "
      :active-class="
        $q.screen.lt.sm
          ? $route.name === 'Explore'
            ? undefined
            : 'inactive-tab'
          : 'active-tab'
      "
    >
      <q-tab
        key="1"
        name="nearby"
        content-class="tab"
        :label="$q.screen.gt.xs ? undefined : 'Home'"
        :ripple="false"
        :icon="sidebarPanel === 'nearby' ? 'mdi-home' : 'mdi-home-outline'"
      />

      <q-tab
        key="2"
        name="explore"
        icon="mdi-map-search"
        :label="$q.screen.gt.xs ? undefined : 'Explore'"
        content-class="tab"
        :ripple="false"
      />
      <q-tab
        key="3"
        name="favorites"
        :icon="
          sidebarPanel === 'favorites'
            ? 'mdi-account-circle-outline'
            : 'mdi-account-circle-outline'
        "
        :label="$q.screen.gt.xs ? undefined : 'You'"
        content-class="tab"
        :ripple="false"
      />
      <q-tab
        key="4"
        name="search"
        icon="mdi-magnify"
        :label="$q.screen.gt.xs ? undefined : 'Search'"
        content-class="tab"
        :ripple="false"
      />
    </q-tabs>
    -->
  </div>
</template>
<script>
import { mapState, mapActions, mapWritableState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
import { useMainStore } from 'src/stores/main';
import { useQueryStore } from 'src/stores/query';
import AddEventDialog from 'components/dialogs/AddEventDialog.vue';

export default {
  name: 'NavigationBar',

  components: {},
  props: {},

  data() {
    return {};
  },
  methods: {
    ...mapActions(useMainStore, ['loadIpInfo', 'getFineLocation']),
    clickNearbyButton() {
      if (this.sidebarPanel === 'nearby') this.getFineLocation();
    },
    showAddEventDialog() {
      this.$q
        .dialog({
          parent: this,
          component: AddEventDialog,
        })
        .onOk((data) => {
          if (!this.currentUser && data.host) {
            this.$router.push({
              path: '/login',
              query: { from: this.$route.path },
            });
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
  },
  watch: {},
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
    ...mapWritableState(useMainStore, ['sidebarPanel', 'showPanel']),
    ...mapState(useMainStore, [
      'fineLocation',
      'userLocationLoading',
      'userLocationCity',
      'userLocation',
    ]),
    ...mapWritableState(useQueryStore, ['controlFavorites']),
    computedLocationName() {
      return 'Near ' + this.userLocationCity;
    },
    computedPanelName() {
      switch (this.sidebarPanel) {
        case 'nearby':
          if (this.userLocation) {
            this.computedLocationName;
          }
          return 'Finding your location...';
        case 'explore':
          return 'Events in this area';
        case 'favorites':
          return 'Your Events';
        case 'search':
          return 'Search';
      }
      return '';
    },
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .nav-separator {
    background: linear-gradient(
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
  }
  .navigation-bar {
    //border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    border-top: 1px solid rgba(255, 255, 255, 0.2);

    .nav-button-container {
      .nav-button {
        background: $bi-3;
        //border: 1px solid rgba(255, 255, 255, 0.1);
        &:hover {
          background: $bi-4;
        }
      }
    }

    :deep(.q-tabs) {
      color: $ti-4 !important;

      .q-tab {
        &.q-tab--active {
          background: $bi-3;
          color: $ti-1 !important;

          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      }
    }
  }
}
.body--light {
  .navigation-bar {
    box-shadow: rgba(100, 100, 111, 0.15) 0px 7px 29px 0px;
    background: white;

    .nav-button-container {
      .nav-button {
        background: $b-2;
        &:hover {
          background: $b-3;
        }
        &.primary {
          background: $primary;
          color: white;
        }
      }
    }

    :deep(.q-tabs) {
      .q-tab {
        color: $t-4 !important;

        &.q-tab--active {
          background: $b-2;
          border: 1px solid rgba(0, 0, 0, 0.1);
          color: $t-1 !important;
        }
      }
    }
  }
  .nav-separator {
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.1), transparent);
  }
}
.navigation-bar {
  width: 216px;
  padding-right: 8px;
  pointer-events: all;
  overflow: none;
  width: 100%;
  z-index: 2000;
  //height: 62px;
  position: relative;
  .nav-button-container {
    .nav-button {
      transition: all 0.3s ease;
      cursor: pointer;
      border-radius: 9px;
      flex-grow: 0;
      flex-basis: 1;
      max-height: 56px;
      //dth: 264px;
    }
  }

  :deep(.q-tabs) {
    position: absolute;
    right: 12px;

    .q-tab {
      padding-top: 4px;
      //padding-bottom: 4px;
      padding: 8px;
      margin: 16px 4px;
      border-radius: 18px;
      transition: all 0.3s;

      opacity: 1 !important;
      border: 1px solid transparent;
      &.q-tab--active {
      }
      &.q-tab--inactive {
        color: grey;
        // opacity: 0.3 !important;
      }
    }
  }
  :deep(.q-tab__icon) {
    //padding: 0px 0px;
  }
}
.nav-separator {
  width: 1px;
  height: 100%;
}
.inactive-tab {
  opacity: 0.3 !important;
}
.animated.slowest {
  animation-duration: calc(var(--animate-duration) * 10);
}
@media only screen and (max-width: 600px) {
  .body--dark {
    .navigation-bar {
      background: black;
      //box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.8);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      :deep(.q-tabs) {
        color: $ti-2 !important;

        .q-tab {
          color: white;
        }
      }
      //box-shadow: 0px 0px 46px -6px rgb(230,230,230);
    }
  }
  .body--light {
    .navigation-bar {
      background: white;
      //box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.1);;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      :deep(.q-tabs) {
        .q-tab {
          color: black;
          color: $t-1 !important;
        }
      }
    }
  }

  .nav-separator {
    display: none;
  }
  .navigation-bar {
    width: 100%;
    z-index: 1000;
    bottom: 0;
    border-bottom: none !important;
    justify-content: unset;
  }
}
</style>
