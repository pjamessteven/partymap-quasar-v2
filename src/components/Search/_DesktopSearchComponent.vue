<template>
  <div
    class="desktop-search-component q-mt-md flex row items-center no-wrap"
    :class="{
      'transport-map': mapStyle === 'transport',
      'overlaying-map': overlayingMap,
      'center-absolute': $route.name !== 'Explore' && $q.screen.gt.xs,
    }"
  >
    <q-icon
      @click="() => $router.go(-1)"
      class="q-pr-md q-pl-sm"
      size="sm"
      name="mdi-chevron-left"
      v-if="$q.screen.lt.lg && sidebarPanel === 'search'"
    />

    <div class="searchbar flex row items-center">
      <div class="flex column inter bold items-center">
        <div class="searchbar-top flex row items-center no-wrap q-pa-md">
          <div class="q-mr-xs q-mr-sm">
            <q-icon size="1.2em" name="mdi-magnify" />
          </div>
          Search and filter events, places and artists
        </div>
        <div class="o-060 q-py-sm">Any Dates • All Tags • All Artists</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapWritableState } from 'pinia';
import { useMainStore } from 'src/stores/main';
import { useMapStore } from 'src/stores/map';
import { useSearchStore } from 'src/stores/search';
import { useQueryStore } from 'src/stores/query';
import ArtistControl from 'src/components/Controls/ArtistControl.vue';
import DateControl from 'src/components/Controls/DateControl.vue';
import DurationControl from 'src/components/Controls/DurationControl.vue';
import SizeControl from 'src/components/Controls/SizeControl.vue';
import TagControl from 'src/components/Controls/TagControl.vue';
import CustomQScroll from 'components/CustomQScroll.vue';
export default {
  components: {},
  props: ['overlayingMap'],
  data() {
    return {};
  },
  watch: {
    controlArtist: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.goToExplore();
        }
      },
      deep: true,
    },
    controlTag: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.goToExplore();
        }
      },
      deep: true,
    },
    controlDateRange: {
      handler(newVal) {
        if (newVal && newVal.end) {
          this.goToExplore();
        }
      },
      deep: true,
    },
    controlSize: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.goToExplore();
        }
      },
      deep: true,
    },
    controlDuration: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.goToExplore();
        }
      },
      deep: true,
    },
  },
  methods: {
    ...mapActions(useMainStore, ['loadIpInfo', 'getFineLocation']),
    goToExplore() {
      this.sidebarPanel = 'explore';
      if (this.$route.name !== 'Explore') {
        this.$router.push({ name: 'Explore', query: { view: 'explore' } });
      }
    },
    clickLocation() {
      this.getFineLocation();
      this.sidebarPanel = 'nearby';
    },
  },
  computed: {
    ipadPortrait() {
      // special layout case
      return this.$q.screen.gt.sm && this.windowWidth < 1124;
    },
    ...mapState(useMapStore, ['mapStyle']),
    ...mapWritableState(useSearchStore, ['query', 'searchbarShowing']),
    ...mapWritableState(useMainStore, [
      'sidebarPanel',
      'showPanel',
      'menubarOpacity',
    ]),
    ...mapState(useMainStore, [
      'windowWidth',
      'fineLocation',
      'userLocationLoading',
      'currentLocationCity',
      'currentLocation',
    ]),
    ...mapState(useQueryStore, [
      'controlDateRange',
      'controlFavorites',
      'controlDuration',
      'controlSize',
      'controlArtist',
      'controlTag',
      'controlCountry',
      'controlRegion',
      'controlLocality',

      'anyFiltersEnabled',
    ]),
    ...mapWritableState(useQueryStore, [
      'controlEmptyLineup',
      'controlDateUnconfirmed',
    ]),
  },
};
</script>

<style lang="scss" scoped>
.body--light {
  .desktop-search-component {
    .separator {
      color: $t-4;
    }
    .searchbar {
      //box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.);

      background: $b-2;
      color: $t-1;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }
    &.overlaying-map {
      .searchbar {
        backdrop-filter: blur(40px);

        //background: rgba(255, 255, 255, 0.3);
        background: linear-gradient(
          rgba(100, 100, 100, 0.68),
          rgba(100, 100, 100, 0.48)
        );
        color: $ti-1;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        border-left: 1px solid rgba(255, 255, 255, 0.1);
        border-right: 1px solid rgba(255, 255, 255, 0.1);

        :deep(.searchbar-wrapper) {
          .searchbar-input {
            .q-field__inner {
              .q-placeholder::placeholder {
                opacity: 1;
              }
              input {
                color: white !important;
              }
              .q-field__marginal {
                font-size: unset;
                color: white !important;
              }
            }
          }
        }
      }
      &.transport-map {
        .controls-wrapper {
          backdrop-filter: none;

          .controls-wrapper-inner {
            border: 1px solid rgba(0, 0, 0, 0.2);
            background: white;
            color: $t-1;

            :deep(.searchbar-wrapper) {
              .searchbar-input {
                .q-field__inner {
                  .q-placeholder::placeholder {
                    opacity: 1;
                  }
                  input {
                    color: $t-1 !important;
                  }
                  .q-field__marginal {
                    font-size: unset;
                    color: $t-1 !important;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
.body--dark {
  .desktop-search-component {
    .searchbar {
      color: $ti-2;
      background: $bi-3;

      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
  &.overlaying-map {
    .separator {
      color: $ti-4;
    }
    .searchbar {
      backdrop-filter: blur(40px);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      border-left: 1px solid rgba(255, 255, 255, 0.1);
      border-right: 1px solid rgba(255, 255, 255, 0.1);

      background: linear-gradient(rgba(80, 80, 80, 0.6), rgba(80, 80, 80, 0.6));
      color: $ti-1;
      // box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);
    }
  }
}

.desktop-search-component {
  z-index: 104;
  position: absolute;
  top: 8px;
  padding-left: 354px;
  width: 100%;
  display: flex;
  pointer-events: none;
  //max-width: 33vw;
  justify-content: center;
  //overflow-x: auto;
  //overflow-y: visible;
  &.center-absolute {
    position: absolute;
    width: 100%;
    justify-content: center;
  }

  .searchbar {
    border-top-right-radius: 30px;
    border-top-left-radius: 30px;
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;

    pointer-events: all;
    cursor: pointer;
    transition: all 0.3s;
    .searchbar-top {
      background: grey;
      border-radius: 50px;
    }
    &:hover {
      filter: brightness(1.5);
    }
  }
}

@media only screen and (max-width: 1576px) {
}
@media only screen and (max-width: 1376px) {
}
@media only screen and (max-width: 1024px) {
  .body--light {
  }

  .body--dark {
  }
}

@media only screen and (max-width: 600px) {
}
</style>
