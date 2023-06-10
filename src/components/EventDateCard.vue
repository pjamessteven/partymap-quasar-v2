<template>
  <div>
    <router-link
      v-slot="{ navigate }"
      :custom="true"
      :to="{
        name: 'EventPage',
        params: {
          id: event.event_id,
          eventDateId: event.id,
        },
        query: {
          name: event.name.replace(/ /g, '_'),
        },
      }"
    >
      <transition appear enter-active-class="animated fadeIn">
        <div
          class="ed-card"
          @mousedown="() => onClickCard($event, navigate)"
          :class="{
            'animated-shimmer': false,
          }"
        >
          <!--
      <q-tooltip
        v-if="$q.screen.gt.xs"
        :content-class="
          $q.dark.isActive
            ? 'bg-black text-white'
            : 'bg-white text-black tooltip'
        "
        :offset="[-128, -56]"
        anchor="top right"
        self="top left"
        content-style="font-size: 14px"
        max-width="300px"
      >
        <div class="flex column">
          <div>
            {{ event.event.description }}
          </div>
          <div
            class="tag-container flex row q-gutter-xs q-mt-xs q-mb-sm"
            style="min-height: 31px"
            v-if="event.event.event_tags && event.event.event_tags.length > 0"
          >
            <Tag
              v-for="(et, index) in event.event.event_tags"
              :key="index"
              :value="et.tag"
            ></Tag>
          </div>
        </div>
      </q-tooltip>
  -->
          <!--
        <div class="card-top-content  flex column justify-end">
          <div class="card-background" :style="getBgImgStyle()" />

        </div>
  -->
          <div class="card-bottom-content flex column">
            <div
              class="card-bottom-background"
              :style="getBottomBgImgStyle()"
            />
            <div class="card-bottom-background-hover-overlay" />
            <!--:style="getBottomBgImgStyle()" /> -->
            <div
              class="card-bottom-foreground flex row no-wrap q-px-md q-py-md"
            >
              <div
                class="image-container flex justify-center items-center shadow-2xl"
              >
                <img
                  :src="imgThumbXsUrl"
                  class="image not-loaded"
                  v-show="!loadedImage"
                />
                <img
                  :src="imgThumbUrl"
                  class="image"
                  @load="() => (loadedImage = true)"
                  v-show="loadedImage"
                />
              </div>
              <div class="flex column ellipsis q-pl-md">
                <div
                  class="ed-card-header flex row justify-between items-start no-wrap ellipsis"
                >
                  <div
                    class="flex row items-baseline no-wrap inter bold q-mr-sm ellipsis"
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
                  class="flex column card-bottom-text q-mt-xs o-070"
                  style="font-weight: 400"
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
                  <span>
                    <q-icon name="las la-clock" class="q-mr-sm" />{{
                      relativeHumanTime(
                        event.start_naive,
                        event.end_naive,
                        event.tz
                      )
                    }}
                  </span>
                  <div class="flex row items-center no-wrap ellipsis">
                    <q-icon name="las la-calendar" class="q-mr-sm" />
                    <div
                      v-if="!event.cancelled"
                      class="flex row no-wrap ellipsis"
                    >
                      <span>
                        {{
                          localDateWithWeekday(event.start_naive, event.tz)
                        }} </span
                      ><!--
              <span v-else>
                {{ localDay(event.start_naive, event.tz) }}
                {{ localDayOfMonth(event.start_naive, event.tz) }}</span
              >-->
                      <span
                        v-if="
                          event.event.rrule &&
                          event.event.rrule.separation_count > 0
                        "
                        class="flex row items-center q-ml-xs o-070 no-wrap ellipsis"
                      >
                        <q-icon
                          class="q-ml-xs q-mr-sm"
                          name="las la-redo-alt"
                        />
                        {{ simplifiedRecurringPattern(event.event.rrule) }}
                      </span>
                    </div>
                    <q-badge
                      class="q-my-xs inter bold"
                      color="red"
                      :label="$t('event_date_inline.cancelled')"
                      v-if="event.cancelled"
                    />
                  </div>
                  <div class="">
                    <span v-if="event.location && event.location.locality">
                      <q-icon name="las la-map-marker" class="q-mr-sm" />{{
                        event.location.locality.long_name
                      }},
                      {{ event.location.locality.region.long_name }}
                    </span>
                    <span v-else>
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

                  <div
                    class="tag-container flex row q-mt-sm no-wrap ellipsis"
                    style="min-height: 31px"
                    v-if="
                      event.event.event_tags &&
                      event.event.event_tags.length > 0
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
          </div>
        </div>
      </transition>
    </router-link>
  </div>
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
    setFocusMarker() {
      if (this.$q.screen.gt.xs)
        this.eventDateHoverMarker = {
          lat: this.event.location.lat,
          lng: this.event.location.lng,
          name: this.event.name,
        };
    },
    getBottomBgImgStyle() {
      if (this.$q.dark.isActive) {
        return `background-image:  url("${this.imgThumbXsUrl}");
        background-size: cover;
        display: inline-block;
        background-position: center;
        //filter: blur(1px);

        `;
      } else {
        return `background-image:  url("${this.imgThumbXsUrl}");
          background-size: cover;
          display: inline-block;
          background-position: center;
          //filter: blur(1px);

          `;
      }
    },

    onClickCard(event, navigate) {
      // blocking map updates on focusMarker watcher in MainMap.vue
      this.focusMarker = {
        lat: this.event.location.lat,
        lng: this.event.location.lng,
      };

      navigate(event);
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
    border: none !important;
    background: $bi-1;
    //blue background-color: #0b0e13;
    .card-top-content {
    }
    .card-bottom-content {
      border-top: 1px solid (rgba(255, 255, 255, 0.2));
      border-left: 1px solid rgba(255, 255, 255, 0.1);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      .card-bottom-background {
        background: $bi-3;
        opacity: 0.4;
      }
      .card-bottom-background-hover-overlay {
        background: rgba(255, 255, 255, 0.1);
      }
      .card-bottom-foreground {
        background: linear-gradient(
          rgba(36, 36, 36, 0.3),
          rgba(36, 36, 36, 0.5)
        );
      }
    }
    .card-background {
      //border: 1px solid #181818;

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
    background: black;
    color: white;
    //border: 1px solid gray;
    /*
    box-shadow: rgba(0, 0, 0, 0.05) 0px 2px 1px, rgba(0, 0, 0, 0.05) 0px 4px 2px,
      rgba(0, 0, 0, 0.05) 0px 8px 4px, rgba(0, 0, 0, 0.05) 0px 16px 8px,
      rgba(0, 0, 0, 0.05) 0px 32px 16px;
*/
    box-shadow: rgba(0, 0, 0, 0.12) 0px 3px 8px;
    font-smooth: always;
    //box-shadow: 0 4px 10px rgba(220, 220, 220, 0.5) !important;

    .card-background {
      //background: #181818;
      opacity: 0.8;
      transition: opacity 0.2s ease;
    }
    .card-top-content {
    }
    .card-bottom-content {
      border-top: 1px solid (rgba(255, 255, 255, 0.2));

      color: white !important;
      background: linear-gradient(
        0deg,
        rgba(255, 255, 255, 0.8) 0%,
        rgba(255, 255, 255, 1) 80%
      );

      .card-bottom-background {
        opacity: 0.68;
        z-index: 0;
        background: white;
        transition: opacity 0.2s ease;
        //opacity: 1;
      }
      .card-bottom-background-hover-overlay {
        background: rgba(255, 255, 255, 0.1);
      }
      .card-bottom-foreground {
        background: linear-gradient(rgba(0, 0, 0, 0.28), rgba(0, 0, 0, 0.3));
        z-index: 1;

        .card-bottom-text {
          // opacity: 0.68 !important;
        }
      }
    }
    &:first-child {
      margin-top: 0px;
      //border: 1px solid rgba(0,0,0,0);
    }

    .event-info {
    }
  }
}

.ed-card {
  border-radius: 9px;
  direction: ltr;
  display: flex;
  flex-direction: column;
  //min-height: 186px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  -webkit-backface-visibility: hidden;
  -webkit-transform: translate3d(0, 0, 0);

  &:hover {
    transform: scale(1.01) translateY(0px);

    .card-bottom-content {
      .card-bottom-background-hover-overlay {
        opacity: 1;
      }
    }
  }

  &:active {
    //  transform: scale(0.98);
  }
  position: relative;

  .card-top-content {
    position: relative;
    height: 140px;

    .card-background {
      border: none;
      overflow: hidden;
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: 2;
      // transform: scale(1.5);
    }
  }
  .card-bottom-content {
    position: relative;
    //color: white;
    //background: black;

    .card-bottom-background {
      border-radius: 9px;
      overflow: hidden;
      //border: 1px solid #181818;
      z-index: 0;
      filter: blur(12px);
      transform: rotate(180deg) scaleX(-1) scale(2);
      //mask-image: linear-gradient(to top, transparent 0%, white 64px);
      position: absolute;
      height: 100%;
      width: 100%;
      //opacity: 0.4;
      transition: opacity 0.2s ease;
    }
    .card-bottom-background-hover-overlay {
      z-index: 1;
      position: absolute;
      height: 100%;
      width: 100%;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .card-bottom-foreground {
      border-radius: 9px;
      overflow: hidden;
      z-index: 1;
      width: 100%;
      .tag-container {
        :deep(.tag) {
          background: transparent !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
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
        width: 86px;
        aspect-ratio: 595 / 842;
        min-width: 86px;
        border-radius: 9px;
        .image {
          height: 100%;
          width: 100%;
          max-height: 100%;
          max-width: 100%;
          object-fit: cover;
          z-index: 2;
        }
      }
    }
  }

  .event-info {
    z-index: 1;
    .tag-container {
      display: flex;
      flex-direction: row;
      width: 100%;
      overflow: hidden;
    }
  }
}

.body--light {
  .animated-shimmer {
    box-shadow: none;
    background: linear-gradient(
      315deg,
      transparent,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    background-size: 400% 400%;
    border-color: rgba(255, 255, 255, 0.1);
    -webkit-animation: shimmer 2s ease-in-out infinite;
    -moz-animation: shimmer 2s ease-in-out infinite;
    animation: shimmer 2s ease-in-out infinite;
    .card-content {
      opacity: 0;
    }
  }
}
.body--dark {
  .animated-shimmer {
    background: linear-gradient(315deg, $bi-1, transparent 50%, $bi-1 100%);
    background-size: 400% 400%;

    -webkit-animation: shimmer 1.5s ease infinite;
    -moz-animation: shimmer 1.5s ease infinite;
    animation: shimmer 1.5s ease infinite;
    .card-content {
      opacity: 0;
    }
  }
}

@-webkit-keyframes shimmer {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 51%;
  }
  100% {
    background-position: 0% 50%;
  }
}
@-moz-keyframes shimmer {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 51%;
  }
  100% {
    background-position: 0% 50%;
  }
}
@keyframes shimmer {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 51%;
  }
  100% {
    background-position: 0% 50%;
  }
}

// sm
@media only screen and (max-width: 600px) {
  .ed-card {
    &:active,
    &:hover {
      transform: none;
    }
  }
}
</style>
