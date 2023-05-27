<template>
  <div class="flex column">
    <div class="sticky-header flex row wrap items-center">
      <p class="text-large inter bolder t1 q-mb-md q-mt-md">
        {{ $t('manage_account.password') }}
      </p>
    </div>
    <div class="flex column q-pt-md">
      <div v-if="currentUser && !currentUser.pw_enabled">
        <div class="t2">
          {{ $t('manage_account.no_password_message') }}
        </div>
      </div>
      <div v-else class="t2">Change your password here.</div>
      <div class="q-mt-md">
        <div class="flex row">
          <q-input
            outlined
            type="password"
            filled
            class="q-mr-md"
            v-model="newPassword"
            :label="$t('manage_account.new_password')"
            :error="passwordValidation != true && newPassword.length > 0"
          >
            <template v-slot:error>
              {{ passwordValidation }}
            </template>
          </q-input>
          <q-input
            outlined
            filled
            type="password"
            class=""
            v-model="newPasswordConfirm"
            :label="$t('manage_account.confirm_password')"
            :error="
              passwordConfirmValidation != true && newPasswordConfirm.length > 0
            "
          >
            <template v-slot:error>
              {{ passwordConfirmValidation }}
            </template>
          </q-input>
        </div>

        <q-btn
          class="soft-button-shadow"
          @click="updatePassword"
          no-caps
          color="primary"
          :disable="
            newPassword.length === 0 ||
            !passwordValidation ||
            !passwordConfirmValidation
          "
          :label="$t('manage_account.update_password')"
          type="a"
        />
      </div>
    </div>
    <InnerLoading v-if="loading" :solid="true" />
  </div>
</template>

<script>
import InnerLoading from 'src/components/InnerLoading.vue';

import { mapActions, mapState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';

export default {
  components: { InnerLoading },
  data() {
    return {
      newPassword: '',
      newPasswordConfirm: '',
      loading: false,
    };
  },
  methods: {
    ...mapActions(useAuthStore, ['editUser']),
    async updatePassword() {
      this.loading = true;
      try {
        await this.editUser({
          password: this.newPassword,
          password_confirm: this.newPasswordConfirm,
        });
        this.$q.notify(this.$t('manage_account.password_updated'));
        this.loading = false;
        this.newPassword = '';
        this.newPasswordConfirm = '';
      } catch (e) {
        this.loading = false;
      }
    },
  },
  watch: {},
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
    passwordValidation() {
      if (this.newPassword.length > 72) {
        return this.$t('validation.password_too_long');
      } else if (this.newPassword.length < 8) {
        return this.$t('validation.password_too_short');
      } else return true;
    },
    passwordConfirmValidation() {
      if (this.newPassword !== this.newPasswordConfirm) {
        return this.$t('validation.password_must_match');
      } else return true;
    },
  },
};
</script>

<style lang="scss" scoped>
.password-field {
  width: 400px;
}
</style>
