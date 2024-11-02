<template>
  <q-card v-if="filteredActivities.length > 0" flat>
    <div class="flex column q-pa-md">
      <div
        class="flew row items-center no-wrap justify-between"
        @click="expanded = !expanded"
      >
        <div v-if="false">
          {{
            props.transaction.activities.map((x) => ({
              object: x.object_type,
              target: x.target_type,
              verb: x.verb,
            }))
          }}
        </div>

        <div class="flex column">
          <div class="flex row">
            <div>
              <RouterLink
                target="_blank"
                v-if="showUsername"
                class="link-hover q-mr-sm"
                :to="{
                  name: 'UserPage',
                  params: { username: transaction.username },
                }"
              >
                @{{ transaction.username }}
              </RouterLink>
              <b>
                {{ actionText }}
                <u>
                  <router-link
                    v-if="isCreateEvent || isUpdateEvent || isCreateReview"
                    style="text-decoration: none; color: inherit"
                    target="_blank"
                    class="link-hover"
                    :to="{
                      name: 'EventPage',
                      params: {
                        id: targetEvent.id,
                      },
                      query: {
                        name: targetEvent?.name.replace(/ /g, '_'),
                      },
                    }"
                    >{{ targetEvent?.name }}</router-link
                  ></u
                >
              </b>
            </div>
          </div>
          <div class="o-040">
            #{{ transaction.transaction_id }} -
            {{ common.timeAgo(transaction.issued_at) }}
          </div>
        </div>
        <q-btn
          v-if="showDropDown"
          flat
          :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click.stop="expanded = !expanded"
          class="t2"
        />
      </div>

      <div class="q-mt-md q-gutter-sm flex column" v-if="expanded">
        <ul>
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
            <!--<TransactionInfo v-if="showTransactionInfo" :activity="activity" /> -->
            <EventActivity
              v-if="activity.object_type === 'Event'"
              :activity="activity"
              :transaction="activity.transaction"
            />
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

            <EventReviewActivity
              v-if="activity.object_type === 'EventReview'"
              :activity="activity"
              :transaction="activity.transaction"
            />
          </div>
        </ul>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import common from 'src/assets/common';
import TagActivities from './TagActivities.vue';
import ArtistActivities from './ArtistActivities.vue';
import LocationActivity from './LocationActivity.vue';
import EventDateActivity from './EventDateActivity.vue';
import EventReviewActivity from './EventReviewActivity.vue';
import EventActivity from './EventActivity.vue';
import MediaItemActivities from './MediaItemActivities.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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

const isCreateEvent = computed(
  () =>
    props.transaction.activities.findIndex(
      (x) => x.object_type === 'Event' && x.verb === 'create'
    ) > -1
);

const isUpdateEvent = computed(
  () =>
    props.transaction.activities.findIndex(
      (x) => x.target_type === 'Event' && x.verb === 'update'
    ) > -1
);

const isCreateReview = computed(
  () =>
    props.transaction.activities.findIndex(
      (x) => x.object_type === 'EventReview' && x.verb === 'create'
    ) > -1
);

const isApprovedEvent = computed(() => {
  const changeset = eventActivities.value?.[0]?.object_version.changeset;
  if (changeset && 'hidden' in changeset) {
    if (changeset['hidden'][0] === true && changeset['hidden'][1] === false) {
      // ignore initial false cancelled value on event date create
      return true;
    }
  }
  return false;
});

const showDropDown = computed(() => {
  return !isApprovedEvent.value;
});
const targetEvent = computed(
  () =>
    props.transaction.activities?.find((x) => x.target_type === 'Event')
      ?.target_version
);

const actionText = computed(() => {
  if (isCreateEvent.value) {
    return;
  } else if (isApprovedEvent.value) {
    return t('activity.approved_event');
  } else if (isUpdateEvent.value) {
    return t('activity.updated_event');
  } else if (isCreateReview.value) {
    return t('activity.reviewed_event');
  } else {
    return t('activity.did_something');
  }
});

const filteredActivities = computed(() => {
  // activities where the object_version doesn't match this transaction aren't relevant
  return props.transaction?.activities.filter(
    (x) => x.object_version?.transaction_id === props.transaction.transaction_id
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
