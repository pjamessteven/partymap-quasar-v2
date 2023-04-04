<template>
  <div class="flex column">
    <div
      v-for="yearMonth in Object.keys(eventDatesGroupedByMonth)"
      :key="yearMonth"
    >
      <DateHeader
        :key="yearMonth + '-header'"
        class="header q-mt-"
        :class="$q.screen.lt.sm ? '' : ''"
        :date="eventDatesGroupedByMonth[yearMonth]?.[0]?.[0].start_naive"
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
          v-for="(date, index) in eventDatesGroupedByMonth[yearMonth]"
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
        v-if="hasNext && Object.keys(eventDatesGroupedByMonth).length > 0"
      />
      <div
        v-else-if="Object.keys(eventDatesGroupedByMonth).length > 0"
        class="t4 chicago q-mt-md"
      >
        End of results
      </div>
      <div
        v-else-if="Object.keys(eventDatesGroupedByMonth).length == 0"
        class="t4 chicago q-mt-md"
      >
        No results
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

const mainStore = useMainStore();

interface Props {
  eventDatesGroupedByMonth: {
    [key: string]: [EventDate, string][]; // string is the distance from current location
  };

  hasNext: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  eventDatesGroupedByMonth: () => {
    return {};
  },
});

const gridColumns = computed(() => {
  if (mainStore.sidebarExpanded) {
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
