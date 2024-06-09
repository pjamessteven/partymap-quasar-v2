<template>
  <div class="ed-summary flex column ellipsis" :class="{ transparent: !ed }">
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
            v-if="ed?.cancelled"
            class="q-my-xs q-mr-sm"
            color="red"
            :label="$t('event_date_inline.cancelled')"
          />
          <span v-if="hasOccured">Past event in&nbsp;</span>
          <span v-if="ed?.date_confirmed == true">
            {{ localDay(ed?.start_naive, ed?.tz) }}
            {{ localDate(ed?.start_naive, ed?.tz) }}
          </span>
          <span v-else-if="!ed?.date_confirmed">
            {{ monthYear(ed?.start_naive, ed?.tz) }}&nbsp;<span
              v-if="!hasOccured && !ed?.cancelled"
              >(Date TBC)</span
            ></span
          >
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
        v-if="ed?.location.name"
        class="ellipsis"
        :class="$q.screen.gt.xs ? 'text-large' : 'inter bold'"
        >{{ ed?.location.name }}</span
      >
      <span v-else>...</span>
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

.ed-summary {
  opacity: 1;

  transition: opacity 5s ease;
  &.transparent {
    opacity: 0;
  }
}
</style>
