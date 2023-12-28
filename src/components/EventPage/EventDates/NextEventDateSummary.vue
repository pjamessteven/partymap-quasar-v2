<template>
  <div class="ed-summary flex column ellipsis">
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
        :class="$q.screen.gt.xs ? 'text-large' : 'inter bold'"
      >
        <div>
          <q-badge
            v-if="ed.cancelled"
            class="q-my-xs"
            color="red"
            :label="$t('event_date_inline.cancelled')"
          />
          <span v-else-if="ed.date_confirmed">
            {{ localDay(ed?.start_naive, ed.tz) }}
            {{ localDate(ed?.start_naive, ed.tz) }}
          </span>
          <span v-else>Date needs to be confirmed</span>
          <!--
          <span class="t3">
            [{{ timeZoneAbbreviention(ed.event_start, ed.tz) }}]
          </span>-->
        </div>
      </div>
    </div>
    <div
      class="flex row items-center no-wrap ellipsis"
      style="width: 100%"
      :class="{ reverse: alignRight }"
    >
      <q-icon
        name="las la-map-marker"
        size="1.25em"
        :left="!alignRight"
        :right="alignRight"
      />
      <span
        class="ellipsis"
        :class="$q.screen.gt.xs ? 'text-large' : 'inter bold'"
        >{{ ed?.location.name }}</span
      >
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
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .ed-summary {
    color: $ti-3;
  }
}

.body--light {
  .ed-summary {
    color: $ti-3;
  }
}
</style>
