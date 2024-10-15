<template>
  <div
    class="nearby-page flex column grow no-wrap"
    style="height: 100%; width: 100%; max-width: 100%"
  >
    <CustomQScroll
      ref="scroll"
      @scroll="onScroll"
      vertical
      :thumb-style="{
        marginTop: '16px',
        right: $q.screen.gt.sm ? '0px' : '0px',
        width: $q.screen.gt.sm ? '12px' : '4px',
        borderRadius: '0px',
      }"
      :class="!showPanelBackground && $q.screen.lt.sm && 'disable-scroll'"
      class="scroll-area flex grow"
    >
      <div class="scroll-stuff flex column">
        <div
          class="flex column mobile-location-header"
          style="width: 100%"
          :class="{
            'q-px-lg ': $q.screen.gt.sm,
            'q-px-md  q-mt-md ': $q.screen.lt.sm,
            'q-px-sm ': $q.screen.lt.md && $q.screen.gt.xs,
          }"
        >
          <div
            style="margin-top: -8px"
            class="ellipsis text-h4 inter bolder"
            v-if="$q.screen.lt.sm"
          >
            <span class="">Near</span>
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
              :class="{ 'reverse grow justify-between': $q.screen.lt.sm }"
            >
              <q-btn
                flat
                class=""
                :class="{
                  'q-ml-md q-pa-sm': $q.screen.lt.md,
                  'q-pa-md': $q.screen.gt.sm,
                }"
                @click.stop="() => getFineLocation()"
                :style="
                  $q.screen.gt.sm
                    ? 'margin-left: -16px; border-radius: 100px!important;'
                    : 'margin-left: 0px; border-radius: 100px!important;'
                "
              >
                <template v-slot:default>
                  <div v-if="!userLocationLoading" class="flex">
                    <q-icon
                      name="mdi-crosshairs-gps"
                      class=""
                      :size="$q.screen.lt.sm || $q.screen.gt.sm ? 'sm' : 'xs'"
                      v-if="fineLocation && !currentLocationFromSearch"
                    />
                    <q-icon
                      :size="$q.screen.lt.sm || $q.screen.gt.sm ? 'sm' : 'xs'"
                      name="mdi-crosshairs"
                      class=""
                      v-else
                    />
                  </div>
                  <div v-else style="position: relative" class="flex">
                    <q-icon
                      :size="$q.screen.lt.sm || $q.screen.gt.sm ? 'sm' : 'xs'"
                      style="z-index: 1"
                      name="mdi-crosshairs"
                    />
                    <q-icon
                      :size="$q.screen.lt.sm || $q.screen.gt.sm ? 'sm' : 'xs'"
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
                      Using rough location from your IP address. Click to
                      improve your location.
                    </span>
                    <span v-else>
                      {{ $t('landing_page.improve_location') }}
                    </span>
                  </q-tooltip>
                </template>
              </q-btn>
              <NearbyCountrySelect />
            </div>
            <div
              class="flex row items-center no-wrap"
              :class="{
                ' q-ml-sm': $q.screen.gt.sm,
                'q-ml-xs': $q.screen.lt.md,
              }"
              style="min-width: 220px"
              v-if="$q.screen.gt.xs"
            >
              <q-icon
                name="las la-calendar"
                :class="$q.screen.gt.sm ? ' q-pa-md' : 'q-pa-sm'"
                :size="$q.screen.gt.sm ? 'sm' : 'xs'"
              />
              <DesktopDateSelect />
            </div>
          </div>
        </div>
        <div
          class="flex message"
          :class="{
            ' q-mb-sm q-mt-lg q-pa-md': $q.screen.gt.xs,
            'q-mx-lg': $q.screen.gt.sm,
            'q-mx-md q-mt-md  q-pb-xs ': $q.screen.lt.md,
            b3: showMessage,
          }"
          @click="showMessage = !showMessage"
        >
          <div
            class="flex grow no-wrap justify-between inter"
            :class="{
              't2 items-center ': $q.screen.lt.md,
              '   inter  text-large t2 ': $q.screen.gt.sm,

              ' items-end': $q.screen.gt.sm,
            }"
          >
            <div class="flex grow">
              Welcome to PartyMap, the global directory of<br
                v-if="$q.screen.gt.sm"
              />
              doofs, festivals and underground culture!
            </div>
            <q-icon
              class="q-ml-md"
              size="1.2rem"
              :name="!showMessage ? 'mdi-menu-down' : 'mdi-menu-up'"
            />
          </div>
          <div
            v-if="showMessage"
            class="flex column items-start justify-start grow t1 q-mt-md inter semibold q-mb-sm"
          >
            PartyMap is a community-driven, crowd-sourced platform for finding
            parties and festivals around the world!
            <p />
            Anyone can submit an event that they know about, as long as the
            information is already public. <br />Anyone can also suggest changes
            to an event if the information is out of date. No account needed!

            <p />

            This is a work in progress... More features coming soon! &#128526;

            <p />
            - Pete
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
                  <span style="text-decoration: italic"
                    >PartyMap on the App Store</span
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
                  <q-icon
                    name="mdi-google-play"
                    size="1.5rem"
                    class="q-mr-sm"
                  />
                  <span style="text-decoration: italic"
                    >PartyMap on Google Play</span
                  >
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
            <!-- tags -->
            <div class="flex column" v-if="nearbyTags?.length >= 10">
              <div
                class="q-py-md location-header"
                :class="$q.screen.gt.sm ? 'q-px-lg' : 'q-pl-md '"
              >
                <div class="text-">Hot tags in this area</div>
              </div>
              <div
                class=""
                :class="$q.screen.gt.sm ? 'q-mb-sm' : ''"
                v-if="nearbyTags && nearbyTags.length > 0"
              >
                <CustomQScroll
                  horizontal
                  class="tag-scroll-area"
                  style="width: 100%"
                  :style="$q.screen.gt.sm ? 'margin-bottom: -8px' : ''"
                  :thumb-style="
                    $q.screen.gt.xs
                      ? {
                          borderRadius: '0px',
                          bottom: '8px',
                          height: '4px',
                          paddingLeft: '16px',
                          marginLeft: '24px',
                        }
                      : { bottom: '0px', height: '0px' }
                  "
                >
                  <div
                    class="flex column"
                    :class="$q.screen.gt.sm ? 'q-px-lg ' : 'q-pl-md'"
                  >
                    <div class="flex row no-wrap q-gutter-sm">
                      <div
                        v-for="(tag, index) in nearbyTags.filter(
                          (x, i) => i % 2 === 0
                        )"
                        :key="index"
                        @click="clickTag(tag)"
                        class="tag t2 text- inter semibold"
                        style="text-transform: capitalize"
                        :class="$q.platform.is.ios ? 'no-hover' : ''"
                      >
                        {{ tag.tag }}
                      </div>
                    </div>
                    <div class="flex row no-wrap q-gutter-sm q-pt-sm">
                      <div
                        v-for="(tag, index) in nearbyTags.filter(
                          (x, i) => i % 2 === 1
                        )"
                        :key="index"
                        @click="clickTag(tag)"
                        class="tag t2 text- inter semibold"
                        style="text-transform: capitalize"
                        :class="$q.platform.is.ios ? 'no-hover' : ''"
                      >
                        {{ tag.tag }}
                      </div>
                    </div>
                  </div>
                </CustomQScroll>
              </div>
            </div>
            <!-- Display global tags if there's not many local tags-->
            <div class="flex column" v-else-if="tagOptions?.length > 0">
              <div
                class="q-py-md location-header"
                :class="$q.screen.gt.sm ? 'q-px-lg q-mt-sm' : 'q-pl-md'"
              >
                Hot tags around the world:
              </div>
              <div>
                <CustomQScroll
                  horizontal
                  :style="$q.screen.gt.sm ? 'margin-bottom: -8px' : ''"
                  class="tag-scroll-area"
                  style="width: 100%"
                  :thumb-style="
                    $q.screen.gt.xs
                      ? {
                          borderRadius: '0px',
                          bottom: '8px',
                          height: '4px',
                          paddingLeft: '16px',
                          marginLeft: '24px',
                        }
                      : { bottom: '0px', height: '0px' }
                  "
                >
                  <div
                    class="flex column"
                    :class="$q.screen.gt.sm ? 'q-px-lg ' : 'q-pl-md'"
                  >
                    <div class="flex row no-wrap q-gutter-sm">
                      <div
                        v-for="(tag, index) in tagOptions.filter(
                          (x, i) => i % 2
                        )"
                        :key="index"
                        @click="clickTag(tag)"
                        class="tag t2 text- inter semibold"
                        style="text-transform: capitalize"
                        :class="$q.platform.is.ios ? 'no-hover' : ''"
                      >
                        {{ tag.tag }}
                      </div>
                    </div>
                    <div class="flex row no-wrap q-gutter-sm q-pt-sm">
                      <div
                        v-for="(tag, index) in tagOptions.filter(
                          (x, i) => i % 2 !== 1
                        )"
                        :key="index"
                        @click="clickTag(tag)"
                        class="tag t2 text- inter semibold"
                        style="text-transform: capitalize"
                        :class="$q.platform.is.ios ? 'no-hover' : ''"
                      >
                        {{ tag.tag }}
                      </div>
                    </div>
                  </div>
                </CustomQScroll>
              </div>
            </div>
            <!-- artists -->
            <div class="flex column" v-if="nearbyArtists?.length > 5">
              <div
                class="location-header q-py-md inter"
                :class="$q.screen.gt.sm ? 'q-px-lg ' : 'q-pl-md t1'"
              >
                High profile artists
              </div>
              <ArtistsComponent
                :size="$q.screen.gt.lg ? 'lg' : 'md'"
                :artists="nearbyArtists"
                :hasNext="nearbyArtistsHasNext"
                :loadMore="debouncedLoadNearbyArtists"
                :style="
                  $q.screen.gt.sm
                    ? 'margin-bottom: -16px; margin-top: -12px; z-index: 2000'
                    : ''
                "
              />
            </div>

            <!-- Display global artists if there's not many local artists-->

            <div class="flex column" v-else-if="artistOptions?.length > 0">
              <div
                class="location-header q-py-md inter semibold"
                :class="
                  $q.screen.gt.sm
                    ? 'q-pl-lg  q-mt-sm t1 inter bolder text-h6'
                    : 'q-pl-md t1'
                "
              >
                Top artists worldwide:
              </div>
              <ArtistsComponent
                :class="$q.screen.gt.sm ? 'q-pl-sm' : ''"
                :artists="artistOptions"
                :hasNext="artistOptionsHasNext"
                :loadMore="debouncedLoadArtistOptions"
                :size="$q.screen.gt.xs ? 'lg' : 'md'"
                :style="
                  $q.screen.gt.sm
                    ? 'margin-bottom: -16px; margin-top: -12px; z-index: 2000'
                    : ''
                "
              />
            </div>
            <!-- NEARBY EVENTS -->
            <!-- your events-->
            <div
              class="flex column"
              v-if="currentUser && userEventDates?.length > 0"
            >
              <div
                class="q-py-md q-mt-sm location-header flex justify-between"
                :class="$q.screen.gt.sm ? 'q-px-lg' : 'q-px-md'"
              >
                <div class="text-">Your upcoming events:</div>
                <router-link
                  class="link-hover t3 inter semibold"
                  :to="{
                    name: 'UserPage',
                    params: { username: currentUser.username },
                  }"
                >
                  View all <q-icon name="mdi-chevron-right" />
                </router-link>
              </div>
              <div
                class="q-mb-sm"
                v-if="userEventDates && userEventDates.length > 0"
              >
                <CustomQScroll
                  horizontal
                  class="user-event-scroll-area"
                  style="width: 100%"
                  :thumb-style="
                    $q.screen.gt.sm
                      ? {
                          bottom: '0px',
                          height: '4px',
                          borderRadius: '0px',
                          marginLeft: '24px',
                        }
                      : { bottom: '0px', height: '0px' }
                  "
                >
                  <div
                    class="flex row no-wrap q-gutter-md"
                    :class="$q.screen.gt.sm ? 'q-px-lg' : 'q-px-md'"
                  >
                    <EventDatePoster
                      v-for="(ed, index) in userEventDates"
                      :key="index"
                      :hideInfo="true"
                      :event="ed[0]"
                    />
                  </div>
                </CustomQScroll>
              </div>
              <div
                :class="
                  $q.screen.lt.md ? 'q-px-md ' : 'q-px-lg q-mt-sm q-mb-sm'
                "
              >
                <q-separator />
              </div>
            </div>

            <div
              v-if="currentLocation"
              class="location-header q-py-sm q-mt-sm flex row items-center justify-between"
              :class="$q.screen.lt.md ? 'q-pl-md' : 'q-pl-lg'"
            >
              <div class="flex items-center">
                <div class="">
                  {{ $t('landing_page.events_within') }}
                </div>
                <q-select
                  emit-value
                  dense
                  borderless
                  map-options
                  behavior="menu"
                  class="q-mx-xs radius-select inter o-050"
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
            <div
              class="q-mt-xl q-pt-xl text-center"
              :class="$q.screen.gt.sm ? 'q-pl-lg t3 ' : 'q-pl-md t3'"
              v-if="
                nearbyEventDates.length === 0 &&
                !loadingEverything &&
                !nearbyEventDatesLoading &&
                !userLocationLoading
              "
            >
              Something went wrong...
            </div>
            <EventDateList
              class="q-mx-sm"
              v-if="nearbyEventDates && compactView"
              :groupByMonth="false"
              :eventDates="nearbyEventDates"
              :hasNext="nearbyEventDatesHasNext"
              :loading="nearbyEventDatesLoading"
              :disableEndOfResultsMessage="true"
              :hideHeader="true"
            />
            <EventDatePosterList
              class="q-mx-sm"
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
              {{ $t('landing_page.no_events_in_area') }}
            </div>
            <!-- ALL EVENTS -->

            <div
              class="location-header q-pl-sm flex row items-center justify-between"
              :class="$q.screen.gt.sm ? 'q-mt-sm' : ''"
              v-if="eventDates && eventDates?.length > 0"
              style="height: 56px"
            >
              <!--<div class="separator" /> -->

              <div
                class="flex"
                :class="$q.screen.gt.sm ? 'q-pl-md' : 'q-pl-sm'"
              >
                <div class="ellipsis" v-if="eventDates">
                  {{ $t('landing_page.all_upcoming_events') }}:
                </div>
              </div>
              <!--
                      <EventDateViewOptions
                        style="margin-right: 16px"
                        :show-group-by-month="false"
                        v-if="$q.screen.gt.sm"
                      />
                      -->
            </div>

            <EventDateList
              class="q-mx-sm"
              v-if="eventDates && compactView"
              :groupByMonth="false"
              :eventDates="eventDates"
              :hasNext="eventDatesHasNext"
              :hideHeader="true"
            />
            <EventDatePosterList
              class="q-mx-sm"
              v-if="eventDates && !compactView"
              :groupByMonth="false"
              :eventDates="eventDates"
              :hasNext="eventDatesHasNext && !nearbyEventDatesHasNext"
              :hideHeader="true"
            />

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
    </CustomQScroll>
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
import EventDateList from 'src/components/EventDateList.vue';
import EventDatePosterList from 'src/components/EventDatePosterList.vue';
//import EventDateViewOptions from 'src/components/EventDateViewOptions.vue';
import InnerLoading from 'src/components/InnerLoading.vue';
import { useAuthStore } from 'src/stores/auth';
import EventDatePoster from 'src/components/EventDatePoster.vue';
import EventDateCard from 'src/components/EventDateCard.vue';
import DesktopDateSelect from './DesktopDateSelect.vue';
import _ from 'lodash';

export default {
  name: 'LandingPage',
  meta() {
    return {
      // this accesses the "title" property in your Vue "data";
      // whenever "title" prop changes, your meta will automatically update
      title: 'PartyMap | The Global Map of Festivals and Events',
      meta: {
        description: {
          name: 'description',
          content:
            'PartyMap is a community-driven platform for discovering festivals and events near you and around the world.',
        },
        keywords: {
          name: 'keywords',
          content:
            'Festival, Festivals, Map, Events, Party, Fiesta, Music, Music Festival, Music Festivals, Best Music Festivals, All Music Festivals, Top Music Festivals, List of music festivals, list',
        },
      },
    };
  },

  components: {
    CustomQScroll,
    ArtistsComponent,
    EventDateList,
    EventDatePosterList,
    EventDatePoster,
    // EventDateViewOptions,
    InnerLoading,
    // EventDateCard,
    NearbyCountrySelect,
    DesktopDateSelect,
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
      'loadNearbyTags',
      'loadNearbyArtists',
      'loadNearbyEventDates',
      'loadEventDates',
    ]),
    scrollMouseEnter(event) {
      console.log(event);
      event.stopImmediatePropagation();
      event.preventDefault();
      return false;
    },
    scrollMouseLeave(event) {
      console.log(event);
    },
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

      if (info.verticalPosition <= 0) {
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
      // infinite scrolling

      if (info.verticalPercentage === 1) {
        if (this.nearbyEventDatesHasNext && this.currentLocation) {
          this.debouncedLoadNearbyEventDates();
        } else if (this.eventDatesHasNext) {
          this.debouncedLoadEventDates();
        }
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
            .join('&')
      );
    },

    clickTag(tag) {
      let index = this.controlTag?.findIndex((x) => x.tag === tag.tag);
      if (index > -1) {
        // tag already selected, do nothing
      } else {
        this.controlTag.push(tag);
      }
      this.sidebarPanel = 'explore';
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
        if (this.$route.name === 'Explore') {
          if (newval && !oldval) {
            console.log('location 1');
            this.loadEverything();
            return;
          } else if (newval && oldval) {
            const userLocationHasSignficantlyChanged =
              Math.round(newval.lat) !== Math.round(oldval.lat) ||
              Math.round(newval.lng) !== Math.round(oldval.lng);
            if (userLocationHasSignficantlyChanged) {
              console.log('location has_sig_changed');
              this.loadEverything();
            }
          }
        }
      },
      //deep: true,
    },
    queryRadius: {
      handler: function (newval, oldval) {
        console.log('qq qr', newval, oldval);
        if (oldval !== null && oldval != newval) {
          console.log('location 2');

          this.loadEverything();
          console.log('qq called', newval, oldval);
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
    this.debouncedLoadNearbyEventDates = _.debounce(
      this.loadNearbyEventDates,
      150,
      {
        leading: true,
        trailing: false,
      }
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
      this.$refs.scroll.setScrollPercentage('vertical', 0);
      setTimeout(() => {
        this.sidebarPanelReady = true;
      }, 350);
    } else {
      this.sidebarPanelReady = true;
    }

    // otherwise will change on route change

    if (this.userLocation) {
      this.restoreUserLocation();
    } else {
      try {
        await this.getFineLocation();
      } catch {
        await this.loadIpInfo();
      }
      if (this.eventDates?.length === 0) this.loadEverything();
      else {
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
      // background: $bi-2;
      border: 1px solid rgba(255, 255, 255, 0.15);
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
        border: 1px solid rgba(255, 255, 255, 0.25);
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
      border: 1px solid rgba(0, 0, 0, 0.1);

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
        border: 1px solid rgba(0, 0, 0, 0.1);
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
  .scroll-area {
    height: 100%;
    overflow: hidden;
    :deep(.q-scrollarea__container) {
      .q-scrollarea__content {
        // width: 100% !important;
        // max-width: 100% !important;
        // this fucks with the vertical artist scroll child width
      }
    }
    :deep(.scroll) {
      //overflow-x: hidden;
      overflow-y: auto;
    }

    &.disable-scroll {
      :deep(.scroll) {
        overflow-y: hidden;
      }
    }
    .scroll-stuff {
      max-width: 100vw;
      position: relative;
      padding-top: 8px;
      .location-header {
        position: sticky;
        top: -1px;
        z-index: 1000;
        width: 100%;
        font-weight: 700;
        font-size: 1rem;
        // text-transform: lowercase;
      }
    }

    :deep(.q-scrollarea__thumb) {
      z-index: 1000;
    }
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
      z-index: 5000;
      //border-radius: 9px;
      cursor: pointer;
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
    height: 88px;
    mask-image: linear-gradient(to left, transparent 0px, white 64px);
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
  }
}

@media only screen and (min-width: 600px) and (max-width: 1024px) {
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
    .scroll-area {
      .scroll-stuff {
        .location-header {
          font-weight: 700;
          font-size: unset;
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
