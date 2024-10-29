<template>
  <li>
    <div class="flex column q-pa-md">
      <TransactionInfo v-if="showTransactionInfo" :activity="activity" />

      <div>
        <b
          >{{ verb }} the location for the date
          <router-link
            v-if="
              activity.target_version?.event_id && activity.target_version?.id
            "
            target="_blank"
            class="link-hover"
            style="text-decoration: none; color: inherit"
            :to="{
              name: 'EventPage',
              params: {
                id: activity.target_version.event_id,
                eventDateId: activity.target_version.id,
              },
            }"
            >{{
              common.localDateWithWeekday(activity.target_version.start_naive)
            }}</router-link
          ></b
        >:
        <p />
        {{ activity.object_version.description }}
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import { Activity } from 'src/types/autogen_types';
import { computed, ref } from 'vue';

import common from 'src/assets/common';
interface Props {
  activity: Activity;
  showTransactionInfo?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  activity: null,
  showTransactionInfo: false,
});

const verb = computed(() => {
  const verb = props.activity.verb;
  if (verb === 'create') {
    return 'Set';
  } else if (verb === 'update') {
    return 'Changed';
  } else if (verb === 'delete') {
    return 'Deleted';
  } else return verb;
});

const loading = ref(false);
</script>
