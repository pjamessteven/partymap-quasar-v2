<template>
  <div class="dialog-page" v-on:click.self="$router.go(-1)">
    <q-card :bordered="$q.screen.gt.sm" class="auth-card">
      <q-card-section
        class="flex column justify-stretch q-px-xl q-pb-sm"
        :class="{ 'q-pt-xl': $q.screen.gt.lg, 'q-pt-xl': $q.screen.gt.xs }"
      >
        <div class="flex justify-center items-center q-mt-sm q-mb-lg">
          <div>
            <img
              style="height: 30px; width: auto"
              src="~assets/partymap-logo-light-sm.png"
              v-if="$q.dark.isActive"
              class="logo-image"
            />
            <img
              style="height: 30px; width: auto"
              src="~assets/partymap-logo-dark-sm.png"
              class="logo-image"
              v-else
            />
          </div>
        </div>
        <!--
        <div
          class="header inter bolder text-large q-mb-lg q-pb-sm q-mt-lg q-pt-md"
          style="text-align: center"
        >
          It's party time &#128526;
        </div>
        -->
        <q-card-section class="q-pt-none q-pb-md">
          <div class="flex justify-center items-center">
            <q-btn
              color="white"
              style="width: 231px; font-size: 15px"
              text-color="black "
              no-caps
              class="soft-button-shadow"
              :type="!$q.platform.is.nativeMobile ? 'a' : undefined"
              :href="!$q.platform.is.nativeMobile ? googleLoginUrl : undefined"
              @click="
                $q.platform.is.nativeMobile ? nativeGoogleLogin() : undefined
              "
            >
              <img
                style="height: 14px; width: auto"
                src="~assets/g-logo.png"
                class="q-mr-sm"
              />
              Sign in with Google
            </q-btn>
            <q-btn
              style="width: 231px; font-size: 15px; background: white"
              no-caps
              text-color="black"
              class="soft-button-shadow q-mt-md"
              :type="!$q.platform.is.nativeMobile ? 'a' : undefined"
              :href="
                !$q.platform.is.nativeMobile ? facebookLoginUrl : undefined
              "
              @click="$q.platform.is.nativeMobile ? nativeFbLogin() : undefined"
            >
              <q-icon
                name="mdi-facebook"
                class="q-mr-sm"
                style="color: #0165e1"
                size="16px"
              />
              Sign in with FaceBook
            </q-btn>
            <q-btn
              v-if="$q.platform.is.ios && $q.platform.is.capacitor"
              style="width: 231px; font-size: 15px; background: white"
              text-color="black"
              no-caps
              class="soft-button-shadow q-mt-md"
              @click="nativeAppleLogin()"
            >
              <q-icon
                name="mdi-apple"
                class="q-mr-sm"
                style="color: black"
                size="16px"
              />
              Sign in with Apple
            </q-btn>
            <vue-apple-login
              v-else
              class="apple-desktop-signin q-mt-md"
              color="white"
              :border="false"
              type="sign in"
              width="231"
              height="36"
              :onSuccess="onAppleDesktopLoginSuccess"
              :onFailure="onAppleDesktopLoginFailure"
            ></vue-apple-login>
          </div>
          <div
            class="t3 q-mt-md"
            style="text-align: center; font-size: small"
            v-if="false"
          >
            {{ $t('auth.only_store_email') }}
          </div>
        </q-card-section>

        <div class="flex row items-center justify-between no-wrap">
          <div class="separator"></div>
          <div class="q-px-md t3">or</div>
          <div class="separator"></div>
        </div>

        <div class="flex column o-animated q-mt-md" style="position: relative">
          <InnerLoading v-if="loading" :solid="false" />

          <q-input
            :class="{ 'o-000': loading }"
            autocapitalize="off"
            ref="login"
            class=""
            outlined
            v-bind:label="$t('auth.identifier')"
            v-model="identifier"
            @keyup.enter="_login"
          />
          <q-input
            :class="{ 'o-000': loading }"
            outlined
            class="q-mt-md"
            type="password"
            v-bind:label="$t('auth.password')"
            v-model="password"
            @keyup.enter="_login"
          />
          <div
            class="flex row grow justify-end items-center q-mt-lg"
            :class="{ 'o-000': loading }"
          >
            <q-btn
              size="small"
              no-caps
              flat
              class="nav-button q-mb-md inter bold text-large q-mr-sm"
              type="a"
              v-bind:label="$t('auth.sign_up')"
              @click="$router.push({ name: 'Register' })"
            />
            <q-btn
              size="small"
              flat
              no-caps
              class="nav-button primary q-mb-md inter bold text-large"
              v-bind:label="$t('auth.login')"
              type="a"
              @click="_login"
            />
            <!--
          <div class="link-hover t2 text-large" @click="login">
            {{ $t('auth.login') }}
            <q-icon right name="mdi-chevron-right" />
          </div>
        -->
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none q-px-lg q-pb-lg bottom-section">
        <div class="separator o-animated" :class="{ 'o-000': loading }" />
        <div
          class="flex row no-wrap items-center justify-end o-animated"
          :class="{ 'o-000': loading }"
        >
          <!--
          <q-btn
            class="q-mt-md t2"
            unelevated
            no-caps
            size="md"
            icon-right="mdi-chevron-right"
            v-bind:label="$t('auth.sign_up_for_account')"
            @click="$router.push({ name: 'Register' })"
          />
-->
          <q-btn
            class="t2 q-mt-md"
            unelevated
            no-caps
            size="md"
            icon-right="mdi-chevron-right"
            :label="$t('auth.forgot_password')"
            @click="$router.push({ name: 'ForgotPassword' })"
          />
        </div>
        <div class="separator q-mt-md" />

        <div class="t4 q-mt-md" style="text-align: center; font-size: small">
          {{ $t('auth.never_share_or_sell') }}
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
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useMainStore } from 'src/stores/main';
import { useAuthStore } from 'src/stores/auth';
import InnerLoading from 'src/components/InnerLoading.vue';
import TermsAndConditionsDialog from 'src/components/dialogs/AboutDialog/TermsAndConditionsDialog.vue';
import PrivacyPolicyDialog from 'src/components/dialogs/AboutDialog/PrivacyPolicyDialog.vue';
import { useQueryStore } from 'src/stores/query';
import { Browser } from '@capacitor/browser';
//import { SignInWithApple } from '@capacitor-community/apple-sign-in';
import shajs from 'sha.js';

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
    ...mapActions(useQueryStore, ['loadUserEventDates']),
    ...mapActions(useAuthStore, ['login', 'appleLogin']),
    async _login() {
      this.loading = true;
      try {
        const currentUser = await this.login({
          identifier: this.identifier,
          password: this.password,
        });
        this.userEventDatesPage = 1;
        this.loadUserEventDates('all', 'future');
        if (!currentUser.username) {
          this.$router.replace({ name: 'ChooseUsername' });
        } else if (this.$route.query.from) {
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
    async nativeGoogleLogin() {
      await Browser.open({ url: this.googleLoginUrl });
    },
    async nativeFbLogin() {
      await Browser.open({ url: this.facebookLoginUrl });
    },
    nativeAppleLogin() {
      const rawNonce = Date.now().toString();
      const nonce = shajs('sha256').update(rawNonce).digest('hex');
      let options = {
        clientId: 'com.partymap.quasar',
        redirectURI: 'https://www.partymap.com',
        scopes: 'email name',
        state: '12345',
        nonce,
      };
      this.loading = true;

      import('@capacitor-community/apple-sign-in')
        .then(({ SignInWithApple }) => {
          SignInWithApple.authorize(options)
            .then(async (result) => {
              console.log('result', result);
              // Handle user information
              // Validate token with server and create new session
              const currentUser = await this.appleLogin(
                result.response.identityToken,
              );
              if (!currentUser.username) {
                this.$router.replace({ name: 'ChooseUsername' });
              } else {
                this.userEventDatesPage = 1;
                try {
                  await this.loadUserEventDates('all', 'future');
                } catch {}
                this.$router.push('/');
              }
              this.loading = false;
            })
            .catch((error) => {
              console.log(error);
              this.$q.notify('Apple login failed, please try again...');
              this.loading = false;
            });
        })
        .catch((error) => {
          console.error(
            'Error importing @capacitor-community/apple-sign-in:',
            error,
          );
        });
    },
    async onAppleDesktopLoginSuccess(data) {
      console.log(data);
      this.loading = true;
      const currentUser = await this.appleLogin(data.authorization.id_token);
      this.loading = false;
      if (!currentUser.username) {
        this.$router.replace({ name: 'ChooseUsername' });
      } else {
        this.userEventDatesPage = 1;
        try {
          await this.loadUserEventDates('all', 'future');
        } catch {}
        this.$router.push('/');
      }
    },
    onAppleDesktopLoginFailure(error) {
      console.log(error);
      this.$q.notify('Apple login failed, please try again...');
    },
  },
  computed: {
    ...mapWritableState(useQueryStore, ['userEventDatesPage']),
    facebookLoginUrl() {
      let url;
      if (this.$route.query.from) {
        url = API_URL + '/oauth/facebook?next_url=' + this.$route.query.from;
        if (this.$q.platform.is.capacitor) {
          url += '&mobile=true';
        }
      } else {
        url = API_URL + '/oauth/facebook';
        if (this.$q.platform.is.capacitor) {
          url += '?mobile=true';
        }
      }

      return url;
    },
    googleLoginUrl() {
      let url;
      if (this.$route.query.from) {
        url = API_URL + '/oauth/google?next_url=' + this.$route.query.from;
        if (this.$q.platform.is.capacitor) {
          url += '&mobile=true';
        }
      } else {
        url = API_URL + '/oauth/google';
        if (this.$q.platform.is.capacitor) {
          url += '?mobile=true';
        }
      }

      return url;
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
.apple-desktop-signin {
  cursor: pointer;
  box-shadow:
    rgba(0, 0, 0, 0.15) 0px 1px 3px 0px,
    rgba(0, 0, 0, 0.1) 0px 1px 2px 0px !important;
  border-radius: 9px;
  overflow: hidden;
  &:hover {
    filter: brightness(0.95);
  }
}
.name-not-visible-text {
  text-align: center;
}
.auth-card {
  // overriding parent styles
  margin-top: unset !important;
  margin-bottom: unset !important;
}
.bottom-section {
  :deep(.q-btn__wrapper) {
    padding-right: 0px !important;
  }
}
</style>
