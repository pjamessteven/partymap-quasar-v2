<template>
  <div class="landing-page flex column no-wrap">
    <!--

    <transition appear enter-active-class="animated fadeIn slow">
      <div
        v-show="showMapGap"
        class="map-gap flex justify-center items-center "
        :class="$q.screen.gt.xs ? 'q-pt-xl' : ''"
        :style="computedMapGapOpacity"
        @click="$router.push({ name: 'Explore' })"
      >
        <div>
          <div class="flex column grow text-wrapper">
            <div
              v-if="$q.screen.gt.xs"
              class="anim-text-flow"
              style="text-align: center;"
              :class="$q.screen.gt.xs ? 'text-large' : 'o-060'"
            >
              <span
                v-for="(char, index) in $t('landing_page.tagline')"
                :key="index"
                ><i>{{ char }}</i>
              </span>
            </div>
            <div
              class="no-wrap flex row grow justify-center items-center explore anim-text-flow"
              style="width: 100%;"
              v-if="$q.screen.gt.xs"
              :class="
                $q.screen.gt.xs
                  ? 'text-large q-mt-sm q-mb-md'
                  : 'text-large q-mt-lg'
              "
            >
              <span
                v-for="(char, index) in $t('landing_page.explore')"
                :key="index"
                ><i>{{ char }}</i>
              </span>
              <span><q-icon name="mdi-chevron-right" class="q-ml-sm"/></span>
            </div>
            <div
              class="explore anim-text-flow"
              style="width: 100%; text-align: center;"
              v-else
              :class="
                $q.screen.gt.xs
                  ? 'text-large q-mt-sm q-mb-md'
                  : 'text-large q-mt-lg'
              "
            >
              <span
                v-for="(char, index) in $t('landing_page.explore_map')"
                :key="index"
                ><i>{{ char }}</i>
              </span>
              <span><q-icon name="mdi-chevron-right" class="q-ml-sm"/></span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  -->

    <div class="main-content flex row justify-center">
      <q-icon
        v-if="$q.screen.lt.sm"
        @click="sidebarPanel = 'explore'"
        flat
        v-touch-swipe="
          () => {
            sidebarPanel = 'explore';
          }
        "
        name="mdi-chevron-up"
        class="mobile-hide-icon "
        :class="{
          'rotate-180 slower': showPanelMobile,
          'q-py-md q-mt-xs q-px-lg': $q.screen.lt.sm
        }"
        :style="
          scrollPosition < 170 && !$q.dark.isActive ? 'filter: invert(1)' : ''
        "
        size="2em"
      />
      <transition enter-active-class="">
        <div class="flex column grow no-wrap" style="width: 100%;">
          <div
            class="flex column grow no-wrap"
            style="height: 100%; width: 100% "
          >
            <q-scroll-area
              @scroll="onScroll"
              vertical
              :thumb-style="{
                right: $q.screen.gt.xs ? '0px' : '0px',
                width: $q.screen.gt.xs ? '4px' : '4px'
              }"
              class="scroll-area flex grow"
              :content-style="{
                'will-change': 'scroll-position'
              }"
            >
              <div
                class="chicago text-h4  q-mt-md "
                :class="$q.screen.lt.sm ? ' ' : 'q-mb-sm'"
              >
                Search
              </div>
              <div class="flex column justify-center items-center banner">
                <div
                  class="banner-text text-large o-080 q-mt-lg q-mb-lg"
                  :class="{
                    'q-pt-sm': $q.screen.lt.sm,
                    'q-my-xl': sidebarExpanded
                  }"
                  style="width: 250px; text-align: center; text-transform: uppercase"
                >
                  <i>The global directory of festivals and events</i>
                </div>
                <div class="banner-background">
                  <video
                    class="banner-video"
                    src="@/assets/pm1small2.mp4"
                    autoplay
                    playsinline
                    loop
                    muted
                    poster="@/assets/pm1small.png"
                  />
                </div>
              </div>
              <div
                class="separator"
                :style="
                  $q.dark.isActive
                    ? 'background: rgba(255,255,255,0.13)!important'
                    : 'background: rgba(0,0,0,0.1)'
                "
              />
              <div
                v-touch-swipe="
                  () => {
                    sidebarPanel = 'explore';
                  }
                "
                class="header  flex column  no-wrap "
                :class="$q.screen.gt.xs ? '' : 'q-pl-sm'"
              >
                <!--<div class="separator" />-->

                <div
                  class="flex row grow no-wrap items-stretch justify-between ellipsis no-wrap"
                  v-touch-swipe="
                    () => {
                      sidebarPanel = 'explore';
                    }
                  "
                >
                  <div
                    class="flex row grow items-stretch no-wrap ellipsis"
                    :class="$q.screen.gt.xs ? 'reverse q-ml-md ' : ''"
                  >
                    <q-btn
                      flat
                      sqaure
                      :loading="loadingLocation"
                      @click="getLocation"
                    >
                      <template v-slot:default>
                        <q-icon
                          name="mdi-crosshairs-gps"
                          :class="$q.screen.gt.xs ? 'q-px-sm' : 'q-py-xs'"
                          v-if="fineLocation"
                        />
                        <q-icon
                          name="mdi-crosshairs"
                          :class="$q.screen.gt.xs ? 'q-px-sm' : 'q-py-xs'"
                          v-else
                        />

                        <q-tooltip
                          :content-class="
                            $q.dark.isActive
                              ? 'bg-black text-white'
                              : 'bg-white text-black'
                          "
                          :offset="[10, 10]"
                          content-style="font-size: 16px"
                        >
                          {{ $t("landing_page.improve_location") }}
                        </q-tooltip>
                      </template>
                      <template v-slot:loading>
                        <q-icon
                          class="absolute q-pa-sm"
                          name="mdi-crosshairs"
                        />
                        <q-icon
                          class="q-pa-sm animated infinite flash slowest absolute"
                          name="mdi-crosshairs-gps"
                        />
                        <q-tooltip
                          :content-class="
                            $q.dark.isActive
                              ? 'bg-black text-white'
                              : 'bg-white text-black'
                          "
                          :offset="[10, 10]"
                          content-style="font-size: 16px"
                        >
                          {{ $t("landing_page.improve_location") }}
                        </q-tooltip>
                      </template>
                    </q-btn>
                    <div class="ellipsis flex grow items-center">
                      <div
                        :class="
                          $q.screen.gt.xs
                            ? 'q-pt-md q-pb-md chicago t1 text-large'
                            : 'q-py-md text-large  chicago t1 text-'
                        "
                        class="ellipsis"
                      >
                        <span v-if="currentLocationName">
                          <span v-if="$q.screen.gt.xs">Near</span>
                          {{ currentLocationName }}
                        </span>
                        <span v-else>
                          Finding your location...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="">
                  <div class="separator" />
                </div>
                <!--
            <q-icon
              @click="handleSwipe"
              flat
              v-touch-swipe="handleSwipe"
              name="mdi-chevron-up"
              class="mobile-hide-icon "
              :class="{
                'rotate-180': showPanelMobile,
                'q-py-md q-px-lg': $q.screen.lt.sm
              }"
              size="2em"
              v-if="$q.screen.lt.sm"
            />
          -->
              </div>

              <div
                class="flex row justify-center items-center q-py-xl q-mt-xl"
                style="height: 300px; width: 100%; "
                v-if="nearbyEventDates == null || !everythingHasLoaded"
              >
                <q-spinner-ios color="primary" size="2em" />
              </div>

              <div
                class="flex column scroll-content "
                :class="{ 'q-mt-xs': $q.screen.gt.xs }"
                v-if="everythingHasLoaded"
              >
                <!-- tags -->
                <div
                  v-if="nearbyTags && nearbyTags.length > 0"
                  class="t4 chicago q-pl-md q-mt-md "
                  style="font-size: small"
                >
                  {{ $t("landing_page.top_tags_in_area") }}:
                </div>
                <div
                  class="q-pl-md q-mt-md"
                  v-if="nearbyTags && nearbyTags.length > 0"
                >
                  <q-scroll-area
                    horizontal
                    class="tag-scroll-area "
                    style=" width: 100%;"
                    :thumb-style="
                      $q.screen.gt.xs
                        ? { bottom: '0px', height: '4px' }
                        : { bottom: '0px', height: '0px' }
                    "
                  >
                    <div
                      class="flex row no-wrap q-gutter-xs  t2 "
                      :class="{
                        'q-pr-lg': $q.screen.gt.xs,
                        'q-pr-md': $q.screen.lt.sm
                      }"
                      v-if="nearbyTags"
                    >
                      <Tag
                        v-for="(tag, index) in nearbyTags"
                        :key="index"
                        :value="tag.tag"
                        :label="tag.label"
                        @selected="clickTag(tag)"
                        :selected="
                          selectedTags.findIndex(x => x.tag == tag.tag) > -1
                        "
                      ></Tag>
                      <Tag
                        v-if="nearbyTagsHasNext"
                        :key="-2"
                        :value="'...show more'"
                        v-on:selected="loadMoreNearbyTags()"
                      />
                    </div>
                  </q-scroll-area>
                </div>
                <!--
              <div
                v-else
                class="t4 q-mt-sm"
                :class="{
                  'q-pl-lg': $q.screen.gt.xs,
                  'q-pl-md': $q.screen.lt.sm
                }"
              >
                {{ $t('landing_page.no_tags_in_area') }}
              </div>
            -->
                <!-- artists -->
                <div
                  class="t4 chicago q-pl-md"
                  style="font-size: small"
                  :class="{
                    'q-mt-md': $q.screen.gt.xs,
                    'q-mt-sm': $q.screen.lt.sm
                  }"
                  v-if="nearbyArtists && nearbyArtists.length > 0"
                >
                  {{ $t("landing_page.top_artists_in_area") }}:
                </div>
                <ArtistsComponent />

                <!--
              <div
                v-else
                class="t4 q-mt-sm"
                :class="{
                  'q-pl-lg': $q.screen.gt.xs,
                  'q-pl-md': $q.screen.lt.sm
                }"
              >
                {{ $t('landing_page.no_artists_in_area') }}
              </div>
            -->
                <!--
              <div class="q-px-md q-mb-sm q-mt-sm">
                <div class="separator" />
              </div>
            -->
                <!-- NEARBY EVENTS -->
                <div
                  class="flex row items-baseline q-pl-md"
                  :class="{
                    'q-mt-sm': $q.screen.gt.xs,
                    '': $q.screen.lt.sm
                  }"
                >
                  <div class="t4 chicago" style="font-size: small">
                    {{ $t("landing_page.events_within") }}
                  </div>
                  <q-select
                    emit-value
                    dense
                    borderless
                    map-options
                    behavior="menu"
                    class="q-ml-xs radius-select chicago o-030 "
                    v-model="queryRadius"
                    :options="queryRadiusOptions"
                  />
                </div>
                <transition
                  appear
                  enter-active-class="animated fadeIn faster"
                  v-if="nearbyEventDates && nearbyEventDates.length > 0"
                >
                  <div
                    class="ed-card-grid q-px-md q-mt-sm"
                    :style="computedGridColumns"
                  >
                    <EventDateCard
                      v-for="(ed, index) in nearbyEventDates"
                      :key="index"
                      :event="ed[0]"
                      class="ed-card"
                    />
                  </div>
                </transition>
                <div
                  v-if="
                    !loadingNearbyEventDates &&
                      nearbyEventDates &&
                      nearbyEventDates.length === 0
                  "
                  class="t4"
                  :class="{
                    'q-pl-lg': $q.screen.gt.xs,
                    'q-pl-md': $q.screen.lt.sm
                  }"
                >
                  {{ $t("landing_page.no_events_in_area") }}
                </div>
                <!-- ALL EVENTS -->

                <div
                  class="header  flex column  no-wrap q-pl-md q-my-md"
                  v-touch-swipe="
                    () => {
                      sidebarPanel = 'explore';
                    }
                  "
                >
                  <!--<div class="separator" /> -->

                  <div
                    class="flex row grow justify-between items-stretch no-wrap ellipsis"
                  >
                    <div class="ellipsis flex grow items-center">
                      <div
                        :class="
                          $q.screen.gt.xs
                            ? 'q-pt-md q-pb-md chicago t1 text-large'
                            : 'q-py-md t1 chicago text-large'
                        "
                        class="ellipsis"
                        v-if="currentLocationName"
                      >
                        {{ $t("landing_page.all_upcoming_events") }}:
                      </div>
                    </div>
                  </div>
                  <div class="">
                    <div class="separator" />
                  </div>
                </div>

                <transition
                  appear
                  enter-active-class="animated fadeIn faster"
                  v-if="eventDates && eventDates.length > 0"
                >
                  <div
                    class="ed-card-grid q-px-md"
                    :style="computedGridColumns"
                  >
                    <EventDateCard
                      v-for="(ed, index) in eventDates"
                      :key="index"
                      :event="ed[0]"
                      class="ed-card"
                    />
                  </div>
                </transition>
                <div
                  class="flex row justify-center q-mt-md"
                  style="opacity: 0;"
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

                <!--
                <div
                  class="flex row justify-center q-mt-lg t3"
                  v-if="!eventDatesHasNext && eventDates != null"
                >
                  <div>End of results</div>
                </div>
              --></div>
            </q-scroll-area>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { getFineLocation } from "@/assets/common.js";

import Tag from "components/EventPage/Tags/Tag";
import ArtistsComponent from "./ArtistsComponent.vue";
import EventDateCard from "components/MapView/Sidebar/ExploreView/EventDateListView/EventDateCard.vue";

export default {
  name: "LandingPage",
  meta() {
    return {
      // this accesses the "title" property in your Vue "data";
      // whenever "title" prop changes, your meta will automatically update
      title: "PartyMap | The Global Map of Festivals and Events",
      meta: {
        description: {
          name: "description",
          content:
            "PartyMap is a community-driven platform for discovering festivals and events near you and around the world."
        },
        keywords: {
          name: "keywords",
          content:
            "Festival, Festivals, Map, Events, Party, Fiesta, Music, Music Festival, Music Festivals, Best Music Festivals, All Music Festivals, Top Music Festivals, List of music festivals, list"
        }
      }
    };
  },

  components: {
    EventDateCard,
    ArtistsComponent,
    Tag
  },
  data() {
    return {
      showMapGap: false,
      initialNearbyTagsLoaded: false,
      initialNearbyArtistsLoaded: false,
      initialNearbyEventDatesLoaded: false,
      locationInput: null,
      eventDatesPerPage: 10,
      scrollPosition: 0,
      queryRadiusOptions: [
        {
          label: "10km",
          value: 10000
        },
        {
          label: "20km",
          value: 20000
        },
        {
          label: "50km",
          value: 50000
        },
        {
          label: "100km",
          value: 100000
        },
        {
          label: "200km",
          value: 200000
        },
        {
          label: "500km",
          value: 500000
        },
        {
          label: "1000km",
          value: 1000000
        },
        {
          label: "2000km",
          value: 2000000
        },
        {
          label: "5000km",
          value: 5000000
        },
        {
          label: "10,000km",
          value: 10000000
        },
        {
          label: "20,000km",
          value: 20000000
        }
      ]
    };
  },
  created() {
    this.getFineLocation = getFineLocation;
  },
  methods: {
    onScroll(info) {
      // infinite scrolling
      this.scrollPosition = info.verticalPosition;
      if (info.verticalPercentage === 1) {
        if (this.nearbyEventDatesHasNext) {
          this.loadMoreNearbyEventDates();
        } else if (this.eventDatesHasNext) {
          this.loadMoreEventDates();
        }
      }
    },
    addParamsToLocation(params) {
      history.pushState(
        {},
        null,
        this.$route.path +
          "?" +
          Object.keys(params)
            .map(key => {
              return (
                encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
              );
            })
            .join("&")
      );
    },
    getLocation() {
      this.getFineLocation();
    },
    clickTag(tag) {
      // mutation toggles tag
      this.selectedTags = tag;
      this.controlTagSelectedOptions = tag;
    },
    loadEverything() {
      // loading event dates will set the query radius,
      // so do that first
      this.nearbyEventDates = null;
      this.nearbyTags = null;
      this.nearbyArtists = null;
      this.loadInitialNearbyEventDates().then(() => {
        this.loadInitialNearbyArtists();
        this.loadInitialNearbyTags();
        this.loadInitialEventDates();
        setTimeout(() => {
          window.prerenderReady = true;
        }, 300);
      });
    },
    loadInitialEventDates() {
      return new Promise((resolve, reject) => {
        if (this.$route.query.global_page) {
          // used by hidden pagination for SEO
          this.eventDatesPage = Number(this.$route.query.global_page);
        } else {
          this.eventDatesPage = 1;
        }
        this.$store
          .dispatch("landingPage/loadEventDates", {
            per_page: this.eventDatesPerPage,
            page: this.eventDatesPage,
            distinct: true
          })
          .then(
            () => {
              this.initialEventDatesLoaded = true;
              resolve();
            },
            () => reject()
          );
      });
    },
    loadMoreEventDates() {
      if (this.eventDatesHasNext) {
        this.eventDatesPage += 1;
        this.$store.dispatch("landingPage/loadEventDates", {
          per_page: this.eventDatesPerPage,
          page: this.eventDatesPage,
          distinct: true
        });
      }
    },
    loadEventDatePage(page) {
      // hidden pagination for SEO
      this.addParamsToLocation({ global_page: page });
      this.eventDates = null;
      this.eventDatesPage = page;
      this.$store.dispatch("landingPage/loadEventDates", {
        per_page: this.eventDatesPerPage,
        page: page,
        distinct: true
      });
    },
    loadInitialNearbyEventDates() {
      return new Promise((resolve, reject) => {
        this.nearbyEventDatesPage = 1;
        this.$store
          .dispatch("landingPage/loadNearbyEventDates", {
            per_page: this.eventDatesPerPage,
            page: 1,
            distinct: true
          })
          .then(
            () => {
              this.initialNearbyEventDatesLoaded = true;
              resolve();
            },
            () => reject()
          );
      });
    },
    loadMoreNearbyEventDates() {
      if (this.nearbyEventDatesHasNext) {
        this.nearbyEventDatesPage += 1;
        this.$store.dispatch("landingPage/loadNearbyEventDates", {
          per_page: this.eventDatesPerPage,
          page: this.nearbyEventDatesPage,
          distinct: true
        });
      }
    },
    loadInitialNearbyArtists() {
      this.nearbyArtistsPage = 1;
      this.$store
        .dispatch("landingPage/loadNearbyArtists", {
          per_page: 10,
          page: 1,
          sort: "event_count",
          desc: true
        })
        .then(() => {
          this.initialNearbyArtistsLoaded = true;
        });
    },
    loadMoreNearbyArtists() {
      if (this.nearbyArtistsHasNext) {
        this.artistsPage += 1;
        this.$store.dispatch("landingPage/loadNearbyArtists", {
          per_page: 10,
          page: this.artistsPage,
          sort: "event_count",
          desc: true
        });
      }
    },
    loadInitialNearbyTags() {
      this.nearbyTagsPage = 1;
      this.$store
        .dispatch("landingPage/loadNearbyTags", {
          per_page: 20,
          page: this.nearbyTagsPage,
          sort: "count",
          desc: true
        })
        .then(() => {
          this.initialNearbyTagsLoaded = true;
        });
    },
    loadMoreNearbyTags() {
      if (this.nearbyTagsHasNext) {
        this.nearbyTagsPage += 1;
        this.$store.dispatch("landingPage/loadNearbyTags", {
          per_page: 20,
          page: this.nearbyTagsPage,
          sort: "count",
          desc: true
        });
      }
    },
    handleSwipe({ evt, ...info }) {
      this.showPanelMobile = !this.showPanelMobile;
    }
  },
  watch: {
    currentLocation: {
      handler: function(newval, oldval) {
        if (oldval != null) {
          this.queryRadius = null;
          this.loadEverything();
          this.$nextTick(() => {
            this.locationInput = this.currentLocationName;
          });
        }
      }
    },
    queryRadius: {
      handler: function(newval, oldval) {
        if (oldval != null) {
          this.loadEverything();
        }
      }
    },
    selectedTags: {
      handler: function(newval, oldval) {
        this.loadInitialNearbyEventDates();
        this.loadInitialEventDates();
      }
    }
  },
  computed: {
    showPanelMobile: {
      get() {
        return this.$store.state.main.showPanelMobile;
      },
      set(val) {
        this.$store.commit("main/setShowPanelMobile", val);
      }
    },
    sidebarPanel: {
      get() {
        return this.$store.state.main.sidebarPanel;
      },
      set(val) {
        this.$store.commit("main/setSidebarPanel", val);
      }
    },
    sidebarExpanded: {
      get() {
        return this.$store.state.main.sidebarExpanded;
      },
      set(val) {
        this.$store.commit("main/setSidebarExpanded", val);
      }
    },
    computedGridColumns() {
      if (this.sidebarExpanded) {
        return `
        grid-template-columns: repeat(2, minmax(0, 1fr));
        `;
      } else {
        return `
        grid-template-columns: repeat(1, minmax(0, 1fr));
        `;
      }
    },
    menuBarOpacity: {
      get() {
        return this.$store.state.main.menuBarOpacity;
      },
      set(val) {
        this.$store.commit("main/setMenuBarOpacity", val);
      }
    },

    everythingHasLoaded() {
      if (
        this.nearbyEventDates != null &&
        this.nearbyTags != null &&
        this.nearbyArtists != null
      ) {
        return true;
      } else if (
        !this.initialNearbyTagsLoaded ||
        !this.initialNearbyArtistsLoaded ||
        !this.initialNearbyEventDatesLoaded
      ) {
        return false;
      } else {
        return false;
      }
    },
    // NEARBY TAGS
    nearbyTags: {
      get() {
        return this.$store.state.landingPage.nearbyTags;
      },
      set(val) {
        this.$store.commit("landingPage/setNearbyTags", val);
      }
    },
    nearbyTagsHasNext() {
      return this.$store.state.landingPage.nearbyTagsHasNext;
    },
    loadingNearbyTags() {
      return this.$store.state.landingPage.loadingNearbyTags;
    },
    nearbyTagsPage: {
      get() {
        return this.$store.state.landingPage.nearbyTagsPage;
      },
      set(val) {
        this.$store.commit("landingPage/setNearbyTagsPage", val);
      }
    },
    selectedTags: {
      get() {
        return this.$store.state.landingPage.selectedTags;
      },
      set(val) {
        this.$store.commit("landingPage/setSelectedTags", val);
      }
    },
    controlTagSelectedOptions: {
      get() {
        return this.$store.state.main.controlTagSelectedOptions;
      },
      set(val) {
        this.$store.commit("main/setControlTagSelectedOptions", val);
      }
    },
    // NEARBY ARTISTS
    nearbyArtists: {
      get() {
        return this.$store.state.landingPage.nearbyArtists;
      },
      set(val) {
        this.$store.commit("landingPage/setNearbyArtists", val);
      }
    },
    loadingNearbyArtists() {
      return this.$store.state.landingPage.loadingNearbyArtists;
    },
    nearbyArtistsHasNext() {
      return this.$store.state.landingPage.nearbyArtistsHasNext;
    },
    nearbyArtistsPage: {
      get() {
        return this.$store.state.landingPage.nearbyArtistsPage;
      },
      set(val) {
        this.$store.commit("landingPage/setNearbyArtistsPage", val);
      }
    },

    // NEABY EVENT DATES
    nearbyEventDates: {
      get() {
        return this.$store.state.landingPage.nearbyEventDates;
      },
      set(val) {
        this.$store.commit("landingPage/setNearbyEventDates", val);
      }
    },
    loadingNearbyEventDates() {
      return this.$store.state.landingPage.loadingNearbyEventDates;
    },
    nearbyEventDatesHasNext() {
      return this.$store.state.landingPage.nearbyEventDatesHasNext;
    },
    nearbyEventDatesPage: {
      get() {
        return this.$store.state.landingPage.nearbyEventDatesPage;
      },
      set(val) {
        this.$store.commit("landingPage/setNearbyEventDatesPage", val);
      }
    },
    // GENERAL EVENT DATES
    eventDates: {
      get() {
        return this.$store.state.landingPage.eventDates;
      },
      set(val) {
        this.$store.commit("landingPage/setEventDates", val);
      }
    },
    loadingEventDates() {
      return this.$store.state.landingPage.loadingEventDates;
    },
    eventDatesHasNext() {
      return this.$store.state.landingPage.eventDatesHasNext;
    },
    eventDatesPages() {
      return this.$store.state.landingPage.eventDatesPages;
    },
    eventDatesPageNumbers() {
      var ans = [];
      for (let i = 1; i <= this.eventDatesPages; i++) {
        ans.push(i);
      }
      return ans;
    },
    eventDatesPage: {
      get() {
        return this.$store.state.landingPage.eventDatesPage;
      },
      set(val) {
        this.$store.commit("landingPage/setEventDatesPage", val);
      }
    },

    // LOCATION
    ipInfo() {
      return this.$store.state.main.ipInfo;
    },
    currentLocation() {
      return this.$store.state.main.currentLocation;
    },
    currentLocationName() {
      return this.$store.state.main.currentLocationName;
    },
    fineLocation() {
      return this.$store.state.main.fineLocation;
    },
    loadingLocation: {
      get() {
        return this.$store.state.main.loadingLocation;
      },
      set(val) {
        this.$store.commit("main/setLoadingLocation", val);
      }
    },
    queryRadius: {
      get() {
        return this.$store.state.landingPage.queryRadius;
      },
      set(val) {
        this.$store.commit("landingPage/setQueryRadius", val);
      }
    }
  },
  beforeMount() {
    window.prerenderReady = false;
  },

  destroyed() {
    this.$store.commit("main/setMenuBarOpacity", 1);
  },

  mounted() {
    // load nearby event dates
    if (!this.currentLocation) {
      this.$store.dispatch("main/getIpInfo").then(() => {
        this.loadEverything();
        this.getFineLocation();
      });
    } else {
      this.locationInput = this.currentLocationName;
      if (!this.nearbyEventDates) {
        this.loadEverything();
      }
    }

    setTimeout(() => {
      this.showMapGap = true;
    }, 300);

    // load hot artists
  }
};
</script>

<style lang="scss" scoped>
.body--dark {
  .landing-page {
    .landing-page-background {
      //  background: linear-gradient(180deg, rgba(0, 0, 0, 0.48), black);
    }
    .map-gap {
      color: white;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    }
    .main-content {
      .banner {
        //background: $bi-2;
        .banner-background {
          .banner-video {
            opacity: 0.48;
          }
        }
      }
      .header {
        background: black;
      }
      .separator {
        background: linear-gradient(
          to right,
          rgba(255, 255, 255, 0.05),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.05)
        ) !important;
        height: 1px;
        border: none;
      }
      .tag-scroll-area {
        .tag {
          opacity: 1;
          transition: all 0.3s ease;
          background: rgba(36, 36, 36, 0);

          &:hover {
            opacity: 1;
            background: rgba(36, 36, 36, 1);
          }
        }
      }
    }
  }
}
.body--light {
  .landing-page {
    .landing-page-background {
      //background: linear-gradient(180deg, rgba(0, 0, 0, 0), black);
    }
    .map-gap {
      color: white;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    }
    .main-content {
      .banner {
        //background: white;

        .tile-background {
          filter: invert(1);
          opacity: 0.2;
        }
        .banner-background {
          .banner-video {
            opacity: 0.68;
          }
        }
      }
      .header {
        background: white;
        //box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.2);

        //background: linear-gradient($b-3, $b-2);
        //box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.1);
      }
      .separator {
        background: linear-gradient(
          to right,
          transparent,
          rgba(0, 0, 0, 0.1),
          transparent
        ) !important;
        height: 1px;
        border: none;
      }
      .tag-scroll-area {
        .tag {
          opacity: 1;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0);

          &:hover {
            opacity: 1;
            background: rgba(255, 255, 255, 1);
          }
        }
      }
    }
  }
}
.animated.slowest {
  animation-duration: calc(var(--animate-duration) * 10);
}
.landing-page {
  width: 100%;
  height: 100%;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  .lights-wrapper {
    width: 100%;
    height: 50px;
    position: absolute;
    pointer-events: none;
    top: 154px;
    opacity: 0.48;
    z-index: 5000;
    display: none;
    .lights-image {
      max-width: 400px;
      height: auto;
      width: 100%;
      position: relative;
      right: 0px;
    }
  }
  .banner {
    position: relative;
    overflow: hidden;
    height: 200px;
    background: black;
    color: white;
    font-family: chicagoflf;
    .banner-text {
      z-index: 2;
    }
    .banner-background {
      position: absolute;
      height: 100%;
      width: 100%;
      .banner-video {
        position: absolute;
        width: 100%;
      }
    }
  }

  .scroll-area {
    height: 100%;
    .scroll-content {
      // padding-top: 32px;
    }
    /deep/.q-scrollarea__thumb {
      z-index: 10;
    }
  }
  .map-gap {
    position: relative;

    width: 100%;
    min-height: calc(33vh - 64px);
    &:hover {
      .text-wrapper {
        .explore {
          transform: scale(1.05);
          filter: contrast(150%);
        }
        .anim-text-flow {
        }
      }
    }
    .text-wrapper {
      //width: 500px;
      //overflow: hidden;
      .explore {
        transition: all 0.3s ease;
      }
      .anim-text-flow {
        $animationSteps: 20;
        $animationDuration: 50;
        $animationElement: span;
        $animationElementsCount: 50;
        $delayBetweenLetters: 0.1;

        // Elements settings
        #{$animationElement} {
          animation-name: anim-text-flow-keys;
          animation-duration: #{$animationDuration}s;
          animation-iteration-count: infinite;
          animation-direction: alternate;
          animation-fill-mode: forwards;
        }

        // Keyframe loop
        @keyframes anim-text-flow-keys {
          @for $i from 0 through $animationSteps {
            #{percentage($i * (1 / $animationSteps))} {
              color: hsla(random(80) + 20, random(30) + 10, 60, 1);
            }
          }
        }

        // Element animation delay loop
        $totalDelayTime: $animationElementsCount * $delayBetweenLetters;

        @for $i from 1 through $animationElementsCount {
          #{$animationElement}:nth-of-type(#{$i}) {
            animation-delay: #{($i * $delayBetweenLetters) - $totalDelayTime}s;
          }
        }
      }
    }
  }
  .main-content {
    width: 100%;
    height: 100%;

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
    .banner {
    }
    .header {
      width: 100%;
      height: 56px;
      position: sticky;
      top: 0px;
      max-height: 72px;
      z-index: 5;
      //box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.1);
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
    .artist-scroll-area {
      height: 164px;
      width: 100%;
      mask-image: linear-gradient(to left, transparent 0px, white 64px);
    }

    .tag-scroll-area {
      height: 42px;
      mask-image: linear-gradient(to left, transparent 0px, white 64px);
      width: 100%;
      .tag {
        opacity: 1;
        transition: all 0.3s ease;
        //font-size: small;
        &:hover {
          opacity: 1;
        }
      }
    }
    .radius-select {
      margin-left: 6px;
      font-size: 0.85rem !important;
      .q-field__inner {
        .q-field__control {
          font-size: unset !important;
          font-weight: 700 !important;
          .q-field__append {
            padding-left: 0px !important;
          }
        }
      }
    }
    .ed-card-grid {
      display: grid;
      grid-gap: 1rem;
      .ed-card {
        max-height: 280px;
        .card {
          height: 100%;
          .card-content {
            height: 100%;
            justify-content: space-between;
          }
        }
      }
    }
  }
}

@media (max-width: 600px) {
  .landing-page {
    .map-gap {
      height: 150px;
      //font-size: 8pt;
      background: none;
      min-height: unset;
      //background: radial-gradient(rgba(0, 0, 0, 0.48), transparent);
      background: radial-gradient(
        ellipse at center 88px,
        rgba(0, 0, 0, 0.9),
        transparent 50%
      );
      //margin-top: 8px;
      .explore {
      }
      .text-wrapper {
        position: relative;
        overflow: hidden;
        width: 220px;
        .anim-text-flow {
          $animationDuration: 30 !important;
          $delayBetweenLetters: 0.8 !important;
          width: 360px;
        }
      }
    }
    .main-content {
      .banner {
        //margin-top: -60px;
      }
      .header {
        height: 68px !important;
        min-height: 68px !important;
        margin-left: unset;
      }
      .artist-scroll-area {
        // height: 128px;
      }
      .separator {
        width: 100vw;
        margin-left: -16px;
      }
      .ed-card-grid {
      }
      .scroll-content {
        //padding-top: 64px;
      }
    }
  }
}
</style>
