<template>
  <div>
    <q-btn
      no-caps
      @click="
        () => {
          showing = !showing;
        }
      "
      class="button-control flex items-center date-control"
      :class="{
        active:
          controlDateRangeSelectedOption &&
          controlDateRangeSelectedOption?.value != null,
      }"
    >
      <div class="flex items-center row no-wrap">
        <div
          class="close-icon-wrapper"
          v-if="showSelectedValue && !!controlDateRangeSelectedOption?.value"
          @click.stop="clearDateRange"
        >
          <q-icon style="font-size: 18px" name="mdi-close" />
        </div>

        <div class="button-label flex row items-center row no-wrap">
          <div v-if="!controlDateRangeSelectedOption?.value" class="q-mr-sm">
            <i class="las la-calendar" />
          </div>
          <div
            v-if="showSelectedValue && !!controlDateRangeSelectedOption?.value"
          >
            {{ controlDateRangeSelectedOption.label }}
          </div>
          <div v-else-if="$q.screen.lt.sm">dates</div>
          <div v-else>
            {{ $t('top_controls.select_dates') }}
          </div>
        </div>
      </div>
      <MenuWrapper :showing="showing" @hide="onHide()" @show="onShow()">
        <div class="calendar-header flex row items-center" style="">
          <q-list dense style="min-width: 100px" v-if="$q.screen.gt.xs">
            <q-item-label header class="q-pb-md">{{
              $t('top_controls.shortcuts')
            }}</q-item-label>
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
              <q-item-section>{{
                $t('top_controls.more_months')
              }}</q-item-section>

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
              <q-item-section>{{
                $t('top_controls.more_months')
              }}</q-item-section>

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
          <DatePicker
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
          />
        </div>
      </MenuWrapper>
    </q-btn>
  </div>
</template>

<script>
import 'v-calendar/dist/style.css';

import moment from 'moment';
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
    showSelectedValue: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      showing: false,
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
            start: moment().hour(0).minute(0).seconds(0).toISOString(),
            end: null,
          };
          break;
        case 'today':
          this.controlDateRange = {
            start: moment()
              .hour(0)
              .minute(0)
              .seconds(0)
              .milliseconds(0)
              .toISOString(),
            end: moment()
              .hour(0)
              .minute(0)
              .seconds(0)
              .milliseconds(0)
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
            start: moment().hour(0).minute(0).seconds(0).toISOString(),
            end: moment()
              .hour(0)
              .minute(0)
              .seconds(0)
              .add(7, 'days')
              .toISOString(),
          };
          break;
        case 'month':
          this.controlDateRange = {
            start: moment().hour(0).minute(0).seconds(0).toISOString(),
            end: moment()
              .hour(0)
              .minute(0)
              .seconds(0)
              .add(1, 'month')
              .toISOString(),
          };

          break;
        case 'jan':
          var year = moment().year();
          if (moment().month() > 0) {
            // if jan has passed then it should be next jan
            year += 1;
          }
          var start = moment()
            .hour(0)
            .minute(0)
            .seconds(0)
            .date(1)
            .month(0)
            .year(year);
          this.controlDateRange = {
            start: start.toISOString(),
            end: start.add(1, 'month').toISOString(),
          };
          break;
        case 'feb':
          var year = moment().year();
          if (moment().month() > 1) {
            // if jan has passed then it should be next jan
            year += 1;
          }
          var start = moment()
            .hour(0)
            .minute(0)
            .seconds(0)
            .date(1)
            .month(1)
            .year(year);
          this.controlDateRange = {
            start: start.toISOString(),
            end: start.add(1, 'month').toISOString(),
          };
          break;
        case 'mar':
          var year = moment().year();
          if (moment().month() > 2) {
            // if jan has passed then it should be next jan
            year += 1;
          }
          var start = moment()
            .hour(0)
            .minute(0)
            .seconds(0)
            .date(1)
            .month(2)
            .year(year);
          this.controlDateRange = {
            start: start.toISOString(),
            end: start.add(1, 'month').toISOString(),
          };
          break;
        case 'apr':
          var year = moment().year();
          if (moment().month() > 3) {
            // if jan has passed then it should be next jan
            year += 1;
          }
          var start = moment()
            .hour(0)
            .minute(0)
            .seconds(0)
            .date(1)
            .month(3)
            .year(year);
          this.controlDateRange = {
            start: start.toISOString(),
            end: start.add(1, 'month').toISOString(),
          };
          break;
        case 'may':
          var year = moment().year();
          if (moment().month() > 4) {
            // if jan has passed then it should be next jan
            year += 1;
          }
          var start = moment()
            .hour(0)
            .minute(0)
            .seconds(0)
            .date(1)
            .month(4)
            .year(year);
          this.controlDateRange = {
            start: start.toISOString(),
            end: start.add(1, 'month').toISOString(),
          };
          break;
        case 'jun':
          var year = moment().year();
          if (moment().month() > 5) {
            // if jan has passed then it should be next jan
            year += 1;
          }
          var start = moment()
            .hour(0)
            .minute(0)
            .seconds(0)
            .date(1)
            .month(5)
            .year(year);
          this.controlDateRange = {
            start: start.toISOString(),
            end: start.add(1, 'month').toISOString(),
          };
          break;
        case 'jul':
          var year = moment().year();
          if (moment().month() > 6) {
            // if jan has passed then it should be next jan
            year += 1;
          }
          var start = moment()
            .hour(0)
            .minute(0)
            .seconds(0)
            .date(1)
            .month(6)
            .year(year);
          this.controlDateRange = {
            start: start.toISOString(),
            end: start.add(1, 'month').toISOString(),
          };
          break;
        case 'aug':
          var year = moment().year();
          if (moment().month() > 7) {
            // if jan has passed then it should be next jan
            year += 1;
          }
          var start = moment()
            .hour(0)
            .minute(0)
            .seconds(0)
            .date(1)
            .month(7)
            .year(year);
          this.controlDateRange = {
            start: start.toISOString(),
            end: start.add(1, 'month').toISOString(),
          };
          break;
        case 'sep':
          var year = moment().year();
          if (moment().month() > 8) {
            // if jan has passed then it should be next jan
            year += 1;
          }
          var start = moment()
            .hour(0)
            .minute(0)
            .seconds(0)
            .date(1)
            .month(8)
            .year(year);
          this.controlDateRange = {
            start: start.toISOString(),
            end: start.add(1, 'month').toISOString(),
          };
          break;
        case 'oct':
          var year = moment().year();
          if (moment().month() > 9) {
            // if jan has passed then it should be next jan
            year += 1;
          }
          var start = moment()
            .hour(0)
            .minute(0)
            .seconds(0)
            .date(1)
            .month(9)
            .year(year);
          this.controlDateRange = {
            start: start.toISOString(),
            end: start.add(1, 'month').toISOString(),
          };
          break;
        case 'nov':
          var year = moment().year();
          if (moment().month() > 10) {
            // if jan has passed then it should be next jan
            year += 1;
          }
          var start = moment()
            .hour(0)
            .minute(0)
            .seconds(0)
            .date(1)
            .month(10)
            .year(year);
          this.controlDateRange = {
            start: start.toISOString(),
            end: start.add(1, 'month').toISOString(),
          };
          break;
        case 'dec':
          // december never passes
          var year = moment().year();
          var start = moment()
            .hour(0)
            .minute(0)
            .seconds(0)
            .date(1)
            .month(11)
            .year(year);
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
    clearDateRange() {
      this.controlDateRange = { start: moment().toISOString() };
      this.controlDateRangeSelectedOption = null;
    },
    onHide() {
      this.showing = false;
    },
    onShow() {
      this.showing = true;
    },
    onSelectedCustomDateRange(value) {
      // set button label
      let label = this.$t('top_controls.custom');

      const startDate = moment(value.start).format('Do MMM YYYY');
      const endDate = moment(value.end).format('Do MMM YYYY');

      if (startDate === endDate) {
        label = startDate;
      } else {
        label = startDate + ' - ' + endDate;
      }

      this.controlDateRangeSelectedOption = {
        label: label,
        value: 'custom',
      };
      this.showing = false;
    },
    getThisWeekendDateRange() {
      const weekendStart = 5; // friday
      const weekendEnd = 7; // sunday
      const today = moment().isoWeekday();
      var startTime;
      var endTime;
      // get start time
      if (today <= weekendStart) {
        // if it's not friday yet, return this friday
        startTime = moment().isoWeekday(weekendStart);
      } else if (today >= weekendStart && today <= weekendEnd) {
        // it's past friday, but already or before Sunday
        // so return current time
        startTime = moment();
      } else {
        // return next friday (not going to happen - for completeness)
        startTime = moment().add(1, 'weeks').isoWeekday(weekendStart);
      }
      // return this sunday
      endTime = moment()
        .hour(0)
        .minute(0)
        .seconds(0)
        .milliseconds(0)
        .isoWeekday(weekendEnd)
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
      startTime = moment()
        .hour(0)
        .minute(0)
        .seconds(0)
        .milliseconds(0)
        .isoWeekday(weekendStart)
        .add(1, 'weeks');

      // get end time
      // return this sunday
      endTime = moment()
        .hour(0)
        .minute(0)
        .seconds(0)
        .milliseconds(0)
        .isoWeekday(weekendEnd)
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
      var currentMonth = moment().month();
      var currentYear = moment().year();
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
}
.body--light {
}

.date-picker {
  border-radius: 0px !important;
  border: none !important;

  .vc-container {
    border: none !important;
  }
}
.calendar-header {
  min-width: 654px;
  width: 648px;
  overflow: hidden;
  border-radius: 18px;
}

@media only screen and (max-width: 600px) {
  .body--dark {
    .calendar-header {
      .date-picker {
        border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
      }
    }
  }
  .body--light {
    .calendar-header {
      .date-picker {
        border-top: 1px solid rgba(0, 0, 0, 0.1) !important;
      }
    }
  }

  .calendar-header {
    max-width: 100%;
    min-width: unset;
    justify-content: start;

    .date-picker {
      margin-top: 8px;
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
</style>
