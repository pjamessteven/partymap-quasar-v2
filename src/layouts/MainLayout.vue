<template>
  <div class="main-layout">
    <MenuBar class="menubar" />
    <div class="overlay" :style="computedOverlayStyle" />
    <!--<ControlsComponent v-if="$q.screen.lt.sm" class="controls-mobile" />-->
    <SideBar class="sidebar-component" />
    <MainMap />
    <!-- There's two router views because we want different transitions for different pages
    and we're lazy... -->
    <router-view
      name="event"
      v-slot="{ Component }"
      class="main-layout-router"
      v-bind:class="{
        'mobile-map-view-router': $q.screen.lt.sm,
      }"
    >
      <transition
        appear
        leave
        enter-active-class="animated slideInUp"
        leave-active-class="animated slideOutDown"
      >
        <component :is="Component" />
      </transition>
    </router-view>
    <router-view
      v-slot="{ Component }"
      class="main-layout-router"
      v-bind:class="{
        'mobile-map-view-router': $q.screen.lt.sm,
      }"
    >
      <transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <component :is="Component" />
      </transition>
    </router-view>

    <NavigationBar class="nav-bar" v-if="$q.screen.lt" />
  </div>
</template>

<script lang="ts">
import MainMap from 'components/MainMap/MainMap.vue';
import SideBar from 'components/SideBar/SideBar.vue';
import MenuBar from 'components/MenuBar/MenuBar.vue';
import MenuBarLogo from 'src/components/MenuBar/MenuBarLogo.vue';
import NavigationBar from 'src/components/NavigationBar.vue';
import { mapWritableState } from 'pinia';
import { useMapStore } from 'src/stores/map';
import { useMainStore } from 'src/stores/main';

export default {
  components: {
    MainMap,
    SideBar,
    MenuBar,
    MenuBarLogo,
    NavigationBar,
  },
  methods: {},
  beforeRouteUpdate(to, from, next) {
    if (from.name === 'Explore') {
      console.log('blockupdate');
      this.blockUpdates = true;
      // blockUpdates is re-enabled in Map.vue at map.
    }
    this.$nextTick(() => {
      next();
    });
  },
  computed: {
    ...mapWritableState(useMapStore, ['blockUpdates']),
    ...mapWritableState(useMainStore, [
      'showSidebar',
      'overlayOpacity',
      'showPanel',
    ]),
    computedOverlayStyle() {
      if (this.$q.screen.lt.sm && this.$route.name === 'EventPage') {
        return `opacity: ${this.overlayOpacity}; background: black!important`;
      } else {
        if (this.showPanel && this.$route.name === 'Explore')
          return 'opacity: 1';
        else return 'opacity: 0.3';
      }
    },
  },
};
</script>
<style lang="scss">
.body--dark {
  .main-layout {
    .overlay {
      background: linear-gradient(
        rgba(0, 0, 0, 0.78) 0px,
        rgba(0, 0, 0, 0.78) 64px,
        rgba(0, 0, 0, 0.58) 128px,
        rgba(0, 0, 0, 0) calc(100% - 256px),
        rgba(0, 0, 0, 0.78) 100%
      );
    }
  }
}
.body--light {
  .main-layout {
    .overlay {
      background: linear-gradient(
        rgba(0, 0, 0, 0.48) 0px,
        rgba(0, 0, 0, 0.48) 64px,
        rgba(0, 0, 0, 0.3) 128px,
        rgba(0, 0, 0, 0) calc(100% - 256px),
        rgba(0, 0, 0, 0.48) 100%
      );
    }
  }
}

.main-layout {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
  .overlay {
    z-index: 103;
    position: absolute;
    height: 100%;
    width: 100%;
    pointer-events: none;
    will-change: opacity;
    transition: opacity 0.3s;
  }
  .menubar {
    width: 100%;
    min-height: 62px !important;
    position: absolute;
    z-index: 1000 !important;
    pointer-events: none;
    z-index: 102;
  }
  .menubar-logo {
    position: absolute;
    z-index: 1000;
  }
  .controls-mobile {
    position: absolute;
    z-index: 103;
    top: 64px;
    width: 100%;
  }
  .sidebar-component {
    z-index: 104;
  }
  .main-layout-router {
    position: absolute;
    height: 100%;
    width: 100%;
    z-index: 105;
    top: 0px;
  }
  .mobile-map-view-router {
    z-index: 104;
  }
  .nav-bar {
  }
}
@media only screen and (max-width: 600px) {
  .body--dark {
    .main-layout {
      .overlay {
        background: rgba(0, 0, 0, 0.68);
      }
    }
  }
  .body--light {
    .main-layout {
      .overlay {
        background: rgba(0, 0, 0, 0.68);
      }
    }
  }
  .main-layout {
    .main-layout-router {
      padding-bottom: 72px;
    }
    .overlay {
      // transition: opacity 0.3s;
    }
  }
}
</style>
