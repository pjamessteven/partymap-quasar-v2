<template>
  <div
    class="ed-card"
    :class="{ isPopup }"
    @mouseenter="mouseEnter"
    @mouseleave="mouseLeave"
  >
    <transition appear enter-active-class="animated fadeIn slow">
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
        <div class="ed-card-bg" :style="getBottomBgImgStyle()" />
        <div
          class="ed-card-content flex row no-wrap q-py-md q-pl-md"
          style="width: 100%"
        >
          <!-- mouseover.stop is to fix a stupid ios bug relating to q-scroll-area having a mouseover event and causing the user to have to double click on items-->
          <div
            class="image-container flex justify-center items-center shadow-2xl q-mr-md"
            v-if="imgThumbUrl"
          >
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
          <div class="flex column grow" style="width: 100%; overflow: hidden">
            <div
              class="ed-card-header flex row justify-between items-start no-wrap ellipsis"
            >
              <div
                class="flex row items-baseline no-wrap metropolis bold q-mr-sm ellipsis"
                :class="{
                  'text-large q-mb-sm': $q.screen.gt.sm,
                  'q-mb-xs': $q.screen.lt.md,
                }"
              >
                <span class="ellipsis">{{ event?.name || name }}</span>
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
              class="flex column justify-center card-bottom-text o-070 q-mb-sm q-pr-md"
              style="font-weight: 400; width: 100%"
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
              <div class="flex column ellipsis" style="width: 100%">
                <span>
                  <q-icon name="las la-clock" class="q-mr-sm" />
                  <!--
                  <q-badge
                    v-if="event.cancelled"
                    class="q-my-xs"
                    color="red"
                    :label="$t('event_dates.cancelled')"
                  />
-->
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
                <div
                  class="flex row items-center no-wrap ellipsis"
                  style="width: 100%; text-transform: capitalize"
                >
                  <q-icon name="las la-calendar" class="q-mr-sm" />
                  <div class="flex row no-wrap ellipsis">
                    <span v-if="event.date_confirmed">
                      {{ localDateWithWeekday(event.start_naive, event.tz) }}
                    </span>
                    <span v-else>
                      {{ monthYear(event.start_naive, event.tz)
                      }}<span class="o-060"
                        >&nbsp;({{ $t('event_dates.tbc') }})</span
                      >
                    </span>
                  </div>
                </div>
                <div style="width: 100%" class="ellipsis">
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
              </div>
            </div>

            <div
              v-if="event.event && $q.screen.gt.sm"
              class="description grow flex ellipsis q-pr-md items-center"
              style="max-width: 100%"
            >
              {{ event.event.description_t || event.event.description }}
            </div>
            <!-- scroll area here (qscroll or regular) area causes performance issues on android-->
            <CustomQScroll
              v-if="!$q.platform.is.android || true"
              horizontal
              style="height: 39px; margin-bottom: -8px"
              :class="$q.screen.gt.sm ? 'q-mt-md' : 'q-mt-xs'"
              :thumb-style="{
                bottom: '-4px',
                height: '4px',
                borderRadius: '0px',
              }"
            >
              <div
                class="tag-container flex row no-wrap q-pr-md"
                v-if="event?.event?.event_tags?.length > 0"
              >
                <Tag
                  class="q-mr-xs o-060"
                  v-for="(et, index) in event.event.event_tags"
                  :key="index"
                  :value="et.tag_t || et.tag"
                  noInteraction
                  outlined
                  small
                ></Tag>
              </div>
            </CustomQScroll>
            <div v-else class="flex">
              <div
                class="tag-container flex row no-wrap"
                style="overflow-x: hidden"
                v-if="event?.event?.event_tags?.length > 0"
              >
                <Tag
                  class="q-mr-xs"
                  v-for="(et, index) in event.event.event_tags"
                  :key="index"
                  :value="et.tag_t || et.tag"
                  noInteraction
                  outlined
                ></Tag>
              </div>
            </div>
          </div>
        </div>
        <div class="q-px-md q-pb-sm q-mb-xs" v-if="event && $q.screen.lt.md">
          <div
            class="description grow flex ellipsis items-center"
            style="max-width: 100%"
          >
            {{ event.event.description_t || event.event.description }}
          </div>
        </div>
      </router-link>
    </transition>
    <div
      v-if="isPopup"
      style="
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 0;
      "
    >
      <div
        class="ed-card-content flex row no-wrap q-py-md q-pl-md"
        style="width: 100%"
      >
        <div
          class="image-container flex justify-center items-center shadow-2xl"
        >
          <img
            style="filter: blur(2px); transform: scale(1.2)"
            class="image not-loaded"
          />
        </div>
        <div
          class="flex column grow q-pl-md"
          style="width: 100%; overflow: hidden"
        >
          <div
            class="ed-card-header flex row justify-between items-start no-wrap ellipsis"
          >
            <div
              class="flex row items-baseline no-wrap metropolis bold q-mr-sm ellipsis"
              :class="{
                'text-large q-mb-sm': $q.screen.gt.sm,
                'q-mb-xs': $q.screen.lt.md,
              }"
            >
              <span class="ellipsis">{{ event?.name || name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
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
    getBottomBgImgStyle() {
      if (this.$q.dark.isActive) {
        return `background-image:  url("${this.imgThumbXsUrl}");
        background-size: cover;
        display: inline-block;
        `;
      } else {
        return `background-image:  url("${this.imgThumbXsUrl}");
          background-size: cover;
          display: inline-block;
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
    computedDateString() {
      if (this.event?.date_confirmed) {
        return this.localDateWithWeekday(this.event.start_naive, this.event.tz);
      } else if (this.event) {
        return this.monthYear(this.event.start_naive, this.event.tz);
      } else return '';
    },
    computedLocation() {
      return this.getGeneralLocationString(this.event.location);
    },
  },
  created() {
    // import common methods
    this.relativeHumanTime = common.relativeHumanTime;
    this.localDateWithWeekday = common.localDateWithWeekday;
    this.monthYear = common.monthYear;
    this.simplifiedRecurringPattern = common.simplifiedRecurringPattern;
    this.localDayOfMonth = localDayOfMonth;
    this.localDay = common.localDay;
    this.getGeneralLocationString = common.getGeneralLocationString;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .ed-card {
    // outline: 1px solid black;
    border-top: 1px solid rgba(64, 64, 64);
    background: linear-gradient($bi-2, $bi-3);

    .ed-card-bg {
      background: $bi-3;
      opacity: 0.2;
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
      color: $ti-1 !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
    }
  }
}

.body--light {
  .ed-card {
    color: white;
    border-top: 1px solid rgba(150, 150, 150);

    box-shadow: rgba(0, 0, 0, 0.12) 0px 3px 8px;
    font-smooth: always;
    //background: linear-gradient($bi-2, rgb(100, 100, 100));
    background: linear-gradient($bi-3, rgb(48, 48, 48));
    .card-background {
      //background: #181818;
      opacity: 0.8;
      transition: opacity 0.2s ease;
    }
    .ed-card-bg {
      opacity: 0.2;
      background: white;
      transition: opacity 0.2s ease;
    }
    .ed-card-content {
      border-top: 1px solid (rgba(255, 255, 255, 0.2));

      color: white !important;
      .image-container {
        background: $bi-3;
      }
    }

    .event-info {
    }
  }
}

.ed-card {
  //min-height: 238.5px;
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

    .tag-container {
      :deep(.tag) {
        font-size: small;
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
        min-width: 144px;
        height: 203px;
      }
    }
  }
}
</style>
