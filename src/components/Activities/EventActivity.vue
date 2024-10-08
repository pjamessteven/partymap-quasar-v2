<template>
  <q-card v-if="Object.keys(computedChangeSet).length > 0">
    <div class="flex column q-pa-md">
      <TransactionInfo v-if="showTransactionInfo" :activity="activity" />

      <div>
        <div
          v-for="(change, index) in Object.keys(computedChangeSet)"
          :key="index"
        >
          <b>{{ change }}:</b> {{ computedChangeSet[change][1] }}
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { Activity } from 'src/types/autogen_types';
import { computed, ref } from 'vue';
import common from 'src/assets/common';

const ignored_changesets = [
  'start',
  'end',
  'event',
  'event_id',
  'id',
  'created_at',
  'updated_at',
  'creator_id',
  'tag_id',
  'thumb_filename',
  'type',
  'location', // shows in object_versions, location_id is universal so is used instead
  'changeset',
  'end_transaction_id',
  'previous',
  'transaction_id',
  'location_id',
  'transaction',
  'index',
  'rrule_id',
  'day_of_month',
  'day_of_week',
  'month_of_year',
  'recurring_type',
  'week_of_month',
  'separation_count',
];

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
    return 'Updated info';
  } else if (verb === 'delete') {
    return 'Deleted';
  } else return verb;
});

const computedChangeSet = computed(() => {
  let changeset = Object.keys(props.activity.changeset)
    .filter((key) => ignored_changesets.indexOf(key) === -1)
    .reduce((cur, key) => {
      return Object.assign(cur, { [key]: props.activity.changeset[key] });
    }, {});

  if (changeset['start_naive']) {
    if (changeset['start_naive'][0]) {
      changeset['start_naive'][0] = common.localDateTimeLong(
        changeset['start_naive'][0]
      );
    }
    if (changeset['start_naive'][1]) {
      changeset['start_naive'][1] = common.localDateTimeLong(
        changeset['start_naive'][1]
      );
    }
  }
  if (changeset['end_naive']) {
    if (changeset['end_naive'][0]) {
      changeset['end_naive'][0] = common.localDateTimeLong(
        changeset['end_naive'][0]
      );
    }
    if (changeset['end_naive'][1]) {
      changeset['end_naive'][1] = common.localDateTimeLong(
        changeset['end_naive'][1]
      );
    }
  }

  return changeset;
});

const loading = ref(false);
</script>
