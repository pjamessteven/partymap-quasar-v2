<template>
  <div></div>
</template>

<script>
import { activateUserRequest } from 'src/api';
export default {
  name: 'Activate',
  data() {
    return {
      loading: true,
    };
  },
  methods: {},
  watch: {},
  computed: {},
  mounted() {
    activateUserRequest(this.$route.params.token)
      .then(() => {
        this.loading = false;
        this.$q
          .dialog({
            title: this.$t('auth.account_activated'),
            message: this.$t('auth.account_acctivated_msg'),
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
      })
      .catch((error) => {
        let title = '';
        let message = '';
        if (error.response.status === 400) {
          // account already activated
          title = this.$t('auth.account_already_activated_error_tilte');
          message = this.$t('auth.account_already_activated_error_msg');
        } else {
          // generic 'there was a problem activating your account, check URL is correct' message
          title = this.$t('auth.account_activate_error_title');
          message = this.$t('auth.account_activate_error_msg');
        }
        this.$q
          .dialog({
            title: title,
            message: message,
            color: 'primary',
            ok: false,
          })
          .onOk(() => {
            this.$router.push('/login');
          })
          .onCancel(() => {
            this.$router.push('/login');
          })
          .onDismiss(() => {
            this.$router.push('/login');
          });
      });
  },
};
</script>

<style lang="scss" scoped>
.form {
  width: 100%;
}

.auth-card {
  width: 400px;
}

@media only screen and (max-width: 1023px) {
  .form {
    width: 100%;
  }
}
</style>
