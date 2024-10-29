<template>
  <li>
    <div class="flex column q-pa-md">
      <TransactionInfo v-if="showTransactionInfo" :activity="activities[0]" />
      <div class="flex column no-wrap" v-if="activitiesByVerb.create">
        <div>
          <b
            >Added artist<span v-if="activitiesByVerb?.create?.length > 1"
              >s</span
            >
            to the lineup for the date
            <router-link
              v-if="
                activities[0]?.target_version?.event_id &&
                activities[0]?.target_version?.id
              "
              target="_blank"
              class="link-hover"
              style="text-decoration: none; color: inherit"
              :to="{
                name: 'EventPage',
                params: {
                  id: activities[0].target_version.event_id,
                  eventDateId: activities[0].target_version.id,
                },
              }"
              >{{
                common.localDateWithWeekday(
                  activities[0].target_version.start_naive
                )
              }}</router-link
            ></b
          >:
        </div>
        <div
          class="flex column no-wrap q-mt-sm"
          v-for="(activity, index) in activitiesByVerb?.create"
          :key="index"
        >
          <q-separator v-if="index > 0" />
          <ArtistListItem :artist="activity.object_version" />
        </div>
      </div>
      <div class="flex column no-wrap q-mt-sm" v-if="activitiesByVerb?.delete">
        <div>
          Removed artist<span v-if="activitiesByVerb.delete?.length > 1"
            >s</span
          >
          from the lineup
        </div>
        <div
          class="flex column no-wrap q-mt-sm"
          v-for="(activity, index) in activitiesByVerb?.delete"
          :key="index"
        >
          <q-separator v-if="index > 0" />
          <ArtistListItem :artist="activity.object_version" />
        </div>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import ArtistListItem from 'src/components/EventPage/EventDates/Artists/ArtistListItem.vue';

import { Activity } from 'src/types/autogen_types';
import { computed, ref } from 'vue';
import TransactionInfo from './TransactionInfo.vue';
import TagComponent from '../TagComponent.vue';
import common from 'src/assets/common';

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
