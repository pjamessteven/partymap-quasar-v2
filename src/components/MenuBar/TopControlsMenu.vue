<template>
  <div class="top-controls inter">
    <div>
      <q-item
        class="q-mt-sm"
        clickable
        v-if="currentUser && $q.screen.lt.sm"
        v-on:click="
          $router.push({
            name: 'UserPage',
            params: { id: currentUser.username },
          })
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

      <q-separator
        inset
        class="q-mt-sm"
        v-if="currentUser && $q.screen.lt.sm"
      />

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
      <q-item v-ripple @click="showAddEventDialog()" clickable>
        <q-item-section avatar>
          <q-icon name="mdi-plus" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ $t('top_controls.submit_event') }}</q-item-label>
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
        v-ripple
        v-on:click="$router.push({ name: 'ActivityPage' })"
        clickable
      >
        <q-item-section avatar>
          <q-icon name="mdi-format-list-bulleted" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ $t('top_controls.all_activity') }}</q-item-label>
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

      <div class="flex row items-center">
        <q-icon name="las la-adjust" size="sm" class="q-ml-md" />
        <div class="flex column grow">
          <q-item-label header class="q-pb-none" style="margin-top: -4px">{{
            $t('top_controls.dark_mode')
          }}</q-item-label>
          <q-item style="margin-top: -16px; margin-bottom: -8px">
            <q-select
              borderless
              dense
              behavior="menu"
              class="flex grow"
              :model-value="darkMode"
              :options="darkModeOptions"
              emit-value
              @update:model-value="setDarkMode"
              square
              map-options
            />
          </q-item>
        </div>
      </div>

      <q-separator inset class="q-my-none" />

      <div class="flex row items-center no-wrap">
        <q-icon name="las la-map" size="sm" class="q-ml-md" />
        <div class="flex column grow">
          <q-item-label header class="q-pb-none" style="margin-top: -4px">{{
            $t('top_controls.map_options')
          }}</q-item-label>
          <q-item style="margin-top: -16px; margin-bottom: -8px">
            <q-select
              borderless
              dense
              behavior="menu"
              class="flex grow"
              v-model="mapStyle"
              :options="mapStyleOptions"
              emit-value
              square
              map-options
            />
          </q-item>
        </div>
      </div>
      <q-separator inset class="q-my-none" />

      <div class="flex row items-center no-wrap">
        <q-icon name="las la-language" size="sm" class="q-ml-md" />
        <div class="flex column grow">
          <q-item-label header class="q-pb-none" style="margin-top: -4px">{{
            $t('top_controls.lang_options')
          }}</q-item-label>

          <q-item style="margin-top: -16px">
            <q-select
              borderless
              dense
              behavior="menu"
              class="flex grow"
              :model-value="currentLanguage"
              @update:model-value="setLanguage"
              :options="localeOptions"
              emit-value
              square
              map-options
            />
          </q-item>
        </div>
      </div>
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
import { i18n, setI18nLanguage, loadLocaleMessages } from 'src/boot/i18n.ts';
import { supportedLocales } from 'src/i18n/index.mjs';
export default {
  name: 'TopControlsMenu',
  components: { FeedbackDialog, AboutDialog },
  data() {
    return {
      logoutLoading: false,
      mobilePosterView: false,
      showFeedbackDialog: false,
      showAboutDialog: false,
      darkModeOptions: [
        { label: this.$t('top_controls.auto'), value: 'auto' },

        { label: this.$t('top_controls.on'), value: true },
        { label: this.$t('top_controls.off'), value: false },
      ],
      mapStyleOptions: [
        { label: this.$t('nav.satellite_map'), value: 'satellite' },
        { label: 'Monochrome', value: 'monochrome' },
        { label: 'Classic', value: 'classic' },
      ],
      localeOptions: Object.values(supportedLocales),
    };
  },
  methods: {
    ...mapActions(useMainStore, ['setLocale']),
    async setLanguage(lang) {
      await this.loadLocaleMessages(i18n, lang);
      this.setI18nLanguage(i18n, lang);
      this.setLocale(lang);
      this.languagePref = lang;
      this.$router.replace({
        ...this.$route,
        params: { lang },
      });
    },
    setDarkMode(value) {
      // persist user preference in store
      // (restored on mount in App.vue)
      this.darkModePref = value;
      this.$q.dark.set(value);
    },
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
    currentLanguage() {
      return i18n.global.locale.value;
    },
    darkMode() {
      return this.$q.dark.mode;
    },
    route() {
      return this.$route;
    },
    ...mapState(useAuthStore, ['currentUser']),
    ...mapWritableState(useMainStore, [
      'compactView',
      'groupEventsByMonth',
      'disableAnimations',
      'languagePref',
      'darkModePref',
    ]),
    ...mapWritableState(useMapStore, ['mapStyle']),
  },
  beforeMount() {
    if (!this.compactView && !this.groupEventsByMonth) {
      this.mobilePosterView = true;
    }
  },
  created() {
    this.setI18nLanguage = setI18nLanguage;
    this.loadLocaleMessages = loadLocaleMessages;
    this.supportedLocales = supportedLocales;
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

.top-controls {
  min-width: 180px;
}
@media only screen and (max-width: 1023px) {
}
</style>
