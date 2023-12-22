<template>
  <div>
    <q-item
      class="q-mt-sm"
      clickable
      v-if="currentUser && $q.screen.lt.sm"
      v-on:click="
        $router.push({ name: 'UserPage', params: { id: currentUser.username } })
      "
    >
      <div class="flex row items-center align-center no-wrap">
        <q-avatar size="48px" color="primary" icon="las la-user"> </q-avatar>

        <div class="username text-subtitle1 q-ml-md">
          {{ currentUser.username }}
        </div>
      </div>
    </q-item>

    <q-separator inset class="q-mt-sm" v-if="currentUser && $q.screen.lt.sm" />

    <q-item
      v-if="!currentUser"
      class="q-mt-sm -item"
      v-ripple
      v-on:click="
        $router.push({
          path: '/login',
          query: { from: $route.path },
        })
      "
      clickable
    >
      <q-item-section avatar>
        <q-icon name="las la-sign-in-alt" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ $t('sidebar.login') }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      v-if="currentUser"
      class="q-mt-sm"
      v-ripple
      v-on:click="handleLogout"
      clickable
    >
      <q-item-section avatar>
        <q-icon name="mdi-logout-variant" v-if="!logoutLoading" />
        <q-spinner-ios
          v-else
          size="1.5rem"
          :color="$q.dark.isActive ? 'white' : 'black'"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ $t('sidebar.logout') }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      v-if="currentUser && currentUser.role >= 20"
      v-ripple
      v-on:click="$router.push({ name: 'AdminPage' })"
      clickable
    >
      <q-item-section avatar>
        <q-icon name="mdi-shield-account-outline" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Administration</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      v-if="currentUser && currentUser.role >= 20"
      v-ripple
      v-on:click="$router.push({ name: 'WorkQueuePage' })"
      clickable
    >
      <q-item-section avatar>
        <q-icon name="mdi-format-list-bulleted" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Work Queue</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      v-if="currentUser"
      v-ripple
      v-on:click="$router.push({ name: 'ManageAccount' })"
      clickable
    >
      <q-item-section avatar>
        <q-icon name="las la-cog" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ $t('sidebar.my_account') }}</q-item-label>
      </q-item-section>
    </q-item>
    <!--
    <q-item
      v-ripple
      v-on:click="
        $router.push({ name: 'UserPage', params: { id: currentUser.username } })
      "
      clickable
      v-if="currentUser"
    >
      <q-item-section avatar>
        <q-icon name="las la-user" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ $t('sidebar.profile') }}</q-item-label>
      </q-item-section>
    </q-item>
-->
    <q-item v-ripple @click="showAddEventDialog()" clickable>
      <q-item-section avatar>
        <q-icon name="mdi-shape-square-plus" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Add event</q-item-label>
      </q-item-section>
    </q-item>

    <q-separator inset class="q-my-sm" />

    <q-item v-ripple v-on:click="showAboutDialog = true" clickable>
      <q-item-section avatar>
        <q-icon name="las la-hand-peace" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ $t('sidebar.about') }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-item v-ripple v-on:click="showFeedbackDialog = true" clickable>
      <q-item-section avatar>
        <q-icon name="las la-comment" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ $t('feedback.give_feedback') }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-separator inset class="q-mt-sm q-mb-none" />

    <q-item>
      <q-toggle v-model="darkMode" label="Dark Mode" />
    </q-item>
    <q-item v-if="$q.screen.lt.sm">
      <q-toggle v-model="mobilePosterView" label="Grid View" />
    </q-item>

    <q-separator inset class="q-mb-xs" />

    <q-item-label header class="q-pb-none">{{
      $t('top_controls.map_options')
    }}</q-item-label>
    <q-item>
      <q-select
        borderless
        behavior="menu"
        class="flex grow"
        v-model="mapStyle"
        :options="mapStyleOptions"
        emit-value
        square
        map-options
      />
    </q-item>

    <q-dialog
      v-model="showFeedbackDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <FeedbackDialog @closeDialog="showFeedbackDialog = false" />
    </q-dialog>
    <q-dialog
      v-model="showAboutDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <AboutDialog />
    </q-dialog>
  </div>
</template>
<script>
import FeedbackDialog from 'components/dialogs/FeedbackDialog.vue';
import AboutDialog from 'components/dialogs/AboutDialog/AboutDialog.vue';
import AddEventDialog from 'components/dialogs/AddEventDialog.vue';
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
import { useMainStore } from 'src/stores/main';
import { useMapStore } from 'src/stores/map';

export default {
  name: 'TopControlsMenu',
  components: { FeedbackDialog, AboutDialog },
  data() {
    return {
      logoutLoading: false,
      mobilePosterView: false,
      showFeedbackDialog: false,
      showAboutDialog: false,
      mapStyleOptions: [
        { label: this.$t('nav.satellite_map'), value: 'satellite' },
        { label: this.$t('nav.transport_map'), value: 'transport' },
      ],
    };
  },
  methods: {
    ...mapActions(useAuthStore, ['logout']),
    async handleLogout() {
      this.logoutLoading = true;
      await this.logout();
      this.logoutLoading = false;
    },
    showAddEventDialog() {
      this.$q
        .dialog({
          parent: this,
          component: AddEventDialog,
        })
        .onOk((data) => {
          if (!this.currentUser && data.host) {
            this.$router.push({ name: 'Login' });
          } else if (data.host) {
            this.$router.push({
              name: 'AddEventHost',
            });
          } else {
            this.$router.push({
              name: 'AddEventPublic',
            });
          }
        });
    },
  },
  watch: {
    mobilePosterView(newv, oldv) {
      if (newv) {
        this.compactView = false;
        this.groupEventsByMonth = false;
      } else {
        this.compactView = true;
        this.groupEventsByMonth = true;
      }
    },
    route() {
      this.showAboutDialog = false;
      this.showFeedbackDialog = false;
    },
  },
  computed: {
    route() {
      return this.$route;
    },
    ...mapState(useAuthStore, ['currentUser']),
    ...mapWritableState(useMainStore, [
      'darkMode',
      'compactView',
      'groupEventsByMonth',
    ]),
    ...mapWritableState(useMapStore, ['mapStyle']),
  },
  beforeMount() {
    if (!this.compactView && !this.groupEventsByMonth) {
      this.mobilePosterView = true;
    }
  },
};
</script>

<style lang="scss" scoped>
.username {
  white-space: nowrap;
}

.q-item__label {
  white-space: nowrap;
}

@media only screen and (max-width: 1023px) {
}
</style>
