<template>
  <li>
    <div class="flex column q-pa-md">
      <div>
        <b>
          {{ verb }}
          <router-link
            v-if="
              activity.object_version?.event_id && activity.object_version?.id
            "
            target="_blank"
            class="link-hover"
            style="text-decoration: none; color: inherit"
            :to="{
              name: 'EventPage',
              params: {
                id: activity.object_version.event_id,
                eventDateId: activity.object_version.id,
              },
            }"
            ><u>{{
              common.localDateTimeLong(activity.object_version.start_naive)
            }}</u></router-link
          ></b
        >:
        <p />

        <ul>
          <li
            v-for="(change, index) in Object.keys(computedChangeSet)"
            :key="index"
          >
            <span v-if="change == 'cancelled'"
              >Marked this date as cancelled</span
            >
            <span v-else>
              <b style="text-transform: capitalize">{{ change }}:</b>
              {{ computedChangeSet[change][1] }}</span
            >
          </li>
        </ul>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import { Activity } from 'src/types/autogen_types';
import { computed, ref } from 'vue';
import common from 'src/assets/common';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const ignored_changesets = computed(() => {
  let ignored = [
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
    'day_of_month',
    'day_of_week',
    'month_of_year',
    'recurring_type',
    'week_of_month',
    'separation_count',
  ];

  const changeset = props.activity.changeset;

  if ('cancelled' in changeset) {
    if (
      changeset['cancelled'][0] === null &&
      changeset['cancelled'][1] === false
    ) {
      // ignore initial false cancelled value on event date create
      ignored.push('cancelled');
    }
    ignored.push('date_confirmed');
  }

  return ignored;
});

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
    return t('activitiy.created_date');
  } else if (verb === 'update') {
    return t('activitiy.updated_date');
  } else if (verb === 'delete') {
    return t('activitiy.deleted_date');
  } else return verb;
});

const computedChangeSet = computed(() => {
  let changeset = Object.keys(props.activity.changeset)
    .filter((key) => ignored_changesets.value.indexOf(key) === -1)
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
    changeset['Start Date'] = changeset['start_naive'];
    delete changeset['start_naive'];
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
    changeset['End Date'] = changeset['end_naive'];
    delete changeset['end_naive'];
  }
  if (changeset['tz']) {
    changeset['Timezone'] = changeset['tz'];
    delete changeset['tz'];
  }

  return changeset;
});

const loading = ref(false);
</script>
