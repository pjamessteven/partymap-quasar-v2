<template>
  <div class="container">
    <div class="flex column content-start">
      <DatePicker
        v-model="dt.date"
        :is-range="isRange"
        color="gray"
        :is-dark="$q.dark.isActive"
        :model-config="modelConfig"
        keepVisibleOnInput
        :is-inline="inlineCalendar"
      />
      <div class="flex row wrap q-gutter-md q-mt-sm justify-start">
        <div class="time-box flex column q-pa-sm">
          <div class="t2">
            <q-icon name="mdi-clock-outline" left />{{ $t('add.start_time') }}
          </div>
          <div class="flex row q-mt-sm">
            <q-select
              outlined
              square
              dense
              hide-dropdown-icon
              v-model="dt.startHours"
              :options="hours"
              v-bind:label="$t('add.hour')"
              class="col-grow"
            >
            </q-select>
            <q-select
              outlined
              square
              dense
              hide-dropdown-icon
              v-model="dt.startMinutes"
              :options="minutes"
              v-bind:label="$t('add.minutes')"
              class="col-grow q-ml-sm"
            >
            </q-select>
          </div>
        </div>
        <div class="time-box flex column q-pa-sm" v-if="isRange">
          <div class="t2">
            <q-icon name="mdi-clock-outline" left />{{ $t('add.end_time') }}
          </div>
          <div class="flex row q-mt-sm">
            <q-select
              outlined
              dense
              square
              hide-dropdown-icon
              v-model="dt.endHours"
              :options="hours"
              v-bind:label="$t('add.hour')"
              class="col-grow"
            />
            <q-select
              outlined
              dense
              square
              hide-dropdown-icon
              v-model="dt.endMinutes"
              :options="minutes"
              v-bind:label="$t('add.minutes')"
              class="col-grow q-ml-sm"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { DatePicker } from 'v-calendar';
import moment from 'moment-timezone';
export default {
  components: {
    DatePicker,
  },
  props: ['value', 'singleValue', 'inlineCalendar', 'isRange'],
  data() {
    return {
      modelConfig: {
        timeAdjust: '00:00:00',
      },
      dt: {
        date: {
          start: null,
          end: null,
        },
        startHours: null,
        startMinutes: '00',
        endHours: null,
        endMinutes: '00',
      },
      endHoursShowing: false,
      startHoursShowing: false,
      hours: [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23,
      ],
      minutes: ['00', '15', '30', '45'],
    };
  },
  methods: {
    removeStartTime() {
      this.dt.startHours = null;
      this.dt.endHours = null;
      this.startHoursShowing = false;
      this.endHoursShowing = false;
    },
    removeEndTime() {
      this.dt.endHours = null;
      this.dt.endMinutes = null;
      this.endHoursShowing = false;
    },
  },
  watch: {
    dt: {
      handler(newVal) {
        if (this.isRange) {
          var start = newVal.date.start;
          var end = newVal.date.end;
          if (start && end) {
            var startHours = 0;
            var startMinutes = 0;
            var endHours = 0;
            var endMinutes = 0;

            if (start && newVal.startHours != null) {
              startHours = Number(newVal.startHours);
              start.setHours(startHours);
            }
            if (start && newVal.startMinutes != null) {
              startMinutes = Number(newVal.startMinutes);
              start.setMinutes(startMinutes);
            }
            if (end && newVal.endHours != null) {
              endHours = Number(newVal.endHours);
              end.setHours(endHours);
            }
            if (end && newVal.endMinutes != null) {
              endMinutes = Number(newVal.endMinutes);
              end.setMinutes(endMinutes);
            }

            start = moment(start)
              .seconds(0)
              .milliseconds(0)
              .utcOffset(0, true)
              .format('YYYY-MM-DD HH:mm:ss');
            end = moment(end)
              .seconds(0)
              .milliseconds(0)
              .utcOffset(0, true)
              .format('YYYY-MM-DD HH:mm:ss');
            this.$emit('dateRange', { start: start, end: end });
          } else {
            this.$emit('dateRange', { start: null, end: null });
          }
        }
        if (!this.isRange && newVal.date) {
          // emit single date with time included. used by event date artists component for lineup times
          var dt = newVal.date;

          var hours = 0;
          var mins = 0;
          if (newVal.startHours != null) {
            hours = Number(newVal.startHours);
            dt.setHours(hours);
          }
          if (newVal.startMinutes != null) {
            mins = Number(newVal.startMinutes);
            dt.setMinutes(mins);
          }
          dt = moment(dt)
            .utcOffset(0, true)
            .seconds(0)
            .milliseconds(0)
            .format('YYYY-MM-DD HH:mm:ss');
          this.$emit('singleDate', dt);
        }
      },
      deep: true,
      immediate: false,
    },
  },
  beforeMount() {
    var local = moment();

    if (this.value) {
      // THIS ASSUMES THAT THE INPUT IS A NAIVE DATETIME STRING
      // LIKE 2021-12-23 11:00:00 OR 2021-12-26T14:00:00Z
      // we need to 'convert' it to local time
      var start = moment
        .utc(this.value.start)
        .subtract(local.utcOffset(), 'm')
        .toDate();
      var end = moment
        .utc(this.value.end)
        .subtract(local.utcOffset(), 'm')
        .toDate();
      var dt = {
        date: {
          start: start,
          end: end,
        },
        startHours: start.getHours(),
        startMinutes: start.getMinutes(),
        endHours: end.getHours(),
        endMinutes: end.getMinutes(),
      };
      this.dt = dt;
    } else if (this.singleValue) {
      this.dt.date = moment
        .utc(this.singleValue)
        .subtract(local.utcOffset(), 'm')
        .toDate();
      this.dt.startHours = this.dt.date.getHours();
      this.dt.startMinutes = this.dt.date.getMinutes();
    }
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .time-box {
    background: $bi-3;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}
.body--light {
  .time-box {
    background: $b-2;
    border: 1px solid rgba(0, 0, 0, 0.1);
    .q-field {
      background: $b-1;
    }
  }
  .vc-container {
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
}
.time-box {
  border-radius: 0px;
  min-width: 200px;
}

.vc-container {
  border-right: none;
  border-left: none;
  border-bottom: none;
  border-radius: 0px;
  border: none;
}
@media only screen and (max-width: 1023px) {
  .card {
    margin-top: 0px;
    width: 100%;
    height: 100%;
  }
}
</style>
