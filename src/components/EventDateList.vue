<template>
  <div class="flex column">
    <DateHeader
      v-if="!hideHeader && !groupByMonth && eventDatesTotal > 0"
      class="total-result-header"
      :altLabel="computedTotalResultMessage"
    />

    <div v-if="groupByMonth">
      <div
        v-for="yearMonth in Object.keys(eventDatesGroupedByMonth).sort()"
        :key="yearMonth"
      >
        <DateHeader
          :key="yearMonth + '-header'"
          class="header q-mt-"
          :class="$q.screen.lt.sm ? '' : ''"
          :date="
            eventDatesGroupedByMonth[Number(yearMonth)][0]?.[0].start_naive
          "
        >
        </DateHeader>
        <div
          class="ed-card-grid q-pb-sm"
          :style="gridColumns"
          :class="{
            'q-px-md q-mb-lg': $q.screen.gt.sm,
            'q-px-sm  q-mt-': $q.screen.lt.md,
          }"
        >
          <EventDateCard
            v-for="(date, index) in eventDatesGroupedByMonth[Number(yearMonth)]"
            :key="index"
            :event="date[0]"
            :short-date="true"
          >
          </EventDateCard>
        </div>
      </div>
    </div>
    <div v-else>
      <div
        class="ed-card-grid q-pb-sm q-mt-xs"
        :style="gridColumns"
        :class="{
          'q-px-md ': $q.screen.gt.sm,
          'q-px-sm  q-mt-': $q.screen.lt.md,
        }"
      >
        <EventDateCard
          v-for="(date, index) in eventDates"
          :key="index"
          :event="date[0]"
          :short-date="true"
        >
        </EventDateCard>
      </div>
    </div>
    <div class="row justify-center">
      <q-linear-progress
        class="q-my-xl q-mb-xl"
        v-if="
          hasNext &&
          ((groupByMonth &&
            Object.keys(eventDatesGroupedByMonth)?.length > 0) ||
            (!groupByMonth && eventDates?.length > 0))
        "
        indeterminate
        size="2px"
        :color="$q.dark.isActive ? 'grey-6' : 'grey-8'"
        rounded
        :style="$q.screen.gt.xs ? 'max-width: 200px' : 'max-width: 120px'"
      />
      <!--
      <q-spinner-ios
      class="q-my-lg q-mb-xl"

        :color="$q.dark.isActive ? 'white' : 'black'"
        size="2em"
        v-if="
          hasNext &&
          ((groupByMonth &&
            Object.keys(eventDatesGroupedByMonth)?.length > 0) ||
            (!groupByMonth && eventDates?.length > 0))
        "
      />-->
      <div v-else-if="!disableEndOfResultsMessage" class="q-my-lg q-mb-xl">
        <div
          v-if="
            (groupByMonth &&
              Object.keys(eventDatesGroupedByMonth)?.length > 0) ||
            (!groupByMonth && eventDates && eventDates?.length > 0)
          "
          class="t4 inter semibold q-mt-md"
        >
          End of results
        </div>
        <div
          v-else-if="
            ((groupByMonth &&
              Object.keys(eventDatesGroupedByMonth)?.length == 0) ||
              (!groupByMonth && eventDates && eventDates?.length === 0)) &&
            !loading
          "
          :class="$q.screen.lt.sm ? 'q-mt-lg t4 semibold' : 'q-mt-lg'"
          class="t4 inter"
        >
          <span v-if="$route.name === 'Explore'"></span
          ><span v-else>No results</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from 'src/stores/main';
import { EventDate } from 'src/types/autogen_types';
import { computed } from 'vue';
import DateHeader from './DateHeader.vue';
import EventDateCard from './EventDateCard.vue';
import { useQuasar } from 'quasar';
import moment from 'moment-timezone';
const $q = useQuasar();

const main = useMainStore();

interface Props {
  eventDates: [EventDate, string][];
  eventDatesGroupedByMonth?: {
    [key: number]: [EventDate, string][];
  };
  groupByMonth?: boolean;
  hasNext: boolean;
  loading?: boolean;
  disableEndOfResultsMessage?: boolean;
  eventDatesTotal?: number;
  hideHeader?: boolean;
  twoColumnsMd?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  eventDates: () => [],
  eventDatesGroupedByMonth: () => {
    return {};
  },
  groupByMonth: () => false,
  eventDatesTotal: () => 0,
  loading: () => false,
  hideHeader: () => false,
  twoColumnsMd: () => false,
});

const gridColumns = computed(() => {
  //if ( ) {
  if (props.twoColumnsMd) {
    return `
        grid-template-columns: repeat(2, minmax(0, 1fr));
        `;
  } else {
    return `
        grid-template-columns: repeat(1, minmax(0, 1fr));
        `;
  }
  /*
  } else {
    if ($q.screen.gt.lg) {
      return `
        grid-template-columns: repeat(1, minmax(0, 1fr));
        `;
    } else if ($q.screen.gt.sm) {
      return `
        grid-template-columns: repeat(1, minmax(0, 1fr));
        `;
    } else {
      return `
        grid-template-columns: repeat(1, minmax(0, 1fr));
        `;
    }
  }
  */
});

const computedTotalResultMessage = computed(() => {
  if ($q.screen.gt.xs) {
    if (props.eventDatesTotal === 1) {
      return props.eventDatesTotal + ' upcoming in this area';
    } else if (props.eventDatesTotal > 1) {
      return props.eventDatesTotal + ' upcoming in this area';
    } else return null;
  } else {
    if (props.eventDatesTotal === 1) {
      return props.eventDatesTotal + ' upcoming in this area';
    } else if (props.eventDatesTotal > 1) {
      return props.eventDatesTotal + ' upcoming in this area';
    } else return null;
  }
});
</script>
<style lang="scss" scoped>
.ed-card-grid {
  cursor: default;
  display: grid;
  grid-gap: 1rem;
  .ed-card {
    //max-height: 280px;
    &:first-child {
      margin-top: 0px;
    }
    .card {
      height: 100%;
      .card-content {
        height: 100%;
        justify-content: space-between;
      }
    }
  }
}
@media only screen and (max-width: 600px) {
}
</style>
