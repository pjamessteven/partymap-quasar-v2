<template>
  <div v-if="onlyUserItems">
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
    <q-item
      v-if="currentUser && currentUser.role >= 30"
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
  </div>
  <div v-else-if="noUserItems">
    <q-item v-ripple @click="showAddEventDialog()" clickable class="q-mt-sm">
      <q-item-section avatar>
        <q-icon name="mdi-plus" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Submit Event</q-item-label>
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
      <q-toggle
        :model-value="darkMode"
        @click="$q.dark.toggle()"
        label="Dark Mode"
      />
    </q-item>
    <q-item v-if="$q.screen.lt.sm && false">
      <q-toggle v-model="disableAnimations" label="Animations" />
    </q-item>

    <q-separator inset class="q-mb-xs" />

    <q-item-label header class="q-pb-none">{{
      $t('top_controls.map_options')
    }}</q-item-label>
    <q-item>
      <q-select
        style="margin-top: -8px"
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
  <div v-else>
    <q-item
      class="q-mt-sm"
      clickable
      v-if="currentUser && $q.screen.lt.sm"
      v-on:click="
        $router.push({ name: 'UserPage', params: { id: currentUser.username } })
      "
    >
      <q-avatar
        size="32px"
        color="primary"
        :icon="currentUser?.avatar?.thumb_url ? undefined : 'las la-user'"
      >
        <img
          v-if="currentUser?.avatar?.thumb_url"
          :src="currentUser.avatar.thumb_url"
        />
      </q-avatar>

      <q-item-section>
        <div class="username inter bold text-large q-ml-md">
          {{ currentUser.username }}
        </div>
      </q-item-section>
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
      v-if="currentUser && currentUser.role >= 30"
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
      v-if="currentUser && currentUser.role >= 30"
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

    <q-item v-ripple @click="showAddEventDialog()" clickable>
      <q-item-section avatar>
        <q-icon name="mdi-plus" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Submit Event</q-item-label>
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
      <q-toggle
        :model-value="darkMode"
        @click="$q.dark.toggle()"
        label="Dark Mode"
      />
    </q-item>
    <q-item v-if="$q.screen.lt.sm && false">
      <q-toggle v-model="disableAnimations" label="Slow phone" />
    </q-item>

    <q-separator inset class="q-mb-xs" />

    <q-item-label header class="q-pb-none">{{
      $t('top_controls.map_options')
    }}</q-item-label>
    <q-item>
      <q-select
        style="margin-top: -8px"
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
  props: ['onlyUserItems', 'noUserItems'],
  components: { FeedbackDialog, AboutDialog },
  data() {
    return {
      logoutLoading: false,
      mobilePosterView: false,
      showFeedbackDialog: false,
      showAboutDialog: false,
      mapStyleOptions: [
        { label: this.$t('nav.satellite_map'), value: 'satellite' },
        { label: 'Monochrome', value: 'monochrome' },
        { label: 'Classic', value: 'classic' },
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
    darkMode() {
      return this.$q.dark.isActive;
    },
    route() {
      return this.$route;
    },
    ...mapState(useAuthStore, ['currentUser']),
    ...mapWritableState(useMainStore, [
      'compactView',
      'groupEventsByMonth',
      'disableAnimations',
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
