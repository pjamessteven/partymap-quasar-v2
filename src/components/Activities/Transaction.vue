<template>
  <q-card>
    <div class="flex column q-pa-md">
      <div
        class="flew row items-center justify-between"
        @click="expanded = !expanded"
      >
        <div class="flex row">
          <RouterLink
            target="_blank"
            v-if="showUsername"
            class="link-hover q-mr-sm"
            :to="{
              name: 'UserPage',
              params: { username: transaction.username },
            }"
          >
            {{ transaction.username }}
          </RouterLink>

          <div>
            <b>
              {{ targetVerb }}
              <router-link
                v-if="transaction.target_type === 'Event'"
                style="text-decoration: none; color: inherit"
                target="_blank"
                class="link-hover"
                :to="{
                  name: 'EventPage',
                  params: {
                    id: transaction.target_version.id,
                  },
                  query: {
                    name: transaction.target_version.name.replace(/ /g, '_'),
                  },
                }"
                >{{ target }}</router-link
              >
              {{ common.timeAgo(transaction.issued_at) }}</b
            >
          </div>
          <div class="o-020 q-ml-md">#{{ transaction.transaction_id }}</div>
        </div>
        <q-btn
          flat
          :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click.stop="expanded = !expanded"
          class="t2"
        />
      </div>

      <div class="q-mt-md q-gutter-sm flex column" v-if="expanded">
        <TagActivities
          v-if="tagActivities?.length > 0"
          :activities="tagActivities"
        />
        <ArtistActivities
          v-if="artistActivities?.length > 0"
          :activities="artistActivities"
        />
        <MediaItemActivities
          v-if="mediaItemActivities?.length > 0"
          :activities="mediaItemActivities"
        />
        <div v-for="(activity, index) in filteredActivities" :key="index">
          <LocationActivity
            v-if="activity.object_type === 'EventLocation'"
            :activity="activity"
            :transaction="activity.transaction"
          />
          <EventDateActivity
            v-if="activity.object_type === 'EventDate'"
            :activity="activity"
            :transaction="activity.transaction"
          />
          <EventActivity
            v-if="activity.object_type === 'Event'"
            :activity="activity"
            :transaction="activity.transaction"
          />
          <EventReviewActivity
            v-if="activity.object_type === 'EventReview'"
            :activity="activity"
            :transaction="activity.transaction"
          />
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import Activity from './Activity.vue';
import { computed, ref } from 'vue';
import moment from 'moment-timezone';
import common from 'src/assets/common';
import TagActivities from './TagActivities.vue';
import ArtistActivities from './ArtistActivities.vue';
import LocationActivity from './LocationActivity.vue';
import EventDateActivity from './EventDateActivity.vue';
import EventReviewActivity from './EventReviewActivity.vue';
import EventActivity from './EventActivity.vue';
import MediaItemActivities from './MediaItemActivities.vue';
interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transaction: any;
  showUsername?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  transaction: null,
  showUsername: false,
});

const expanded = ref(false);
const targetVerb = computed(() => {
  const targetVerb = props.transaction.activities?.[0]?.verb; // assuming the target activity is always last to be added in a transaction
  if (targetVerb === 'create') {
    return 'Created';
  } else if (targetVerb === 'update') {
    return 'Updated';
  } else if (targetVerb === 'delete') {
    return 'Deleted';
  } else return 'Modified';
});

const target = computed(() => {
  const targetTyoe = props.transaction.target_type;
  const objectType = props.transaction.activities?.[0]?.object_type;
  if (objectType === 'EventReview') {
    const eventName = props.transaction.target_version.name;
    return 'a review for ' + eventName;
  }
  if (targetTyoe === 'Event') {
    const eventName = props.transaction.target_version.name;
    return 'the event page for ' + eventName;
  } else if (targetTyoe === 'Artist') {
    // TODO
    return 'Artist';
  } else return 'Unknown';
});

const filteredActivities = computed(() => {
  // activities where the object_version doesn't match this transaction aren't relevant
  return props.transaction?.activities.filter(
    (x) => x.object_version.transaction_id === props.transaction.transaction_id
  );
});

const activitiesByVerb = computed(() => {
  return Object.groupBy(
    props.transaction.activities,
    (activity) => activity.verb
  );
});

const tagActivities = computed(() => {
  return props.transaction.activities.filter(
    (x) => x.object_type === 'EventTag'
  );
});

const artistActivities = computed(() => {
  return props.transaction.activities.filter(
    (x) => x.object_type === 'EventDateArtist'
  );
});

const mediaItemActivities = computed(() => {
  return props.transaction.activities.filter(
    (x) => x.object_type === 'MediaItem'
  );
});
const locationActivities = computed(() => {
  return props.transaction.activities.filter(
    (x) => x.object_type === 'EventLocation'
  );
});

const eventActivities = computed(() => {
  return props.transaction.activities.filter((x) => x.object_type === 'Event');
});

const eventDateActivities = computed(() => {
  return props.transaction.activities.filter((x) => x.object_type === 'Event');
});

const loading = ref(false);
</script>
