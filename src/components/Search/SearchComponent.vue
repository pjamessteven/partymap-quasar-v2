<template>
  <div class="search-component flex row items-center">
    <!--
    <div class="location-button-wrapper q-mr-sm">
      <q-icon
        flat
        class="q-pa-sm"
        @click.stop="() => getFineLocation()"
        size="1.5em"
      >
        <template v-slot:default>
          <div v-if="!userLocationLoading" class="flex">
            <q-icon name="mdi-crosshairs-gps" class="" v-if="fineLocation" />
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
      </q-icon>
    </div>
    -->
    <div
      class="controls-wrapper flex no-wrap"
      @click="() => (showSearch = !showSearch)"
    >
      <div class="controls-wrapper-inner">
        <ControlsComponent />
      </div>

      <!--
      <q-btn
        :class="{ 'show-location': sidebarPanel === 'explore' }"
        flat
        round
        class="q-pa-sm q-ml-md location"
        @click.stop="() => clickLocation()"
        :color="iconColor"
      >
        <template v-slot:default>
          <div v-if="!userLocationLoading" class="flex">
            <q-icon
              name="mdi-crosshairs-gps"
              class=""
              v-if="fineLocation && sidebarPanel === 'nearby'"
              size="1.5rem"
            />
            <q-icon name="mdi-crosshairs" class="" v-else size="1.5rem" />
          </div>
          <div v-else style="position: relative" class="flex">
            <q-icon style="z-index: 1" name="mdi-crosshairs" />
            <q-icon
              style="z-index: 2; left: 0px"
              class="animated infinite flash slowest absolute"
              name="mdi-crosshairs-gps"
            />
          </div>
        </template>
      </q-btn>
      -->
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapWritableState } from 'pinia';
import { useMainStore } from 'src/stores/main';
import { useSearchStore } from 'src/stores/search';
import ControlsComponent from 'src/components/Controls/ControlsComponent.vue';

export default {
  components: { ControlsComponent },
  props: {},
  data() {
    return { showSearch: false };
  },
  methods: {
    ...mapActions(useMainStore, ['loadIpInfo', 'getFineLocation']),
    onInput() {
      this.sidebarPanel = 'search';
      this.showPanel = true;
    },
    clickLocation() {
      this.getFineLocation();
    },
    /*
    showDialog() {
      //this.sidebarPanel = 'explore';
      this.dialog = this.$q.dialog({
        component: SearchDialog,
        parent: this, // becomes child of this Vue node
        // ("this" points to your Vue component)
        // (prop was called "root" in < 1.1.0 and
        // still works, but recommending to switch
        // to the more appropriate "parent" name)

        transitionShow: 'slide-down',
        transitionHide: 'side-up',
        // props forwarded to component
      });
    },
    */
  },
  computed: {
    ...mapWritableState(useSearchStore, ['query']),
    ...mapWritableState(useMainStore, [
      'sidebarPanel',
      'showPanel',
      'menubarOpacity',
    ]),
    ...mapState(useMainStore, [
      'fineLocation',
      'userLocationLoading',
      'userLocationCity',
      'userLocation',
    ]),
    iconColor() {
      if (this.showPanel && !this.$q.dark.isActive) {
        return 'darkgrey';
      } else {
        return 'white';
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.body--light {
  .location-button-wrapper {
    background: white;
    color: $t-1;
  }
  .controls-wrapper-inner {
    box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.2);

    background: white;
    color: $t-1;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  .search-popup-wrapper {
    background: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
}
.body--dark {
  .controls-wrapper-inner {
    color: $ti-1;
    background: $bi-2;

    //background: rgba(0, 0, 0, 0.5);
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
}
.search-component {
  z-index: 1000;
  position: absolute;
  top: 24px;
  width: 100%;
  display: flex;
  justify-content: center;
  pointer-events: none;
  .location-button-wrapper {
    border-radius: 24px;
  }
  .controls-wrapper {
    z-index: 1000;
    width: 100%;
    justify-content: center;
    &:hover {
      .controls-wrapper-inner {
        background: rgba(255, 255, 255, 0.1);
      }
    }
    .location {
      opacity: 0;
      transition: opacity 0.3s ease;
      &.show-location {
        opacity: 1;
      }
    }
    .controls-wrapper-inner {
      pointer-events: all;

      overflow: hidden;
      transition: all 0.3s;
      cursor: pointer;
      width: 500px;
      height: 100%;
      border-radius: 48px;
      backdrop-filter: blur(10px);
    }
  }
  .search-dialog {
    z-index: 1000;
  }
}
@media only screen and (max-width: 1024px) {
  .search-component {
    width: 100%;
    display: flex;
    justify-content: center;
    top: 64px;
    left: unset;
  }
}
</style>
