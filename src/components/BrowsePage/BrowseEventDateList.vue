<template>
  <div
    class="event-list-vertical shadow-0 main-content"
    style="height: 100%; width: 100%; position: relative; overflow: hidden"
  >
    <div class="event-list-inner">
      <div
        class="flex column grow no-wrap"
        :class="$q.screen.gt.sm ? 'q-pt-sm' : ''"
      >
        <div class="flex column" v-if="!isLoadingInitial">
          <div class="flex column q-px-sm">
            <EventDateList
              v-if="compactView"
              :groupByMonth="groupEventsByMonth"
              :eventDatesGroupedByMonth="eventDatesGroupedByMonth"
              :eventDates="eventDates"
              :hasNext="eventDatesHasNext"
              :twoColumnsMd="$q.screen.gt.sm"
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
        </div>
      </div>

      <div
        class="event-date-center flex column grow no-wrap justify-center items-center"
        :style="
          $q.screen.lt.sm
            ? 'height: 144px; position: absolute; width: 100%; z-index: 500'
            : 'height: 100%; padding-top: 96px; position: absolute; width: 100%; z-index: 500'
        "
      >
        <div class="flex column items-center no-wrap">
          <div
            class="metropolis bold q-mb-md"
            :class="$q.screen.gt.xs && 'q-mt-xl'"
            v-if="isLoadingInitial"
          >
            {{ $t('explore_view.finding_whats_good') }}
          </div>
          <div
            class="metropolis bold q-mb-md"
            :class="$q.screen.gt.xs && 'q-mt-xl q-pb-xs'"
            v-else-if="!isLoadingInitial && noResults"
          >
            {{ $t('explore_view.nothing_coming_up') }}
          </div>
          <div style="height: 20px; width: 200px" class="flex justify-center">
            <q-linear-progress
              v-if="isLoadingInitial"
              class="linear-progress q-mt-md"
              indeterminate
              size="2px"
              :color="$q.dark.isActive ? 'grey-6' : 'grey-8'"
              rounded
              :style="$q.screen.gt.xs ? 'max-width: 200px' : 'max-width: 120px'"
            />
            <div
              class="flex column no-wrap"
              style="pointer-events: all"
              v-else-if="noResults && !isLoadingInitial"
            >
              <div class="flex row no-wrap">
                <q-btn
                  no-caps
                  style="border-radius: 48px !important; height: 40px"
                  v-if="anyFiltersEnabled"
                  class="button-plain flex items-center"
                  @click="
                    () => {
                      clearAllFilters();
                    }
                  "
                >
                  <div class="flex items-center row no-wrap q-px-xs">
                    <q-icon name="mdi-close" size="1rem" class="q-pr-md" />
                    <div>{{ $t('explore_view.clear_filters') }}</div>
                  </div>
                </q-btn>
              </div>
            </div>
          </div>
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

import { useMapStore } from 'src/stores/map';
import { useQueryStore } from 'src/stores/query';
import { useMainStore } from 'src/stores/main';
import { useAuthStore } from 'src/stores/auth';
import { mapActions, mapWritableState, mapState } from 'pinia';
import CustomQScroll from 'components/CustomQScroll.vue';

export default {
  components: {
    //ControlsComponent,
    //ArtistProfile,
    EventDateList,
    EventDatePosterList,
    CustomQScroll,
  },

  async mounted() {
    this.getInitialList();
  },
  data() {
    return {
      mainContentScrollPosition: 0,
      headerYPosition: 0,
      year: 0,
      componentGroup: {},
    };
  },
  props: {
    country: {
      type: String,
      default: undefined,
    },
    region: {
      type: String,
      default: undefined,
    },
  },
  methods: {
    ...mapActions(useQueryStore, [
      'loadEventDates',
      'loadArtists',
      'loadMoreArtists',
      'clearAllFilters',
    ]),
    ...mapActions(useMainStore, ['loadIpInfo', 'persistTipsToLocalStorage']),
    resetQueryState() {
      this.eventDatesHasNext = true;
      this.eventDatesPage = 1;
      this.eventDatesTotal = null;
      this.eventDates = []; // this is actually quite important
      this.eventDatesGroupedByMonth = {};
    },
    async getInitialList() {
      // event date stuff
      // scroll to top
      this.resetQueryState();

      this.loadMore();
    },
    async loadMore() {
      if (this.eventDatesHasNext) {
        try {
          await this.loadEventDates(
            false,
            (this.$route.params.country !== 'all' &&
              this.$route.params.country) ||
              undefined,
            this.$route.params.region,
          );
        } catch (error) {}
      }
    },

    onScrollMainContent(info) {
      this.mainContentScrollPosition = info.verticalPosition;
      if (info.verticalPercentage > 0.99) {
        // reached bottom
        this.debouncedLoadMore();
      }
    },
  },
  watch: {
    $route: {
      handler(newv, oldv) {
        // we don't want to reload when navigating between eventpage and browse page
        if (newv.name === 'BrowsePage' && oldv.name === 'BrowsePage')
          this.getInitialList();
      },
    },
    country: {
      handler() {
        this.getInitialList();
      },
    },
    region: {
      handler() {
        this.getInitialList();
      },
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
    controlEmptyLineup: {
      handler() {
        this.getInitialList();
      },
    },
    controlDateUnconfirmed: {
      handler() {
        this.getInitialList();
      },
    },
  },
  computed: {
    ...mapState(useMainStore, [
      'sidebarPanel',
      'currentLocation',
      'compactView',
      'groupEventsByMonth',
    ]),
    ...mapWritableState(useMainStore, [
      'currentLocationCity',
      'currentLocationFromSearch',
    ]),
    ...mapWritableState(useMapStore, ['map']),
    ...mapState(useAuthStore, ['currentUser']),
    ...mapState(useMapStore, [
      'mapBounds',
      'mapMoving',
      'showResults',
      'mapZoomLevel',
    ]),
    ...mapState(useQueryStore, [
      'controlDateRange',
      'controlSize',
      'controlDuration',
      'artistsHasNext',
      'anyFiltersEnabled',
      'topTagsInArea',
      'topArtistsInArea',
      'topRegionsInArea',
      'controlDateUnconfirmed',
      'controlEmptyLineup',
    ]),
    ...mapWritableState(useQueryStore, [
      'controlTag',
      'controlArtist',
      'eventDates',
      'eventDatesTotal',
      'eventDatesPage',
      'eventDatesHasNext',
      'artists',
      'artistsPage',
      'artistsHasNext',
      'eventDatesLoading',
      'eventDatesGroupedByMonth',
    ]),
    topTagsWithoutSelected() {
      return this.topTagsInArea.filter(
        (x) => this.controlTag.findIndex((y) => y.tag === x.tag) === -1,
      );
    },
    noFiltersSelected() {
      return (
        this.controlDateRange.end === null &&
        this.controlArtist.length === 0 &&
        this.controlDuration.length === 0 &&
        this.controlSize.length === 0 &&
        this.controlTag.length === 0
      );
    },
    noResults() {
      return (
        (this.groupEventsByMonth &&
          Object.keys(this.eventDatesGroupedByMonth).length === 0) ||
        (!this.groupEventsByMonth && this.eventDates?.length === 0)
      );
    },
    // depends on results being mapped to stop loading indicator
    isLoadingInitial() {
      return this.eventDatesLoading && this.noResults;
    },
    isLoading() {
      return this.isLoadingInitial || this.eventDatesLoading;
    },
    route() {
      return this.$route;
    },
  },
  beforeMount() {
    this.resetQueryState();
  },
  created() {
    this.debouncedOnScrollMainContent = _.debounce(
      this.onScrollMainContent,
      10,
    );
    this.debouncedGetInitalList = _.debounce(this.getInitialList, 150, {
      leading: false,
      trailing: true,
    });
    this.debouncedLoadMore = _.debounce(this.loadMore, 150, {
      leading: true,
      trailing: false,
    });
  },
};
</script>

<style lang="scss" scoped>
.header {
  z-index: 1000;
  width: 100%;
  font-size: 1rem;
  //  font-family: 'Chicago';
  //  font-style: italic;
  font-family: 'Metropolis';
  font-weight: 700;

  &:lang(ru) {
    font-family: 'InterDisplay';
  }
  //font-style: italic;
  &.header-select {
    :deep(.q-field) {
      .q-field__control::before {
        border-bottom: none;
      }
    }
  }
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
      position: absolute;
      right: 0px;
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
}

.event-date-center {
  z-index: 1;
  align-items: center;
  pointer-events: none;
  margin-top: -48px;
}

.body--dark {
  .event-list-vertical {
    pointer-events: none;
  }

  .header {
    background: black;
  }
  .date-header {
    background: black;
  }
}

.body--light {
  .event-list-vertical {
    background: white;
  }
  .header {
    background: white;
  }
  .controls-component {
    background: white;
  }
  .date-header-bg {
    background: white;
  }
}

@media only screen and (min-width: 600px) and (max-width: 1023px) {
  .header {
    font-size: unset;
  }
}

@media only screen and (max-width: 599px) {
  .body--dark {
    .header {
      background: black !important;
    }
  }
  .event-date-center {
    margin-top: 0px;
  }

  .event-list-vertical {
    margin-top: 4px;

    .event-list-inner {
      .no-parties-text {
        margin-left: 8px;
      }

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
</style>
