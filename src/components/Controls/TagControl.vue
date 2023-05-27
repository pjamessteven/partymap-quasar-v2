<template>
  <div>
    <q-btn
      no-caps
      class="button-control flex items-center"
      :class="{
        active: controlTag?.length > 0,
      }"
      @click="
        () => {
          showing = !showing;
        }
      "
    >
      <div class="flex items-center row no-wrap">
        <div
          class="close-icon-wrapper"
          v-if="controlTag?.length > 0"
          @click.stop="
            () => {
              controlTag = [];
              event.preventDefault();
            }
          "
        >
          <q-icon style="font-size: 18px" name="mdi-close" />
        </div>

        <div class="button-label flex row items-center row no-wrap">
          <i class="las la-tags q-mr-sm q-ml-none q-pr-none" />

          <div v-if="!controlTag || controlTag.length === 0">
            {{ $t('top_controls.select_tags') }}
          </div>
          <div v-else>
            <span v-for="(tag, index) in controlTag" :key="index"
              >{{ tag.tag
              }}<span
                v-if="index != controlTag.length - 1 && controlTag.length > 1"
              >
                +
              </span></span
            >
          </div>
        </div>

        <!--
        <i
          class="q-select__dropdown-icon material-icons q-icon notranslate q-mr-none q-pr-none"
          :class="{ 'rotate-180': menuShowing }"
        >
          arrow_drop_down
        </i>
        -->
      </div>

      <MenuWrapper :showing="showing" @hide="onHide()" @show="onShow()">
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
            class="flex column grow"
            v-if="tagOptions && tagOptions.length > 0"
          >
            <q-list>
              <div
                class="flex column"
                v-for="(tag, index) in tagOptions"
                :key="index"
              >
                <q-separator v-if="index > 0" />
                <q-item
                  dense
                  v-close-popup
                  clickable
                  @click="clickTag(tag)"
                  :active="controlTag?.findIndex((x) => x.tag === tag.tag) > -1"
                >
                  <div
                    class="flex row grow justify-between items-center no-wrap inter bold q-py-md"
                  >
                    <q-item-label>
                      {{ tag.tag }} &nbsp;
                      <!--<span class="t4"
                        >({{ tag.count }})</span-->
                    </q-item-label>
                    <!--
                    <q-checkbox
                      @click="clickTag(tag)"
                      :model-value="
                        controlTag?.findIndex((x) => x.tag === tag.tag) > -1
                      "
                    />
                    -->
                  </div>
                </q-item>
              </div>
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
    </q-btn>
  </div>
</template>

<script>
import { mapActions, mapWritableState, mapState } from 'pinia';
import { useMapStore } from 'src/stores/map';
import { useQueryStore } from 'src/stores/query';
import MenuWrapper from './MenuWrapper.vue';

export default {
  components: {
    MenuWrapper,
  },
  data() {
    return {
      showing: false,
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
      this.showing = false;

      // unload additional pages to reduce render load next time the dialog is opened
      this.tagOptions = this.tagOptions.slice(0, this.tagOptionsPerPage);
      this.tagOptionsPage = 2;
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
      this.loadTagOptions(this.query);
    },

    clickTag(tag) {
      let index = this.controlTag?.findIndex((x) => x.tag === tag.tag);
      if (index > -1) {
        // tag exists, deselect
        this.controlTag.splice(index, 1);
      } else {
        this.controlTag.push(tag);
      }
    },
    onScrollMainContent(event) {
      console.log(event.target);
      if (
        event.target.offsetHeight + event.target.scrollTop >=
        event.target.scrollHeight
      ) {
        // reached bottom
        this.loadMore();
      }
    },
  },
  computed: {
    ...mapWritableState(useMapStore, ['blockUpdates']),
    ...mapWritableState(useQueryStore, [
      'controlTag',
      'tagOptionsPage',
      'tagOptions',
    ]),
    ...mapState(useQueryStore, [
      'tagOptionsHasNext',
      'tagOptionsLoading',
      'tagOptionsPerPage',
    ]),
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
  max-width: 300px;
}
@media only screen and (max-width: 600px) {
  .control-menu {
    max-width: unset;
  }
}
</style>
