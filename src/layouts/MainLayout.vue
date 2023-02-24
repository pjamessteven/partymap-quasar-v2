<template>
  <div class="main-layout">
    <MenuBar class="menubar" />
    <SideBar />
    <MainMap />
    <transition
      appear
      leave
      :enter-active-class="
        $q.screen.gt.sm ? 'animated slideInUp fast' : 'animated slideInUp'
      "
      :leave-active-class="
        $q.screen.gt.sm ? 'animated slideOutDown fast' : 'animated slideOutDown'
      "
    >
      <router-view
        class="main-layout-router"
        v-bind:class="{
          'mobile-map-view-router': $q.screen.lt.sm,
        }"
      />
    </transition>
  </div>
</template>

<script lang="ts">
import MainMap from 'components/MainMap/MainMap.vue';
import SideBar from 'components/SideBar/SideBar.vue';
import MenuBar from 'components/MenuBar/MenuBar.vue';
import { mapWritableState } from 'pinia';
import { useMapStore } from 'src/stores/map';
import { useMainStore } from 'src/stores/main';

export default {
  components: {
    MainMap,
    SideBar,
    MenuBar,
  },
  computed: {
    ...mapWritableState(useMapStore, ['blockUpdates']),
    ...mapWritableState(useMainStore, ['showSidebar']),
  },
};
</script>
<style lang="scss">
.main-layout {
  height: 100%;
  width: 100%;
  position: relative;
  .menubar {
    width: 100%;
    min-height: 62px !important;
    position: absolute;
    z-index: 1000 !important;
    pointer-events: none;
  }
  .main-layout-router {
    position: absolute;
    height: 100%;
    width: 100%;
    z-index: 100;
    top: 0px;
  }
}
</style>
