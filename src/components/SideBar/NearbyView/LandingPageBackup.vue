<template>
  <div class="landing-page flex column no-wrap" @scroll="onScroll">
    <div
      class="landing-page-background"
      @click="$router.push({ name: 'Explore' })"
    />

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
    <div class="main-content flex row justify-center">
      <transition
        appear
        enter-active-class="animated fadeInUp fast"
        leave-active-class="animated fadeOutDown fast"
      >
        <q-card
          class="content-card col-8 col-sm-11 col-md-8 col-lg-8 col-xl-8 col-xs-12"
        >
          <div class="flex column grow q-mb-lg" style="width: 100%;">
            <div
              v-touch-swipe="
                () => {
                  $router.push({ name: 'Explore' });
                }
              "
              class="header  flex row justify-between items-center no-wrap q-pr-md"
            >
              <div class="flex row no-wrap items-stretch ellipsis">
                <q-btn
                  flat
                  sqaure
                  :loading="loadingLocation"
                  @click="getLocation"
                >
                  <template v-slot:default>
                    <q-icon
                      name="mdi-crosshairs-gps"
                      :class="$q.screen.gt.xs ? 'q-pa-sm' : 'q-py-xs'"
                      v-if="fineLocation"
                    />
                    <q-icon
                      name="mdi-crosshairs"
                      :class="$q.screen.gt.xs ? 'q-pa-sm' : 'q-py-xs'"
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
                    <q-icon class="absolute q-pa-sm" name="mdi-crosshairs" />
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
                <div class="ellipsis">
                  <div
                    :class="
                      $q.screen.gt.xs
                        ? 'q-pt-lg q-pb-lg text-h6'
                        : 'q-py-md text-large'
                    "
                    class="ellipsis"
                    v-if="currentLocationName"
                  >
                    <b>{{ currentLocationName }}</b>
                  </div>
                </div>
                <!--

                  <q-input
                    flat
                    square
                    borderless
                    v-model="locationInput"
                    class="location-input"
                  />
                -->
              </div>
            </div>
            <div class="separator" />
            <div class="flex column" v-if="everythingHasLoaded">
              <!-- tags -->
              <div
                v-if="nearbyTags && nearbyTags.length > 0"
                class="t3"
                :class="{
                  'q-pl-lg q-mt-lg': $q.screen.gt.xs,
                  'q-pl-md q-mt-md': $q.screen.lt.sm
                }"
              >
                {{ $t("landing_page.top_tags_in_area") }}:
              </div>
              <q-scroll-area
                horizontal
                class="tag-scroll-area q-mt-md"
                style=" width: 100%;"
                v-if="nearbyTags && nearbyTags.length > 0"
                :thumb-style="
                  $q.screen.gt.xs
                    ? { bottom: '0px', height: '4px' }
                    : { bottom: '0px', height: '0px' }
                "
              >
                <div
                  class="flex row no-wrap q-gutter-xs "
                  :class="{
                    'q-px-lg': $q.screen.gt.xs,
                    'q-px-md': $q.screen.lt.sm
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
                class="t3"
                v-if="nearbyArtists && nearbyArtists.length > 0"
                :class="{
                  'q-pl-lg q-mt-lg': $q.screen.gt.xs,
                  'q-pl-md q-mt-md': $q.screen.lt.sm
                }"
              >
                {{ $t("landing_page.top_artists_in_area") }}:
              </div>
              <q-scroll-area
                horizontal
                class="artist-scroll-area q-mt-md"
                v-if="nearbyArtists && nearbyArtists.length > 0"
                :thumb-style="
                  $q.screen.gt.xs
                    ? { bottom: '0px', height: '4px' }
                    : { bottom: '0px', height: '0px' }
                "
              >
                <div
                  class="flex row no-wrap q-gutter-md"
                  :class="{
                    'q-px-lg': $q.screen.gt.xs,
                    'q-px-md': $q.screen.lt.sm
                  }"
                  v-if="nearbyArtists"
                >
                  <ArtistHead
                    v-for="(artist, index) in nearbyArtists"
                    :key="index"
                    :artist="artist"
                  ></ArtistHead>
                  <div
                    v-if="nearbyArtistsHasNext"
                    class="flex justify-center items-center t3 link-hover q-mr-lg"
                    @click="loadMoreNearbyArtists"
                    style="height: 128px; width: 128px; cursor: pointer"
                  >
                    <q-icon
                      name="mdi-chevron-right"
                      class="q-mb-lg"
                      size="2em"
                    />
                  </div>
                </div>
              </q-scroll-area>
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
              <div
                v-if="
                  (nearbyTags && nearbyTags.length > 0) ||
                    (nearbyArtists && nearbyArtists.length > 0)
                "
                :class="{
                  'q-px-lg': $q.screen.gt.xs,
                  'q-px-md': $q.screen.lt.sm
                }"
              >
                <div
                  class="separator"
                  :class="{
                    'q-mt-lg': $q.screen.gt.xs,
                    'q-mt-md': $q.screen.lt.sm
                  }"
                />
              </div>
              <!-- NEARBY EVENTS -->
              <div
                class="flex row items-center"
                :class="{
                  'q-pl-lg q-mt-md': $q.screen.gt.xs,
                  'q-pl-md q-mt-sm': $q.screen.lt.sm
                }"
              >
                <div class="t3">{{ $t("landing_page.events_within") }}</div>
                <q-select
                  emit-value
                  dense
                  borderless
                  map-options
                  behavior="menu"
                  class="q-ml-xs radius-select t3 o-060"
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
                  class="ed-card-grid "
                  :class="{
                    'q-px-lg q-mt-md': $q.screen.gt.xs,
                    'q-px-md q-mt-sm': $q.screen.lt.sm
                  }"
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
                :class="{
                  'q-px-lg q-mt-xl': $q.screen.gt.xs,
                  'q-px-md q-mt-lg': $q.screen.lt.sm
                }"
              >
                <div class="separator" />
              </div>
              <div
                v-if="eventDates"
                class="t3"
                :class="{
                  'q-pl-lg q-mt-lg q-mb-lg': $q.screen.gt.xs,
                  'q-pl-md q-mt-md q-mb-md': $q.screen.lt.sm
                }"
              >
                {{ $t("landing_page.all_upcoming_events") }}:
              </div>
              <transition
                appear
                enter-active-class="animated fadeIn faster"
                v-if="eventDates && eventDates.length > 0"
              >
                <div
                  class="ed-card-grid "
                  :class="{
                    'q-px-lg': $q.screen.gt.xs,
                    'q-px-md': $q.screen.lt.sm
                  }"
                >
                  <EventDateCard
                    v-for="(ed, index) in eventDates"
                    :key="index"
                    :event="ed[0]"
                    class="ed-card"
                  />
                </div>
              </transition>
              <div class="flex row justify-center q-mt-md" style="opacity: 0;">
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
              <div
                class="row justify-center q-my-lg"
                style="position: relative;"
                v-if="
                  eventDatesHasNext ||
                    nearbyEventDatesHasNext ||
                    loadingEventDates ||
                    (loadingNearbyEventDates && nearbyEventDates != null)
                "
              >
                <q-spinner-ios color="primary" size="2em" />
              </div>
              <div
                class="flex row justify-center items-center q-py-xl q-mt-xl"
                style="height: 300px; width: 100%; "
                v-if="nearbyEventDates == null"
              >
                <q-spinner-ios color="primary" size="2em" />
              </div>
              <!--
                <div
                  class="flex row justify-center q-mt-lg t3"
                  v-if="!eventDatesHasNext && eventDates != null"
                >
                  <div>End of results</div>
                </div>
              -->
            </div>

            <div
              class="flex row grow justify-center items-center q-mt-xl q-pt-xl"
              v-if="!everythingHasLoaded"
            >
              <q-spinner-ios color="primary" size="2em" />
            </div>
          </div>
        </q-card>
      </transition>
    </div>
  </div>
</template>

<script>
import { getFineLocation } from "@/assets/common.js";

import Tag from "components/EventPage/Tags/Tag";
import ArtistHead from "./ArtistHead.vue";
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
    ArtistHead,
    Tag
  },
  data() {
    return {
      showMapGap: false,
      scrollPosition: 0,
      initialNearbyTagsLoaded: false,
      initialNearbyArtistsLoaded: false,
      initialNearbyEventDatesLoaded: false,
      locationInput: null,
      eventDatesPerPage: 10,
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
      // menubar opacity
      /*
      var height = 0
      if (this.$q.screen.lt.sm) {
        height = 100 // this is the height of the gap between menu bar and top of event card
      } else {
        height = window.innerHeight / 3 - 120 // this is the height of the gap between menu bar and top of event card
      }
      var scrollPercentage = info.target.scrollTop / height
      if (scrollPercentage >= 1) {
        this.menuBarOpacity = 0
      } else {
        this.menuBarOpacity = 1
      }
        */
      this.scrollPosition = info.target.scrollTop;
      var delayedScrollPos = 0;

      if (this.$q.screen.gt.xs) {
        if (this.scrollPosition < 62) {
          delayedScrollPos = 0;
        } else {
          delayedScrollPos = this.scrollPosition - 62;
        }
        this.menuBarOpacity = (delayedScrollPos / 100) * -1 + 1;
      } else {
        if (this.scrollPosition < 62) {
          delayedScrollPos = 0;
        } else {
          delayedScrollPos = this.scrollPosition - 62;
        }
        this.menuBarOpacity = ((delayedScrollPos * 1.5) / 100) * -1 + 1;
      }
      // infinite scrolling
      let bottomOfWindow =
        info.target.scrollTop + info.target.offsetHeight ===
        info.target.scrollHeight;
      if (bottomOfWindow) {
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
      if (this.artistsHasNext) {
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
    computedMapGapOpacity() {
      var opacity = 1;
      var scale = 1;
      if (this.$q.screen.gt.xs) {
        opacity = (this.scrollPosition / 100) * -1 + 1;
        scale = (this.scrollPosition / 2000) * -1 + 1;
      } else {
        opacity = ((this.scrollPosition * 1.5) / 100) * -1 + 1;
        scale = ((this.scrollPosition * 2) / 2000) * -1 + 1;
      }
      return `opacity: ${opacity};
              transform: scale(${scale})`;
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

<style lang="scss">
.body--dark {
  .landing-page {
    .landing-page-background {
      //  background: linear-gradient(180deg, rgba(0, 0, 0, 0.48), black);
    }
    .map-gap {
      color: white;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 1);
    }
    .main-content {
      .content-card {
        .header {
          background: black;
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
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 1);
    }
    .main-content {
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
  padding-top: Max(calc((100vh - 66vh) - 64px), 0px);
  .landing-page-background {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0px;
    cursor: pointer;
  }
  .map-gap {
    position: fixed;
    top: 0px;
    left: 0px;
    //pointer-events: none;
    background: radial-gradient(rgba(0, 0, 0, 0.48), transparent 50%);
    cursor: pointer;
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
      width: 500px;
      overflow: hidden;
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

    .content-card {
      max-width: 960px;
      min-height: 100vh;
      pointer-events: all;
      border-top-left-radius: 0px !important;
      border-top-right-radius: 0px !important;
      box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 46px -6px,
        rgba(0, 0, 0, 0.2) 10px -10px 46px -6px,
        rgba(0, 0, 0, 0.2) -10px -10px 40px -6px !important;
      overflow: hidden;
      .header {
        width: 100%;
        height: 80px;
        box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.1);
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
        height: 154px;
        width: 100%;
        .artist-head-wrapper {
          height: 100%;
          .artist-name {
            display: flex;
            flex-grow: 1;
            align-items: center;
            justify-content: center;
          }
        }
      }

      .tag-scroll-area {
        height: 32px;
        width: 100%;
        .tag {
          opacity: 0.68;
        }
      }
      .radius-select {
        font-size: unset !important;
        .q-field__inner {
          .q-field__control {
            font-size: unset !important;
            .q-field__append {
              padding-left: 0px !important;
            }
          }
        }
      }
      .ed-card-grid {
        display: grid;
        grid-gap: 1rem;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        .ed-card {
          max-height: 174px;
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
}
@media (max-width: 2456px) {
  .landing-page {
    .main-content {
      .content-card {
        .ed-card-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
    }
  }
}
@media (max-width: 1680px) {
  .landing-page {
    .main-content {
      .content-card {
        .ed-card-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
    }
  }
}
@media (max-width: 600px) {
  .landing-page {
    padding-top: 150px;

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
          text-shadow: 1px 2px 2px rgba(0, 0, 0, 1);
        }
      }
    }
    .main-content {
      .content-card {
        .header {
          height: 62px !important;
        }
        .artist-scroll-area {
          // height: 128px;
        }

        .ed-card-grid {
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
      }
    }
  }
}
</style>
