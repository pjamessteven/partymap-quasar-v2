<template>
  <MenuWrapper :showing="showing" @hide="onHide()">
    <div class="calendar-header flex row no-wrap items-start" style="">
      <q-list
        dense
        style="min-width: 100px"
        v-if="$q.screen.gt.xs"
        class="desktop-shortcuts"
      >
        <q-item-label header class="q-pb-md">{{
          $t('top_controls.shortcuts')
        }}</q-item-label>
        <q-separator class="q-mb-sm" />

        <q-item
          clickable
          v-close-popup
          v-for="option in menuOptions"
          :key="option.value"
          @click="controlDateRange = option"
        >
          <q-item-section>{{ option.label }}</q-item-section>
        </q-item>
        <q-item
          style="white-space: nowrap"
          v-for="option in monthOptionsOrderedFromNow.slice(0, 2)"
          :key="option.value"
          clickable
          v-close-popup
          @click="controlDateRange = option"
        >
          <q-item-section>{{ option.label }}</q-item-section>
        </q-item>
        <q-item clickable v-if="$q.screen.gt.xs">
          <q-item-section>{{ $t('top_controls.more_months') }}</q-item-section>

          <q-item-section side>
            <q-icon name="keyboard_arrow_right" />
          </q-item-section>

          <q-menu
            :anchor="$q.screen.gt.xs ? 'top right' : 'top middle'"
            :self="$q.screen.gt.xs ? 'top left' : 'top left'"
          >
            <q-list class="q-pr-md" dense>
              <q-item
                style="white-space: nowrap"
                v-for="option in monthOptionsOrderedFromNow.slice(2)"
                :key="option.value"
                clickable
                v-close-popup
                @click="controlDateRange = option"
              >
                <q-item-section>{{ option.label }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
      </q-list>
      <q-list
        padding
        style="min-width: 100px"
        class="grow"
        v-if="$q.screen.lt.sm"
      >
        <q-item-label header class="q-pb-sm">{{
          $t('top_controls.shortcuts')
        }}</q-item-label>
        <q-item
          dense
          clickable
          v-close-popup
          v-for="option in menuOptions"
          :key="option.value"
          @click="controlDateRange = option"
        >
          <q-item-section>{{ option.label }}</q-item-section>
        </q-item>
      </q-list>
      <q-list
        dense
        padding
        style="min-width: 100px"
        class="grow"
        v-if="$q.screen.lt.sm"
      >
        <q-item-label header class="q-pb-sm">&nbsp;</q-item-label>

        <q-item
          style="white-space: nowrap"
          v-for="option in monthOptionsOrderedFromNow.slice(0, 3)"
          :key="option.value"
          clickable
          v-close-popup
          @click="controlDateRange = option"
        >
          <q-item-section>{{ option.label }}</q-item-section>
        </q-item>
        <q-item clickable>
          <q-item-section>{{ $t('top_controls.more_months') }}</q-item-section>

          <q-item-section side>
            <q-icon name="keyboard_arrow_right" />
          </q-item-section>

          <q-menu
            transition-show="jump-down"
            transition-hide="jump-up"
            :anchor="$q.screen.gt.xs ? 'top right' : 'top middle'"
            :self="$q.screen.gt.xs ? 'top left' : 'top left'"
          >
            <q-list class="q-pr-md" dense>
              <q-item
                style="white-space: nowrap"
                v-for="option in monthOptionsOrderedFromNow.slice(3)"
                :key="option.value"
                clickable
                v-close-popup
                @click="controlDateRange = option"
              >
                <q-item-section>{{ option.label }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
      </q-list>
      <div
        class="flex column date-picker-container"
        :class="$q.screen.lt.sm ? ' q-pb-xl' : ''"
      >
        <q-item-label
          header
          class="q-pb-md t1 inter bold"
          style="text-align: center"
          >{{ title }}</q-item-label
        >
        <q-separator />
        <DatePicker
          borderless
          expanded
          title-position="center"
          @update:model-value="onSelectedCustomDateRange"
          class="date-picker flex"
          is-inline="true"
          v-model="controlDateRange"
          :model-config="modelConfig"
          is-range
          color="gray"
          :columns="$q.screen.gt.xs ? 2 : 1"
          :is-dark="$q.dark.isActive"
          @dayclick="dayclick"
        />
      </div>
    </div>
  </MenuWrapper>
</template>

<script>
import 'v-calendar/dist/style.css';

import * as dayjs from 'dayjs';
import { mapWritableState } from 'pinia';
import { useQueryStore } from 'src/stores/query';
import { DatePicker } from 'v-calendar';
import MenuWrapper from './MenuWrapper.vue';

export default {
  components: {
    DatePicker,
    MenuWrapper,
  },
  props: {
    showing: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      title: this.$t('top_controls.select_date_range'),
      customDateRange: null,
      modelConfig: {
        type: 'string',
        mask: undefined, // Uses 'iso' if missing
      },
      menuOptions: [
        /*
        {
          label: this.$t('top_controls.all'),
          value: null
        }, */
        {
          label: this.$t('top_controls.today'),
          value: 'today',
        },
        {
          label: this.$t('top_controls.week'),
          value: 'week',
        },
        {
          label: this.$t('top_controls.weekend'),
          value: 'weekend',
        },
        {
          label: this.$t('top_controls.next_weekend'),
          value: 'next_weekend',
        },
      ],
      months: [
        'jan',
        'feb',
        'mar',
        'apr',
        'may',
        'jun',
        'jul',
        'aug',
        'sep',
        'oct',
        'nov',
        'dec',
      ],
    };
  },
  watch: {
    controlDateRange(newVal) {
      /* eslint-disable */

      switch (newVal.value) {
        case null: // all future dates
          this.controlDateRange = {
            start: dayjs()
              .set('hour', 0)
              .set('minute', 0)
              .set('second', 0)
              .toISOString(),
            end: null,
          };
          break;
        case 'today':
          this.controlDateRange = {
            start: dayjs()
              .set('hour', 0)
              .set('minute', 0)
              .set('second', 0)
              .set('millisecond', 0)
              .toISOString(),
            end: dayjs()
              .set('hour', 0)
              .set('minute', 0)
              .set('second', 0)
              .set('millisecond', 0)
              .add(23, 'hours')
              .add(59, 'minutes')
              .toISOString(),
          };

          break;
        case 'weekend':
          this.controlDateRange = this.getThisWeekendDateRange();
          break;
        case 'next_weekend':
          this.controlDateRange = this.getNextWeekendDateRange();
          break;
        case 'week':
          this.controlDateRange = {
            start: dayjs()
              .set('hour', 0)
              .set('minute', 0)
              .set('second', 0)
              .toISOString(),
            end: dayjs()
              .set('hour', 0)
              .set('minute', 0)
              .set('second', 0)
              .add(7, 'days')
              .toISOString(),
          };
          break;
        case 'month':
          this.controlDateRange = {
            start: dayjs()
              .set('hour', 0)
              .set('minute', 0)
              .set('second', 0)
              .toISOString(),
            end: dayjs()
              .set('hour', 0)
              .set('minute', 0)
              .set('second', 0)
              .add(1, 'month')
              .toISOString(),
          };

          break;
        case 'jan':
          var year = dayjs().year();
          if (dayjs().month() > 0) {
            // if jan has passed then it should be next jan
            year += 1;
          }
          var start = dayjs()
            .set('hour', 0)
            .set('minute', 0)
            .set('second', 0)
            .set('date', 1)
            .set('month', 0)
            .set('year', year);
          this.controlDateRange = {
            start: start.toISOString(),
            end: start.add(1, 'month').toISOString(),
          };
          break;
        case 'feb':
          var year = dayjs().year();
          if (dayjs().month() > 1) {
            // if jan has passed then it should be next jan
            year += 1;
          }
          var start = dayjs()
            .set('hour', 0)
            .set('minute', 0)
            .set('second', 0)
            .set('date', 1)
            .set('month', 1)
            .set('year', year);
          this.controlDateRange = {
            start: start.toISOString(),
            end: start.add(1, 'month').toISOString(),
          };
          break;
        case 'mar':
          var year = dayjs().year();
          if (dayjs().month() > 2) {
            // if jan has passed then it should be next jan
            year += 1;
          }
          var start = dayjs()
            .set('hour', 0)
            .set('minute', 0)
            .set('second', 0)
            .set('date', 1)
            .set('month', 2)
            .set('year', year);
          this.controlDateRange = {
            start: start.toISOString(),
            end: start.add(1, 'month').toISOString(),
          };
          break;
        case 'apr':
          var year = dayjs().year();
          if (dayjs().month() > 3) {
            // if jan has passed then it should be next jan
            year += 1;
          }
          var start = dayjs()
            .set('hour', 0)
            .set('minute', 0)
            .set('second', 0)
            .set('date', 1)
            .set('month', 3)
            .set('year', year);
          this.controlDateRange = {
            start: start.toISOString(),
            end: start.add(1, 'month').toISOString(),
          };
          break;
        case 'may':
          var year = dayjs().year();
          if (dayjs().month() > 4) {
            // if jan has passed then it should be next jan
            year += 1;
          }
          var start = dayjs()
            .set('hour', 0)
            .set('minute', 0)
            .set('second', 0)
            .set('date', 1)
            .set('month', 4)
            .set('year', year);
          this.controlDateRange = {
            start: start.toISOString(),
            end: start.add(1, 'month').toISOString(),
          };
          break;
        case 'jun':
          var year = dayjs().year();
          if (dayjs().month() > 5) {
            // if jan has passed then it should be next jan
            year += 1;
          }
          var start = dayjs()
            .set('hour', 0)
            .set('minute', 0)
            .set('second', 0)
            .set('date', 1)
            .set('month', 5)
            .set('year', year);
          this.controlDateRange = {
            start: start.toISOString(),
            end: start.add(1, 'month').toISOString(),
          };
          break;
        case 'jul':
          var year = dayjs().year();
          if (dayjs().month() > 6) {
            // if jan has passed then it should be next jan
            year += 1;
          }
          var start = dayjs()
            .set('hour', 0)
            .set('minute', 0)
            .set('second', 0)
            .set('date', 1)
            .set('month', 6)
            .set('year', year);
          this.controlDateRange = {
            start: start.toISOString(),
            end: start.add(1, 'month').toISOString(),
          };
          break;
        case 'aug':
          var year = dayjs().year();
          if (dayjs().month() > 7) {
            // if jan has passed then it should be next jan
            year += 1;
          }
          var start = dayjs()
            .set('minute', 0)
            .set('second', 0)
            .set('date', 1)
            .set('month', 7)
            .set('year', year);
          this.controlDateRange = {
            start: start.toISOString(),
            end: start.add(1, 'month').toISOString(),
          };
          break;
        case 'sep':
          var year = dayjs().year();
          if (dayjs().month() > 8) {
            // if jan has passed then it should be next jan
            year += 1;
          }
          var start = dayjs()
            .set('minute', 0)
            .set('second', 0)
            .set('date', 1)
            .set('month', 8)
            .set('year', year);
          this.controlDateRange = {
            start: start.toISOString(),
            end: start.add(1, 'month').toISOString(),
          };
          break;
        case 'oct':
          var year = dayjs().year();
          if (dayjs().month() > 9) {
            // if jan has passed then it should be next jan
            year += 1;
          }
          var start = dayjs()
            .set('minute', 0)
            .set('second', 0)
            .set('date', 1)
            .set('month', 9)
            .set('year', year);
          this.controlDateRange = {
            start: start.toISOString(),
            end: start.add(1, 'month').toISOString(),
          };
          break;
        case 'nov':
          var year = dayjs().year();
          if (dayjs().month() > 10) {
            // if jan has passed then it should be next jan
            year += 1;
          }
          var start = dayjs()
            .set('minute', 0)
            .set('second', 0)
            .set('date', 1)
            .set('month', 10)
            .set('year', year);
          this.controlDateRange = {
            start: start.toISOString(),
            end: start.add(1, 'month').toISOString(),
          };
          break;
        case 'dec':
          // december never passes
          var year = dayjs().year();
          var start = dayjs()
            .set('minute', 0)
            .set('second', 0)
            .set('date', 1)
            .set('month', 11)
            .set('year', year);
          this.controlDateRange = {
            start: start.toISOString(),
            end: start.add(1, 'month').toISOString(),
          };
          break;
        case 'custom':
          // triggered by watcher on customDateRange
          break;
        /* eslint-enable */
      }
    },
  },
  methods: {
    dayclick() {
      if (this.title === this.$t('top_controls.select_date_range')) {
        this.title = this.$t('top_controls.select_end_date');
      } else {
        this.title = this.$t('top_controls.select_date_range');
      }
    },
    clearDateRange() {
      this.controlDateRange = { start: dayjs().toISOString() };
      this.controlDateRangeSelectedOption = null;
    },
    onHide() {
      this.$emit('hide');
    },
    onSelectedCustomDateRange(value) {
      // set button label
      let label = this.$t('top_controls.custom');

      //const startDate = dayjs(value.start).format('Do MMM YYYY');
      //const endDate = dayjs(value.end).format('Do MMM YYYY');
      const startDate = dayjs(value.start).format('DD/MM/YYYY');
      const endDate = dayjs(value.end).format('DD/MM/YYYY');
      if (startDate === endDate) {
        label = startDate;
      } else {
        label = startDate + ' - ' + endDate;
      }

      this.controlDateRangeSelectedOption = {
        label: label,
        value: 'custom',
      };
      this.$emit('hide');
    },
    getThisWeekendDateRange() {
      const weekendStart = 5; // friday
      const weekendEnd = 7; // sunday
      const today = dayjs().weekday();
      var startTime;
      var endTime;
      // get start time
      if (today <= weekendStart) {
        // if it's not friday yet, return this friday
        startTime = dayjs().weekday(weekendStart);
      } else if (today >= weekendStart && today <= weekendEnd) {
        // it's past friday, but already or before Sunday
        // so return current time
        startTime = dayjs();
      } else {
        // return next friday (not going to happen - for completeness)
        startTime = dayjs().add(1, 'weeks').weekday(weekendStart);
      }
      // return this sunday
      endTime = dayjs()
        .set('hour', 0)
        .set('minute', 0)
        .set('second', 0)
        .set('millisecond', 0)
        .weekday(weekendEnd)
        .add(23, 'hours')
        .add(59, 'minutes');
      return { start: startTime.toISOString(), end: endTime.toISOString() };
    },
    getNextWeekendDateRange() {
      const weekendStart = 5; // friday
      const weekendEnd = 7; // sunday
      var startTime;
      var endTime;
      // get start time
      // if it's not friday yet, return this friday
      startTime = dayjs()
        .set('hour', 0)
        .set('minute', 0)
        .set('second', 0)
        .set('millisecond', 0)
        .weekday(weekendStart)
        .add(1, 'weeks');

      // get end time
      // return this sunday
      endTime = dayjs()
        .set('hour', 0)
        .set('minute', 0)
        .set('second', 0)
        .set('millisecond', 0)
        .weekday(weekendEnd)
        .add(23, 'hours')
        .add(59, 'minutes')
        .add(1, 'weeks');
      return { start: startTime.toISOString(), end: endTime.toISOString() };
    },
  },
  computed: {
    ...mapWritableState(useQueryStore, [
      'controlDateRange',
      'controlDateRangeSelectedOption',
    ]),
    monthOptionsOrderedFromNow() {
      var currentMonth = dayjs().month();
      var currentYear = dayjs().year();
      var months = [];
      for (var i = 0; i < 12; i++) {
        if (currentMonth === 11) {
          // edge case
          // reset month to 0 and increase year
          months.push({
            value: this.months[currentMonth],
            label:
              this.$t(`months.${this.months[currentMonth]}`) +
              ' ' +
              currentYear,
          });
          currentMonth = 0;
          currentYear += 1;
        } else {
          months.push({
            value: this.months[currentMonth],
            label:
              this.$t(`months.${this.months[currentMonth]}`) +
              ' ' +
              currentYear,
          });
          currentMonth += 1;
        }
      }
      return months;
    },
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .date-picker-container {
    background: $bi-3;
  }
  .desktop-shortcuts {
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }
  .calendar-header {
    .date-picker {
      border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
    }
  }
}
.body--light {
  .date-picker-container {
    background: #fafafa;
  }
  .desktop-shortcuts {
    border-right: 1px solid rgba(0, 0, 0, 0.1);
  }
  .calendar-header {
    .date-picker {
      border-top: 1px solid rgba(0, 0, 0, 0.1) !important;
    }
  }
}

.button-control {
}
.date-picker {
  border-radius: 0px !important;
  border: none !important;

  .vc-container {
    border: none !important;
  }
}
.calendar-header {
  min-width: 655px;
  width: 648px;
  overflow: hidden;
  border-radius: 9px;

  .date-picker-container {
    .date-picker {
      height: 274px;
      flex-grow: 1;
      border-radius: 18px;
    }
  }
}

@media only screen and (max-width: 599px) {
  .body--dark {
    .date-picker-container {
      border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
    }
  }
  .body--light {
    .date-picker-container {
      border-top: 1px solid rgba(0, 0, 0, 0.1) !important;
    }
  }

  .calendar-header {
    max-width: 100%;
    min-width: unset;
    justify-content: start;
    flex-wrap: wrap;
    .date-picker-container {
      width: 100%;
      .date-picker {
        height: 296px;
        border-radius: 0px !important;
        border-top-right-radius: 0px !important;
        border-top-left-radius: 0px !important;
        width: 100%;
        padding: 16px 16px;
        :deep(.vc-container) {
          font-size: larger !important;
        }
      }
    }
  }
}
</style>
