<template>
  <div class="history flex column grow">
    <div class="header flex column">
      <q-toolbar>
        <q-tabs
          v-model="tab"
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="left"
          no-caps
        >
          <q-tab name="activity" :label="$t('activity.activity')" />
          <q-tab
            name="suggestions"
            :label="$t('suggestions.suggestions')"
            v-if="currentUserIsStaff"
          />
          <q-tab
            name="versions"
            :label="$t('history.history')"
            v-if="currentUserIsStaff"
          />
          <q-tab name="contributors" :label="$t('contributors.contributors')" />
        </q-tabs>
        <q-space />
        <q-btn flat icon="mdi-close" @click="$emit('close')" />
      </q-toolbar>
      <q-separator />
    </div>

    <q-tab-panels v-model="tab">
      <q-tab-panel name="activity">
        <div class="text-h6">{{ $t('activity.all_activity') }}</div>
        <div class="t3 q-mb-md">{{ $t('activity.sorted_by_recent') }}</div>
        <div class="activity-container">
          <Activity
            v-for="(activity, index) in activities"
            :key="index"
            :activity="activity"
            :compact="false"
            class="q-mb-sm"
          />
          <div class="flex grow justify-center">
            <q-btn
              :label="$t('activity.load_more')"
              v-if="hasNext"
              icon="mdi-chevron-down"
              @click="loadMore"
              flat
            />
          </div>
          <q-inner-loading :showing="loading">
            <q-spinner-ios
              :color="$q.dark.isActive ? 'white' : 'black'"
              size="2em"
            />
          </q-inner-loading>
        </div>
      </q-tab-panel>

      <q-tab-panel name="suggestions">
        <div class="text-h6">{{ $t('suggestions.suggestions') }}</div>
        <div class="t3">
          {{ $t('suggestions.suggested_edits_submitted_by_users') }}
        </div>
        <SuggestionsBrowser class="suggestions-browser grow q-mt-md" />
      </q-tab-panel>

      <q-tab-panel name="versions">
        <div class="text-h6">{{ $t('activity.page_versions') }}</div>
        <div class="t3">{{ $t('activity.page_versions_message') }}</div>

        <VersionsBrowser class="versions-browser grow" />
      </q-tab-panel>

      <q-tab-panel name="contributors">
        <div class="text-h6">{{ $t('contributors.contributors') }}</div>
        <div class="t3">{{ $t('contributors.contributors_msg') }}</div>

        <ContributorsBrowser class="contributors-browser" />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>
import Activity from './Activity.vue';
import ContributorsBrowser from 'components/EventPage/Activity/ContributorsBrowser.vue';
import SuggestionsBrowser from 'components/EventPage/Activity/SuggestionsBrowser.vue';
import VersionsBrowser from 'components/EventPage/Activity/VersionsBrowser.vue';

import { mapState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
import { useEventStore } from 'src/stores/event';

import { getEventActivityRequest } from 'src/api';
export default {
  components: {
    VersionsBrowser,
    ContributorsBrowser,
    SuggestionsBrowser,
    Activity,
  },
  props: {},
  data() {
    return {
      tab: 'activity',
      activities: [],
      hasNext: false,
      page: 1,
      loading: false,
    };
  },
  methods: {
    loadMore() {
      this.page += 1;
      this.loading = true;
      getEventActivityRequest(this.event.id, {
        page: this.page,
        per_page: 10,
      }).then((response) => {
        this.loading = false;
        this.activities = [...this.activities, ...response.data.items];
        this.hasNext = response.data.has_next;
      });
    },
  },
  watch: {},
  computed: {
    ...mapState(useAuthStore, ['currentUser', 'currentUserIsStaff']),
    ...mapState(useEventStore, ['event']),
  },
  mounted() {
    this.loading = true;
    getEventActivityRequest(this.event.id, { page: 1, per_page: 10 }).then(
      (response) => {
        this.loading = false;
        this.activities = response.data.items;
        this.hasNext = response.data.has_next;
      }
    );
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .history {
    .header {
      background: $bi-2;
    }
  }
  .q-tab-panels {
    background: $bi-1;
  }
}

.body--light {
  .history {
    .header {
      background: $b-2;
    }
  }
  .q-tab-panels {
    background: $b-2;
  }
}

.history {
  .header {
    position: sticky;
    top: 0px;
    z-index: 1;
  }
  .activity-container {
    position: relative;
    min-height: 200px;
  }

  min-height: 100px;
}
@media only screen and (max-width: 1023px) {
  .card {
    margin-top: 0px;
    width: 100%;
    height: 100%;
  }
}
</style>
