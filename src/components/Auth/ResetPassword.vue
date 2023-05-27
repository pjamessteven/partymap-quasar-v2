<template>
  <div class="dialog-page" v-on:click.self="hideDialog">
    <q-card :bordered="$q.screen.gt.sm" class="auth-card">
      <q-card-section class="row items-center">
        <b class="text-large">{{ $t('auth.reset_password') }}</b>
        <q-space />
      </q-card-section>

      <q-card-section class="form q-px-lg">
        <q-input
          square
          outlined
          class="q-mt-md"
          hide-bottom-space
          v-bind:label="$t('manage_account.new_password')"
          type="password"
          v-model="password"
          @keyup.enter="prompt = false"
          bottom-slots
          :error="passwordValidation != '' && password.length > 0"
        >
          <template v-slot:error>
            {{ passwordValidation }}
          </template>
        </q-input>

        <q-input
          square
          outlined
          class="q-mt-md"
          hide-bottom-space
          v-bind:label="$t('auth.password_confirm')"
          type="password"
          v-model="password_confirm"
          @keyup.enter="prompt = false"
          bottom-slots
          :error="
            passwordConfirmValidation != '' && password_confirm.length > 0
          "
        >
          <template v-slot:error>
            {{ passwordConfirmValidation }}
          </template>
        </q-input>
      </q-card-section>

      <q-card-section class="flex justify-center q-mb-md">
        <q-btn
          :disable="!validation"
          :label="$t('auth.reset_password')"
          color="primary"
          v-on:click="resetPassword"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { passwordResetRequest } from 'src/api';
export default {
  name: 'ResetPassword',
  data() {
    return {
      password: '',
      password_confirm: '',
    };
  },
  methods: {
    resetPassword() {
      const progressDialog = this.$q.dialog({
        title: this.$t('edit_event_date.submitting'),
        color: 'primary',
        progress: true, // we enable default settings
        cancel: false,
        persistent: true, // we want the user to not be able to close it
        ok: false,
      });
      passwordResetRequest(this.$route.params.token, {
        password: this.password,
        password_confirm: this.password_confirm,
      }).then(
        (response) => {
          this.$store.commit('main/setCurrentUser', response.data);
          this.$store.commit('main/setAuthenticated', true);
          progressDialog.hide();
          this.$q
            .dialog({
              title: this.$t('auth.success'),
              message:
                this.$t('auth.your_pw_has_been_reset_and_logged_in_as') +
                ' ' +
                response.data.username,
              color: 'primary',
              cancel: false,
            })
            .onDismiss(() => {
              this.$router.push({ name: 'Explore' });
            });
        },
        () => {
          progressDialog.hide();
        }
      );
    },
    hideDialog() {
      this.$router.push({ name: 'Explore' });
    },
  },

  computed: {
    validation() {
      if (
        this.passwordValidation === '' &&
        this.passwordConfirmValidation === ''
      ) {
        return true;
      } else return false;
    },

    passwordValidation() {
      if (this.password.length > 72) {
        return this.$t('validation.password_too_long');
      } else if (this.password.length < 8) {
        return this.$t('validation.password_too_short');
      } else return '';
    },
    passwordConfirmValidation() {
      if (this.password !== this.password_confirm) {
        return this.$t('validation.password_must_match');
      } else return '';
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
