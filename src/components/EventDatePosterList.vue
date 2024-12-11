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
          :date="eventDatesGroupedByMonth[Number(yearMonth)][0]?.start_naive"
        >
        </DateHeader>
        <div
          class="ed-poster-grid q-pb-sm"
          :style="gridColumns"
          :class="{
            'q-px-md  q-mb-lg': $q.screen.gt.xs,
            'q-px-xs  q-mt-': $q.screen.lt.sm,
          }"
        >
          <EventDatePoster
            v-for="(date, index) in eventDatesGroupedByMonth[Number(yearMonth)]"
            :key="index"
            :event="date"
            :short-date="true"
          >
          </EventDatePoster>
        </div>
      </div>
    </div>
    <div v-else>
      <div
        class="ed-poster-grid q-pb-sm"
        :style="gridColumns"
        :class="{
          'q-px-md': $q.screen.gt.xs,
          'q-px-sm q-mt-xs': $q.screen.lt.sm,
        }"
      >
        <EventDatePoster
          v-for="(date, index) in eventDates"
          :key="index"
          :event="date"
          :short-date="true"
        >
        </EventDatePoster>
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
      />
            -->
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
          :class="$q.screen.lt.sm ? 'q-mt-lg semibold' : 'q-mt-lg'"
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
import EventDatePoster from './EventDatePoster.vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

const $q = useQuasar();

const { t } = useI18n();

const mainStore = useMainStore();

interface Props {
  eventDates: EventDate[];
  eventDatesGroupedByMonth?: {
    [key: number]: EventDate[];
  };
  groupByMonth?: boolean;
  hasNext: boolean;
  loading?: boolean;
  disableEndOfResultsMessage?: boolean;
  eventDatesTotal?: number;
  hideHeader?: boolean;
}

const main = useMainStore();

const props = withDefaults(defineProps<Props>(), {
  eventDates: () => [],
  eventDatesGroupedByMonth: () => {
    return [];
  },
  groupByMonth: () => false,
  eventDatesTotal: () => 0,
  loading: () => false,
  hideHeader: () => false,
});

const gridColumns = computed(() => {
  if (main.showPanel) {
    if ($q.screen.gt.lg) {
      return `
        grid-template-columns: repeat(3, minmax(0, 1fr));
        `;
    } else if ($q.screen.gt.md) {
      return `
        grid-template-columns: repeat(3, minmax(0, 1fr));
        `;
    } else if ($q.screen.gt.xs) {
      return `
        grid-template-columns: repeat(3, minmax(0, 1fr));
        `;
    } else {
      return `
        grid-template-columns: repeat(2, minmax(0, 1fr));
        `;
    }
  } else {
    if ($q.screen.gt.lg) {
      return `
        grid-template-columns: repeat(3, minmax(0, 1fr));
        `;
    } else if ($q.screen.gt.md) {
      return `
        grid-template-columns: repeat(3, minmax(0, 1fr));
        `;
    } else if ($q.screen.gt.xs) {
      return `
        grid-template-columns: repeat(3, minmax(0, 1fr));
        `;
    } else {
      return `
        grid-template-columns: repeat(2, minmax(0, 1fr));
        `;
    }
  }
});

const computedTotalResultMessage = computed(() => {
  if ($q.screen.gt.xs) {
    if (props.eventDatesTotal > 1) {
      return props.eventDatesTotal + ' ' + t('nearby_view.in_this_area');
    } else return null;
  }
});
</script>
<style lang="scss" scoped>
.total-result-header {
  position: sticky;

  top: 0px;
}
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
@media only screen and (max-width: 599px) {
  .ed-poster-grid {
    grid-gap: 0.5re m;
  }
  .total-result-header {
    position: sticky;
  }
}
</style>
