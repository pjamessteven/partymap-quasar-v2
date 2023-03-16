<template>
  <div class="main-layout">
    <MenuBar class="menubar" />
    <div class="overlay" :style="computedOverlayOpacity" />
    <!--<ControlsComponent v-if="$q.screen.lt.sm" class="controls-mobile" />-->
    <SideBar
      class="sidebar-component"
      v-show="$q.screen.lt.sm ? $route.name === 'Explore' : true"
    />
    <MainMap />
    <router-view
      v-slot="{ Component }"
      class="main-layout-router"
      v-bind:class="{
        'mobile-map-view-router': $q.screen.lt.sm,
      }"
    >
      <transition
        appear
        leave
        :enter-active-class="
          $q.screen.gt.sm ? 'animated slideInUp fast' : 'animated slideInUp'
        "
        :leave-active-class="
          $q.screen.gt.sm
            ? 'animated slideOutDown fast'
            : 'animated slideOutDown'
        "
      >
        <component :is="Component" />
      </transition>
    </router-view>

    <NavigationBar class="nav-bar" v-if="$q.screen.lt.sm" />
  </div>
</template>

<script lang="ts">
import MainMap from 'components/MainMap/MainMap.vue';
import SideBar from 'components/SideBar/SideBar.vue';
import MenuBar from 'components/MenuBar/MenuBar.vue';
import NavigationBar from 'src/components/NavigationBar.vue';
import { mapWritableState } from 'pinia';
import { useMapStore } from 'src/stores/map';
import { useMainStore } from 'src/stores/main';

export default {
  components: {
    MainMap,
    SideBar,
    MenuBar,
    NavigationBar,
  },
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
      'showPanelMobile',
    ]),
    computedOverlayOpacity() {
      if (this.$q.screen.gt.xs) {
        return `opacity: ${this.overlayOpacity}`;
      } else {
        if (this.showPanelMobile && this.$route.name === 'Explore')
          return 'opacity: 1';
        else return 'opacity: 0';
      }
    },
  },
};
</script>
<style lang="scss">
.body--dark {
  .main-layout {
    .overlay {
      background: rgba(0, 0, 0, 0.4);
    }
  }
}
.body--light {
  .main-layout {
    .overlay {
      background: rgba(0, 0, 0, 0.2);
    }
  }
}

.main-layout {
  height: 100%;
  width: 100%;
  position: relative;

  .overlay {
    z-index: 103;
    position: absolute;
    height: 100%;
    width: 100%;
    pointer-events: none;
    will-change: opacity;
  }
  .menubar {
    width: 100%;
    min-height: 62px !important;
    position: absolute;
    z-index: 1000 !important;
    pointer-events: none;
    z-index: 102;
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
    z-index: 103;
    top: 0px;
  }
  .mobile-map-view-router {
    z-index: 104;
  }
  .nav-bar {
    bottom: 0px !important;
    position: absolute;
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
    .overlay {
      transition: opacity 0.3s;
    }
  }
}
</style>
