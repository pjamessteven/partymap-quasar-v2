<template>
  <div class="flex column">
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
            'q-px-md ': $q.screen.gt.xs,
            'q-px-sm  q-mt-': $q.screen.lt.sm,
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
      <!--
      <DateHeader
        class="header q-mt-"
        :class="$q.screen.lt.sm ? '' : ''"
        :altLabel="'Upcoming events in this area:'"
      >
      </DateHeader>
      -->
      <div
        class="ed-card-grid q-pb-sm q-mt-xs"
        :style="gridColumns"
        :class="{
          'q-px-md ': $q.screen.gt.xs,
          'q-px-sm  q-mt-': $q.screen.lt.sm,
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
    <div class="row justify-center q-my-lg q-mb-xl">
      <q-spinner-ios
        :color="$q.dark.isActive ? 'white' : 'black'"
        size="2em"
        v-if="
          hasNext &&
          ((groupByMonth &&
            Object.keys(eventDatesGroupedByMonth)?.length > 0) ||
            (!groupByMonth && eventDates?.length > 0))
        "
      />
      <div v-else-if="!disableEndOfResultsMessage">
        <div
          v-if="
            (groupByMonth &&
              Object.keys(eventDatesGroupedByMonth)?.length > 0) ||
            (!groupByMonth && eventDates && eventDates.length > 0)
          "
          class="t3 inter bold q-mt-md"
        >
          End of results
        </div>
        <div
          v-else-if="
            ((groupByMonth &&
              Object.keys(eventDatesGroupedByMonth)?.length == 0) ||
              (!groupByMonth && eventDates && eventDates.length === 0)) &&
            !loading
          "
          class="t3 inter bold"
          :class="$q.screen.lt.sm ? 'q-mt-lg' : ''"
        >
          No results<span v-if="$route.name === 'Explore'"
            >&nbsp;in this area</span
          >
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

const $q = useQuasar();

const mainStore = useMainStore();

interface Props {
  eventDates: [EventDate, string][];
  eventDatesGroupedByMonth?: {
    [key: number]: [EventDate, string][];
  };
  groupByMonth?: boolean;
  hasNext: boolean;
  loading: boolean;
  disableEndOfResultsMessage: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  eventDates: () => [],
  eventDatesGroupedByMonth: () => {
    return {};
  },
  groupByMonth: () => false,
});

const gridColumns = computed(() => {
  if ($q.screen.gt.lg) {
    return `
        grid-template-columns: repeat(3, minmax(0, 1fr));
        `;
  } else if ($q.screen.gt.sm) {
    return `
        grid-template-columns: repeat(2, minmax(0, 1fr));
        `;
  } else {
    return `
        grid-template-columns: repeat(1, minmax(0, 1fr));
        `;
  }
});
</script>
<style lang="scss" scoped>
.ed-card-grid {
  display: grid;
  grid-gap: 1rem;
  .ed-card {
    //max-height: 280px;
    .card {
      height: 100%;
      .card-content {
        height: 100%;
        justify-content: space-between;
      }
    }
  }
}
</style>
