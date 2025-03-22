<template>
  <div class="tag-explorer flex row wrap q-gutter-sm">
    <div
      v-for="(tag, index) in selectedTags"
      :key="index"
      @click="clickTag(tag)"
      class="tag t1 flex items-center selected"
      style="text-transform: capitalize"
      :class="{
        'no-hover': $q.platform.is.ios,
      }"
    >
      <q-icon
        style="margin-left: -4px; font-size: 18px"
        name="mdi-close-circle q-mr-sm"
      />

      {{ tag.tag_t || tag.tag }}
    </div>
    <div
      v-for="(tag, index) in tagsWithoutSelected"
      :key="index"
      @click="clickTag(tag)"
      class="tag t1 flex items-center"
      style="text-transform: capitalize"
      :class="{
        'no-hover': $q.platform.is.ios,
      }"
    >
      {{ tag.tag_t || tag.tag }}
    </div>
    <div class="tag" v-if="hasNext" @click="loadMore">
      {{ $t('artist_page.show_more') }}
      <q-spinner v-if="loading" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useQueryStore } from 'src/stores/query';
import { useMainStore } from 'src/stores/main';
import { useNearbyStore } from 'src/stores/nearby';

export default {
  props: ['mode'],
  data() {
    return {};
  },
  methods: {
    ...mapActions(useNearbyStore, ['loadNearbyTags']),
    ...mapActions(useQueryStore, ['loadTagOptions', 'clearResults']),
    clickTag(tag) {
      // force loading state after clicking to prevent glitchy feeling ui
      this.clearResults();
      let index = this.controlTag?.findIndex((x) => x.tag === tag.tag);
      if (index > -1) {
        // tag already selected, do nothing
        this.controlTag.splice(index, 1);
      } else {
        this.controlTag.push(tag);
        this.$emit('tagSelected');
      }
      if (
        this.$route.name !== 'Explore' &&
        this.$route.name !== 'BrowseEventDateList'
      ) {
        // go to browse page
        this.$router.push({
          name: 'BrowseEventDateList',
          params: { country: 'all' },
        });
      } else if (this.$route.name === 'Explore') {
        this.sidebarPanel = 'explore';
      }
    },
    loadMore() {
      if (this.mode === 'all') {
        this.loadTagOptions();
      } else if (this.mode === 'nearby') {
        this.loadNearbyTags();
      }
    },
  },
  mounted() {
    if (this.mode === 'all' && this.tagOptions.length === 0) {
      this.loadMore();
    }
  },
  computed: {
    ...mapWritableState(useMainStore, ['sidebarPanel']),
    ...mapWritableState(useQueryStore, [
      'controlTag',
      'tagOptions',
      'tagOptionsHasNext',
      'tagOptionsLoading',
      'topTagsInArea',
      'eventDates',
      'eventDatesLoading',
      'eventDatesGroupedByMonth',
    ]),
    ...mapState(useNearbyStore, [
      'nearbyTags',
      'nearbyTagsHasNext',
      'nearbyTagsPage',
      'nearbyTagsSuccess',
      'nearbyTagsLoading',
    ]),
    loading() {
      if (this.mode === 'nearby') {
        return this.nearbyTagsLoading;
      } else if (this.mode === 'all') {
        return this.tagOptionsLoading;
      }
    },
    tagsWithoutSelected() {
      return this.tags.filter(
        (x) => this.controlTag.findIndex((y) => x.tag === y.tag) == -1,
      );
    },
    selectedTags() {
      if (this.tags.length === 0) {
        return this.controlTag;
      } else {
        return this.tags.filter(
          (x) => this.controlTag.findIndex((y) => x.tag === y.tag) > -1,
        );
      }
    },
    tags() {
      if (this.mode == 'explore') {
        return this.topTagsInArea;
      } else if (this.mode === 'nearby') {
        return this.nearbyTags;
      } else {
        return this.tagOptions;
      }
    },
    hasNext() {
      if (this.mode == 'explore') {
        return false;
      } else if (this.mode === 'nearby') {
        return this.nearbyTagsHasNext;
      } else {
        return this.tagOptionsHasNext;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .tag {
    opacity: 1;
    transition: all 0.3s ease;
    background: $bi-3;
    //border: 1px solid rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(0, 0, 0, 0);

    &:not(.no-hover) {
      &:hover {
        opacity: 1;
        background: $bi-4;
      }
    }
    &.selected {
      background: $bi-4;
    }
  }
}

.body--light {
  .tag {
    // opacity: 1

    transition: all 0.3s ease;
    //background: rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(0, 0, 0, 0.05);
    //box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px 0px;

    //box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 4px 0px;
    color: $t-2 !important;
    /*
    box-shadow:
      rgba(9, 30, 66, 0.2) 0px 1px 1px,
      rgba(9, 30, 66, 0.07) 0px 0px 1px 1px;
*/
    //   box-shadow: rgba(14, 63, 126, 0.08) 0px 0px 0px 1px;

    &:not(.no-hover) {
      &:hover {
        background: rgba(0, 0, 0, 0.1);
      }
    }
    &.selected {
      background: $b-4;
    }
  }
}

.tag-explorer {
  pointer-events: none;
  padding-top: 2px;
  padding-bottom: 8px;
  .tag {
    pointer-events: all;
    opacity: 1;
    transition: all 0.3s ease;
    white-space: nowrap;
    cursor: pointer;
    border-radius: 18px;
    padding: 6px 12px;
    border-radius: 18px;

    &.selected {
      //  text-decoration: underline;
    }
  }
}
</style>
