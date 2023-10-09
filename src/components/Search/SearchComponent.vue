<template>
  <div class="search-component flex row items-center">
    <div
      class="controls-wrapper flex no-wrap"
      @click="() => (showSearch = !showSearch)"
    >
      <div class="controls-wrapper-inner">
        <div
          class="location-button-wrapper q-mr-sm"
          :class="showPanel ? 'show-panel' : ''"
          v-if="$q.screen.gt.xs && false"
        >
          <q-btn
            flat
            round
            class="q-pa-sm q-ml-md location t1"
            @click.stop="() => clickLocation()"
          >
            <template v-slot:default>
              <div v-if="!userLocationLoading" class="flex">
                <q-icon
                  name="mdi-crosshairs-gps"
                  class=""
                  v-if="(fineLocation && sidebarPanel === 'nearby') || true"
                  size="1.3rem"
                />
                <q-icon name="mdi-crosshairs" class="" v-else size="1.3rem" />
              </div>
              <div v-else style="position: relative" class="flex">
                <q-icon style="z-index: 1" name="mdi-crosshairs" />
                <q-icon
                  style="z-index: 2; left: 0px"
                  class="animated infinite flash slowest absolute"
                  name="mdi-crosshairs-gps"
                />
              </div>
              <!--
              <q-tooltip
                style="font-size: 1em !important"
                :content-class="
                  $q.dark.isActive
                    ? 'bg-black text-white'
                    : 'bg-white text-black'
                "
                :offset="[10, 10]"
              >
                Near you
              </q-tooltip>-->
            </template>
          </q-btn>
        </div>
        <ControlsComponent />

        <!--
          <q-icon
            flat
            class="q-pa-sm"
            @click.stop="() => getFineLocation()"
            size="1rem"
          >
            <template v-slot:default>
              <div v-if="!userLocationLoading" class="flex">
                <q-icon
                  name="mdi-crosshairs-gps"
                  class=""
                  v-if="fineLocation"
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
              <q-tooltip
                class=""
                :content-class="
                  $q.dark.isActive
                    ? 'bg-black text-white'
                    : 'bg-white text-black'
                "
                :offset="[10, 10]"
              >
                {{ $t('landing_page.improve_location') }}
              </q-tooltip>
            </template>
          </q-icon>
          -->
      </div>
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

    clickLocation() {
      this.getFineLocation();
      this.sidebarPanel = 'nearby';
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
  },
};
</script>

<style lang="scss" scoped>
.body--light {
  .search-component {
    .controls-wrapper {
      .controls-wrapper-inner {
        .location-button-wrapper {
          //background: white;
          color: $ti-1;
          .q-btn {
            color: $ti-1;
          }
          &.show-panel {
            .q-btn {
              color: $t-1;
            }
          }
        }
      }
    }
  }
  .controls-wrapper-inner {
    //
    box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);
    background: white;
    //background: #fafafa;
    color: $t-1;
    //border: 1px solid rgba(0, 0, 0, 0.1);
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
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    border-left: 1px solid rgba(255, 255, 255, 0.05);
    border-right: 1px solid rgba(255, 255, 255, 0.05);
  }
}
.search-component {
  z-index: 4000;
  position: absolute;
  top: 38px;
  width: 100%;
  display: flex;
  justify-content: center;
  pointer-events: none;

  .controls-wrapper {
    z-index: 1000;
    width: 100%;
    justify-content: center;
    position: relative;

    .controls-wrapper-inner {
      pointer-events: all;

      transition: all 0.3s;
      cursor: pointer;
      width: 510px;
      height: 100%;
      border-radius: 48px;
      backdrop-filter: blur(10px);
      position: relative;
      .location-button-wrapper {
        position: absolute;
        left: -80px;
        top: 4px;
        border-radius: 24px;
        background: transparent;
      }
    }
  }
  .search-dialog {
    z-index: 1000;
  }
}

.animated.slowest {
  animation-duration: calc(var(--animate-duration) * 10);
}

@media only screen and (min-width: 1921px) {
  .search-component {
  }
}

@media only screen and (max-width: 1280px) {
  .search-component {
    width: 100%;
    display: flex;
    justify-content: center;
    left: unset;
    padding: 0 16px;
    top: 72px;
  }
}

@media only screen and (max-width: 600px) {
  .body--light {
    .controls-wrapper-inner {
      box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }
  }
  .body--dark {
    .controls-wrapper-inner {
      border: 1px solid $bi-3;
      background: $bi-2;
      box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.4);
    }
  }
  .search-component {
    // android
    @supports ((top: var(--safe-area-inset-top))) {
      top: calc(68px + var(--safe-area-inset-top));
    }
    // ios specific padding
    @supports (
      (top: env(safe-area-inset-top)) and (font: -apple-system-body) and
        (-webkit-appearance: none)
    ) {
      top: calc(72px + env(safe-area-inset-top) - 8px);
    }
    .controls-wrapper {
      .controls-wrapper-inner {
      }
    }
  }
}
</style>
