<template>
  <div class="container">
    <div class="flex row grow">
      <q-select
        v-model="separationCount"
        :label="$t('add.frequency')"
        :options="
          disableOneOff
            ? separationCountOptionsNoOneOff
            : separationCountOptions
        "
        option-value="id"
        option-label="desc"
        map-options
        emit-value
        square
        outlined
        class="flex grow"
      />
      <q-select
        v-if="separationCount != 0"
        v-model="recurringType"
        :label="$t('add.type')"
        :options="recurringTypeOptions"
        option-value="id"
        option-label="desc"
        map-options
        emit-value
        square
        class="q-ml-md grow"
        outlined
      />
    </div>
    <div
      v-if="
        dateTime && dateTime.start && recurringType === 1 && separationCount > 0
      "
      class="q-pt-md"
    >
      <div class="weekly-rrule-text q-pa-sm t3">
        <span v-if="separationCount === 1">{{ $t('add.every') }} </span>
        <span v-if="separationCount === 2">{{ $t('add.every_second') }} </span>
        {{ $t('add.week') }} {{ $t('add.on') }} {{ selectedWeekday }}
        <span v-if="dateTime.start">
          {{ $t('add.at') }}
          {{ startTime }}
        </span>
      </div>
    </div>
    <div v-if="recurringType === 2 && separationCount > 0" class="q-pt-md t2">
      <q-radio
        v-model="absoluteDate"
        :val="true"
        :label="
          separationCount == 1
            ? ordinalNumberFormatterShort(selectedDate) +
              ' ' +
              $t('add.day') +
              ' ' +
              $t('add.of_every_month')
            : ordinalNumberFormatterShort(selectedDate) +
              ' ' +
              $t('add.day') +
              ' ' +
              $t('add.of_every_second_month')
        "
      />
      <q-radio
        v-model="absoluteDate"
        :val="false"
        :label="
          separationCount == 1
            ? ordinalNumberFormatterLong(occuranceOfDateInMonth) +
              ' ' +
              selectedWeekday +
              ' ' +
              $t('add.of_every_month')
            : ordinalNumberFormatterLong(occuranceOfDateInMonth) +
              ' ' +
              selectedWeekday +
              ' ' +
              $t('add.of_every_second_month')
        "
      />
    </div>
    <div v-if="recurringType === 3 && separationCount > 0" class="q-pt-md t2">
      <q-radio
        v-model="absoluteDate"
        :val="true"
        :label="
          separationCount == 1
            ? ordinalNumberFormatterShort(selectedDate) +
              ' ' +
              $t('add.day_of') +
              ' ' +
              selectedMonth +
              ' ' +
              $t('add.every_year')
            : ordinalNumberFormatterShort(selectedDate) +
              ' ' +
              $t('add.day_of') +
              ' ' +
              selectedMonth +
              ' ' +
              $t('add.every_second_year')
        "
      />
      <q-radio
        v-model="absoluteDate"
        :val="false"
        :label="
          separationCount == 1
            ? ordinalNumberFormatterLong(occuranceOfDateInMonth) +
              ' ' +
              selectedWeekday +
              ' ' +
              $t('add.of') +
              ' ' +
              selectedMonth +
              '  ' +
              $t('add.every_year')
            : ordinalNumberFormatterLong(occuranceOfDateInMonth) +
              ' ' +
              selectedWeekday +
              ' ' +
              $t('add.of') +
              ' ' +
              selectedMonth +
              '  ' +
              $t('add.every_second_year')
        "
      />
    </div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  components: {},
  props: ['dateTime', 'disableOneOff'],
  data() {
    return {
      absoluteDate: false,
      recurringType: 1,
      separationCount: this.disableOneOff ? 1 : 0,
      separationCountOptions: [
        { id: 0, desc: this.$t('add.once') },
        { id: 1, desc: this.$t('add.every_') },
        { id: 2, desc: this.$t('add.every_second_') },
      ],
      separationCountOptionsNoOneOff: [
        { id: 1, desc: this.$t('add.every_') },
        { id: 2, desc: this.$t('add.every_second_') },
      ],
      recurringTypeOptions: [
        { id: 1, desc: this.$t('add.week') },
        { id: 2, desc: this.$t('add.month') },
        { id: 3, desc: this.$t('add.year') },
      ],
    };
  },
  watch: {
    $props: {
      handler() {
        this.dt = this.value;
        this.emitRrule();
      },
      deep: true,
      immediate: true,
    },
    recurringType: function () {
      this.emitRrule();
    },
    separationCount: function () {
      this.emitRrule();
    },
    absoluteDate: function () {
      this.emitRrule();
    },
  },
  methods: {
    ordinalNumberFormatterLong(input) {
      return this.$t('ordinal_long.' + input);
    },
    ordinalNumberFormatterShort(input) {
      return this.$t('ordinal_short.' + input);
    },
    emitRrule() {
      var r = {
        recurringType: this.recurringType,
        separationCount: this.separationCount,
        weekOfMonth: this.weekOfMonth,
        dayOfMonth: this.dayOfMonth,
        dayOfWeek: this.dayOfWeek,
        monthOfYear: this.monthOfYear,
      };
      this.$emit('updateRrule', r);
    },
  },
  computed: {
    occuranceOfDateInMonth() {
      if (this.dateTime && this.dateTime.start) {
        const startDate = this.dateTime.start;
        // 0 = the last day of week in month
        // 1 = first day in month
        // 2 = second etc.
        var counterDate = moment(startDate);
        var date = moment(startDate);
        var weekday = date.isoWeekday();
        counterDate.set('date', 1);
        var count = 1;
        var numOfWeekdaysInMonth = 0;
        while (counterDate.date() < date.date()) {
          if (counterDate.isoWeekday() === weekday) {
            count++;
          }
          counterDate.set('date', counterDate.date() + 1);
        }
        // Get number of occurances of this weekday in month
        counterDate = moment(startDate);
        counterDate.set('date', 1);
        var datemax = moment(startDate);
        datemax.set('date', datemax.daysInMonth());
        while (counterDate.date() < datemax.date()) {
          if (counterDate.isoWeekday() === weekday) {
            numOfWeekdaysInMonth += 1;
          }
          // handle last case (this is such a bitch)
          if (counterDate.date() + 1 === datemax.date()) {
            if (datemax.isoWeekday() === weekday) {
              numOfWeekdaysInMonth += 1;
            }
          }
          counterDate.set('date', counterDate.date() + 1);
        }
        // return -1 if this is the last occurance in the month
        if (
          (numOfWeekdaysInMonth === 5 && count === 5) ||
          (numOfWeekdaysInMonth === 4 && count === 4)
        ) {
          return -1;
        } else {
          return count;
        }
      } else return null;
    },
    dayOfWeek() {
      if (this.dateTime && !this.absoluteDate) {
        return moment(this.dateTime.start).isoWeekday();
      } else {
        return null;
      }
    },
    weekOfMonth() {
      if (this.dateTime && !this.absoluteDate) {
        return this.occuranceOfDateInMonth;
      } else {
        return null;
      }
    },
    dayOfMonth() {
      if (this.dateTime) {
        return moment(this.dateTime.start).date();
      } else return null;
    },
    monthOfYear() {
      if (this.dateTime) {
        return moment(this.dateTime.start).month() + 1;
      } else return null;
    },
    selectedDate() {
      if (this.dateTime) {
        var mom = moment(this.dateTime.start);
        return mom.date();
      } else return null;
    },
    selectedWeekday() {
      if (this.dateTime) {
        var mom = moment(this.dateTime.start).isoWeekday();
        switch (mom) {
          case 1:
            return 'Monday';
          case 2:
            return 'Tuesday';
          case 3:
            return 'Wednesday';
          case 4:
            return 'Thursday';
          case 5:
            return 'Friday';
          case 6:
            return 'Saturday';
          case 7:
            return 'Sunday';
        }
        return '';
      } else return null;
    },
    selectedMonth() {
      if (this.dateTime) {
        var mom = moment(this.dateTime.start).month();
        switch (mom) {
          case 0:
            return 'January';
          case 1:
            return 'Febuary';
          case 2:
            return 'March';
          case 3:
            return 'April';
          case 4:
            return 'May';
          case 5:
            return 'June';
          case 6:
            return 'July';
          case 7:
            return 'August';
          case 8:
            return 'September';
          case 9:
            return 'October';
          case 10:
            return 'November';
          case 11:
            return 'December';
        }
        return '';
      } else return null;
    },
    startTime() {
      if (this.dateTime && this.dateTime.start) {
        return moment.utc(this.dateTime.start).format('h:mm A');
      } else return null;
    },
  },
  mounted() {
    this.emitRrule();
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .weekly-rrule-text {
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
}
.body--light {
  .weekly-rrule-text {
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 0px;
    background: $b-2;
  }
}
</style>
