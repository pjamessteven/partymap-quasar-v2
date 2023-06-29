<template>
  <div class="dialog-page" style="padding-bottom: 60px">
    <q-card :bordered="$q.screen.gt.sm" class="q-pa-md auth-card">
      <q-card-section class="title flex justify-center column">
        <b class="text-large">{{ $t('auth.choose_username') }}</b>
        <p class="t3">{{ $t('auth.choose_username_message') }}</p>
        <p class="t2">{{ $t('auth.choose_username_requirements') }}</p>
      </q-card-section>
      <q-card-section class="flex grow">
        <q-input
          filled
          class="flex grow"
          v-bind:label="$t('auth.username')"
          v-model="username"
          @keyup.enter="prompt = false"
          bottom-slots
          :error="usernameValidation != true && username.length > 0"
        >
          <template v-slot:error>
            {{ usernameValidation }}
          </template>
        </q-input>
      </q-card-section>
      <q-card-actions align="right" class="text-primary q-pa-md q-pt-md">
        <q-btn
          :disable="usernameValidation != true || username.length == 0"
          color="primary"
          v-bind:label="$t('auth.continue')"
          v-on:click="setUsername"
        />
      </q-card-actions>
      <InnerLoading v-if="loading" :solid="true" />
    </q-card>
  </div>
</template>

<script>
import InnerLoading from 'src/components/InnerLoading.vue';
import { useAuthStore } from 'src/stores/auth';
import { mapActions, mapState } from 'pinia';

export default {
  name: 'SetUsername',
  components: { InnerLoading },
  watch: {
    username() {
      if (this.username_taken) {
        this.username_taken = false;
      }
    },
  },
  data() {
    return {
      username: '',
      username_taken: false,
    };
  },
  methods: {
    ...mapActions(useAuthStore, ['editUser']),
    async setUsername() {
      this.loading = true;
      try {
        await this.editUser({ username: this.username });
        this.$q.notify(this.$t('auth.welcome') + ', ' + this.username + '!');
        this.loading = false;
        this.$router.push('/');
      } catch (error) {
        this.loading = false;
        if (error.response.data.error.code === 'USERNAME_TAKEN') {
          this.username_taken = true;
        }
      }
    },
  },
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
    usernameValidation() {
      if (this.username_taken) {
        return this.$t('errors.username_already_registered');
      } else if (this.username.length > 25) {
        return this.$t('validation.username_too_long');
      } else if (this.username.length < 3) {
        return this.$t('validation.username_too_short');
      } else if (!/^[A-Za-z0-9_-]+$/.test(this.username)) {
        return this.$t('auth.username_letters_and_numbers');
      } else return true;
    },
  },
};
</script>

<style lang="scss" scoped></style>
