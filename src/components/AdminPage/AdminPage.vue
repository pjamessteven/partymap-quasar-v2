<template>
  <SolidPage @scrollPercentage="scrollPercentage = $event">
    <template v-slot>
      <div class="flex column" style="width: 100%">
        <UserProfile
          :username="username"
          :class="{
            'q-mt-lg q-mb-lg q-px-md': $q.screen.gt.xs,
            'q-mx-sm  q-my-md q-mb-md': $q.screen.lt.sm,
          }"
        />
        <div
          class="flex column"
          :class="$q.screen.gt.xs && 'q-px-md'"
          style="width: 100%"
        >
          <div :class="$q.screen.lt.md && 'q-px-md'" style="width: 100%">
            <q-tabs
              v-model="tab"
              dense
              align="left"
              :breakpoint="0"
              style="width: 100%"
            >
              <q-tab name="activity" no-caps>
                <div class="text-large inter bold q-pa-sm">Activity</div>
              </q-tab>
              <q-tab name="events" no-caps>
                <div class="text-large inter bold q-pa-sm">Events</div>
              </q-tab>
              <q-tab name="artists" no-caps>
                <div class="text-large inter bold q-pa-sm">Artists</div>
              </q-tab>
              <q-tab name="suggestions" no-caps>
                <div class="text-large inter bold q-pa-sm">Suggestions</div>
              </q-tab>
              <q-tab name="reports" no-caps>
                <div class="text-large inter bold q-pa-sm">Reports</div>
              </q-tab>
              <q-tab name="event-dates" no-caps>
                <div class="text-large inter bold q-pa-sm">Event Dates</div>
              </q-tab>
            </q-tabs>
          </div>
          <q-separator />
        </div>

        <ActivityView
          v-if="tab === 'activity'"
          :scrollPercentage="scrollPercentage"
        />
        <ManageArtistsComponent v-if="tab === 'artists'" class="q-mt-lg" />
        <PendingEventsComponent v-if="tab === 'events'" class="q-mt-lg" />
        <PendingReportsComponent v-if="tab === 'reports'" class="q-mt-lg" />
        <PendingSuggestionsComponent
          v-if="tab === 'suggestions'"
          class="q-mt-lg q-mb-xl"
        />
        <PendingEventDatesComponent
          v-if="tab === 'event-dates'"
          class="q-mt-lg"
        />
      </div>
    </template>
  </SolidPage>
</template>

<script>
import common from 'assets/common';
import { mapState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
import SolidPage from 'src/components/dialogs/SolidPage.vue';
import ActivityView from 'src/components/Activities/ActivityView.vue';
import PendingEventsComponent from './PendingEventsComponent.vue';
import PendingReportsComponent from './PendingReportsComponent.vue';
import PendingSuggestionsComponent from './PendingSuggestionsComponent.vue';
import ManageArtistsComponent from './ManageArtistsComponent.vue';
import PendingEventDatesComponent from './PendingEventDatesComponent.vue';
export default {
  name: 'UserPage',
  components: {
    SolidPage,
    ActivityView,
    PendingEventsComponent,
    PendingReportsComponent,
    PendingSuggestionsComponent,
    ManageArtistsComponent,
    PendingEventDatesComponent,
  },
  props: {
    username: {
      default: null,
    },
  },
  data() {
    return {
      scrollPercentage: 0,
      user: null,
      loading: false,
      tab: 'events',
    };
  },
  mounted() {
    // load user activities
    /*
    this.loading = true;
    if (this.currentUser && this.currentUser.role >= 20) {
      // get full profile if admin
      getUserFullProfileRequest(this.id).then((response) => {
        this.user = response.data;
        this.loading = false;
      });
    } else {
      getUserRequest(this.id).then((response) => {
        this.user = response.data;
        this.loading = false;
      });
    }*/
  },
  methods: {},
  watch: {},
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
  },
  created() {
    this.timeAgo = common.timeAgo;
    this.dateUTCToLocal = common.dateUTCToLocal;
  },
};
</script>

<style lang="scss" scoped>
.solid-page {
  :deep(.solid-page-content) {
    padding: 0px !important;
  }
}
.body--dark {
}

.body--light {
}
</style>
