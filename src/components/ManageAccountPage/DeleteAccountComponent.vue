<template>
  <div class="flex column">
    <div class="sticky-header flex row wrap items-center">
      <p class="text-large inter bolder t1 q-mb-md q-mt-md">
        {{ $t('manage_account.delete_account') }}
      </p>
    </div>
    <div class="flex column q-pt-md">
      <div class="t2">
        {{ $t('manage_account.delete_account_msg') }}
      </div>
      <div>
        <q-btn
          no-caps
          class="soft-button-shadow q-mt-lg chicago"
          @click="showDeleteAccountDialog"
          color="red"
          v-bind:label="$t('manage_account.delete_account')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';

import { deleteUserRequest } from 'src/api';

export default {
  methods: {
    ...mapActions(useAuthStore, ['logout']),
    showDeleteAccountDialog() {
      this.$q
        .dialog({
          title: this.$t('manage_account.delete_account'),
          message: this.$t('manage_account.delete_account_confirm'),
          color: 'primary',
          cancel: true,
        })
        .onOk(() => {
          this.deleteAccount();
        });
    },
    deleteAccount() {
      const progressDialog = this.$q.dialog({
        title: this.$t('manage_account.deleting_account'),
        message: this.$t('manage_account.no_way_back'),
        color: 'primary',
        progress: true, // we enable default settings
        cancel: false,
        persistent: true, // we want the user to not be able to close it
        ok: false,
      });
      deleteUserRequest(this.currentUser.id).then(() => {
        // it can takes a while to delete an account!
        setTimeout(() => {
          progressDialog.hide();
          setTimeout(() => {
            this.logout();
            this.$router.push({ name: 'Explore' });
          }, 350);
        }, 3000);
      });
    },
  },
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
  },
};
</script>

<style lang="scss" scoped></style>
