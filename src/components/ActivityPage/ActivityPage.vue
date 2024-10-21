<template>
  <SolidPage @scrollPercentage="scrollPercentage = $event">
    <template v-slot>
      <div class="flex column" style="width: 100%">
        <UserProfileSummary
          :user="currentUser"
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
              <q-tab
                name="you"
                no-caps
                :disabled="!currentUser"
                :style="!currentUser ? 'pointer-events: none' : ''"
              >
                <div class="text-large inter bold q-pa-sm">Your Feed</div>
              </q-tab>
              <q-tab name="all" no-caps>
                <div class="text-large inter bold q-pa-sm">All Activity</div>
              </q-tab>
            </q-tabs>
          </div>
          <q-separator />
          <ActivityView
            v-if="tab === 'all'"
            :scrollPercentage="scrollPercentage"
          />
          <div class="q-pa-lg" v-else>Coming soon!</div>
        </div>
      </div>
    </template>
  </SolidPage>
</template>

<script>
import common from 'assets/common';
import { mapState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
import SolidPage from 'src/components/dialogs/SolidPage.vue';
import UserProfileSummary from '../UserProfileSummary.vue';
import ActivityView from 'src/components/Activities/ActivityView.vue';
export default {
  name: 'UserPage',

  components: { SolidPage, UserProfileSummary, ActivityView },
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
      tab: 'all',
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
