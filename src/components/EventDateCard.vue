<template>
  <transition appear enter-active-class="animated fadeIn">
    <div class="ed-card" @mouseenter="mouseEnter" @mouseleave="mouseLeave">
      <router-link
        style="text-decoration: none; color: inherit"
        :to="{
          name: 'EventPage',
          params: {
            id: event.event_id,
            eventDateId: event.id,
          },
          query: {
            name: event.name.replace(/ /g, '_'),
            thumbXsUrl: imgThumbXsUrl,
            location: JSON.stringify({
              lat: event.location.lat,
              lng: event.location.lng,
            }),
          },
        }"
      >
        <div class="ed-card-bg" :style="getBottomBgImgStyle()" />
        <div class="ed-card-content flex row no-wrap q-pa-md">
          <!-- mouseover.stop is to fix a stupid ios bug relating to q-scroll-area having a mouseover event and causing the user to have to double click on items-->
          <div
            class="image-container flex justify-center items-center shadow-2xl"
          >
            <img
              style="filter: blur(2px); transform: scale(1.2)"
              :src="imgThumbXsUrl"
              class="image not-loaded"
              v-show="!loadedImage"
            />
            <transition enter-active-class="animated fadeIn">
              <img
                :src="imgThumbUrl"
                class="image"
                @load="() => (loadedImage = true)"
                v-show="loadedImage"
              />
            </transition>
          </div>
          <div class="flex column grow q-pl-md" style="width: 100%">
            <div
              class="ed-card-header flex row justify-between items-start no-wrap ellipsis"
            >
              <div
                class="flex row items-baseline no-wrap inter bold q-mr-sm ellipsis"
                :class="{
                  'text-large q-mb-sm': $q.screen.gt.sm,
                  'q-mb-xs': $q.screen.lt.md,
                }"
              >
                <span class="ellipsis">{{ event.name }}</span>
                <q-icon
                  class="q-ml-sm o-080"
                  name="mdi-check-decagram"
                  v-if="event.event.host"
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
              class="flex column justify-center card-bottom-text o-070 q-mb-sm"
              style="font-weight: 400"
              :class="{
                'q-mt-': $q.screen.gt.sm,
              }"
            >
              <!--

          <div class="flex row items-center ">
            <q-badge
              class="q-my-xs"
              color="red"
              :label="$t('event_date_inline.cancelled')"
              v-if="event.cancelled"
            />
            <span v-if="!event.cancelled">
              <q-icon name="las la-clock" class="q-mr-sm" />{{
                relativeHumanTime(event.start_naive, event.end_naive, event.tz)
              }}
            </span>
          </div>
-->
              <div class="flex column">
                <span>
                  <q-icon name="las la-clock" class="q-mr-sm" />
                  <q-badge
                    v-if="event.cancelled"
                    class="q-my-xs"
                    color="red"
                    :label="$t('event_date_inline.cancelled')"
                  />

                  <span v-else
                    >{{
                      relativeHumanTime(
                        event.start_naive,
                        event.end_naive,
                        event.tz
                      )
                    }}
                  </span>
                </span>
                <div class="flex row items-center no-wrap ellipsis">
                  <q-icon name="las la-calendar" class="q-mr-sm" />
                  <div class="flex row no-wrap ellipsis">
                    <span v-if="event.date_confirmed">
                      {{ localDateWithWeekday(event.start_naive, event.tz) }}
                    </span>
                    <span v-else>
                      {{ monthYear(event.start_naive, event.tz) }} (Date TBC)
                    </span>
                    <span
                      v-if="
                        event.event.rrule &&
                        event.event.rrule.separation_count > 0
                      "
                      class="flex row items-center q-ml-xs o-070 no-wrap ellipsis"
                    >
                      <q-icon class="q-ml-xs q-mr-sm" name="las la-redo-alt" />
                      {{ simplifiedRecurringPattern(event.event.rrule) }}
                    </span>
                  </div>
                </div>
                <div>
                  <span
                    v-if="event.location && event.location.locality"
                    class="ellipsis"
                  >
                    <q-icon name="las la-map-marker" class="q-mr-sm" />{{
                      event.location.locality.long_name
                    }}<span v-if="event.location.locality?.region?.long_name"
                      >,</span
                    >
                    {{ event.location.locality?.region?.long_name }}
                  </span>
                  <span v-else class="ellipsis">
                    <q-icon name="las la-map-marker" class="q-mr-sm" />{{
                      event.location.name
                    }}
                  </span>
                  <span v-if="event.distance != null" class="o-050 ellipsis"
                    >&nbsp;({{
                      Intl.NumberFormat().format(
                        parseInt(Number(event.distance) / 1000)
                      )
                    }}km)</span
                  >
                </div>
              </div>
            </div>
            <div
              v-if="$q.screen.gt.sm"
              class="description flex ellipsis q-mb-sm items-center"
              style="max-width: 100%"
            >
              {{ event.event.description }}
            </div>
            <!-- scroll area here (qscroll or regular) area causes performance issues on android-->
            <q-scroll-area
              v-if="!$q.platform.is.android"
              horizontal
              style="min-height: 39px; margin-bottom: -8px"
              class="q-mt-xs"
              :thumb-style="{
                bottom: '-4px',
                height: '8px',
                borderRadius: '0px',
              }"
            >
              <div
                class="tag-container flex row no-wrap ellipsis"
                v-if="
                  event.event.event_tags && event.event.event_tags.length > 0
                "
              >
                <Tag
                  :small="true"
                  class="q-mr-xs"
                  v-for="(et, index) in event.event.event_tags"
                  :key="index"
                  :value="et.tag"
                ></Tag>
              </div>
            </q-scroll-area>
            <div v-else class="flex">
              <div
                class="tag-container flex row no-wrap"
                style="overflow-x: hidden"
                v-if="
                  event.event.event_tags && event.event.event_tags.length > 0
                "
              >
                <Tag
                  class="q-mr-xs"
                  v-for="(et, index) in event.event.event_tags"
                  :key="index"
                  :value="et.tag"
                ></Tag>
              </div>
            </div>
          </div>
        </div>
      </router-link>
    </div>
  </transition>
</template>

<script>
import common, { localDayOfMonth } from 'assets/common';
import Tag from 'src/components/TagComponent.vue';
import { mapWritableState } from 'pinia';
import { useMapStore } from 'src/stores/map';
export default {
  components: {
    Tag,
  },
  props: {
    event: Object,
    shortDate: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      loadedImage: false,
    };
  },
  methods: {
    mouseEnter() {
      if (this.$q.screen.gt.xs)
        this.eventDateHoverMarker = {
          lat: this.event.location.lat,
          lng: this.event.location.lng,
          name: this.event.name,
        };
    },
    mouseLeave() {
      this.eventDateHoverMarker = null;
    },
    getBottomBgImgStyle() {
      if (this.$q.dark.isActive) {
        return `background-image:  url("${this.imgThumbXsUrl}");
        background-size: cover;
        display: inline-block;
        background-position: center;
        `;
      } else {
        return `background-image:  url("${this.imgThumbXsUrl}");
          background-size: cover;
          display: inline-block;
          background-position: center;
          `;
      }
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
    outline: 1px solid black;
    border-top: 1px solid rgba(48, 48, 48);
    background: linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.9));

    .ed-card-bg {
      background: $bi-3;
      opacity: 0.4;
    }
    .ed-card-content {
    }
    .card-background {
      background: $bi-4;
      opacity: 0.8;
      transition: opacity 0.2s ease;
    }
    &:first-child {
      margin-top: 0px;
    }
    .event-info {
      color: $ti-2;
    }
  }

  .tag-container {
    .tag {
      color: $ti-2 !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
    }
  }
}

.body--light {
  .ed-card {
    color: white;

    box-shadow: rgba(0, 0, 0, 0.12) 0px 3px 8px;
    font-smooth: always;
    background: black;

    .card-background {
      //background: #181818;
      opacity: 0.8;
      transition: opacity 0.2s ease;
    }
    .ed-card-bg {
      opacity: 0.4;
      background: white;
      transition: opacity 0.2s ease;
    }
    .ed-card-content {
      border-top: 1px solid (rgba(255, 255, 255, 0.2));

      color: white !important;
    }
    &:first-child {
      margin-top: 0px;
    }

    .event-info {
    }
  }
}

.ed-card {
  border: none;
  border-radius: 9px;
  direction: ltr;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  position: relative;
  transform: translate3d(0, 0, 0);
  @supports (font: -apple-system-body) and (-webkit-appearance: none) {
    -webkit-backface-visibility: hidden;
    -webkit-transform: translate3d(0, 0, 0);
    // translate3d is a hack for safari to force gpu rendering of blur()
  }

  &:before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    z-index: 10;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    border-radius: 9px;
    z-index: 2;
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
    filter: blur(12px);
    transform: rotate(180deg) scaleX(-1) scale(2);
    position: absolute;
    height: 100%;
    width: 100%;

    /* Safari Only*/
    @supports (font: -apple-system-body) and (-webkit-appearance: none) {
      transform: rotate(180deg) scaleX(-1) scale(2) translate3d(0, 0, 0);
      // translate3d is a hack for safari to force gpu rendering of blur()
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
    .tag-container {
      :deep(.tag) {
        background: transparent !important;
        border: 1px solid rgba(255, 255, 255, 0.48) !important;
      }
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
      //max-width: 400px;
      // max-height: 400px;
      // min-width: 400px;
      width: 100%;
      position: relative;
      overflow: hidden;
      //border-radius: 100%;
      width: 90px;
      height: 127px;
      // aspect-ratio: 595 / 842; (this causes serious slowness on ios)
      min-width: 90px;
      z-index: 1;
      border-radius: 9px;

      .image {
        height: 100%;
        width: 100%;
        max-height: 100%;
        max-width: 100%;
        object-fit: cover;
        z-index: 2;
        pointer-events: none;
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
@media only screen and (max-width: 599px) {
  .ed-card {
    &:before {
      display: none;
      //opacity: 1;
    }
    &:hover {
      //transform: scale(1.01) translateY(0px);
    }
  }
}

// desktop
@media only screen and (min-width: 1024px) {
  .ed-card {
    &:before {
      display: none;
      //opacity: 1;
    }
    &:hover {
      //transform: scale(1.01) translateY(0px);
    }
    .ed-card-content {
      .image-container {
        min-width: 144px;
        height: 203px;
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
    }
  }
}
</style>
