<template>
  <div class="solid-page flex row justify-center">
    <div
      class="solid-page-inner col-8 col-sm-8 col-md-8 col-lg-8 col-xl-8 col-xs-12"
    >
      <div class="text-h5 chicago q-mb-xl">Administration</div>
      <PendingEventsComponent />
      <PendingReportsComponent class="q-mt-lg" />
      <PendingSuggestionsComponent class="q-mt-lg q-mb-xl" />
    </div>
  </div>
</template>

<script>
import PendingEventsComponent from './PendingEventsComponent.vue';
import PendingReportsComponent from './PendingReportsComponent.vue';
import PendingSuggestionsComponent from './PendingSuggestionsComponent.vue';

import { mapState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';

export default {
  components: {
    PendingEventsComponent,
    PendingReportsComponent,
    PendingSuggestionsComponent,
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
