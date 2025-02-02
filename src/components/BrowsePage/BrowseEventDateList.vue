<template>
  <div
    class="event-list-vertical shadow-0 main-content"
    style="height: 100%; min-height: 100vh; width: 100%; position: relative"
  >
    <div class="event-list-inner">
      <div class="flex column grow no-wrap" :class="$q.screen.gt.sm ? '' : ''">
        <div class="flex column" v-if="$q.screen.gt.sm">
          <div class="text-h5 inter bolder q-ml-lg">
            <div v-if="currentCountry" class="flex items-center">
              {{ $t('nearby_view.upcoming_in') }}&nbsp;<span
                v-if="$route.params.region"
                >{{ $route.params.region }},&nbsp;</span
              >{{ currentCountry?.name }}&nbsp;
              <div style="font-size: 32pt" class="q-ml-xs" v-if="false">
                {{ currentCountry?.emoji_flag }}
              </div>
            </div>
            <span v-else>
              {{ $t('browse_page.all_events_world') }}
            </span>
          </div>

          <div class="inter text-large bold t3 q-ml-lg q-mt-sm q-mb-lg">
            {{ $t('browse_page.the_ultimate_calendar') }} {{ currentYear }}!
          </div>
        </div>
        <div class="flex column" v-if="!isLoadingInitial">
          <div
            class="flex column"
            :class="{
              'q-px-sm': $q.screen.lt.md,
              'q-pt-sm': $q.screen.lt.md && $q.screen.gt.xs,
            }"
          >
            <EventDateList
              v-if="compactView"
              :groupByMonth="groupEventsByMonth"
              :eventDatesGroupedByMonth="eventDatesGroupedByMonth"
              :eventDates="eventDates"
              :hasNext="eventDatesHasNext"
              :twoColumnsMd="$q.screen.gt.xs"
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
            ? 'height: 250px; position: absolute; width: 100%; z-index: 500'
            : 'height: 100vh;  margin-top: -96px; position: absolute; width: 100%; z-index: 5000'
        "
      >
        <div
          style="height: 100px; width: 200px"
          class="flex justify-center items-center"
        >
          <div
            class="metropolis bold q-mb-md"
            :class="$q.screen.gt.xs && 'q-mt-xl'"
            v-if="isLoadingInitial"
          >
            {{ $t('explore_view.finding_whats_good') }}
          </div>

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

      <div
        class="flex row justify-center q-my-md"
        style="opacity: 0; margin-top: -16px"
      >
        <a
          v-for="i in eventDatesPageNumbers"
          :key="i"
          class="link-hover q-mr-xs t3"
          @click="loadEventDatePage(i)"
          :class="i + 1 === eventDatesPage ? 'text-primary' : ''"
        >
          [{{ i }}]
        </a>
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import EventDateList from 'src/components/EventDateList.vue';
import EventDatePosterList from 'src/components/EventDatePosterList.vue';
import { useMapStore } from 'src/stores/map';
import { useQueryStore } from 'src/stores/query';
import { useMainStore } from 'src/stores/main';
import { useAuthStore } from 'src/stores/auth';
import { mapActions, mapWritableState, mapState } from 'pinia';
import CustomQScroll from 'components/CustomQScroll.vue';
import countryCodes from 'src/assets/country-code-emoji';
import dayjs from 'dayjs';
import { createMetaMixin } from 'quasar';

export default {
  components: {
    EventDateList,
    EventDatePosterList,
    CustomQScroll,
  },
  mixins: [
    createMetaMixin(function () {
      // "this" here refers to your component
      const country = this.getCurrentCountry(this.$route.params.country);

      const year = dayjs().year();
      return {
        // assuming `this.myTitle` exists in your mixed in component
        title: country
          ? this.$t('meta.country_title', {
              country: country.name,
              year,
            })
          : this.$t('meta.browse_title', { year }),
        meta: {
          viewport: {
            name: 'viewport',
            content:
              'width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0,user-scalable=no;user-scalable=0;',
          }, // THIS META TAG ENABLES 'FAST TAPPING' ON IOS DEVICES
          description: {
            name: 'description',
            content: country
              ? this.$t('meta.country_description', {
                  country: country.name,
                  year,
                })
              : this.$t('meta.browse_description', {
                  year,
                }),
          },
          keywords: {
            name: 'keywords',
          },
          content: country
            ? this.$t('meta.main_tags') +
              ', ' +
              country.name +
              ', ' +
              country.code
            : this.$t('meta.main_tags'),
        },
      };
    }),
  ],
  async mounted() {
    this.getInitialList();
  },
  data() {
    return {
      mainContentScrollPosition: 0,
      headerYPosition: 0,
      year: 0,
      componentGroup: {},
      currentYear: dayjs().year(),
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
    scrollPercentage: {
      type: Number,
      default: undefined,
    },
    resetScrollPosition: {
      type: Function,
      default: undefined,
    },
  },
  methods: {
    ...mapActions(useQueryStore, [
      'loadEventDates',
      'loadArtists',
      'loadMoreArtists',
      'clearAllFilters',
      'clearResults',
    ]),
    ...mapActions(useMainStore, ['loadIpInfo', 'persistTipsToLocalStorage']),

    async getInitialList() {
      // event date stuff
      // scroll to top
      this.clearResults();
      this.resetScrollPosition();
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
    // hidden pagination for SEO
    loadEventDatePage(page) {
      this.clearResults();
      this.eventDatesPage = page;
      this.loadEventDates();
    },
    getCurrentCountry(countryCode) {
      return this.countryCodes?.find((x) => x.code == countryCode);
    },
  },
  watch: {
    scrollPercentage: {
      handler(newv) {
        if (newv > 0.99) {
          // reached bottom
          this.debouncedLoadMore();
        }
      },
    },
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
      'eventDatesPages',
      'eventDatesHasNext',
      'artists',
      'artistsPage',
      'artistsHasNext',
      'eventDatesLoading',
      'eventDatesGroupedByMonth',
    ]),
    currentCountry() {
      return this.countryCodes?.find(
        (x) => x.code == this.$route.params.country,
      );
    },
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
    // make array of page numbers for SEO
    eventDatesPageNumbers() {
      let pages = [];
      for (let i = 1; i <= this.eventDatesPages; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  beforeMount() {
    this.clearResults();
  },

  created() {
    this.countryCodes = countryCodes;

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
