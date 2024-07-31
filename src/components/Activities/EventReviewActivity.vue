<template>
  <q-card>
    <div class="flex column q-pa-md">
      <TransactionInfo v-if="showTransactionInfo" :activity="activity" />

      <div v-if="showTransactionInfo">
        <b>{{ verb }} a review </b>:
        <p />
      </div>
      <div>
        {{ activity.object_version.text }}
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
    return 'Created ';
  } else if (verb === 'update') {
    return 'Changed ';
  } else if (verb === 'delete') {
    return 'Deleted ';
  } else return verb;
});

const loading = ref(false);
</script>
