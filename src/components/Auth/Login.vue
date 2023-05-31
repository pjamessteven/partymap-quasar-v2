<template>
  <div class="dialog-page" v-on:click.self="$router.go(-1)">
    <q-card :bordered="$q.screen.gt.sm" class="auth-card">
      <q-card-section
        class="flex column justify-stretch q-px-xl q-pb-sm q-pt-xl"
        :class="$q.screen.gt.xs ? '' : ''"
      >
        <div
          class="header t1 inter bolder text-h6 q-mb-xl"
          style="text-align: center"
        >
          It's party time.
        </div>
        <q-input
          ref="login"
          class=""
          outlined
          filled
          v-bind:label="$t('auth.identifier')"
          v-model="identifier"
          @keyup.enter="_login"
        />
        <q-input
          outlined
          filled
          class="q-mt-md"
          type="password"
          v-bind:label="$t('auth.password')"
          v-model="password"
          @keyup.enter="_login"
        />
        <div class="flex row grow justify-end items-center q-mt-lg">
          <q-btn
            size="medium"
            color="primary"
            no-caps
            class="soft-button-shadow q-mb-md t1 inter bold text-large"
            v-bind:label="$t('auth.login')"
            type="a"
            @click="_login"
          />
          <!--
          <div class="link-hover t2 text-large" @click="login">
            {{ $t('auth.login') }}
            <q-icon right name="mdi-chevron-right" />
          </div>
        --></div>
      </q-card-section>

      <q-card-section
        class="flex column justify-center items-end q-pt-xs q-px-lg q-pb-lg bottom-section"
      >
        <!--
        <q-btn
          style="background: #1877f2"
          text-color="white"
          no-caps
          class="soft-button-shadow"
          icon="mdi-facebook"
          v-bind:label="$t('auth.log_in_with_facebook')"
          type="a"
          :href="facebookLoginUrl"
        />

        <div class="q-pt-md name-not-visible-text t4">
          {{ $t('auth.real_name_not_visible') }}
          <br />
          {{ $t('auth.only_save_email') }}
        </div>
      -->

        <div class="separator" />
        <div class="flex column items-end">
          <q-btn
            class="q-mt-md t2"
            unelevated
            no-caps
            size="md"
            icon-right="mdi-chevron-right"
            v-bind:label="$t('auth.sign_up_for_account')"
            @click="$router.push({ name: 'Register' })"
          />

          <q-btn
            class="t2"
            unelevated
            no-caps
            size="md"
            icon-right="mdi-chevron-right"
            label="Forgot password?"
            @click="$router.push({ name: 'ForgotPassword' })"
          />
        </div>
        <div class="separator q-mt-md" />

        <div class="t4 q-mt-md" style="text-align: center">
          We take privacy very seriously and we will never share or sell your
          information.
          <div class="q-mt-sm">
            <a
              class="link-hover underline"
              @click="showPrivacyPolicyDialog = true"
              >{{ $t('about.read_privacy_policy') }}</a
            >
            &nbsp;
            <a
              class="link-hover underline q-ml-sm"
              @click="showTermsAndConditionsDialog = true"
              >{{ $t('about.read_terms_and_conditions') }}</a
            >
          </div>
        </div>
      </q-card-section>
      <InnerLoading v-if="loading" :solid="true" />
    </q-card>
    <q-dialog
      v-model="showPrivacyPolicyDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <PrivacyPolicyDialog />
    </q-dialog>
    <q-dialog
      v-model="showTermsAndConditionsDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <TermsAndConditionsDialog />
    </q-dialog>
  </div>
</template>

<script>
import { API_URL } from 'src/api';
import { mapActions } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
import InnerLoading from 'src/components/InnerLoading.vue';
import TermsAndConditionsDialog from 'src/components/dialogs/AboutDialog/TermsAndConditionsDialog.vue';
import PrivacyPolicyDialog from 'src/components/dialogs/AboutDialog/PrivacyPolicyDialog.vue';

export default {
  name: 'LoginPage',
  components: { InnerLoading, TermsAndConditionsDialog, PrivacyPolicyDialog },
  watch: {},
  data() {
    return {
      identifier: '',
      password: '',
      loading: false,
      showPrivacyPolicyDialog: false,
      showTermsAndConditionsDialog: false,
    };
  },
  methods: {
    ...mapActions(useAuthStore, ['login']),
    async _login() {
      this.loading = true;
      try {
        await this.login(this.identifier, this.password);
        if (this.$route.query.from) {
          this.$router.replace(this.$route.query.from);
        } else if (this.$route.params.from) {
          this.$router.replace(this.$route.params.from);
        } else {
          this.$router.push('/');
        }
      } catch {}
      this.loading = false;
    },
    hideDialog() {
      this.$router.push({ name: 'Explore' });
    },
  },
  computed: {
    facebookLoginUrl() {
      if (this.$route.query.from) {
        return API_URL + '/oauth/facebook?next_url=' + this.$route.query.from;
      } else {
        return API_URL + '/oauth/facebook';
      }
    },
  },
  mounted() {
    setTimeout(() => {
      //this.$refs.login.focus();
    }, 300);
  },
};
</script>

<style lang="scss" scoped>
.name-not-visible-text {
  text-align: center;
}
.bottom-section {
  :deep(.q-btn__wrapper) {
    padding-right: 0px !important;
  }
}
</style>
