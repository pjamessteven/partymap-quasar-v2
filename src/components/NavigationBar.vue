<template>
  <div class="navigation-bar flex row no-wrap">
    <q-tabs
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
          : undefined
      "
    >
      <q-tab
        name="nearby"
        :icon="sidebarPanel === 'nearby' ? 'mdi-home' : 'mdi-home-outline'"
        :label="'Nearby'"
        content-class="tab"
        :ripple="false"
        @click="backToExplore"
      />
      <q-tab
        name="explore"
        icon="mdi-map-search"
        :label="'Explore'"
        content-class="tab"
        :ripple="false"
        @click="backToExplore"
      />
      <q-tab
        name="favorites"
        :icon="
          sidebarPanel === 'favorites'
            ? 'mdi-account-circle'
            : 'mdi-account-circle-outline'
        "
        :label="'You'"
        content-class="tab"
        :ripple="false"
        @click="backToExplore"
      />
      <q-tab
        name="search"
        icon="mdi-magnify"
        :label="'Search'"
        content-class="tab"
        :ripple="false"
        @click="backToExplore"
      />
    </q-tabs>
  </div>
</template>
<script>
import { mapState, mapWritableState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
import { useMainStore } from 'src/stores/main';
import { useQueryStore } from 'src/stores/query';

export default {
  name: 'NavigationBar',

  components: {},
  props: {},

  data() {
    return {};
  },
  methods: {
    // go back to explore
    // if the user is on an event or artist page
    backToExplore() {
      if (this.$route.name !== 'explore') {
        this.$router.push({ name: 'Explore' });
      }
    },
  },
  watch: {
    sidebarPanel(to, from) {
      // this.backToExplore();
      if (to === 'explore') {
        this.showPanelMobile = false;
      }
      if (to === 'search') {
        this.showPanelMobile = true;
      }
      if (to === 'nearby') {
        this.showPanelMobile = true;
      }
      if (to === 'favorites') {
        if (this.currentUser) {
          this.controlFavorites = true;
          this.showPanelMobile = true;
        } else {
          this.sidebarPanel = from;

          this.$router.push({ name: 'Login' });
        }
      } else if (from === 'favorites') {
        this.controlFavorites = false;
      }
    },
  },
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
    ...mapWritableState(useMainStore, ['sidebarPanel', 'showPanelMobile']),
    ...mapWritableState(useQueryStore, ['controlFavorites']),
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
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
}
.body--light {
  .navigation-bar {
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    //border-bottom: 1px solid rgba(0, 0, 0, 0.1);

    //box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.2);
  }
  .nav-separator {
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.1), transparent);
  }
}
.navigation-bar {
  width: 216px;
  padding-right: 8px;
  pointer-events: all;
  //height: 62px;
  :deep(.q-tabs) {
    height: 100%;
    width: 100%;
    font-family: chicagoflf;

    .q-tab {
      padding-top: 4px;
      opacity: 0.3;
      //padding-bottom: 4px;
      &.q-tab--active {
        opacity: 1;
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
@media only screen and (max-width: 600px) {
  .body--dark {
    .navigation-bar {
      background: black;
      box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.8);
      border-top: 1px solid rgba(255, 255, 255, 0.1);

      //box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.1);
    }
  }
  .body--light {
    .navigation-bar {
      background: white;
      box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.1);
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      :deep(.q-tabs) {
        .q-tab {
          color: black;
        }
      }
    }
  }
  .nav-separator {
    display: none;
  }
  .navigation-bar {
    width: 100%;
    position: absolute;
    z-index: 1000;
    bottom: 0;

    :deep(.q-tab__icon) {
      padding: 6px 4px;
    }
  }
}
</style>
