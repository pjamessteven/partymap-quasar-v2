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
          <div :class="$q.screen.lt.sm && 'q-px-md'" style="width: 100%">
            <q-tabs
              v-model="tab"
              dense
              align="left"
              :breakpoint="0"
              style="width: 100%"
            >
              <q-tab name="events" no-caps>
                <div class="text-large inter bold q-pa-sm">Events</div>
              </q-tab>
              <q-tab name="activity" no-caps>
                <div class="text-large inter bold q-pa-sm">Activity</div>
              </q-tab>
              <q-tab name="following" no-caps>
                <div class="text-large inter bold q-pa-sm">Following</div>
              </q-tab>
              <q-tab name="followers" no-caps>
                <div class="text-large inter bold q-pa-sm">Followers</div>
              </q-tab>
            </q-tabs>
          </div>
          <q-separator />
        </div>

        <UserEventsView
          v-if="tab === 'events'"
          :scrollPercentage="scrollPercentage"
          :username="username"
        />
        <ActivityView
          v-else-if="tab === 'activity'"
          :username="username"
          :scrollPercentage="scrollPercentage"
        />
        <div class="q-pa-lg" v-else>Coming soon!</div>
      </div>
    </template>
  </SolidPage>
</template>

<script>
import common from 'assets/common';
import { mapState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
import SolidPage from 'src/components/dialogs/SolidPage.vue';
import UserEventsView from './UserEventsView.vue';
import UserProfile from './UserProfile.vue';
import ActivityView from 'src/components/Activities/ActivityView.vue';
import { getUserRequest, getUserFullProfileRequest } from 'src/api';
export default {
  name: 'UserPage',

  components: { SolidPage, UserEventsView, UserProfile, ActivityView },
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
