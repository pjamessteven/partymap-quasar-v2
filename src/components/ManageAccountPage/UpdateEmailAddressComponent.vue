<template>
  <div class="flex column">
    <div class="sticky-header flex row wrap items-center">
      <p class="text-large chicago t1 q-mb-md q-mt-md">
        {{ $t('manage_account.email_address') }}
      </p>
    </div>
    <div class="flex column q-pt-md">
      <div v-if="currentUser && !currentUser.pw_enabled">
        {{ $t('manage_account.facebook_login_message_1') }}
        <br />
        {{ $t('manage_account.facebook_login_message_2') }}
      </div>
      <div
        v-else-if="currentUser && currentUser.pw_enabled && currentUser.oauth"
      >
        <div class="t2">
          You can log in with Facebook Login or your email address,
          <b>{{ currentUser?.email }}</b>
        </div>
      </div>
      <div class="q-mt-sm">
        <div class="flex row q-mt-md">
          <q-input
            outlined
            filled
            v-model="email"
            class="email-field"
            :label="$t('manage_account.email_address')"
            :error="emailValidation != true && email.length > 0"
          >
            <template v-slot:error>
              {{ emailValidation }}
            </template>
          </q-input>
        </div>
        <q-btn
          class="soft-button-shadow chicago"
          @click="updateEmail"
          no-caps
          color="primary"
          :disable="email.length == 0 || emailValidation != true"
          v-bind:label="$t('manage_account.update_email')"
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
      email: '',
      loading: false,
      email_taken: false,
    };
  },
  methods: {
    ...mapActions(useAuthStore, ['editUser']),
    async updateEmail() {
      this.loading = true;
      try {
        await this.editUser({
          email: this.email,
        });
        this.$q.dialog({
          title: this.$t('manage_account.email_verification'),
          message: this.$t('manage_account.email_verification_msg'),
          color: 'primary',
        });

        this.email = '';
        this.loading = false;
      } catch (e) {
        this.loading = false;
        if (error.response.data.error.code === 'EMAIL_ALREADY_REGISTERED') {
          this.email_taken = true;
        }
      }
    },
  },
  watch: {},
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
    emailValidation() {
      if (this.email_taken) {
        return this.$t('error_codes.EMAIL_ALREADY_REGISTERED');
      } else if (
        // eslint-disable-next-line
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          this.email
        )
      ) {
        return true;
      } else return this.$t('validation.email_invalid');
    },
  },
  mounted() {
    if (this.currentUser?.email) {
      this.email = this.currentUser.email;
    }
  },
};
</script>

<style lang="scss" scoped>
.email-field {
  width: 300px;
}
</style>
