<template>
  <div class="ed-summary flex column" :class="{ transparent: !ed }">
    <div
      class="flex row no-wrap items-center ellipsis"
      :class="{ reverse: alignRight }"
    >
      <q-icon
        name="las la-clock"
        size="1.25em"
        :left="!alignRight"
        :right="alignRight"
      />
      <div
        class="flex column"
        :class="$q.screen.gt.xs ? 'inter semibold' : 'inter semibold'"
      >
        <div v-if="!!ed" class="flex wrap q-gutter-sm">
          <span>
            <span v-if="hasOccured">Past event in&nbsp;</span>
            <span v-if="ed?.date_confirmed == true">
              {{ relativeHumanTime(ed.start_naive, ed.end_naive, ed.tz) }}
            </span>
            <span v-else-if="!ed?.date_confirmed">
              {{ monthYear(ed?.start_naive, ed?.tz) }}&nbsp;<span
                v-if="!hasOccured && !ed?.cancelled"
                >({{ $t('event_dates.date_tbc') }})</span
              ></span
            >
          </span>
          <q-badge
            v-if="ed?.cancelled"
            class="q-my-xs q-ml-sm"
            color="red"
            :label="$t('event_dates.cancelled')"
          />
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
      <div :class="$q.screen.gt.xs ? 'inter semibold' : 'inter semibold'">
        {{ $route?.query?.locationDescription || location || '...' }}
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
      return this.isInPast(this.ed?.end);
    },
    location() {
      return this.getGeneralLocationString(this.ed.location);
    },
  },
  created() {
    // import common methods
    this.relativeHumanTime = common.relativeHumanTime;
    this.monthYear = common.monthYear;
    this.isInPast = common.isInPast;
    this.getGeneralLocationString = common.getGeneralLocationString;
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

  transition: opacity 1s ease;
  &.transparent {
    opacity: 0;
  }
}
</style>
