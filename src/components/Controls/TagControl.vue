<template>
  <MenuWrapper
    :showing="showing"
    @hide="onHide()"
    @show="onShow()"
    class="menu-wrapper"
    @scroll="onScrollMainContent($event)"
  >
    <div class="sticky-input">
      <q-input
        debounce="500"
        clearable
        class="q-ml-md q-mr-md"
        v-model="query"
        borderless
        ref="input"
        bg-color="transparent"
        :label="$t('top_controls.search_tags')"
        @keyup.enter="$refs.input.blur()"
      >
        <template v-slot:append>
          <q-icon
            name="mdi-magnify"
            class="q-my-md"
            v-if="!query || query?.length == 0"
          />
        </template>
      </q-input>
      <div class="separator" style="width: 100%" />
    </div>
    <div @scroll="onScrollMainContent($event)" class="control-menu">
      <div
        :class="$q.screen.lt.sm ? 'q-pb-lg' : undefined"
        class="flex column grow"
        v-if="tagOptions && tagOptions.length > 0"
      >
        <q-list>
          <q-item-label
            header
            class="t3 q-pb-sm inter"
            v-if="controlTag?.length > 0"
            >{{ $t('top_controls.selected_tags') }}:</q-item-label
          >
          <div
            class="flex row q-gutter-sm q-px-md q-pt-sm q-mb-xs"
            v-if="controlTag?.length > 0"
          >
            <Tag
              :value="tag.tag_t || tag.tag"
              :key="index"
              @click="clickTag(tag)"
              :selected="true"
              :showIcons="true"
              v-for="(tag, index) in controlTag"
            />
          </div>

          <q-item-label
            header
            class="t3 q-pb-sm inter"
            v-if="(!query || query.length == 0) && topTagsInArea?.length > 0"
            >{{ $t('top_controls.top_tags_in_area') }}:</q-item-label
          >
          <div
            class="flex row q-gutter-sm q-px-md q-pt-sm q-mb-xs"
            v-if="(!query || query.length == 0) && topTagsInArea?.length > 0"
          >
            <Tag
              :value="tag.tag_t || tag.tag"
              :key="index"
              @click="clickTag(tag)"
              :disabled="controlTag?.findIndex((x) => x.tag === tag.tag) > -1"
              v-for="(tag, index) in topTagsInArea"
            />
          </div>
          <q-item-label
            header
            class="t3 q-pb-sm inter"
            v-if="!query || query.length == 0"
            >{{ $t('top_controls.top_tags_worldwide') }}:</q-item-label
          >
          <q-item-label header class="t3 q-pb-sm inter" v-else
            >{{ $t('top_controls.search_results') }}:</q-item-label
          >
          <div class="flex row q-gutter-sm q-px-md q-pt-sm q-pb-lg">
            <Tag
              :value="tag.tag"
              :key="index"
              @click="clickTag(tag)"
              :disabled="controlTag?.findIndex((x) => x.tag === tag.tag) > -1"
              v-for="(tag, index) in tagOptions"
            />
          </div>
          <!--
                                <div
                class="flex column"
                v-for="(tag, index) in tagOptions"
                :key="index"
              >
                <div class="q-px-md">
                  <q-separator v-if="index > 0" />
                </div>
                <q-item
                  dense
                  v-close-popup
                  clickable
                  @click="clickTag(tag)"
                  :active="controlTag?.findIndex((x) => x.tag === tag.tag) > -1"
                >
                  <div class="q-py-md">
                    <q-item-label>
                      {{ tag.tag }} &nbsp;
                      <span class="t4"
                        >({{ tag.count }})</span
                    </q-item-label>

                  </div>
                </q-item>
                </div>
              -->
        </q-list>
        <div
          class="row justify-center q-my-lg"
          v-if="tagOptionsHasNext && tagOptions?.length > 0"
        >
          <q-spinner-ios
            :color="$q.dark.isActive ? 'white' : 'black'"
            size="2em"
          />
        </div>
      </div>
      <div
        class="flex row grow justify-center items-center"
        v-if="tagOptionsLoading && tagOptionsPage == 1"
      >
        <q-spinner-ios
          :color="$q.dark.isActive ? 'white' : 'black'"
          size="2em"
        />
      </div>
    </div>
  </MenuWrapper>
</template>

<script>
import { mapActions, mapWritableState, mapState } from 'pinia';
import { useMapStore } from 'src/stores/map';
import { useQueryStore } from 'src/stores/query';
import MenuWrapper from './MenuWrapper.vue';
import Tag from 'components/Tag.vue';
import _ from 'lodash';

export default {
  props: {
    showing: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    MenuWrapper,
    Tag,
  },
  data() {
    return {
      query: null,
    };
  },
  watch: {
    query() {
      this.tagOptions = [];
      this.loadInitialList();
    },
  },
  methods: {
    ...mapActions(useQueryStore, ['loadTagOptions']),
    onShow() {
      // used to stop the ed list refrshing on mobile viewport size change
      // this.blockUpdates = true;
      if (!this.tagOptions || this.tagOptions.length === 0) {
        this.loadInitialList();
      }
    },
    onHide() {
      this.$emit('hide');
      // unload additional pages to reduce render load next time the dialog is opened
      this.tagOptions = this.tagOptions.slice(0, this.tagOptionsPerPage);
      this.tagOptionsPage = 2; // we reset back to page 1
      this.tagOptionsHasNext = true;
      /*
      setTimeout(() => {
        this.blockUpdates = false;
      }, 1500);
      */
    },
    loadInitialList() {
      this.tagOptionsPage = 1;
      this.loadTagOptions(this.query);
    },
    loadMore() {
      if (this.tagOptionsHasNext) {
        this.loadTagOptions(this.query);
      }
    },

    clickTag(tag) {
      let index = this.controlTag?.findIndex((x) => x.tag === tag.tag);
      if (index > -1) {
        // tag exists, deselect
        this.controlTag.splice(index, 1);
      } else {
        this.controlTag.push(tag);
        this.onHide();
      }
    },
    onScrollMainContent(event) {
      if (
        event.target.offsetHeight + event.target.scrollTop >=
        event.target.scrollHeight - 1
      ) {
        // reached bottom
        this.debouncedLoadMore();
      }
    },
  },
  computed: {
    ...mapWritableState(useMapStore, ['blockUpdates']),
    ...mapWritableState(useQueryStore, [
      'controlTag',
      'tagOptionsPage',
      'tagOptions',
      'tagOptionsHasNext',
      'topTagsInArea',
    ]),
    ...mapState(useQueryStore, ['tagOptionsLoading', 'tagOptionsPerPage']),
  },
  created() {
    this.debouncedLoadMore = _.debounce(this.loadMore, 150, {
      leading: true,
      trailing: false,
    });
  },
  mounted() {
    setTimeout(() => {
      if (!this.tagOptions) {
        // this isn't that import so delay it
        // this.loadInitialList()
      }
    }, 5000);
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}

.body--light {
}

.control-menu {
  display: flex;
  flex-direction: column;
  min-height: 400px;
  max-width: 500px;
}
@media only screen and (max-width: 599px) {
  .control-menu {
    max-width: unset;
  }
}
</style>
