<template>
  <li>
    <div class="flex column q-pa-md">
      <TransactionInfo v-if="showTransactionInfo" :activity="activities[0]" />
      <div class="flex row no-wrap items-center" v-if="activitiesByVerb.create">
        <b>{{ tc('activity.add_tag', activitiesByVerb?.create?.length) }} </b>
        <p />
        <TagComponent
          v-for="(activity, index) in activitiesByVerb.create"
          :value="activity.object_version.tag"
          class="q-ml-sm"
          :key="index"
        ></TagComponent>
      </div>
      <div
        class="flex row no-wrap items-center"
        v-if="activitiesByVerb?.delete"
      >
        <b
          >{{ tc('activity.remove_tag', activitiesByVerb?.delete?.length) }}
        </b>

        <TagComponent
          v-for="(activity, index) in activitiesByVerb.delete"
          :value="activity.object_version.tag"
          :key="index"
          class="q-ml-sm"
        ></TagComponent>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import { Activity } from 'src/types/autogen_types';
import { computed, ref } from 'vue';
import TransactionInfo from './TransactionInfo.vue';
import TagComponent from '../TagComponent.vue';
import { useI18n } from 'vue-i18n';

const { t, tc } = useI18n();

interface Props {
  activities: Activity[];
  showTransactionInfo?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  activities: null,
  showTransactionInfo: false,
});

const activitiesByVerb = computed(() => {
  return Object.groupBy(props.activities, (activity) => activity.verb);
});
</script>
