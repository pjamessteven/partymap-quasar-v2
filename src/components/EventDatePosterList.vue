<template>
  <div class="flex column">
    <div v-if="groupByMonth">
      <div v-for="yearMonth in eventDatesGroupedByMonth" :key="yearMonth">
        <DateHeader
          :key="yearMonth + '-header'"
          class="header q-mt-"
          :class="$q.screen.lt.sm ? '' : ''"
          :date="yearMonth.dates[0]?.[0].start_naive"
        >
        </DateHeader>
        <div
          class="ed-poster-grid q-pb-sm"
          :style="gridColumns"
          :class="{
            'q-px-md ': $q.screen.gt.xs,
            'q-px-sm  q-mt-': $q.screen.lt.sm,
          }"
        >
          <EventDatePoster
            v-for="(date, index) in yearMonth.dates"
            :key="index"
            :event="date[0]"
            :short-date="true"
          >
          </EventDatePoster>
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
        class="ed-poster-grid q-pb-sm q-mt-sm"
        :style="gridColumns"
        :class="{
          'q-px-md ': $q.screen.gt.xs,
          'q-px-sm  q-mt-': $q.screen.lt.sm,
        }"
      >
        <EventDatePoster
          v-for="(date, index) in eventDates"
          :key="index"
          :event="date[0]"
          :short-date="true"
        >
        </EventDatePoster>
      </div>
    </div>

    <div class="row justify-center q-my-lg q-mb-xl">
      <q-spinner-ios
        :color="$q.dark.isActive ? 'white' : 'black'"
        size="2em"
        v-if="
          hasNext &&
          (eventDatesGroupedByMonth?.length > 0 || eventDates?.length > 0)
        "
      />
      <div
        v-else-if="
          (groupByMonth && eventDatesGroupedByMonth?.length > 0) ||
          (eventDates && eventDates.length > 0)
        "
        class="t4 chicago q-mt-md"
      >
        End of results
      </div>
      <div
        v-else-if="
          (groupByMonth && eventDatesGroupedByMonth?.length == 0) ||
          (eventDates && eventDates.length > 0)
        "
        class="t4 chicago q-mt-md"
      >
        No results in this area
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from 'src/stores/main';
import { EventDate } from 'src/types/autogen_types';
import { computed } from 'vue';
import DateHeader from './DateHeader.vue';
import EventDatePoster from './EventDatePoster.vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

const mainStore = useMainStore();

interface Props {
  eventDates: [EventDate, string][];
  eventDatesGroupedByMonth: {
    yearMonth: string;
    dates: [EventDate, string][];
  }[];
  groupByMonth: boolean;
  hasNext: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  eventDates: () => [],
  eventDatesGroupedByMonth: () => {
    return [];
  },
  groupByMonth: () => false,
});

const gridColumns = computed(() => {
  if ($q.screen.gt.lg) {
    return `
        grid-template-columns: repeat(4, minmax(0, 1fr));
        `;
  } else if ($q.screen.gt.sm) {
    return `
        grid-template-columns: repeat(3, minmax(0, 1fr));
        `;
  } else if ($q.screen.gt.xs) {
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
.ed-poster-grid {
  display: grid;
  grid-gap: 1rem;
  .ed-poster {
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
