<template>
  <q-card>
    <div class="flex column q-pa-md">
      <TransactionInfo v-if="showTransactionInfo" :activity="activity" />

      <div class="q-mt-md">
        {{ activity.changeset }}
      </div>
    </div>
  </q-card>
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
    return 'Created';
  } else if (verb === 'update') {
    return 'Updated';
  } else if (verb === 'delete') {
    return 'Deleted';
  } else return verb;
});

const target = computed(() => {
  const objectType = props.activity.object_type;
  if (objectType === 'Event') {
    const eventName = props.activity.object_version.name;
    return 'the event page for ' + eventName;
  } else if (objectType === 'EventDate') {
    const eventName = props.activity.object_version.name;
    return 'a date for ' + eventName;
  } else return 'Unknown';
});

const loading = ref(false);
</script>
