<template>
  <div class="dialog-page" v-on:click.self="hideDialog">
    <q-card :bordered="$q.screen.gt.sm" class="auth-card">
      <q-card-section
        class="title flex q-mt-md flex justify-center q-px-lg"
        style="text-align: center"
      >
        <div
          class="header t1 inter bolder text-h6 q-mb-lg"
          style="text-align: center; text-transform: "
        >
          {{ $t('auth.forgot_password') }}
        </div>
        <p class="t3">{{ $t('auth.forgot_password_message') }}</p>
      </q-card-section>
      <q-card-section class="form q-px-lg q-pt-none">
        <q-input
          square
          filled
          outlined
          hide-bottom-space
          v-bind:label="$t('auth.identifier')"
          v-model="identifier"
          @keyup.enter="prompt = false"
          bottom-slots
        >
        </q-input>
      </q-card-section>

      <q-card-section class="flex justify-center q-mb-md">
        <q-btn
          class="soft-button-shadow"
          :disable="loading"
          :label="$t('auth.reset_password')"
          color="primary"
          v-on:click="resetPassword"
        />
      </q-card-section>
      <InnerLoading v-if="loading" :solid="true" />
    </q-card>
  </div>
</template>

<script>
import InnerLoading from 'src/components/InnerLoading.vue';

import { requestPasswordResetRequest } from 'src/api';
export default {
  name: 'ForgotPassword',
  components: { InnerLoading },

  data() {
    return {
      identifier: '',
      loading: false,
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

      requestPasswordResetRequest(this.identifier).then(
        () => {
          progressDialog.hide();

          this.$q
            .dialog({
              title: this.$t('auth.nearly_there'),
              message: this.$t('auth.password_reset_email_sent'),
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
      if (this.passwordValidation === '') {
        return false;
      } else return true;
    },

    passwordValidation() {
      if (this.password.length > 72) {
        return this.$t('validation.password_too_long');
      } else if (this.password.length < 8) {
        return this.$t('validation.password_too_short');
      } else return true;
    },
    passwordConfirmValidation() {
      if (this.password !== this.password_confirm) {
        return this.$t('validation.password_must_match');
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
