<template>
  <div
    class="ed-card"
    style="width: 100%"
    :class="{ isPopup }"
    @mouseenter="mouseEnter"
    @mouseleave="mouseLeave"
  >
    <router-link
      v-if="event"
      style="
        text-decoration: none;
        color: inherit;
        z-index: 1;
        display: flex;
        flex-direction: column;
      "
      :to="{
        name: 'EventPage',
        params: {
          id: event?.event_id,
          eventDateId: event?.id,
        },
        query: {
          name: event?.name.replace(/ /g, '_'),
          thumbXsUrl: imgThumbUrl,
          location: JSON.stringify({
            lat: event?.location.lat,
            lng: event?.location.lng,
            place_id: event?.location.place_id,
          }),
          dateString: computedDateString,
          locationDescription: computedLocation,
          description: event.event.description_t || event.event.description,
          tags: JSON.stringify(event?.event.event_tags),
        },
      }"
    >
      <div
        class="ed-card-content flex row grow justify-between items-center no-wrap q-py-sm q-pl-lg"
        style="width: 100%"
      >
        <!-- mouseover.stop is to fix a stupid ios bug relating to q-scroll-area having a mouseover event and causing the user to have to double click on items-->
        <div class="flex row grow items-start no-wrap shrink">
          <div
            class="image-container flex justify-center items-center shadow-md q-mr-md"
          >
            <q-icon
              v-if="!imgThumbUrl"
              name="las la-calendar"
              size="2em"
              class="o-070"
              style="z-index: 2"
            />
            <transition appear enter-active-class="animated fadeIn slow">
              <img
                style="filter: blur(2px); transform: scale(1.2); z-index: 2"
                :src="imgThumbXsUrl"
                class="not-loaded"
              />
            </transition>
            <transition appear enter-active-class="animated fadeIn slow">
              <img
                ref="imgThumb"
                :src="imgThumbUrl"
                @load="onLoadedThumb"
                v-show="loadedImage"
                style="z-index: 3"
              />
            </transition>
          </div>
          <div class="flex column grow ellipsis">
            <div
              class="ed-card-header ellipsis flex row justify-between items-start no-wrap ellipsis"
            >
              <div
                class="flex row items-baseline no-wrap metropolis bold q-mr-sm ellipsis"
                :class="{
                  ' q-mb-xs': $q.screen.gt.sm,
                  'q-mb-xs': $q.screen.lt.md,
                }"
              >
                <span class="ellipsis" style="max-width: 250px">{{
                  event?.name || name
                }}</span>
                <q-icon
                  class="q-ml-sm o-080"
                  name="mdi-check-decagram"
                  v-if="event?.event.host"
                >
                  <q-tooltip
                    :content-class="
                      $q.dark.isActive
                        ? 'bg-black text-white'
                        : 'bg-white text-black'
                    "
                    :offset="[10, 10]"
                    content-style="font-size: 16px"
                  >
                    {{ $t('event.official_page') }}
                  </q-tooltip></q-icon
                >
              </div>
            </div>

            <div
              class="flex row grow justify-between no-wrap card-bottom-text o-070 q-pr-md"
              style="font-weight: 400; font-size: smaller"
              v-if="event"
            >
              <!--

          <div class="flex row items-center ">
            <q-badge
              class="q-my-xs"
              color="red"
              :label="$t('event_dates.cancelled')"
              v-if="event.cancelled"
            />
            <span v-if="!event.cancelled">
              <q-icon name="las la-clock" class="q-mr-sm" />{{
                relativeHumanTime(event.start_naive, event.end_naive, event.tz)
              }}
            </span>
          </div>
-->
              <div class="flex column grow ellipsis">
                <span>
                  <q-icon name="las la-clock" class="q-mr-sm" />

                  <span
                    v-if="event.cancelled"
                    class="text-bold"
                    style="color: red"
                    >{{ $t('event_dates.cancelled') }}</span
                  >

                  <span v-else
                    >{{
                      relativeHumanTime(
                        event.start_naive,
                        event.end_naive,
                        event.tz,
                      )
                    }}
                  </span>
                  -
                  <span v-if="event.date_confirmed">
                    {{ localDateWithWeekday(event.start_naive, event.tz) }}
                  </span>
                  <span v-else>
                    {{ monthYear(event.start_naive, event.tz)
                    }}<span class="o-060"
                      >&nbsp;({{ $t('event_dates.tbc') }})</span
                    >
                  </span>

                  <span
                    v-if="
                      event.event.rrule &&
                      event.event.rrule.separation_count > 0
                    "
                    class="o-070 no-wrap ellipsis q-ml-sm"
                  >
                    <q-icon
                      size="1em"
                      class="q-mr-sm q-pb-xs"
                      name="las la-redo-alt"
                    />
                    <span v-if="$q.screen.gt.sm">{{
                      simplifiedRecurringPattern(event.event.rrule)
                    }}</span>
                  </span>
                </span>

                <div class="ellipsis">
                  <span v-if="computedLocation" class="ellipsis">
                    <q-icon name="las la-map-marker" class="q-mr-sm" />{{
                      computedLocation
                    }}
                  </span>

                  <span v-if="event.distance != null" class="o-050 ellipsis"
                    >&nbsp;({{
                      Intl.NumberFormat().format(
                        parseInt(Number(event.distance) / 1000),
                      )
                    }}{{ $t('event.km') }})</span
                  >
                </div>

                <div class="flex row no-wrap items-center">
                  <q-icon name="las la-hashtag" class="q-mr-sm" />

                  <CustomQScroll
                    v-if="event?.event?.event_tags?.length > 0"
                    horizontal
                    style="height: 18px; margin-bottom: 0px; width: 100%"
                    :thumb-style="{
                      bottom: '-4px',
                      height: '4px',
                      borderRadius: '0px',
                    }"
                  >
                    <div class="tag-container flex row no-wrap q-pr-md">
                      <span v-for="(et, index) in event.event.event_tags"
                        >{{ et.tag_t || et.tag
                        }}<span v-if="index < event.event.event_tags.length - 1"
                          >,&nbsp;</span
                        ></span
                      >
                    </div>
                  </CustomQScroll>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script>
import common, { localDayOfMonth } from 'assets/common';
import Tag from 'src/components/Tag.vue';
import { mapWritableState } from 'pinia';
import { useMapStore } from 'src/stores/map';
import CustomQScroll from 'components/CustomQScroll.vue';
//import ColorThief from 'colorthief/dist/color-thief.mjs';

export default {
  components: {
    Tag,
    CustomQScroll,
  },
  props: {
    event: Object,
    isPopup: Boolean,
    name: String,
  },
  data() {
    return {
      loadedImage: false,
    };
  },
  methods: {
    onLoadedThumb() {
      this.loadedImage = true;
    },
    mouseEnter() {
      if (this.$q.screen.gt.xs && !this.isPopup)
        this.eventDateHoverMarker = {
          lat: this.event.location.lat,
          lng: this.event.location.lng,
          name: this.event.name,
        };
    },
    mouseLeave() {
      this.eventDateHoverMarker = null;
    },
  },
  computed: {
    ...mapWritableState(useMapStore, ['eventDateHoverMarker', 'focusMarker']),
    imgThumbUrl() {
      return this.event?.event?.cover_items?.[0]?.thumb_url;
    },
    imgThumbXsUrl() {
      return this.event?.event?.cover_items?.[0]?.thumb_xxs_url;
    },
    computedDateString() {
      if (this.event?.date_confirmed) {
        return this.localDateWithWeekday(this.event.start_naive, this.event.tz);
      } else if (this.event) {
        return this.monthYear(this.event.start_naive, this.event.tz);
      } else return '';
    },
    computedLocation() {
      if (this.event?.location?.locality) {
        if (this.event.location.locality.region?.long_name) {
          return (
            this.event.location.locality.long_name +
            ', ' +
            this.event.location.locality.country.long_name
          );
        } else {
          return this.event?.location?.locality?.long_name;
        }
      } else {
        return this.event?.location?.name;
      }
    },
  },
  created() {
    // import common methods
    this.relativeHumanTime = common.relativeHumanTime;
    this.localDateWithWeekday = common.localDateWithWeekday;
    this.monthYear = common.monthYear;
    this.timeZoneAbbreviention = common.timeZoneAbbreviention;
    this.simplifiedRecurringPattern = common.simplifiedRecurringPattern;
    this.localDayOfMonth = localDayOfMonth;
    this.localDay = common.localDay;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .ed-card {
    // outline: 1px solid black;
    // border-top: 1px solid rgba(30, 30, 30);
    // background: linear-gradient($bi-3, $bi-3);

    .ed-card-bg {
      background: $bi-3;
      opacity: 0.4;
    }
    .ed-card-content {
      .image-container {
        background: $bi-3;
      }
    }
    .card-background {
      background: $bi-4;
      opacity: 0.8;
      transition: opacity 0.2s ease;
    }

    .event-info {
      color: $ti-2;
    }
  }

  .tag-container {
    .tag {
      //color: $ti-1 !important;
      // border: 1px solid rgba(255, 255, 255, 0.2) !important;
    }
  }
}

.body--light {
  .ed-card {
    // border-top: 1px solid rgba(220, 220, 220);

    font-smooth: always;
    .card-background {
      background: #181818;
      opacity: 0.8;
      transition: opacity 0.2s ease;
    }
    &:hover {
      background: $b-2;
    }
    .ed-card-bg {
      opacity: 0.4;

      transition: opacity 0.2s ease;
    }
    .ed-card-content {
      .image-container {
        background: $b-4;
      }
    }

    .event-info {
    }
  }
}

.ed-card {
  //min-height: 238.5px;
  border: none;

  direction: ltr;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  position: relative;
  transform: translate3d(0, 0, 0);
  width: 100%;

  @supports (font: -apple-system-body) and (-webkit-appearance: none) {
    -webkit-backface-visibility: hidden;
    -webkit-transform: translate3d(0, 0, 0);
    // translate3d is a hack for safari to force gpu rendering of blur()
  }

  &.isPopup {
    height: 238px;
    width: 450px;
  }
  &:before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.05);
    z-index: 10;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    border-radius: 9px;
    z-index: 5;
  }

  &:hover {
    //transform: scale(1.01) translateY(0px);
    &:before {
      opacity: 1;
    }
  }

  .ed-card-bg {
    //border-radius: 9px;
    z-index: 1;
    filter: blur(100px);
    transform: rotate(180deg) scaleX(-1) scale(2);
    position: absolute;
    height: 100%;
    width: 100%;

    mix-blend-mode: soft-light;
    /* Safari Only*/
    @supports (font: -apple-system-body) and (-webkit-appearance: none) {
      transform: rotate(180deg) scaleX(-1) scale(2) translate3d(0, 0, 0);
      // translate3d is a hack for safari to force gpu rendering of blur()
    }
  }
  .description {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    max-height: 60px; // height of 3 lines of text

    @supports (-webkit-line-clamp: 3) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: initial;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
  }
  .ed-card-content {
    position: relative;
    transition: opacity 0.3s ease;
    z-index: 1;
    @supports (font: -apple-system-body) and (-webkit-appearance: none) {
      -webkit-backface-visibility: hidden;
      -webkit-transform: translate3d(0, 0, 0);
      // translate3d is a hack for safari to force gpu rendering of blur()
    }

    .ed-card-header {
      //font-size: 1rem;
      max-width: 100%;
      opacity: 1;
      //color: white !important;
      z-index: 2;
    }
    .card-bottom-text {
      position: relative;
      z-index: 2;
      //color: white !important;
      font-size: small;
    }
    .image-container {
      width: 100%;
      position: relative;
      overflow: hidden;
      //border-radius: 100%;
      width: 68px;
      height: 88px;
      // aspect-ratio: 595 / 842; (this causes serious slowness on ios)
      z-index: 1;
      border-radius: 9px;

      img {
        position: absolute;
        pointer-events: none;
        height: 100%;
        width: 100%;
        max-height: 100%;
        max-width: 100%;
        object-fit: cover;
      }
    }
  }

  .event-info {
    z-index: 1;
    .tag-container {
      display: flex;
      flex-direction: row;
      width: 100%;
      //overflow: hidden;
    }
  }
}

// sm
@media only screen and (max-width: 1023px) {
  .ed-card {
    &:before {
      display: none;
      //opacity: 1;
    }
    &:hover {
      //transform: scale(1.01) translateY(0px);
    }
    .ed-card-content {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 9px;
      margin-bottom: 8px;
      box-shadow: rgba(0, 0, 0, 0.1) 0px 25px 20px -20px;
    }
    .description {
      font-size: small;
    }
  }
}

// desktop
@media only screen and (min-width: 1024px) {
  .ed-card {
    &:before {
      //display: none;
      //opacity: 1;
    }
    &:hover {
      //transform: scale(1.01) translateY(0px);
    }
    .ed-card-content {
      .image-container {
      }
    }
  }
}
</style>
