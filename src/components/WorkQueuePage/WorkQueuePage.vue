<template>
  <SolidPage :loading="loading">
    <template v-slot:title>
      <div>Work Queue</div>
    </template>
    <template v-slot>
      <WorkQueueComponent class="q-mt-lg" />
    </template>
  </SolidPage>
</template>

<script>
import SolidPage from 'components/dialogs/SolidPage.vue';
import WorkQueueComponent from './WorkQueueComponent.vue';
import { mapState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';

export default {
  components: {
    WorkQueueComponent,
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
