<template>
  <div
    class="flex column no-wrap calendar editing-outline"
    :class="[
      inline ? 'inline' : '',
      editing || showMoreFields ? 'editing q-px-md' : '',
    ]"
    @click="editing || showMoreFields ? (showEditDialog = true) : expand()"
  >
    <div
      class="flex row no-wrap grow items-center justify-between"
      v-if="inline && selectedEventDate != null"
    >
      <div class="flex row items-start no-wrap">
        <q-icon
          class="t2"
          name="las la-clock"
          :size="$q.screen.gt.sm ? '2em' : '1.5rem'"
        />

        <div
          class="flex column q-ml-md"
          :class="$q.screen.gt.sm ? 'text-large' : ''"
          v-if="selectedEventDate?.date_confirmed"
        >
          <div class="t2" v-if="selectedEventDate.start_naive">
            <span class="inter" v-if="hasOccured">Happened on:&nbsp;</span>

            <span v-if="$q.screen.gt.xs">
              {{
                localDateTimeLong(
                  selectedEventDate.start_naive,
                  selectedEventDate.tz
                )
              }}
            </span>
            <span v-else>
              {{
                localDateTimeShort(
                  selectedEventDate.start_naive,
                  selectedEventDate.tz
                )
              }}
            </span>

            <span class="t4">
              [{{
                timeZoneAbbreviention(
                  selectedEventDate.start_naive,
                  selectedEventDate.tz
                )
              }}]
            </span>
          </div>
          <div
            v-if="
              selectedEventDate.end &&
              selectedEventDate.end != selectedEventDate.start
            "
            class="t4"
            :class="$q.screen.gt.sm ? 'text-large' : ''"
          >
            <span>{{ $t('event_date_inline.ends') }}&nbsp;</span>
            <span v-if="$q.screen.gt.xs">{{
              localDateTimeLong(
                selectedEventDate.end_naive,
                selectedEventDate.tz
              )
            }}</span>
            <span v-else
              >{{
                localDateTimeShort(
                  selectedEventDate.end_naive,
                  selectedEventDate.tz
                )
              }}
            </span>
          </div>
        </div>
        <div
          class="flex column q-ml-md"
          :class="$q.screen.gt.sm ? 'text-large' : ''"
          v-else-if="!hasOccured"
        >
          <div class="t2">
            <div>
              Usually happens in&nbsp;{{
                month(selectedEventDate.start_naive, selectedEventDate.tz)
              }}
            </div>
            <div class="q-mt-xs">
              <span
                class="t4 link-hover underline"
                @click.stop="showEditDialog = true"
                >Confirm date</span
              >&nbsp;or&nbsp;<span
                class="t4 link-hover underline"
                @click.stop="showMarkCancelledDialog = true"
                >mark as cancelled
              </span>
            </div>
          </div>
        </div>
        <div
          class="flex column q-ml-md"
          :class="$q.screen.gt.sm ? 'text-large' : ''"
          v-else
        >
          <div class="t2">
            <span>
              Happened in&nbsp;{{
                monthYear(selectedEventDate.start_naive, selectedEventDate.tz)
              }}
            </span>
          </div>
        </div>
      </div>
      <q-icon
        size="2em"
        class="t3 q-ml-md"
        name="mdi-chevron-down"
        v-if="expandable && !expanded"
      />
      <q-icon
        size="2em"
        class="t3 q-ml-md"
        name="mdi-chevron-up"
        v-else-if="expandable && expanded"
      />
    </div>
    <Calendar
      @click.stop
      v-if="
        selectedEventDate != null &&
        (!inline || (inline && expanded && expandable))
      "
      :class="[inline ? 'q-mt-md' : '']"
      ref="calendar"
      title-position="left"
      :is-dark="$q.dark.isActive ? true : false"
      keepVisibleOnInput
      :is-inline="true"
      is-expanded
      @dayclick="dayClick($event)"
      :available-dates="calendarAvailableDates"
      :attributes="computedCalendarAttributes"
    />
    <q-dialog
      v-model="showEditDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <EditEventDateDialog :ed="selectedEventDate" mode="date" />
    </q-dialog>
    <q-dialog
      v-model="showMarkCancelledDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <EventDateMarkCancelledDialog v-if="showMarkCancelledDialog" />
    </q-dialog>
  </div>
</template>

<script>
import { Calendar } from 'v-calendar';
import common from 'assets/common';
import * as dayjs from 'dayjs';

import EditEventDateDialog from './EditEventDateDialog.vue';
import EventDateMarkCancelledDialog from './EventDateMarkCancelledDialog.vue';
import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';

export default {
  name: 'EventDateTimeComponent',
  components: {
    EditEventDateDialog,
    Calendar,
    EventDateMarkCancelledDialog,
  },
  watch: {
    calendarSelectedEventDateRange: {
      handler: function (newval) {
        // move to currently selected date
        if (newval != null && newval.start) {
          setTimeout(() => {
            if (this.selectedEventDate) {
              const calendar = this.$refs.calendar;
              if (calendar) {
                this.moveToDate(
                  dayjs
                    .utc(this.selectedEventDate.start_naive)
                    .subtract(this.local.utcOffset(), 'm')
                    .toDate()
                );
              }
            }
          }, 300);
        }
      },
    },
  },
  data() {
    return {
      expanded: false,
      showEditDialog: false,
      local: dayjs(),
      showMarkCancelledDialog: false,
    };
  },
  props: {
    editing: Boolean,
    inline: Boolean, // desktop and mobile (only show text, no calendar)
    expandable: Boolean, // mobile only
    showMoreFields: Boolean,
  },
  methods: {
    expand() {
      this.expanded = !this.expanded;
      this.delayedMoveToCurrentDate();
    },
    dayClick(day) {
      this.selectedEventDateIndex = this.event.event_dates.findIndex(
        (x) => x.id === day.attributes[0].customData.id
      );
      // eslint-disable-next-line
      this.selectedEventDate =
        this.event.event_dates[this.selectedEventDateIndex];
    },
    delayedMoveToCurrentDate() {
      setTimeout(() => {
        if (this.selectedEventDate) {
          const calendar = this.$refs.calendar;
          if (calendar) {
            calendar.move(
              dayjs
                .utc(this.selectedEventDate.start_naive)
                .subtract(this.local.utcOffset(), 'm')
                .toDate()
            );
          }
        }
      }, 300);
    },
    moveToDate(date) {
      const calendar = this.$refs.calendar;
      calendar.move(date);
    },
  },
  computed: {
    ...mapState(useEventStore, [
      'event',
      'selectedEventDate',
      'selectedEventDateIndex',
    ]),
    hasOccured() {
      return this.isInPast(
        this.selectedEventDate?.start_naive,
        this.selectedEventDate.tz
      );
    },
    calendarSelectedEventDateRange() {
      // THIS ASSUMES THAT THE INPUT IS A NAIVE DATETIME STRING
      // LIKE 2021-12-23 11:00:00 OR 2021-12-26T14:00:00Z
      // we need to 'convert' it to local time
      if (this.selectedEventDate && this.selectedEventDate.start_naive) {
        var range = {
          start: dayjs
            .utc(this.selectedEventDate.start_naive)
            .subtract(this.local.utcOffset(), 'm')
            .toDate(),
          end: dayjs
            .utc(this.selectedEventDate.end_naive)
            .subtract(this.local.utcOffset(), 'm')
            .toDate(),
        };
        return range;
      } else {
        return { start: null, end: null };
      }
    },
    calendarAvailableDates() {
      // THIS ASSUMES THAT THE INPUT IS A NAIVE DATETIME STRING
      // LIKE 2021-12-23 11:00:00 OR 2021-12-26T14:00:00Z
      // we need to 'convert' it to local time
      if (this.event && this.event.event_dates) {
        return this.event.event_dates.map((x) => {
          return {
            start: dayjs
              .utc(x.start_naive)
              .subtract(this.local.utcOffset(), 'm')
              .toDate(),
            end: dayjs
              .utc(x.end_naive)
              .subtract(this.local.utcOffset(), 'm')
              .toDate(),
          };
        });
      } else {
        return [];
      }
    },
    computedCalendarAttributes() {
      var attrs = [];

      var mappedAvailableDates = this.event.event_dates.map((x) => {
        return {
          start: dayjs
            .utc(x.start_naive)
            .subtract(this.local.utcOffset(), 'm')
            .toDate(),
          end: dayjs
            .utc(x.end_naive)
            .subtract(this.local.utcOffset(), 'm')
            .toDate(),
          id: x.id,
        };
      });
      for (var dateRange of mappedAvailableDates) {
        attrs.push({
          highlight: {
            start: {
              fillMode: 'light',
              class: 'highlight-background-inactive',
              contentClass: 'highlight-end-inactive',
            },
            base: {
              fillMode: 'light',
              class: 'highlight-background-inactive',

              contentClass: 'highlight-base-inactive',
            },
            end: {
              fillMode: 'light',
              class: 'highlight-background-inactive',
              contentClass: 'highlight-end-inactive',
            },
          },
          customData: dateRange,
          dates: dateRange,
        });
      }
      if (
        this.calendarSelectedEventDateRange &&
        this.calendarSelectedEventDateRange.start
      ) {
        attrs.push({
          highlight: {
            order: 1,
            start: {
              fillMode: 'outline',
              contentClass: 'highlight-end-active',
              class: 'highlight-background-active',
            },
            base: {
              fillMode: 'solid',
              contentClass: 'highlight-base-active',
              class: 'highlight-background-active',
            },
            end: {
              fillMode: 'outline',
              contentClass: 'highlight-end-active',
              class: 'highlight-background-active',
            },
          },
          customData: this.selectedEventDate,
          dates: this.calendarSelectedEventDateRange,
        });
      }

      return attrs;
    },
  },
  mounted() {
    this.delayedMoveToCurrentDate();
  },
  created() {
    this.relativeHumanTime = common.relativeHumanTime;
    this.localDateTimeLong = common.localDateTimeLong;
    this.localDateTimeShort = common.localDateTimeShort;
    this.localDateLong = common.localDateLong;
    this.localDate = common.localDate;
    this.monthYear = common.monthYear;
    this.localTimeCompact = common.localTimeCompact;
    this.timeZoneAbbreviention = common.timeZoneAbbreviention;
    this.month = common.month;
    this.recurringPattern = common.recurringPattern;
    this.isInPast = common.isInPast;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .calendar {
    :deep(.vc-container) {
      .highlight-base-active {
        color: black !important;
      }
      .highlight-end-active {
        color: black !important;
        background: $primary;
      }
      .highlight-background-active {
        background: $secondary !important;
      }
      .highlight-background-inactive {
        background-color: $bi-4 !important;
      }
      .highlight-base-inactive {
        color: $ti-3 !important;
      }
      .highlight-end-inactive {
        color: $ti-3 !important;
        background: $bi-4;
      }
    }
  }
}
.body--light {
  .calendar {
    :deep(.vc-container) {
      .highlight-base-active {
        color: white !important;
      }
      .highlight-end-active {
        color: white !important;
        background: $primary;
      }
      .highlight-background-active {
        background: $secondary !important;
      }
      .highlight-background-inactive {
        background-color: $b-3 !important;
      }
      .highlight-base-inactive {
        color: $t-3 !important;
      }
      .highlight-end-inactive {
        color: $t-3 !important;
        background: $b-3;
      }
    }
  }
}
.calendar {
  :deep(.vc-container) {
    min-height: 280px;
    min-width: 280px;
    border-right: none;
    border-left: none;
    border-bottom: none;
    border-radius: 0px;
    border: none;
    box-shadow: 0 0.5em 1em -0.125em rgba(0, 0, 0, 0.1),
      0 0px 0 1px rgba(0, 0, 0, 0.02);
  }
}

.inline {
  border: none;
  .vc-container {
    box-shadow: 0 0.5em 1em -0.125em rgba(0, 0, 0, 0.1),
      0 0px 0 1px rgba(0, 0, 0, 0.02);
  }
}
</style>
