<template>
  <SolidPage :loading="loading">
    <template v-slot:title>
      <div>Administration</div>
    </template>
    <template v-slot>
      <div class="flex column">
        <PendingEventsComponent class="q-mt-lg" />
        <PendingReportsComponent class="q-mt-lg" />
        <PendingSuggestionsComponent class="q-mt-lg q-mb-xl" />
      </div>
    </template>
  </SolidPage>
</template>

<script>
import PendingEventsComponent from './PendingEventsComponent.vue';
import PendingReportsComponent from './PendingReportsComponent.vue';
import PendingSuggestionsComponent from './PendingSuggestionsComponent.vue';
import SolidPage from 'components/dialogs/SolidPage.vue';

import { mapState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';

export default {
  components: {
    PendingEventsComponent,
    PendingReportsComponent,
    PendingSuggestionsComponent,
    SolidPage,
  },
  props: {
    id: {
      default: null,
      loading: false,
    },
  },
  data() {
    return {
      user: null,
    };
  },

  methods: {},
  watch: {},
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}

.body--light {
}
</style>
