<template>
  <li>
    <div class="flex column q-pa-md">
      <TransactionInfo v-if="showTransactionInfo" :activity="activity" />

      <div v-if="showTransactionInfo">
        <b>{{ verb }}</b
        >:
        <p />
      </div>
      <div>
        {{ activity.object_version.text }}
      </div>
      <q-rating
        v-if="activity.object_version.rating !== 0"
        :model-value="activity.object_version.rating"
        size="1rem"
        :max="5"
        readonly
        color="primary"
        class="q-my-sm"
      />
    </div>
  </li>
</template>

<script setup lang="ts">
import { Activity } from 'src/types/autogen_types';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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
    return t('activity.create');
  } else if (verb === 'update') {
    return t('activity.update');
  } else return verb;
});

const loading = ref(false);
</script>
