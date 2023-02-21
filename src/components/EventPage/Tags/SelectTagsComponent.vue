<template>
  <div class="select-tags-component flex column">
    <q-input
      class="nav-input"
      :class="{ 'q-mt-sm': mode === 'updateExisting' }"
      v-bind:label="$t('tags.search_for_tag')"
      v-model="query"
      square
      debounce="200"
      @update:model-value="queryTags"
      :loading="resultsLoading"
      outlined
      @keyup.enter="search"
      clearable
      clear-icon="las la-times"
    >
      <template v-slot:append>
        <q-icon name="search" class="q-pa-md" />
      </template>
    </q-input>

    <div
      class="flex column q-mt-md"
      v-if="computedResults?.length > 0 || query?.length > 0"
    >
      <span>
        <span class="t1" v-if="query && query.length > 0">{{
          $t('tags.search_results')
        }}</span>
        <span class="t1" v-else>{{ $t('tags.top_tags') }}</span>

        <span class="t3"> ({{ $t('tags.touch_to_add') }})</span>
      </span>
      <div class="flex row wrap q-py-sm q-gutter-xs">
        <Tag
          v-if="
            query?.length > 0 &&
            computedResults.findIndex((tag) => tag.tag == query) === -1
          "
          :key="-1"
          :value="query"
          :disabled="tagsList.indexOf(query) > -1"
          v-on:selected="onSelectTag(query)"
        />
        <Tag
          v-for="(tag, index) in computedResults"
          :key="index"
          :value="tag.tag"
          :disabled="tagsList.indexOf(tag.tag) > -1"
          v-on:selected="onSelectTag(tag.tag)"
        />
        <Tag
          v-if="!query || query.length == 0"
          :key="-2"
          :value="'...show more'"
          :disabled="!hasNext"
          v-on:selected="loadMore()"
        />
      </div>
    </div>
    <q-separator
      class="q-mt-sm"
      v-if="computedResults?.length > 0 || query?.length > 0"
    />

    <div class="flex column q-mt-md" v-if="tagsList?.length > 0">
      <span>
        <span class="t3">{{ $t('tags.selected_tags') }}:</span>
      </span>

      <div class="q-pt-sm tag-container q-gutter-xs">
        <Tag
          v-for="(tag, index) in tagsList"
          :key="index"
          :value="tag"
          @selected="onSelectTag(tag)"
          :selected="true"
        >
        </Tag>
      </div>
    </div>
    <q-card-section
      class="q-pt-lg q-pb-none q-pr-none flex justify-end"
      v-if="mode == 'updateExisting'"
    >
      <q-btn
        color="primary"
        :label="$t('general.save_changes')"
        v-on:click="updateEventWithTags"
      />
    </q-card-section>
  </div>
</template>

<script>
import { getTagRequest } from 'src/api';
import SubmitSuggestionPrompt from 'components/EventPage/Suggestions/SubmitSuggestionPrompt.vue';
import Tag from 'components/EventPage/Tags/TagComponent.vue';

import { mapState, mapActions } from 'pinia';
import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';

export default {
  components: {
    Tag,
  },
  props: { mode: String },
  data() {
    return {
      query: null,
      queryResults: null,
      loadingQuery: null,
      hasNext: true,
      topTags: [],
      selectValue: null, // current value of select, not used elsewhere
      tagsList: [],
      pages: 1,
    };
  },
  watch: {
    tagsList: {
      handler: function () {
        this.$emit('valueUpdated', this.tagsList);
      },
    },
  },
  methods: {
    ...mapActions(useEventStore, ['updateEvent', 'suggestEventEdit']),
    onSelectTag(value) {
      var index = this.tagsList.indexOf(value);
      if (index > -1) {
        // remove if it exists
        this.tagsList.splice(index, 1);
      } else {
        // add tag
        this.tagsList.push(value);
        this.query = '';
        this.queryResults = [];
      }
    },
    queryTags(val) {
      if (!val || val === '') {
        this.queryResults = null;
      } else {
        this.loadingQuery = true;
        getTagRequest({
          tag_name: val,
          page: 1,
          sort: 'count',
          desc: true,
          per_page: 10,
        }).then((response) => {
          this.queryResults = response.data.items;
          this.loadingQuery = false;
          this.hasNext = response.data.has_next;
        });
      }
    },
    loadInitialList() {
      this.loading = true;
      this.page = 1;
      getTagRequest({
        page: 1,
        sort: 'count',
        desc: true,
        per_page: 20,
      }).then((response) => {
        this.topTags = response.data.items;
        this.loading = false;
        this.hasNext = response.data.has_next;
      });
    },
    loadMore() {
      this.page += 1;
      this.loading = true;
      getTagRequest({
        tag_name: this.query && this.query.length > 0 ? this.query : undefined,
        page: this.page,
        sort: 'count',
        desc: true,
        per_page: 20,
      }).then(
        (response) => {
          this.topTags = [...this.topTags, ...response.data.items];
          this.loading = false;
          this.hasNext = response.data.has_next;
        },
        () => {
          this.hasNext = false;
        }
      );
    },
    async updateEventWithTags() {
      if (this.currentUserCanEdit) {
        const progressDialog = this.$q.dialog({
          title: this.$t('edit_event.updating_event'),
          color: 'primary',
          progress: true, // we enable default settings
          cancel: false,
          persistent: true, // we want the user to not be able to close it
          ok: false,
        });
        try {
          await this.updateEvent({
            add_tags: this.tagsToAdd,
            remove_tags: this.tagsToRemove,
          });
          this.$emit('closeDialog'); // close parent dialog
        } catch (e) {}
        progressDialog.hide();
      } else {
        this.$q
          .dialog({
            parent: this,
            component: SubmitSuggestionPrompt,
          })
          .onOk(async (messageAndToken) => {
            // make suggestion
            // suggest edit instead of editing directly
            const progressDialog = this.$q.dialog({
              title: this.$t('edit_event_date.submitting'),
              color: 'primary',
              progress: true, // we enable default settings
              cancel: false,
              persistent: true, // we want the user to not be able to close it
              ok: false,
            });
            try {
              await suggestEventEdit({
                ...messageAndToken,
                ...{ add_tags: this.tagsToAdd, remove_tags: this.tagsToRemove },
              });
              this.$q
                .dialog({
                  title: this.$t('edit_event_date.submitted'),
                  message: this.$t('edit_event_date.submitted_msg'),
                  color: 'primary',
                  persistent: false, // we want the user to not be able to close it
                })
                .onDismiss(() => {
                  this.$emit('closeDialog'); // close parent dialog
                  window.bus.$emit('closeDialog');
                });
            } catch (e) {}
            progressDialog.hide();
          });
      }
    },
  },
  computed: {
    ...mapState(useEventStore, ['event', 'currentUserCanEdit']),
    ...mapState(useAuthStore, ['currentUser']),
    existingTags() {
      return this.event?.event_tags?.map((x) => x.tag) || [];
    },
    tagsToAdd() {
      let toAdd = [];
      for (let tag of this.tagsList) {
        if (this.existingTags.indexOf(tag) === -1) {
          toAdd.push(tag);
        }
      }
      return toAdd;
    },
    tagsToRemove() {
      let toRemove = [];
      for (let tag of this.existingTags) {
        if (this.tagsList.indexOf(tag) === -1) {
          toRemove.push(tag);
        }
      }
      return toRemove;
    },
    computedResults() {
      if (this.queryResults?.length > 0 && this.query?.length > 0) {
        return this.queryResults;
      } else {
        // return most popular tags if no search query
        return this.topTags;
      }
    },
    resultsLoading() {
      if (this.loadingOptions || this.loadingQuery) {
        return true;
      } else {
        return false;
      }
    },
  },
  mounted() {
    if (this.mode === 'updateExisting') {
      this.tagsList = this.event?.event_tags.map((x) => x.tag);
    }
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}
.body--light {
  .select-tags-component {
    background: $b-1;
    :deep(.tag) {
      opacity: 1;
      background: $b-4;
      color: grey;
      border: 1px solid rgba(255, 255, 255, 0.2);
      &.selected {
        color: black;
        background: $b-4 !important;
        .tag-inner-wrapper {
          opacity: 1;
          .tag-inner {
            font-weight: bold;
          }
        }
      }
    }
  }
}

.select-tags-component {
  max-width: 400px;
  min-width: 400px;
}
.taggroup-move {
  transition: transform 500ms;
}
.tag-container {
  display: flex;
  flex-direction: row;
  overflow: unset;
  justify-content: flex-start;
  flex-wrap: wrap;
}
@media only screen and (max-width: 600px) {
  .select-tags-component {
    max-width: 400px;
    min-width: unset;
  }
}
</style>
