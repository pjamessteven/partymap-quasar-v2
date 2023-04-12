<template>
  <q-card>
    <q-card-section class="flex row grow justify-between">
      <div class="text-h6">Pending suggestions:</div>
      <q-btn-dropdown :label="status ? status : 'all'">
        <q-list>
          <q-item clickable v-close-popup @click="setStatus('pending')">
            <q-item-section>
              <q-item-label>Pending</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="setStatus(null)">
            <q-item-section>
              <q-item-label>All</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="setStatus('approved')">
            <q-item-section>
              <q-item-label>Approved</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup @click="setStatus('hidden')">
            <q-item-section>
              <q-item-label>Hidden</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </q-card-section>
    <q-card-section class="">
      <q-list v-if="suggestions && suggestions.length > 0">
        <div
          class="flex column"
          v-for="(item, index) in suggestions"
          :key="index"
        >
          <q-separator spaced v-if="index !== 0" />

          <Suggestion :item="item" />
        </div>
        <div class="flex grow justify-center q-mt-md">
          <q-btn
            :label="$t('activity.load_more')"
            v-if="hasNext"
            icon="mdi-chevron-down"
            @click="loadMore"
            flat
          />
        </div>
      </q-list>
      <div class="t3 flex grow justify-center" v-else>No suggestions :D</div>
    </q-card-section>
    <q-inner-loading :showing="loading">
      <q-spinner-ios :color="$q.dark.isActive ? 'white' : 'black'" size="2em" />
    </q-inner-loading>
  </q-card>
</template>

<script>
import {
  getSuggestionsRequest,
  updateSuggestionRequest,
  deleteSuggestionRequest,
} from 'src/api';
import common from 'assets/common';
import Suggestion from 'src/components/EventPage/Activity/SuggestionComponent.vue';

export default {
  components: { Suggestion },
  props: {
    id: {
      default: null,
      loading: false,
    },
  },
  data() {
    return {
      status: 'pending',
      suggestions: null,
      page: 1,
      perPage: 10,
      hasNext: false,
      loading: false,
    };
  },
  mounted() {
    this.loadInitialList();
  },
  methods: {
    setStatus(status) {
      this.status = status;
      this.loadInitialList();
    },
    updateReport(id, openStatus) {
      const progressDialog = this.$q.dialog({
        title: 'Doo do doo..',
        color: 'primary',
        progress: true, // we enable default settings
        cancel: false,
        persistent: true, // we want the user to not be able to close it
        ok: false,
      });
      updateSuggestionRequest(id, { open: openStatus }).then(
        (response) => {
          progressDialog.hide();
          if (openStatus === false) {
            var indexToDelete = this.suggestions.findIndex((x) => x.id === id);
            this.suggestions.splice(indexToDelete, 1);
          } else {
            var indexToUpdate = this.reports.findIndex((x) => x.id === id);
            this.suggestions[indexToUpdate] = response.data;
            this.suggestions = [...this.suggestions];
          }
        },
        () => {
          // on error
          progressDialog.hide();
        }
      );
    },
    deleteSuggestion(id) {
      this.$q
        .dialog({
          title: 'Delete Suggestion',
          message: 'Are you sure? It will never come back',
          color: 'primary',
          persistent: false, // we want the user to not be able to close it
        })
        .onOk(() => {
          const progressDialog = this.$q.dialog({
            title: 'Doo do doo..',
            color: 'primary',
            progress: true, // we enable default settings
            cancel: false,
            persistent: true, // we want the user to not be able to close it
            ok: false,
          });
          deleteSuggestionRequest(id).then(
            () => {
              progressDialog.hide();
              var indexToDelete = this.suggestions.findIndex(
                (x) => x.id === id
              );
              this.suggestions.splice(indexToDelete, 1);
            },
            () => {
              // on error
              progressDialog.hide();
            }
          );
        });
    },
    loadInitialList() {
      this.loading = true;
      getSuggestionsRequest({
        status: this.status,
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
    loadMore() {
      this.page += 1;
      this.loading = true;
      getSuggestionsRequest({
        status: this.status,
        page: this.page,
        sort: 'created_at',
        desc: true,
        per_page: 10,
      }).then((response) => {
        this.loading = false;
        this.suggestions = [...this.suggestions, ...response.data.items];
        this.hasNext = response.data.has_next;
      });
    },
  },
  watch: {},
  computed: {},
  created() {
    this.timeAgo = common.timeAgo;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}

.body--light {
}
</style>
