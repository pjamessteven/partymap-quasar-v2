<template>
  <li>
    <div class="flex column q-pa-md">
      <TransactionInfo v-if="showTransactionInfo" :activity="activities[0]" />
      <div class="flex column no-wrap" v-if="activitiesByVerb.create">
        <b>{{ t('activity.added_media') }}:</b>

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
        <b>{{ t('activity.modified_items') }}:</b>
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
  </li>
</template>

<script setup lang="ts">
import { Activity } from 'src/types/autogen_types';
import { computed, ref } from 'vue';
import TransactionInfo from './TransactionInfo.vue';

import { useI18n } from 'vue-i18n';

const { t } = useI18n();
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
