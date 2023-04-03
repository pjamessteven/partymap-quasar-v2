<template>
  <div class="flex column">
    <div v-for="yearMonth in Object.keys(componentGroup)" :key="yearMonth">
      <component
        v-if="componentGroup[yearMonth].header"
        :key="yearMonth + '-header'"
        class="header q-mt-"
        :class="$q.screen.lt.sm ? '' : ''"
        :is="DateHeader"
        v-bind="componentGroup[yearMonth].header.propsData"
      >
      </component>

      <div
        class="ed-card-grid q-pb-sm"
        :style="gridColumns"
        :class="{
          'q-px-md ': $q.screen.gt.xs,
          'q-px-sm  q-mt-': $q.screen.lt.sm,
        }"
      >
        <component
          v-for="(component, index) in componentGroup[yearMonth].dates"
          :key="index"
          :is="EventDateCard"
          v-bind="component.propsData"
        >
        </component>
      </div>
    </div>
    <div class="row justify-center q-my-lg q-mb-xl">
      <q-spinner-ios
        :color="$q.dark.isActive ? 'white' : 'black'"
        size="2em"
        v-if="hasNext && eventDates.length > 0"
      />
      <div v-else-if="eventDates.length > 0" class="t4 chicago q-mt-md">
        End of results
      </div>
      <div v-else-if="eventDates.length == 0" class="t4 chicago q-mt-md">
        No results
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import moment from 'moment';
import { useMainStore } from 'src/stores/main';
import { EventDate } from 'src/types/autogen_types';
import { computed, onMounted, Ref, ref, watch } from 'vue';
import DateHeader from './DateHeader.vue';
import EventDateCard from './EventDateCard.vue';

const mainStore = useMainStore();

interface Props {
  eventDates: [EventDate, string][];
  hasNext: boolean;
}

interface ComponentGroupType {
  [key: string]: {
    header: {
      propsData: {
        [key: string]: any;
      };
    };
    dates: {
      propsData: {
        [key: string]: any;
      };
    }[];
  };
}
const props = withDefaults(defineProps<Props>(), {
  eventDates: () => [],
});

const emit = defineEmits<{
  (e: 'loaded'): void;
}>();

let componentGroup: Ref<ComponentGroupType> = ref({});

const updateComponentGroup = (eventDates: [EventDate, string][]) => {
  if (eventDates.length === 0) {
    componentGroup.value = {};
  } else {
    for (let ed of eventDates) {
      // assumes eventDates are sorted by time
      const start = moment(ed?.[0].start_naive);
      let yearMonth = start.month() + '' + start.year();
      if (!componentGroup.value[yearMonth]) {
        componentGroup.value[yearMonth] = {
          header: {
            propsData: {
              date: ed[0].start_naive,
            },
          },
          dates: [],
        };
      }
      if (
        !componentGroup.value[yearMonth].dates.find(
          (x) => x.propsData.event.id === ed[0].id
        )
      )
        componentGroup.value[yearMonth].dates.push({
          propsData: {
            event: ed[0],
            class: 'ed-card',
            shortDate: true,
          },
        });
    }
  }
  emit('loaded');
};

watch(
  () => props.eventDates,
  (eventDates) => {
    updateComponentGroup(eventDates);
  }
);
onMounted(() => {
  updateComponentGroup(props.eventDates);
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
