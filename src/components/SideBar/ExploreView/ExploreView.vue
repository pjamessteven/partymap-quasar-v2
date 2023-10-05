<template>
  <div
    class="event-list-vertical shadow-0 main-content"
    style="height: 100%; width: 100%; position: relative; overflow: hidden"
  >
    <div
      @click="() => (showPanel = !showPanel)"
      style="pointer-events: all; cursor: pointer"
      class="inter bolder text-h5 flex items-center justify-between q-pl-lg q-pr-md q-py-md explore-header"
      v-if="$q.screen.gt.xs && false"
    >
      <div>Explore Events</div>
      <div class="flex items-center q-my-sm show-map">
        <q-icon
          flat
          class="q-mr-md"
          size="2rem"
          :class="{ 'rotate-180': showPanel }"
          name="mdi-chevron-up"
          style="cursor: pointer"
        />
      </div>
    </div>
    <div
      :class="{ 'q-px-md': showPanel || true }"
      v-if="$q.screen.gt.xs && false"
    >
      <q-separator />
    </div>

    <div class="mobile-panel-button">
      <q-icon
        @click="() => (showPanel = !showPanel)"
        v-if="$q.screen.lt.sm"
        flat
        size="1.5rem"
        class="q-pa-md q-mr-xs t2"
        :class="{ 'rotate-180': showPanel }"
        name="mdi-chevron-up"
        style="pointer-events: all"
      />
    </div>
    <div class="touch-overlay" v-touch-swipe.vertical="handleSwipe" />
    <div class="event-list-inner">
      <div
        class="flex row no-wrap items-center justify-between q-px-md q-pt-md q-pb-sm view-options-absolute"
        v-if="$q.screen.gt.xs"
      >
        <div class="text-h5 inter bolder q-ml-sm q-my-sm">Explore Events</div>
        <div class="flex row items-center no-wrap">
          <EventDateViewOptions class="q-mr-md" />

          <q-icon
            @click="() => (showPanel = !showPanel)"
            v-if="$q.screen.gt.xs"
            flat
            size="2.5rem"
            class="q-mr-md t1"
            name="mdi-chevron-up"
            :class="{ 'rotate-180': showPanel }"
            style="cursor: pointer"
          />
        </div>
      </div>
      <div class="flex column grow no-wrap">
        <q-scroll-area
          vertical
          @scroll="onScrollMainContent"
          ref="scroll"
          :thumb-style="{
            right: $q.screen.gt.xs ? '0px' : '-16px',
            width: $q.screen.gt.xs ? '8px' : '4px',
            borderRadius: 0,
          }"
          class="scroll-area flex grow"
          @mouseenter="mouseEnter"
          :class="!showPanel && 'disable-scroll'"
        >
          <div class="flex column no-wrap scroll-content q-px-sm">
            <transition appear enter-active-class="animated fadeIn slow">
              <div
                class="flex column"
                :style="mapMoving && !blockUpdates ? 'opacity: 0' : ''"
              >
                <EventDateList
                  v-if="compactView"
                  :groupByMonth="groupEventsByMonth"
                  :eventDatesGroupedByMonth="eventDatesGroupedByMonth"
                  :eventDates="eventDates"
                  :hasNext="eventDatesHasNext"
                  :loading="eventDatesLoading"
                  :eventDatesTotal="eventDatesTotal"
                />

                <EventDatePosterList
                  v-if="!compactView"
                  :groupByMonth="groupEventsByMonth"
                  :eventDatesGroupedByMonth="eventDatesGroupedByMonth"
                  :eventDates="eventDates"
                  :hasNext="eventDatesHasNext"
                  :loading="eventDatesLoading"
                  :eventDatesTotal="eventDatesTotal"
                />
              </div>
            </transition>
          </div>
        </q-scroll-area>
      </div>
      <div
        v-if="
          $q.screen.gt.xs && (isLoadingInitial || (mapMoving && !blockUpdates))
        "
        style="height: 100%; position: absolute; width: 100%; z-index: 500"
        class="t4 inter semibold q-mt-md event-date-center flex grow justify-center"
      >
        Loading...
      </div>
      <div
        class="event-date-center flex column grow no-wrap justify-center"
        :style="
          $q.screen.lt.sm
            ? 'height: 144px; position: absolute; width: 100%; z-index: 500'
            : 'height: 240px; position: absolute; width: 100%; z-index: 500'
        "
      >
        <div
          class="inter semibold q-mb-lg"
          v-if="
            (isLoadingInitial || (mapMoving && !blockUpdates)) && !showPanel
          "
        >
          Finding what's good...
        </div>
        <div
          class="inter semibold q-mb-md"
          v-else-if="!isLoadingInitial && eventDatesTotal === 0"
        >
          Nothing to see here
        </div>

        <q-linear-progress
          v-if="
            (isLoadingInitial || (mapMoving && !blockUpdates)) && !showPanel
          "
          class="linear-progress"
          indeterminate
          size="2px"
          :color="$q.dark.isActive ? 'grey-6' : 'grey-8'"
          rounded
          :style="$q.screen.gt.xs ? 'max-width: 200px' : 'max-width: 120px'"
        />
        <div
          class="flex row no-wrap"
          style="pointer-events: all"
          v-else-if="
            ((groupEventsByMonth &&
              Object.keys(eventDatesGroupedByMonth)?.length == 0) ||
              (!groupEventsByMonth && eventDates && eventDates.length === 0)) &&
            !(isLoadingInitial || (mapMoving && !blockUpdates))
          "
        >
          <q-btn
            no-caps
            v-if="anyFiltersEnabled"
            class="button-plain flex items-center"
            @click="
              () => {
                clearAllFilters();
              }
            "
          >
            <div class="flex items-center row no-wrap">
              <q-icon name="mdi-close" size="1rem" class="q-pr-md" />
              <div>Clear filters</div>
            </div>
          </q-btn>
          <q-btn
            no-caps
            v-if="mapZoomLevel > 2"
            class="button-plain flex items-center q-ml-sm"
            @click="zoomOut()"
          >
            <div class="flex items-center row no-wrap">
              <q-icon
                name="mdi-magnify-minus-outline"
                size="1rem"
                class="q-pr-md"
              />
              <div>Zoom out</div>
            </div>
          </q-btn>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { toRaw } from 'vue';

import _ from 'lodash';
//import ArtistProfile from 'components/ArtistProfile.vue';

import EventDateList from 'src/components/EventDateList.vue';
import EventDatePosterList from 'src/components/EventDatePosterList.vue';
import EventDateViewOptions from 'src/components/EventDateViewOptions.vue';

import { useMapStore } from 'src/stores/map';
import { useQueryStore } from 'src/stores/query';
import { useMainStore } from 'src/stores/main';
import { useAuthStore } from 'src/stores/auth';
import { mapActions, mapWritableState, mapState } from 'pinia';

export default {
  components: {
    //ControlsComponent,
    //ArtistProfile,
    //ArtistsComponent,
    EventDateList,
    EventDatePosterList,
    EventDateViewOptions,
  },

  mounted() {
    setTimeout(() => {
      this.hasLoaded = true;
      // the event listener in q-scroll-area causees a bug in ios that makes you have to click twice on links within
    }, 500);
  },
  data() {
    return {
      mainContentScrollPosition: 0,
      scrollingUp: false,
      hasLoaded: false,
      headerYPosition: 0,
      year: 0,
      componentGroup: {},
      isLoadingDatesInitial: false,
      isLoadingArtistsInitial: false,
    };
  },
  methods: {
    ...mapActions(useQueryStore, [
      'loadEventDates',
      'loadArtists',
      'loadMoreArtists',
      'clearAllFilters',
    ]),
    ...mapActions(useMainStore, ['loadIpInfo']),
    zoomOut() {
      toRaw(this.map).setZoom(1);
      this.showPanel = false;
    },
    async getInitialList() {
      // event date stuff
      // this.isLoadingDatesInitial = true;
      if (this.$refs) this.$refs.scroll.setScrollPercentage('vertical', 0);
      this.eventDatesHasNext = true;
      this.eventDatesPage = 1;
      this.eventDatesTotal = null;
      this.eventDates = []; // this is actually quite important
      this.eventDatesGroupedByMonth = {};
      if (!this.userLocation) {
        await this.loadIpInfo();
        this.loadMore();
      } else {
        this.loadMore();
      }
    },
    async loadMore() {
      if (
        this.$route.name === 'Explore' &&
        this.eventDatesHasNext &&
        !this.blockUpdates
      ) {
        try {
          await this.loadEventDates();
        } catch (error) {}
      }
    },
    handleSwipe() {
      this.showPanel = !this.showPanel;
    },

    onScrollMainContent(info) {
      this.mainContentScrollPosition = info.verticalPosition;
      if (info.verticalPercentage === 0) {
        if (!this.$q.platform.has.touch) {
          setTimeout(() => {
            // behavior fix for desktop scroll
            this.enablePanelSwipeDown = true;
          }, 250);
        } else {
          this.enablePanelSwipeDown = true;
        }
      } else {
        this.enablePanelSwipeDown = false;
      }
      if (info.verticalPercentage > 0.99) {
        // reached bottom
        this.loadMore();
      }
    },
  },
  watch: {
    showPanel(newv) {
      if (newv) {
        this.enablePanelSwipeDown = true;
      }
    },
    mapMoving(newv) {
      if (newv) this.eventDatesHasNext = false;
    },
    route: {
      handler: async function (to) {
        if (to.name === 'Explore' && !this.blockUpdates) {
          if (this.eventDates?.length === 0) {
            if (!this.userLocation) {
              await this.loadIpInfo();
              this.getInitialList();
            } else {
              this.getInitialList();
            }
          }
        }
      },
    },
    mapBounds() {
      if (!this.blockUpdates) {
        // map moved
        // if updates are not blocked, update event dates
        this.getInitialList();
      }
    },

    controlDateRange: {
      handler() {
        console.log('ctl date range');
        this.getInitialList();
      },
      deep: true,
    },
    controlDuration: {
      handler() {
        this.getInitialList();
      },
      deep: true,
    },
    controlSize: {
      handler() {
        this.getInitialList();
      },
      deep: true,
    },
    controlArtist: {
      handler() {
        this.getInitialList();
      },
      deep: true,
    },
    controlTag: {
      handler() {
        this.getInitialList();
      },
      deep: true,
    },
  },
  computed: {
    ...mapState(useMainStore, [
      'sidebarPanel',
      'userLocation',
      'compactView',
      'groupEventsByMonth',
    ]),
    ...mapWritableState(useMainStore, ['showPanel', 'enablePanelSwipeDown']),
    ...mapWritableState(useMapStore, ['map']),
    ...mapState(useAuthStore, ['currentUser']),
    ...mapState(useMapStore, [
      'mapBounds',
      'blockUpdates',
      'mapMoving',
      'showResults',
      'mapZoomLevel',
    ]),
    ...mapState(useQueryStore, [
      'controlTag',
      'controlDateRange',
      'controlSize',
      'controlDuration',
      'controlArtist',
      'artists',
      'artistsHasNext',
      'anyFiltersEnabled',
    ]),
    ...mapWritableState(useQueryStore, [
      'eventDates',
      'eventDatesTotal',
      'eventDatesPage',
      'eventDatesHasNext',
      'artistsPage',
      'artistsHasNext',
      'eventDatesLoading',
      'eventDatesGroupedByMonth',
    ]),
    noFiltersSelected() {
      return (
        this.controlDateRange.end === null &&
        this.controlArtist.length === 0 &&
        this.controlDuration.length === 0 &&
        this.controlSize.length === 0 &&
        this.controlTag.length === 0
      );
    },
    isLoadingInitial() {
      // return this.isLoadingDatesInitial || this.isLoadingArtistsInitial;
      return this.eventDatesLoading && this.eventDatesTotal <= 1;
    },

    route() {
      return this.$route;
    },
    getTitleOpactity() {
      let opacity = 1 - this.mainContentScrollPosition / 0;
      let op1;
      if (opacity < 0) {
        op1 = 0;
      } else {
        op1 = opacity;
      }
      return `opacity: ${op1}`;
    },
    getBottomDivider() {
      var opacity = 0 + this.mainContentScrollPosition / 150;
      var op1, op2;
      if (opacity > 0.09) {
        op1 = 0.09;
      } else {
        op1 = opacity;
      }
      if (opacity > 0.065) {
        op2 = 0.065;
      } else {
        op2 = opacity;
      }
      return `
      box-shadow: 0 3px 6px 0 rgba(40, 40, 90, ${op1}), 0 1px 1px 0 rgba(0, 0, 0, ${op2});`;
    },
    getBottomDividerDark() {
      var opacity = 0 + this.mainContentScrollPosition / 150;
      var op;
      if (opacity > 0.09) {
        op = 0.09;
      } else {
        op = opacity;
      }
      return `
      border-bottom: 1px solid rgba(255,255,255,${op});`;
    },
  },
  created() {
    this.debouncedOnScrollMainContent = _.debounce(
      this.onScrollMainContent,
      10
    );
    this.debouncedGetInitalList = _.debounce(this.getInitialList, 150, {
      leading: false,
      trailing: true,
    });
  },
};
</script>

<style lang="scss" scoped>
@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(180deg);
  }
}

.card:first-child {
  margin-top: 0px !important;
}
.event-list-transparent-bg {
  background: rgba(0, 0, 0, 0) !important;
  border: none;
}

.header {
  //position: absolute;
  //transition: all 0.3s ease;
  // width: 100%;
  width: 100%;
  //height: 56px;
  position: sticky;
  top: 0px;
  //max-height: 48px;
  z-index: 10;
  // font-size: 1rem;
}

.event-list-vertical {
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: background 0.3s;
  //z-index: 3000;
  position: absolute;
  pointer-events: none;

  .event-list-inner {
    pointer-events: all;
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: all 0.3s;
    position: relative;

    .view-options {
      position: absolute;
      right: 64px;
      top: 20px;
      z-index: 100;
    }

    .view-options-absolute {
      z-index: 1000;
    }

    .date-header-bg {
      // only useful for light theme
      position: absolute;
      top: 0;
      left: 0;
      height: 48px;
      width: 100%;
      z-index: 10;
    }
  }

  .no-parties-text {
    margin-left: 16px;
  }
  .scroll-area {
    height: 100%;
    .search-input {
      :deep(.q-field__control) {
        &:before {
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 9px;
        }
      }
    }
    .artists-wrapper {
      border-radius: 0px;
      .artists-component {
        z-index: 2;
      }
      //background: whitesmoke;
    }
    .artist-profile-wrapper {
      width: 100%;
      .artist-profile {
        max-width: 100%;
        //height: 200px;
        border-radius: 9px !important;
      }
    }
    .scroll-content {
      position: relative;
      width: 100%;
      min-height: 100%;
      -webkit-overflow-scrolling: auto;
    }
    :deep(.q-scrollarea__thumb) {
      z-index: 1000;
    }
    &.disable-scroll {
      :deep(.scroll) {
        overflow: hidden !important;
      }
    }
  }

  .touch-overlay {
    position: absolute;
    height: 100%;
    width: calc(100% + 10px);
    margin-left: -5px;
    z-index: -1;
    pointer-events: all;
  }
}

.event-date-center {
  z-index: 1;
  align-items: center;
  pointer-events: none;
}

.body--dark {
  .scroll-area {
    background: transparent;
  }
  .event-list-vertical {
    pointer-events: none;

    .controls-component {
      background: black;

      //background: black;
    }
    .event-list-inner {
      //background: $bi-2;

      //background: black;
    }
  }

  .header {
    background: $bi-1;
  }
  .date-header {
    background: $bi-1;
  }
}

.body--light {
  .scroll-area {
    background: transparent;
    .search-input {
      background: #fafafa;
    }
  }
  .event-list-vertical {
    background: white;

    .event-list-inner {
      //background: white;
    }
  }
  .header {
    background: white;

    //box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.2);
  }
  .controls-component {
    background: white;
  }
  .date-header-bg {
    background: white;
  }
}

@media only screen and (min-width: 1921px) {
  .linear-progress {
    margin-top: 32px;
  }
}

@media only screen and (max-width: 600px) {
  .body--dark {
    .header {
      background: black !important;
    }
  }
  .event-date-center {
  }

  .event-list-vertical {
    margin-top: 4px;

    .mobile-panel-button {
      position: absolute;
      right: 0px;
      top: -4px;
      z-index: 5000;
      @supports (font: -apple-system-body) and (-webkit-appearance: none) {
        -webkit-transform: translate3d(0, 0, 0);
      }
    }
    .event-list-inner {
      .artists-component {
        height: 178px;
      }
      .controls-component {
        z-index: 101;
        top: 0px;
      }
      .scroll-area {
        .no-parties-text {
          margin-left: 8px;
        }
        .scroll-content {
          //margin-top: -24px;
          position: relative;

          .header {
            display: sticky;
            top: 0px;
            z-index: 100;
          }
        }
      }
    }
  }
}
</style>
