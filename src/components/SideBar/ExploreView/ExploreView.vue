<template>
  <div
    class="event-list-vertical shadow-0 main-content"
    style="height: 100%; width: 100%; position: relative; overflow: hidden"
  >
    <div
      @click="() => (showPanel = !showPanel)"
      style="pointer-events: all; cursor: pointer"
      class="inter bolder text-h5 flex items-center justify-between q-pl-lg q-pr-md q-py-md explore-header"
      v-if="$q.screen.gt.xs"
    >
      <div>Explore Events</div>

      <div class="flex items-center q-my-sm show-map">
        <q-icon
          flat
          class="q-mr-md"
          size="2rem"
          :class="{ 'rotate-180': showPanel }"
          name="mdi-chevron-up"
        />
      </div>
    </div>
    <div
      :class="{ 'q-px-md': showPanel || true }"
      v-if="$q.screen.gt.xs && false"
    >
      <q-separator />
    </div>

    <q-icon
      @click="() => (showPanel = !showPanel)"
      v-if="$q.screen.lt.sm"
      flat
      size="1.5rem"
      class="q-pa-md q-mr-xs mobile-panel-button t2"
      :class="{ 'rotate-180': showPanel }"
      name="mdi-chevron-up"
    />
    <div class="touch-overlay" v-touch-swipe.vertical="handleSwipe" />
    <div class="event-list-inner">
      <EventDateViewOptions
        v-if="$q.screen.gt.xs && groupEventsByMonth"
        class="view-options-absolute"
      />

      <div class="inner-shadow" v-if="!showPanel && false" />

      <div
        class="flex column grow no-wrap"
        :style="
          groupEventsByMonth && $q.screen.gt.xs ? 'margin-top: -16px' : ''
        "
      >
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
          :class="!showPanel && 'disable-scroll'"
          :content-style="{
            'will-change': 'scroll-position',
          }"
        >
          <transition enter-active-class="animated fadeIn">
            <div class="flex column no-wrap scroll-content q-px-sm">
              <div class="flex column no-wrap content">
                <div
                  class="inter t1 justify-between flex items-center"
                  :class="
                    $q.screen.lt.sm
                      ? 'q-pl-md q-py-md header t2 semibold '
                      : 'q-pl-md  q-pb-md t3 '
                  "
                  v-if="
                    !groupEventsByMonth &&
                    eventDates?.length > 0 &&
                    !isLoadingInitial &&
                    showResults &&
                    eventDatesTotal
                  "
                >
                  <span
                    >{{ eventDatesTotal }}
                    <span v-if="eventDatesTotal === 1">result</span
                    ><span v-else>results</span>&nbsp;in this area:</span
                  >
                  <EventDateViewOptions
                    v-if="$q.screen.gt.xs"
                    class="view-options"
                  />
                </div>
                <div
                  class="inter"
                  :class="
                    $q.screen.lt.sm
                      ? 'q-pl-md q-py-md header t2 semibold'
                      : 'q-pl-md  q-pb-md t3 '
                  "
                  :style="
                    groupEventsByMonth && $q.screen.gt.xs
                      ? 'margin-top: 16px'
                      : ''
                  "
                  v-else-if="
                    (isLoadingInitial || (mapMoving && !blockUpdates)) &&
                    !showPanel
                  "
                >
                  <span>Loading results...</span>
                </div>
                <div class="flex row no-wrap">
                  <!--
                  <ControlsComponent
                    class="controls-component grow"
                    :class="{
                      'q-mt-md': $q.screen.lt.sm,
                      'q-mt-md ': $q.screen.gt.xs,
                    }"
                    :showSelectedValue="true"
                    :showOnlySelected="false"
                  />
                  -->
                </div>
                <div
                  class="artist-profile-wrapper"
                  :class="
                    $q.screen.gt.xs ? 'q-px-md q-pb-md q-pt-sm' : 'q-pa-sm'
                  "
                  v-if="controlArtist.length > 0"
                >
                  <ArtistProfile
                    :key="controlArtist[0].id"
                    :id="controlArtist[0].id"
                  />
                </div>
                <transition appear enter-active-class="animated fadeIn slow">
                  <div
                    class="flex column"
                    v-show="showResults && !isLoadingInitial"
                  >
                    <!--
                  <div
                    class="flex column artists-wrapper"
                    v-if="noFiltersSelected && artists?.length > 0"
                  >
                    <div
                      class="header q-py-md t1 chicago"
                      :class="
                        $q.screen.lt.sm ? 'q-pl-sm q-mt-sm' : 'q-pl-md  q-py-md'
                      "
                    >
                      Top artists in this area:
                    </div>
                    <ArtistsComponent
                      @wheel.stop
                      class="artists-component"
                      :artists="artists"
                      :hasNext="artistsHasNext"
                      :loadMore="loadMoreArtists"
                    />
                  </div>
                  -->

                    <EventDateList
                      v-if="showResults && compactView"
                      :groupByMonth="groupEventsByMonth"
                      :eventDatesGroupedByMonth="eventDatesGroupedByMonth"
                      :eventDates="eventDates"
                      :hasNext="eventDatesHasNext"
                      :loading="eventDatesLoading"
                    />

                    <EventDatePosterList
                      v-if="showResults && !compactView"
                      :groupByMonth="groupEventsByMonth"
                      :eventDatesGroupedByMonth="eventDatesGroupedByMonth"
                      :eventDates="eventDates"
                      :hasNext="eventDatesHasNext"
                      :loading="eventDatesLoading"
                    />
                  </div>
                </transition>
              </div>
            </div>
          </transition>
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
        v-if="(isLoadingInitial || (mapMoving && !blockUpdates)) && !showPanel"
        class="event-date-center flex grow justify-center"
        :style="
          $q.screen.lt.sm
            ? 'height: 100%; position: absolute; width: 100%; z-index: 500'
            : 'height: 100px; position: absolute; width: 100%; z-index: 500'
        "
      >
        <q-linear-progress
          class="linear-progress"
          indeterminate
          size="2px"
          :color="$q.dark.isActive ? 'grey-6' : 'grey-8'"
          rounded
          :style="$q.screen.gt.xs ? 'max-width: 200px' : 'max-width: 120px'"
        />
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import ArtistProfile from 'components/ArtistProfile.vue';

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
    ArtistProfile,
    //ArtistsComponent,
    EventDateList,
    EventDatePosterList,
    EventDateViewOptions,
  },
  beforeCreate() {
    this.eventDatesLoading = true;
    setTimeout(() => {
      this.getInitialList();
    }, 300);
    // watcher on map bounds triggers inital load i think
  },
  mounted() {
    setTimeout(() => {
      this.hasLoaded = true;
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
    ]),
    ...mapActions(useMainStore, ['loadIpInfo']),

    async getInitialList() {
      if (this.$route.name === 'Explore' && !this.blockUpdates) {
        // event date stuff
        this.isLoadingDatesInitial = true;
        if (this.$refs) this.$refs.scroll.setScrollPercentage('vertical', 0);
        this.eventDatesHasNext = true;
        this.eventDatesPage = 1;
        this.eventDatesTotal = null;
        this.eventDates = []; // this is actually quite important
        if (!this.userLocation) {
          await this.loadIpInfo();
          this.loadMore();
        } else {
          this.loadMore();
        }
        // Artist stuff
        /*
        this.artistsPage = 1;
        this.artistsHasNext = true;
        this.isLoadingArtistsInitial = true;
        await this.loadArtists();
        this.isLoadingArtistsInitial = false;
        */
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
        this.isLoadingDatesInitial = false;
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
      if (info.verticalPercentage === 1) {
        // reached bottom
        this.loadMore();
      }
    },
  },
  watch: {
    route: {
      handler: async function (to) {
        if (to.name === 'Explore') {
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
    currentUser() {
      // load favorites after user logs in
      if (this.sidebarPanel === 'favorites') {
        this.getInitialList();
      }
    },
    controlDateRange: {
      handler() {
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
    ...mapState(useAuthStore, ['currentUser']),
    ...mapState(useMapStore, [
      'mapBounds',
      'blockUpdates',
      'mapMoving',
      'showResults',
    ]),
    ...mapState(useQueryStore, [
      'eventDatesGroupedByMonth',
      'controlTag',
      'controlDateRange',
      'controlSize',
      'controlDuration',
      'controlArtist',
      'artists',
      'artistsHasNext',
    ]),
    ...mapWritableState(useQueryStore, [
      'eventDates',
      'eventDatesTotal',
      'eventDatesPage',
      'eventDatesHasNext',
      'artistsPage',
      'artistsHasNext',
      'eventDatesLoading',
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
      return this.isLoadingDatesInitial || this.isLoadingArtistsInitial;
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

  .explore-header {
    &:hover {
      .show-map {
      }
    }
  }

  .event-list-inner {
    pointer-events: all;
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: all 0.3s;
    position: relative;
    .inner-shadow {
      position: absolute;
      height: 100%;
      width: 100%;
      z-index: 1;
      pointer-events: none;
      box-shadow: inset rgba(100, 100, 100, 0.1) 0px 8px 10px -5px;
    }

    .view-options {
      position: absolute;
      right: -18px;
      top: -8px;
      z-index: 100;
    }

    .view-options-absolute {
      position: absolute;
      right: -18px;
      top: -8px;
      z-index: 100;
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

    .explore-header {
      &:hover {
        .show-map {
        }
      }
    }

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
    background: black;
  }
  .date-header {
    background: black;
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
  .event-date-center {
    margin-top: 100px;
    align-items: start;
  }

  .event-list-vertical {
    margin-top: 4px;
    .mobile-panel-button {
      position: absolute;
      right: 0px;
      top: -4px;
      z-index: 5000;
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
