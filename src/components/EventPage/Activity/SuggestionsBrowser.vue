<template>
  <div class="history flex column grow">
    <div class="flex column">
      <Suggestion
        v-for="(item, index) in suggestions"
        :key="index"
        :item="item"
        class="q-mb-md"
      />
    </div>
    <q-inner-loading :showing="loading">
      <q-spinner-ios :color="$q.dark.isActive ? 'white' : 'black'" size="2em" />
    </q-inner-loading>
  </div>
</template>

<script>
import Suggestion from './SuggestionComponent.vue';
import { getSuggestionsRequest } from 'src/api';
export default {
  components: {
    Suggestion,
  },
  props: {},
  data() {
    return {
      suggestions: null,
      hasNext: false,
      page: 1,
      loading: false,
    };
  },
  methods: {
    loadMore() {
      this.page += 1;
      this.loading = true;
      getSuggestionsRequest({
        event_id: this.event.id,
        page: this.page,
        sort: 'created_at',
        desc: true,
        per_page: 10,
      }).then((response) => {
        this.loading = false;
        this.suggestions = [...this.activities, ...response.data.items];
        this.hasNext = response.data.has_next;
      });
    },
  },
  watch: {},
  computed: {
    event() {
      return this.$store.state.currentEvent.event;
    },
  },
  beforeMount() {},
  mounted() {
    this.loading = true;
    getSuggestionsRequest({
      event_id: this.event.id,
      page: this.page,
      sort: 'created_at',
      desc: true,
      per_page: 10,
    }).then((response) => {
      this.loading = false;
      this.suggestions = response.data.items;
      this.hasNext = response.data.has_next;
    });
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}

.body--light {
}

@media only screen and (max-width: 1023px) {
}
</style>
