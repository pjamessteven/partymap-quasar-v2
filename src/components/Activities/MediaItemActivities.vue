<template>
  <q-card>
    <div class="flex column q-pa-md">
      <TransactionInfo v-if="showTransactionInfo" :activity="activities[0]" />
      <div class="flex column no-wrap" v-if="activitiesByVerb.create">
        <div class="flex row q-gutter-sm q-mt-md">
          <div
            v-for="(activity, index) in activitiesByVerb.create"
            class="media_thumb flex"
            :key="index"
          >
            <img
              v-if="activity.object_version"
              :src="activity.object_version.thumb_url"
              style="max-height: 200px"
            />
          </div>
        </div>
      </div>
      <div class="flex column no-wrap" v-if="activitiesByVerb?.update">
        <b>Modified these items:</b>
        <div class="flex row q-gutter-sm q-mt-md">
          <div
            v-for="(activity, index) in activitiesByVerb.update"
            class="media_thumb flex column"
            :key="index"
          >
            <img
              v-if="activity.object_version"
              :src="activity.object_version.thumb_url"
              style="max-height: 200px"
            />
            {{ activity.changeset }}
          </div>
        </div>
      </div>
    </div>
  </q-card>
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
