<template>
  <li>
    <div class="flex column q-pa-md">
      <TransactionInfo v-if="showTransactionInfo" :activity="activities[0]" />
      <div class="flex row no-wrap items-center" v-if="activitiesByVerb.create">
        <b
          >Added tag<span v-if="activitiesByVerb?.create?.length > 1"
            >s</span
          ></b
        >
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
          >Removed tag<span v-if="activitiesByVerb.delete?.length > 1"
            >s</span
          ></b
        >
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
interface Props {
  activities: Activity[];
  showTransactionInfo?: boolean;
}

const targetVerb = computed(() => {
  const targetVerb = props.activities[0].verb; // assuming the target activity is always last to be added in a transaction
  if (targetVerb === 'create') {
    return 'Added';
  } else if (targetVerb === 'update') {
    return 'Updated';
  } else if (targetVerb === 'delete') {
    return 'Removed';
  } else return 'Modified';
});
const props = withDefaults(defineProps<Props>(), {
  activities: null,
  showTransactionInfo: false,
});

const activitiesByVerb = computed(() => {
  return Object.groupBy(props.activities, (activity) => activity.verb);
});
</script>
