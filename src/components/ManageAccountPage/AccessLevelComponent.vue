<template>
  <q-card>
    <q-card-section class="flex row justify-between no-wrap">
      <div class="flex row wrap items-center">
        <q-icon left size="1.25em" name="las la-lock" />
        <div class="text-h6 card-title q-pr-md">
          {{ $t('manage_account.access_level') }}
        </div>
      </div>
    </q-card-section>
    <q-card-section v-if="currentUser && currentUser.role == 0">
      <span>
        {{ $t('manage_account.your_access_level_is') }}
        <b>{{ $t('manage_account.role_0') }}</b>
      </span>
      <p />
      <span class="t2">
        {{ $t('manage_account.role_0_message') }}
      </span>
    </q-card-section>
    <q-card-section v-else-if="currentUser && currentUser.role == 10">
      <span class="t2">
        {{ $t('manage_account.your_access_level_is') }}
        <b>{{ $t('manage_account.role_10') }}</b>
      </span>
      <p />
      <span class="t2">
        {{ $t('manage_account.role_10_message') }}
      </span>
    </q-card-section>
    <q-card-section v-if="currentUser && currentUser.role == 0">
      <q-btn
        class="q-mt-sm"
        color="blue"
        v-bind:label="$t('manage_account.become_an_event_host')"
        type="a"
      />
    </q-card-section>
  </q-card>
</template>

<script>
import { mapState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';

export default {
  components: {},
  data() {
    return {};
  },
  methods: {},
  watch: {},
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
  },
};
</script>

<style lang="scss" scoped></style>
