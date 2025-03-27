<template>
  <div
    class="nearby-page flex column grow no-wrap"
    style="height: 100%; width: 100%; max-width: 100%"
  >
    <div class="scroll-stuff flex column">
      <div
        class="flex column mobile-location-header"
        style="width: 100%"
        :class="{
          'q-px-lg  q-mb-sm': $q.screen.gt.sm,
          'q-px-md ': $q.screen.lt.md,
          'q-px-sm q-mb-xs  ': $q.screen.lt.md && $q.screen.gt.xs,
        }"
      >
        <div
          style="margin-top: -8px"
          class="ellipsis text-h4"
          v-if="$q.screen.lt.sm"
        >
          <span class="metropolis bolder">
            {{ $t('nearby_view.near') }}
          </span>
        </div>
        <div
          class="flex no-wrap"
          :class="{
            'justify-start items-end text-h4': $q.screen.gt.xs,
            'justify-start row': $q.screen.lt.sm,
          }"
          style="width: 100%"
        >
          <div
            class="flex row no-wrap items-center"
            style="max-width: 100%"
            :class="{ ' grow reverse justify-between': $q.screen.lt.sm }"
          >
            <div
              class="flex row items-center no-wrap"
              :class="{
                ' q-mx-sm q-mr-lg': $q.screen.gt.sm,
                'q-ml-xs': $q.screen.lt.md,
              }"
              :style="
                $q.screen.gt.sm
                  ? 'margin-left: -16px; border-radius: 100px!important;'
                  : 'margin-left: 0px; border-radius: 100px!important;'
              "
              v-if="$q.screen.gt.sm && false"
            >
              <q-icon
                name="las la-calendar"
                :class="$q.screen.gt.sm ? ' q-pa-md' : 'q-pa-sm'"
                size="sm"
                :style="
                  $q.screen.gt.sm
                    ? 'margin-right: -4px; '
                    : 'margin-left: 0px; '
                "
              />
              <DesktopDateSelect />
            </div>

            <q-btn
              flat
              class=""
              :class="{
                'q-ml-md q-pa-sm': $q.screen.lt.sm,
                'q-pa-md q-ml-md q-mr-xs ': $q.screen.gt.xs,
              }"
              @click.stop="() => getFineLocation()"
              :style="
                $q.screen.gt.xs
                  ? 'margin-left: -8px; border-radius: 100px!important;'
                  : 'margin-left: 0px; border-radius: 100px!important;'
              "
            >
              <template v-slot:default>
                <div v-if="!userLocationLoading" class="flex">
                  <q-icon
                    name="mdi-crosshairs-gps"
                    class=""
                    size="sm"
                    v-if="fineLocation && !currentLocationFromSearch"
                  />
                  <q-icon size="sm" name="mdi-crosshairs" class="" v-else />
                </div>
                <div v-else style="position: relative" class="flex">
                  <q-icon size="sm" style="z-index: 1" name="mdi-crosshairs" />
                  <q-icon
                    size="sm"
                    style="z-index: 2; left: 0px"
                    class="animated infinite flash slowest absolute"
                    name="mdi-crosshairs-gps"
                  />
                </div>
                <q-tooltip
                  style="font-size: 1em !important"
                  :content-class="
                    $q.dark.isActive
                      ? 'bg-black text-white'
                      : 'bg-white text-black'
                  "
                  :offset="[10, 10]"
                >
                  <span v-if="!fineLocation">
                    {{ $t('nearby_view.improve_location') }}
                  </span>
                  <span v-else>
                    {{ $t('nearby_view.improve_location') }}
                  </span>
                </q-tooltip>
              </template>
            </q-btn>
            <div class="ellipsis text-h5 q-mr-sm" v-if="$q.screen.gt.sm">
              <span class="metropolis bolder">
                {{ $t('nearby_view.upcoming_in') }}
              </span>
            </div>
            <NearbyCountrySelect />
          </div>
        </div>
      </div>

      <div
        class="flex message"
        v-if="false"
        :class="{
          ' q-mt-md ': $q.screen.gt.xs,
          ' q-mb-xs ': $q.screen.gt.xs && $q.screen.lt.md,
          'q-mx-lg q-mb-sm q-pb-xs': $q.screen.gt.sm,
          'q-mx-md  q-pb-xs ': $q.screen.lt.md,
        }"
        @click="showMessage = !showMessage"
      >
        <div
          class="flex grow no-wrap justify-between t2 inter items-start"
          :class="{
            'text-large  ': $q.screen.gt.xs,
          }"
        >
          <div class="flex grow">
            {{ $t('about.welcome') }}
          </div>
          <q-icon
            class="q-ml-md"
            size="1.2rem"
            :name="!showMessage ? 'mdi-menu-down' : 'mdi-menu-up'"
          />
        </div>
        <div
          v-if="showMessage"
          class="flex column items-start justify-start grow t2 inter q-mt-md q-mb-sm"
        >
          <div
            :class="{
              'text-large  ': $q.screen.gt.xs,
            }"
          >
            {{ $t('nearby_view.message_1') }}

            <p />
            {{ $t('nearby_view.message_2') }}

            <p />
            {{ $t('nearby_view.message_3') }}

            &#128526;

            <p />
            - Pete
          </div>
          <div
            class="flex q-gutter-md q-mt-sm"
            v-if="!$q.platform.is.nativeMobile"
          >
            <a
              href="https://apps.apple.com/in/app/partymap/id6473246623"
              target="_blank"
              class="app-link"
              style="text-decoration: none !important"
              @click.stop
            >
              <div class="appstore-wrapper flex items-center q-py-sm q-px-md">
                <q-icon name="mdi-apple" size="1.5rem" class="q-mr-sm" />
                <!--PartyMap on the App Store-->
                <span style="text-decoration: italic">
                  {{ $t('nearby_view.app_store') }}</span
                >
              </div>
            </a>

            <a
              href="https://play.google.com/store/apps/details?id=org.partymap.com"
              target="_blank"
              class="app-link"
              style="text-decoration: none !important"
              @click.stop
            >
              <div class="appstore-wrapper flex items-center q-py-sm q-px-md">
                <q-icon name="mdi-google-play" size="1.5rem" class="q-mr-sm" />
                <span style="text-decoration: italic">
                  {{ $t('nearby_view.play_store') }}
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div
        v-if="$q.screen.lt.sm && false"
        class="nav-button-container flex row no-wrap q-px-md t1 q-mt-md"
        :class="{
          'q-mb-sm': $q.screen.lt.sm,
          'q-mb-sm text-large inter bold q-px-lg ': $q.screen.gt.sm,
        }"
      >
        <div
          flat
          @click.stop="showAddEventDialog()"
          class="nav-button flex items-center justify-center q-mr-sm q-px-md q-py-xs"
        >
          <span v-if="$q.screen.lt.sm">Submit</span
          ><span v-else>Add an event</span>
          <q-icon
            name="mdi-plus"
            size="1rem"
            class="q-ml-md"
            :class="{ 'q-ml-md': $q.screen.gt.sm }"
          />
        </div>

        <q-btn
          @click.stop="() => (sidebarPanel = 'explore')"
          flat
          no-caps
          class="nav-button q-px-md q-py-xs"
        >
          <div class="flex justify-center items-center grow">
            <span>Explore the map! </span>
            <q-icon name="mdi-chevron-right" size="1rem" class="q-ml-md" />
          </div>
        </q-btn>
      </div>

      <div class="q-px-md q-mt-sm q-mb-xs" v-if="$q.screen.lt.sm && false">
        <div class="separator" />
      </div>

      <div
        class="flex row justify-center items-center loading-wrapper"
        v-if="
          !userLocationLoading &&
          (loadingEverything || !computedSidebarPanelReady)
        "
      >
        <!--
                  <q-spinner-ios
                    color="$a.dark.isActive ? 'white' : 'black'"
                    size="2em"
                  />
                  --><InnerLoading :solid="false" />
      </div>

      <transition appear enter-active-class="animated fadeIn slow">
        <div
          class="content"
          style="cursor: default"
          v-if="computedSidebarPanelReady && !loadingEverything"
        >
          <div class="flex column" :class="{ reverse: $q.screen.lt.sm }">
            <div>
              <!-- tags -->
              <div class="flex column" v-if="nearbyTags?.length >= 10">
                <div
                  class="q-py-md location-header sticky location-header-select flex justify-between items-center"
                  :class="$q.screen.gt.sm ? 'q-px-lg' : 'q-pl-md '"
                >
                  <div class="text-">
                    {{ $t('nearby_view.popular_tags') }}
                  </div>
                </div>
                <TagExplorer
                  mode="nearby"
                  :class="$q.screen.gt.sm ? 'q-px-lg q-mb-sm' : 'q-pl-md q'"
                />
              </div>
              <!-- Display global tags if there's not many local tags-->
              <div class="flex column" v-else-if="tagOptions?.length > 0">
                <div
                  class="q-py-md location-header sticky location-header-select flex justify-between items-center"
                  :class="$q.screen.gt.sm ? 'q-px-lg' : 'q-pl-md '"
                >
                  <div>{{ $t('nearby_view.hot_tags_around_world') }}</div>
                </div>
                <TagExplorer
                  mode="all"
                  :class="$q.screen.gt.sm ? 'q-px-lg q-mb-sm' : 'q-pl-md  '"
                />
              </div>
            </div>
            <div>
              <!-- artists -->
              <div class="flex column" v-if="nearbyArtists?.length > 5">
                <div
                  class="location-header q-py-md location-header-select sticky flex justify-between items-center"
                  :class="$q.screen.gt.sm ? 'q-px-lg' : 'q-pl-md '"
                >
                  <div>{{ $t('nearby_view.high_profile_artists') }}</div>
                  <ControlSelect
                    v-if="false"
                    @clear="
                      () => {
                        controlTag = [];
                      }
                    "
                    :size="$q.screen.gt.sm ? 'sm' : 'xs'"
                    :label="'All Artists'"
                  >
                    <template v-slot="{ showing, hide }">
                      <ArtistControl :showing="showing" @hide="hide" />
                    </template>
                  </ControlSelect>
                </div>

                <ArtistsComponent
                  :size="$q.screen.gt.sm ? 'lg' : $q.screen.sm ? 'lg' : 'lg'"
                  :artists="nearbyArtists"
                  :hasNext="nearbyArtistsHasNext"
                  :loadMore="debouncedLoadNearbyArtists"
                  :style="
                    $q.screen.gt.sm
                      ? 'margin-bottom: -16px; '
                      : 'margin-bottom: -8px; margin-top: -8px'
                  "
                />
              </div>

              <!-- Display global artists if there's not many local artists-->

              <div class="flex column" v-else-if="artistOptions?.length > 0">
                <div
                  class="q-py-md location-header location-header-select sticky flex justify-between items-center"
                  :class="$q.screen.gt.sm ? 'q-px-lg' : 'q-pl-md '"
                >
                  <div>{{ $t('nearby_view.top_artists_worldwide') }}</div>
                  <ControlSelect
                    v-if="false"
                    @clear="
                      () => {
                        controlTag = [];
                      }
                    "
                    :size="$q.screen.gt.sm ? 'sm' : 'xs'"
                    :label="'All Artists'"
                    iconName="las la-music"
                  >
                    <template v-slot="{ showing, hide }">
                      <ArtistControl :showing="showing" @hide="hide" />
                    </template>
                  </ControlSelect>
                </div>

                <ArtistsComponent
                  :class="$q.screen.gt.sm ? '' : ''"
                  :artists="artistOptions"
                  :hasNext="artistOptionsHasNext"
                  :loadMore="debouncedLoadArtistOptions"
                  :size="$q.screen.gt.sm ? 'lg' : 'lg'"
                  :style="
                    $q.screen.gt.sm
                      ? 'margin-bottom: -16px; '
                      : 'margin-bottom: -8px; margin-top: -8px'
                  "
                />
              </div>
            </div>
          </div>
          <!-- NEARBY EVENTS -->

          <div
            class="q-mt-xl q-pt-xl text-center metropolis bold text-large"
            :class="$q.screen.gt.sm ? 'q-pl-lg t1' : 'q-pl-md t1'"
            v-if="
              nearbyEventDates.length === 0 &&
              eventDates.length === 0 &&
              !loadingEverything &&
              !nearbyEventDatesLoading
            "
          >
            {{ $t('nearby_view.waiting_for_location') }}...
          </div>
          <div
            v-else-if="userLocation && fineLocation"
            class="location-header sticky q-py-sm q-mt-md flex row items-center justify-between"
            :class="$q.screen.lt.md ? 'q-pl-md' : 'q-pl-lg'"
          >
            <div class="flex items-center">
              <div class="">
                {{ $t('nearby_view.events_within') }}
              </div>
              <q-select
                emit-value
                dense
                map-options
                behavior="menu"
                class="q-mx-xs radius-select"
                v-model="queryRadius"
                :options="queryRadiusOptions"
              />
            </div>
            <!--
                      <EventDateViewOptions
                        style="margin-right: 16px"
                        :show-group-by-month="false"
                        v-if="$q.screen.gt.sm "
                      />
                      -->
          </div>
          <EventDateCardList
            :class="{ 'q-px-sm': $q.screen.lt.md }"
            v-if="nearbyEventDates && compactView"
            :groupByMonth="false"
            :eventDates="nearbyEventDates"
            :hasNext="nearbyEventDatesHasNext"
            :loading="nearbyEventDatesLoading"
            :disableEndOfResultsMessage="true"
            :twoColumnsMd="$q.screen.sm"
            :hideHeader="true"
          />
          <EventDatePosterList
            :class="{ 'q-px-sm': $q.screen.lt.md }"
            v-if="nearbyEventDates && !compactView"
            :groupByMonth="false"
            :eventDates="nearbyEventDates"
            :hasNext="nearbyEventDatesHasNext"
            :loading="nearbyEventDatesLoading"
            :disableEndOfResultsMessage="true"
            :hideHeader="true"
          />

          <div
            v-if="nearbyEventDatesSuccess && nearbyEventDates.length === 0"
            class="t4"
            :class="{
              'q-pl-lg': $q.screen.gt.sm,
              'q-pl-md': $q.screen.lt.md,
            }"
          >
            {{ $t('nearby_view.no_events_in_area') }}
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
              :class="i === eventDatesPage ? 'text-primary' : ''"
            >
              [{{ i }}]
            </a>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import ArtistsComponent from './../ArtistsComponent.vue';
import CustomQScroll from 'components/CustomQScroll.vue';
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useQueryStore } from 'src/stores/query';
import { useMainStore } from 'src/stores/main';
import { useNearbyStore } from 'src/stores/nearby';
import NearbyCountrySelect from './NearbyCountrySelect.vue';
import AddEventDialog from 'components/dialogs/AddEventDialog.vue';
import EventDateCardList from 'src/components/EventDateCardList.vue';
import EventDatePosterList from 'src/components/EventDatePosterList.vue';
//import EventDateViewOptions from 'src/components/EventDateViewOptions.vue';
import InnerLoading from 'src/components/InnerLoading.vue';
import { useAuthStore } from 'src/stores/auth';
import EventDatePoster from 'src/components/EventDatePoster.vue';
import EventDateCard from 'src/components/EventDateCard.vue';
import DesktopDateSelect from './DesktopDateSelect.vue';
import ControlSelect from 'src/components/Controls/ControlSelect.vue';
import TagControl from 'src/components/Controls/TagControl.vue';
import ArtistControl from 'src/components/Controls/ArtistControl.vue';
import { useMapStore } from 'src/stores/map';
import DesktopSearchComponent from 'src/components/Controls/DesktopSearchComponent.vue';

import _ from 'lodash';
import TagExplorer from '../../TagExplorer.vue';
import { stubFalse } from 'lodash';

export default {
  name: 'NearbyView',
  components: {
    CustomQScroll,
    ArtistsComponent,
    EventDatePosterList,
    EventDatePoster,
    // EventDateViewOptions,
    InnerLoading,
    // EventDateCard,
    NearbyCountrySelect,
    DesktopDateSelect,
    ControlSelect,
    TagControl,
    DesktopSearchComponent,
    ArtistControl,
    EventDateCardList,
    TagExplorer,
  },
  data() {
    return {
      sidebarPanelReady: false,
      showMessage: false,
      scrollPosition: 0,
      queryRadiusOptions: [
        {
          label: '10km',
          value: 10000,
        },
        {
          label: '20km',
          value: 20000,
        },
        {
          label: '50km',
          value: 50000,
        },
        {
          label: '100km',
          value: 100000,
        },
        {
          label: '200km',
          value: 200000,
        },
        {
          label: '500km',
          value: 500000,
        },
        {
          label: '1000km',
          value: 1000000,
        },
        {
          label: '2000km',
          value: 2000000,
        },
        {
          label: '5000km',
          value: 5000000,
        },
        {
          label: '10,000km',
          value: 10000000,
        },
        {
          label: '20,000km',
          value: 20000000,
        },
      ],
    };
  },

  methods: {
    ...mapActions(useMainStore, [
      'loadIpInfo',
      'getFineLocation',
      'restoreUserLocation',
    ]),
    ...mapActions(useQueryStore, ['loadArtistOptions', 'loadTagOptions']),
    ...mapActions(useNearbyStore, [
      'loadEverything',
      'loadNearbyArtists',
      'loadNearbyEventDates',
      'loadEventDates',
    ]),

    showAddEventDialog() {
      this.$q
        .dialog({
          parent: this,
          component: AddEventDialog,
        })
        .onOk((data) => {
          if (!this.currentUser && data.host) {
            this.$router.push({
              path: '/login',
              query: { from: this.$route.path },
            });
          } else if (data.host) {
            this.$router.push({
              name: 'AddEventHost',
            });
          } else {
            this.$router.push({
              name: 'AddEventPublic',
            });
          }
        });
    },
    onScroll(info) {
      this.scrollPosition = info.verticalPosition;

      if (info.verticalPosition > 0) {
        this.enablePanelSwipeDown = false;
      }
      // infinite scrolling

      if (info.verticalPercentage === 1) {
        if (this.nearbyEventDatesHasNext && this.userLocation) {
          console.log('userloc', this.userLocation);
          this.debouncedLoadNearbyEventDates();
        } else if (this.eventDatesHasNext) {
          this.debouncedLoadEventDates();
        }
      }
    },
    onScrollEnd() {
      if (this.scrollPosition <= 1) {
        this.enablePanelSwipeDown = true;
      }
    },
    addParamsToLocation(params) {
      history.pushState(
        {},
        null,
        this.$route.path +
          '?' +
          Object.keys(params)
            .map((key) => {
              return (
                encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
              );
            })
            .join('&'),
      );
    },

    loadEventDatePage(page) {
      // hidden pagination for SEO
      this.addParamsToLocation({ global_page: page });
      this.eventDates = null;
      this.eventDatesPage = page;
      this.loadEventDates();
    },
  },
  watch: {
    currentLocation: {
      handler: function (newval, oldval) {
        if (this.currentLocationFromSearch) {
          if (newval && !oldval) {
            this.loadEverything();
            return;
          } else if (newval && oldval) {
            const locationHasSignficantlyChanged =
              Math.round(newval.lat) !== Math.round(oldval.lat) ||
              Math.round(newval.lng) !== Math.round(oldval.lng);
            if (locationHasSignficantlyChanged) {
              this.loadEverything();
            }
          }
        }
      },
      //deep: true,
    },
    userLocation: {
      handler: function (newval, oldval) {
        if (newval && !oldval) {
          this.loadEverything();
          return;
        } else if (newval && oldval) {
          const locationHasSignficantlyChanged =
            Math.round(newval.lat) !== Math.round(oldval.lat) ||
            Math.round(newval.lng) !== Math.round(oldval.lng);
          if (locationHasSignficantlyChanged) {
            this.loadEverything();
          }
        }
      },

      //deep: true,
    },
    queryRadius: {
      handler: function (newval, oldval) {
        if (oldval !== null && oldval != newval) {
          this.loadEverything();
        }
      },
    },
  },
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
    ...mapWritableState(useMainStore, [
      'showPanel',
      'showPanelBackground',
      'enablePanelSwipeDown',
      'sidebarPanel',
      'menubarOpacity',
      'sidebarExpanded',
    ]),
    ...mapState(useMainStore, [
      'userLocationLoading',
      'userLocation',
      'currentLocation',
      'currentLocationFromSearch',
      'currentLocationCity',
      'currentLocationCountry',
      'fineLocation',
      'compactView',
    ]),
    ...mapWritableState(useQueryStore, [
      'controlTag',
      'tagOptions',
      'tagOptionsHasNext',
      'artistOptions',
      'artistOptionsHasNext',
      'userEventDates',
      'userEventDatesPage',
      'userEventDatesHasNext',
      'userEventDatesLoading',
      'eventDatesGroupedByMonth',
      'eventDates',
      'eventDatesLoading',
    ]),
    ...mapWritableState(useNearbyStore, [
      'queryRadius',
      'eventDates',
      'eventDatesPage',
      'eventDatesLoading',
    ]),
    ...mapState(useNearbyStore, [
      'loadingEverything',
      'nearbyTags',
      'nearbyTagsHasNext',
      'nearbyTagsPage',
      'nearbyTagsSuccess',
      'nearbyArtists',
      'nearbyArtistsHasNext',
      'nearbyArtistsPage',
      'nearbyArtistsSuccess',
      'nearbyEventDates',
      'nearbyEventDatesLoading',
      'nearbyEventDatesHasNext',
      'nearbyEventDatesPage',
      'nearbyEventDatesSuccess',
      'eventDatesHasNext',
      'eventDatesPages',
    ]),
    ...mapWritableState(useMapStore, ['map']),
    computedSidebarPanelReady() {
      if (this.$q.screen.lt.sm) {
        return this.sidebarPanelReady;
      } else return this.sidebarPanelReady;
    },
    computedGridColumns() {
      if (this.$q.screen.gt.lg) {
        return `
        grid-template-columns: repeat(3, minmax(0, 1fr));
        `;
      } else if (this.$q.screen.gt.sm) {
        return `
        grid-template-columns: repeat(2, minmax(0, 1fr));
        `;
      } else {
        return `
        grid-template-columns: repeat(1, minmax(0, 1fr));
        `;
      }
    },

    // make array of page numbers for SEO
    eventDatesPageNumbers() {
      var ans = [];
      for (let i = 1; i <= this.eventDatesPages; i++) {
        ans.push(i);
      }
      return ans;
    },
  },
  beforeMount() {
    window.prerenderReady = false;
  },
  created() {
    this.debouncedLoadEverything = _.debounce(this.loadEverything, 300, {
      leading: true,
      trailing: false,
    });
    this.debouncedLoadNearbyEventDates = _.debounce(
      this.loadNearbyEventDates,
      150,
      {
        leading: true,
        trailing: false,
      },
    );
    this.debouncedLoadEventDates = _.debounce(this.loadEventDates, 150, {
      leading: true,
      trailing: false,
    });
    this.debouncedLoadArtistOptions = _.debounce(this.loadArtistOptions, 300, {
      leading: true,
      trailing: false,
    });
    this.debouncedLoadNearbyArtists = _.debounce(this.loadNearbyArtists, 300, {
      leading: true,
      trailing: false,
    });
  },
  unmounted() {
    this.menuBarOpacity = 1;
  },

  /*
  async activated() {)
    if (this.$q.screen.lt.sm || true) {
      this.$refs.scroll.setScrollPercentage('vertical', 0);
      setTimeout(() => {
        this.sidebarPanelReady = true;
      }, 350);
    } else {
      this.sidebarPanelReady = true;
    }
    if (this.userLocation) {
      restoreUserLocation();
    } else {
      try {
        await this.getFineLocation();
      } catch {
        await this.loadIpInfo();
      }
    }
    this.loadEverything();
  },
  */
  deactivated() {
    this.sidebarPanelReady = false;
  },
  async mounted() {
    if (this.$q.screen.lt.sm || true) {
      setTimeout(() => {
        this.sidebarPanelReady = true;
      }, 350);
    } else {
      this.sidebarPanelRedy = true;
    }

    // otherwise will change on route change

    if (this.userLocation) {
      this.restoreUserLocation();
      if (!this.nearbyEventDates || this.nearbyEventDates.length === 0) {
        this.loadEverything();
      }
    } else {
      // setting location will trigger loadEverything()
      try {
        await this.getFineLocation();
      } catch {
        // people don't like this
        // because they've already explicitly said they don't want to give their location
        // so this creeps them out
        // await this.loadIpInfo();
        if (this.eventDates?.length === 0) this.loadEverything();
      }
    }

    if (this.$route.query.global_page) {
      // used by hidden pagination for SEO
      this.eventDatesPage = Number(this.$route.query.global_page);
      await this.loadEventDates();
      setTimeout(() => {
        window.prerenderReady = true;
      }, 300);
    } else {
      setTimeout(() => {
        window.prerenderReady = true;
      }, 300);
    }
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .nearby-page {
    .location-header {
      background: black;
    }
    .message {
      //background: $bi-3;
      //border: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.3s ease;
      &:hover {
        // background: $bi-4;
      }
      .appstore-wrapper {
        //background: $bi-3;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 9px;
        color: $ti-1;
        &:hover {
          background: $bi-2;
        }
      }
    }

    .tag-scroll-area {
      .tag {
        opacity: 1;
        transition: all 0.3s ease;
        background: black;
        border: 1px solid rgba(255, 255, 255, 0.4);
        &:not(.no-hover) {
          &:hover {
            opacity: 1;
            background: rgba(36, 36, 36, 1);
          }
        }
        &.selected {
          background: rgba(24, 24, 24, 1);
        }
      }
    }
  }
}
.body--light {
  .nearby-page {
    .message {
      //box-shadow: rgba(100, 100, 111, 0.05) 0px 7px 29px 0px;
      //background: $b-1;
      // border: 1px solid rgba(0, 0, 0, 0.1);
      //background: $b-2;
      transition: all 0.3s ease;
      &:hover {
        // background: $b-3;
      }
      .appstore-wrapper {
        //background: $b-2;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 9px;
        color: $t-1 !important;
        text-decoration: none !important;
        &:hover {
          background: $b-2;
        }
      }
    }

    .location-header {
      background: white;
    }

    .tag-scroll-area {
      .tag {
        // opacity: 1;
        transition: all 0.3s ease;
        background: rgba(255, 255, 255, 0);
        border: 1px solid rgba(0, 0, 0, 0.15);
        //box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px 0px;

        //box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 4px 0px;
        &:not(.no-hover) {
          &:hover {
            background: rgba(0, 0, 0, 0.1);
          }
        }
      }
    }
  }
}
.animated.slowest {
  animation-duration: calc(var(--animate-duration) * 10);
}
.nearby-page {
  .scroll-stuff {
    max-width: 100vw;
    position: relative;

    .location-header {
      z-index: 500;
      width: 100%;
      font-weight: 800;
      font-size: 1rem !important;
      font-family: 'Metropolis';
      &:lang(ru) {
        font-family: 'InterDisplay';
      }
      font-size: 1rem;
      &.sticky {
        position: sticky;
        top: 73px;
      }
      &.location-header-select {
        :deep(.q-field) {
          .q-field__control::before {
            border-bottom: none;
          }
        }
      }

      // text-transform: lowercase;
    }
  }

  :deep(.q-scrollarea__thumb) {
    z-index: 1000;
  }

  .scroll-stuff {
    .loading-wrapper {
      pointer-events: none !important;
      position: absolute;
      height: calc(100vh - 128px); // account for desktop hiddenYposition
      width: 100%;
      justify-content: center;
      display: flex;
    }
    .message {
      border-radius: 18px;

      //border-radius: 9px;
      cursor: pointer;
      font-weight: 400;
    }
  }

  .mobile-hide-wrapper {
    position: sticky;
    top: 0px;
    right: 0px;
    z-index: 50;
  }
  .mobile-hide-icon {
    position: absolute;
    top: 0px;
    right: 0px;
    z-index: 100;
  }

  .header {
    width: 100%;
    //height: 56px;
    position: relative;
    //max-height: 72px;
    z-index: 5;
    //text-transform: lowercase;

    //box-shadow: 0px 0px 46px -6px rgb(230,230,230);
    .location-input {
      input {
        font-size: 18px;
        font-weight: 600;
        line-height: 1.8rem;
        letter-spacing: 0.0125em;
      }
    }
  }
  .q-field {
    .q-field__inner {
      .q-field__control {
        font-size: 16px;
        .q-field__append {
          padding-left: 0px !important;
        }
      }
    }
  }

  .user-event-scroll-area {
    mask-image: unset;
    height: 280px;
    :deep(.ed-poster) {
      max-width: 150px;
    }
  }
  .tag-scroll-area {
    width: 100%;
    .tag {
      opacity: 1;
      transition: all 0.3s ease;
      white-space: nowrap;
      cursor: pointer;
      border-radius: 18px;
      padding: 6px 12px;
      border-radius: 18px;

      &.selected {
        text-decoration: underline;
      }
    }
  }
  .radius-select {
    margin-left: 6px;
    font-size: 0.91rem !important;
    :deep(.q-field__inner) {
      font-weight: 700 !important;

      .q-field__control {
        font-size: unset !important;
        font-weight: 700 !important;
        //font-family: 'Metropolis';
        &:before {
          opacity: 0.68;
        }
        .q-field__append {
          padding-left: 0px !important;
        }
      }
    }
  }
  .ed-card-grid {
    display: grid;
    grid-gap: 1rem;
  }
}

@media only screen and (min-width: 600px) and (max-width: 1023px) {
  .nearby-page {
    .scroll-area {
      .scroll-stuff {
        padding-top: 0px;
        .location-header {
          font-weight: 700;
          font-size: unset;
        }
      }
    }
  }
}

@media (max-width: 599px) {
  .body--dark {
    .nearby-page {
      .location-header {
        background: black;
      }
    }
  }
  .body--light {
    .nearby-page {
      .location-header {
        background: white;
      }
    }
  }

  .nearby-page {
    .scroll-stuff {
      .location-header {
        font-weight: 700;
        font-size: 0.9rem;
      }
      .loading-wrapper {
        height: calc(100vh - 172px); // account for desktop hiddenYposition

        pointer-events: none;
        //margin-top: calc(var(--safe-area-inset-top));
      }
      .message {
        border-radius: 0px;
        border-left: none !important;
        border-right: none !important;
        border: none;
        box-shadow: none;
        background: none;
        // margin-bottom: -16px !important;
      }
    }

    .nav-button-container {
      .nav-button {
        flex-basis: unset;
        flex-grow: 1;
        width: unset;
      }
    }
    .tag-scroll-area {
      height: 84px;
    }

    .header {
      margin-left: unset;
    }
  }
}
</style>
