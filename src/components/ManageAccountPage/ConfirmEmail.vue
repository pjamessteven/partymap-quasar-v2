<template>
  <div></div>
</template>

<script>
import { confirmEmailRequest } from 'src/api';
import { useAuthStore } from 'src/stores/auth';
import { mapActions } from 'pinia';

export default {
  name: 'ConfirmEmail',
  data() {
    return {
      loading: true,
    };
  },
  methods: {
    ...mapActions(useAuthStore, ['checkAuthCookie']),
  },
  watch: {},
  computed: {},
  mounted() {
    confirmEmailRequest(this.$route.params.token)
      .then(async () => {
        this.loading = false;
        await this.checkAuthCookie();
        this.$q
          .dialog({
            title: this.$t('manage_account.email_updated'),
            message: this.$t('manage_account.email_updated_msg'),
            color: 'primary',
          })
          .onOk(() => {
            this.$router.replace('/account');
          })
          .onCancel(() => {
            this.$router.replace('/account');
          })
          .onDismiss(() => {
            this.$router.replace('/account');
          });
      })
      .catch(() => {
        this.$q
          .dialog({
            title: this.$t('auth.account_activate_error'),
            message: this.$t('manage_account.email_verification_error_msg'),
            color: 'primary',
          })
          .onOk(() => {
            this.$router.replace('/');
          })
          .onCancel(() => {
            this.$router.replace('/');
          })
          .onDismiss(() => {
            this.$router.replace('/');
          });
      });
  },
};
</script>
