<template>
  <div class="select-tags-component flex column">
    <q-input
      class="nav-input"
      v-bind:label="$t('tags.search_for_tag')"
      v-model="query"
      debounce="200"
      @update:model-value="queryTags"
      :loading="resultsLoading"
      outlined
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
          v-for="(tag, index) in computedResults"
          :key="index"
          :showIcons="true"
          :value="tag.tag"
          :disabled="tagsList.indexOf(tag.tag) > -1"
          v-on:selected="onSelectTag(tag.tag)"
        />
        <Tag
          v-if="
            query?.length > 0 &&
            computedResults.findIndex((tag) => tag.tag == query) === -1
          "
          :key="-1"
          :showIcons="true"
          :value="query"
          :disabled="tagsList.indexOf(query) > -1"
          v-on:selected="onSelectTag(query)"
        />
        <Tag
          v-if="(!query || query.length == 0) && hasNext"
          :key="-2"
          :value="'...show more'"
          v-on:selected="loadMoreTopTags()"
        />
      </div>
    </div>
    <q-separator
      class="q-mt-sm"
      v-if="computedResults?.length > 0 || query?.length > 0"
    />
    <div class="flex column q-mt-sm q-mb-md" v-if="tagsList?.length > 0">
      <span>
        <span class="t1">{{ $t('tags.selected_tags') }}:</span>
      </span>

      <div class="q-pt-sm tag-container q-gutter-xs">
        <Tag
          v-for="(tag, index) in tagsList"
          :key="index"
          :value="tag"
          :showIcons="true"
          @selected="onSelectTag(tag)"
          :selected="true"
        >
        </Tag>
      </div>
    </div>
  </div>
</template>

<script>
import { getTagRequest } from 'src/api';
import Tag from 'components/EventPage/Tags/TagComponent.vue';
import _ from 'lodash';
export default {
  components: {
    Tag,
  },
  props: {
    existingTags: { type: Array, default: () => [] },
    showTopTags: { type: Boolean, default: false },
  },
  data() {
    return {
      query: null,
      queryResults: [],
      loadingQuery: null,
      hasNext: true,
      topTags: [],
      selectValue: null, // current value of select, not used elsewhere
      tagsList: [...this.existingTags],
      pages: 1,
    };
  },
  watch: {
    existingTags: {
      handler: function (newv, oldv) {
        if (!_.isEqual(newv, oldv)) {
          this.tagsList = [...new Set([...this.tagsList, ...newv])];
        }
      },
      deep: true,
    },
    tagsList: {
      handler: function () {
        this.$emit('valueUpdated', this.tagsList);
      },
      deep: true,
    },
  },
  methods: {
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
      // reset top tags
      this.topTags = this.topTags.splice(0, 10);
      this.page = 1;
      this.hasNext = true;
    },
    queryTags(val) {
      if (!val || val === '') {
        this.queryResults = [];
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
        });
      }
    },
    loadInitialTopTags() {
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
    loadMoreTopTags() {
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
  },
  computed: {
    computedResults() {
      if (this.queryResults?.length > 0 || this.query?.length > 0) {
        return this.queryResults;
      } else {
        // return most popular tags if no search query
        return this.topTags;
      }
    },
    resultsLoading() {
      if (this.loadingQuery) {
        return true;
      } else {
        return false;
      }
    },
  },
  mounted() {
    if (this.showTopTags) {
      this.loadInitialTopTags();
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
      color: black;
      border: 1px solid rgba(255, 255, 255, 0.2);
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
@media only screen and (max-width: 599px) {
  .select-tags-component {
    max-width: 400px;
    min-width: unset;
  }
}
</style>
