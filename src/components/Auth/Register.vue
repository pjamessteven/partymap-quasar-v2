<template>
  <div class="dialog-page" v-on:click.self="$router.go(-1)">
    <q-card :bordered="$q.screen.gt.sm" class="auth-card">
      <q-card-section style="text-align: center">
        <div
          class="header t1 inter bolder text-h5 q-my-lg"
          style="text-align: center; text-transform: capitalize"
        >
          {{ $t('auth.create') }}
        </div>
        <p class="t3">{{ $t('auth.choose_username_message') }}</p>
      </q-card-section>
      <q-form @submit="_register">
        <q-card-section class="form q-px-lg q-pt-none">
          <q-input
            outlined
            autocapitalize="off"
            filled
            hide-bottom-space
            v-bind:label="$t('auth.username')"
            v-model="username"
            @keyup.enter="prompt = false"
            bottom-slots
            lazy-rules
            :rules="[(val) => usernameValidation(val)]"
          />

          <q-input
            outlined
            filled
            autocapitalize="off"
            class="q-mt-md"
            type="email"
            hide-bottom-space
            v-bind:label="$t('auth.email')"
            v-model="email"
            @keyup.enter="prompt = false"
            bottom-slots
            :rules="[(val) => emailValidation(val)]"
          />

          <q-input
            outlined
            filled
            class="q-mt-md"
            hide-bottom-space
            v-bind:label="$t('auth.password')"
            type="password"
            v-model="password"
            @keyup.enter="prompt = false"
            bottom-slots
            :rules="[(val) => passwordValidation(val)]"
          />
          <q-input
            outlined
            filled
            class="q-mt-md"
            hide-bottom-space
            v-bind:label="$t('auth.password_confirm')"
            type="password"
            v-model="password_confirm"
            @keyup.enter="prompt = false"
            bottom-slots
            :rules="[(val) => passwordConfirmValidation(val)]"
          />
          <InnerLoading v-if="loading" :solid="true" />
        </q-card-section>

        <q-card-section class="flex justify-center q-mb-md q-px-lg">
          <q-btn
            class="inter bolder"
            :disable="loading"
            label="Let's go, sign me up!"
            no-caps
            color="primary"
            size=""
            type="submit"
          />
        </q-card-section>
      </q-form>
    </q-card>
  </div>
</template>

<script>
import InnerLoading from 'src/components/InnerLoading.vue';

import { mapActions } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
export default {
  name: 'RegisterPage',
  data() {
    return {
      username: '',
      password: '',
      password_confirm: '',
      email: '',
      loading: false,
      username_taken: false,
      email_taken: false,
    };
  },
  components: { InnerLoading },
  methods: {
    ...mapActions(useAuthStore, ['register']),
    async _register() {
      this.loading = true;
      try {
        await this.register({
          email: this.email,
          password: this.password,
          username: this.username,
          // only add token if it's in the route
          token:
            this.$route.params && this.$route.params.token
              ? this.$route.params.token
              : undefined,
        });
        this.$q
          .dialog({
            title: this.$t('auth.account_created'),
            message: this.$t('auth.account_created_msg'),
            color: 'primary',
          })
          .onOk(() => {
            this.$router.replace('/login');
          })
          .onCancel(() => {
            this.$router.replace('/login');
          })
          .onDismiss(() => {
            this.$router.replace('/login');
          });
      } catch (error) {
        this.loading = false;

        if (error.response.data.error.code === 'USERNAME_TAKEN') {
          this.username_taken = true;
        } else if (
          error.response.data.error.code === 'EMAIL_ALREADY_REGISTERED'
        ) {
          this.email_taken = true;
        }
      }
    },
    hideDialog() {
      this.$router.push({ name: 'Explore' });
    },
    usernameValidation(val) {
      if (this.username_taken) {
        return this.$t('error_codes.USERNAME_TAKEN');
      } else if (val.length > 25) {
        return this.$t('validation.username_too_long');
      } else if (val.length < 3) {
        return this.$t('validation.username_too_short');
      } else if (!/^[A-Za-z0-9_-]+$/.test(val)) {
        return this.$t('auth.username_letters_and_numbers');
      } else return true;
    },
    passwordValidation(val) {
      if (val.length > 72) {
        return this.$t('validation.password_too_long');
      } else if (val.length < 8) {
        return this.$t('validation.password_too_short');
      } else return true;
    },
    passwordConfirmValidation(val) {
      if (this.password !== val) {
        return this.$t('validation.password_must_match');
      } else return true;
    },
    emailValidation(val) {
      if (this.email_taken) {
        return this.$t('error_codes.EMAIL_ALREADY_REGISTERED');
      } else if (
        // eslint-disable-next-line
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          val
        )
      ) {
        return true;
      } else return this.$t('validation.email_invalid');
    },
  },
  watch: {
    username() {
      if (this.username_taken) {
        this.username_taken = false;
      }
    },
    email() {
      if (this.email_taken) {
        this.email_taken = false;
      }
    },
  },
  computed: {
    validation() {
      if (
        this.usernameValidation === '' &&
        this.passwordValidation === '' &&
        this.emailValidation
      ) {
        return false;
      } else return true;
    },
  },
};
</script>

<style lang="scss" scoped>
@media only screen and (max-width: 1023px) {
  .form {
    width: 100%;
  }
}
</style>
