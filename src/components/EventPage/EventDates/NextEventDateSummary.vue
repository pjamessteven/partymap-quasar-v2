<template>
  <div class="ed-summary flex column" :class="{ transparent: !ed }">
    <div
      class="flex row items-center ellipsis"
      :class="{ reverse: alignRight }"
    >
      <q-icon
        name="las la-calendar"
        size="1.25em"
        :left="!alignRight"
        :right="alignRight"
      />
      <div
        class="flex column"
        :class="$q.screen.gt.xs ? 'inter bold' : 'inter bold'"
      >
        <div v-if="!!ed">
          <q-badge
            v-if="ed?.cancelled"
            class="q-my-xs q-mr-sm"
            color="red"
            :label="$t('event_dates.cancelled')"
          />
          <span v-if="hasOccured">Past event in&nbsp;</span>
          <span v-if="ed?.date_confirmed == true">
            {{ localDateWithWeekday(ed?.start_naive, ed?.tz) }}
          </span>
          <span v-else-if="!ed?.date_confirmed">
            {{ monthYear(ed?.start_naive, ed?.tz) }}&nbsp;<span
              v-if="!hasOccured && !ed?.cancelled"
              >({{ $t('event_dates.date_tbc') }})</span
            ></span
          >
          <!--
          <span class="t3">
            [{{ timeZoneAbbreviention(ed.event_start, ed.tz) }}]
          </span>-->
        </div>
        <div v-else-if="$route?.query.dateString">
          {{ $route.query.dateString }}
        </div>
        <div v-else>...</div>
      </div>
    </div>

    <div
      class="flex row items-baseline no-wrap"
      style="width: 100%"
      :class="{ reverse: alignRight }"
    >
      <q-icon
        class="q-mt-xs"
        name="las la-map-marker"
        size="1.25em"
        :left="!alignRight"
        :right="alignRight"
      />
      <div :class="$q.screen.gt.xs ? 'inter bold' : 'inter bold'">
        {{ $route?.query?.locationDescription || ed?.location.name || '...' }}
      </div>
    </div>
  </div>
</template>

<script>
import common from 'assets/common';

export default {
  data() {
    return {};
  },
  components: {},
  props: { ed: Object, alignRight: Boolean },
  computed: {
    hasOccured() {
      return this.isInPast(this.ed?.start_naive, this.ed?.tz);
    },
  },
  created() {
    // import common methods
    this.relativeHumanTime = common.relativeHumanTime;
    this.localTime = common.localTime;
    this.localDate = common.localDate;
    this.localDay = common.localDay;
    this.localDateTimeLong = common.localDateTimeLong;
    this.localDateLong = common.localDateLong;
    this.localTimeCompact = common.localTimeCompact;
    this.timeZoneAbbreviention = common.timeZoneAbbreviention;
    this.monthYear = common.monthYear;
    this.isInPast = common.isInPast;
    this.localDateWithWeekday = common.localDateWithWeekday;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .ed-summary {
    color: $ti-2;
  }
}

.body--light {
  .ed-summary {
    color: $ti-2;
  }
}

.ed-summary {
  opacity: 1;

  transition: opacity 5s ease;
  &.transparent {
    opacity: 0;
  }
}
</style>
