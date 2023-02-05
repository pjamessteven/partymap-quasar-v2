<template>
  <div>
    <q-btn
      no-caps
      class="button-control flex items-center"
      :class="{
        active:
          controlTagSelectedOptions && controlTagSelectedOptions.length > 0,
      }"
    >
      <div class="flex items-center row no-wrap">
        <!--<q-icon left name="las la-calendar " />-->
        <q-icon
          style="font-size: 18px"
          name="mdi-close-circle"
          class="q-pr-md"
          @click.stop="
            () => {
              controlTagSelectedOptions = [];
              menuShowing = false;
            }
          "
          v-if="
            controlTagSelectedOptions && controlTagSelectedOptions.length > 0
          "
        />
        <i class="las la-tags q-mr-sm q-ml-none q-pr-none" />

        <div
          v-if="
            !controlTagSelectedOptions || controlTagSelectedOptions.length === 0
          "
        >
          {{ $t('top_controls.select_tags') }}
        </div>
        <div v-else>
          <span v-for="(tag, index) in controlTagSelectedOptions" :key="index"
            >{{ tag.tag
            }}<span
              v-if="
                index != controlTagSelectedOptions.length - 1 &&
                controlTagSelectedOptions.length > 1
              "
            >
              +
            </span></span
          >
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

      <q-menu
        v-model="menuShowing"
        @before-show="onBeforeShowMenu"
        @before-hide="onBeforeHideMenu"
        anchor="top middle"
        self="bottom middle"
        :offset="[0, 8]"
      >
        <div class="flex column">
          <div class="sticky-input">
            <q-input
              @input="loadInitialList()"
              debounce="500"
              clearable
              class="q-ml-md q-mr-md"
              v-model="query"
              borderless
              bg-color="transparent"
              :label="$t('top_controls.search_tags')"
            >
              <template v-slot:append>
                <q-icon name="mdi-magnify" class="q-my-md" />
              </template>
            </q-input>
            <div class="separator" style="width: 100%" />
          </div>
          <q-scroll-area
            vertical
            ref="scroll"
            @scroll="onScrollMainContent"
            style="
              max-height: 400px !important;
              max-width: 300px;
              height: 400px;
              min-width: 280px;
              overflow-x: hidden;
            "
          >
            <div
              class="flex column"
              style="position: relative; min-height: 400px"
            >
              <q-list v-if="tagOptions && tagOptions.length > 0">
                <q-item-label
                  header
                  class="t3 q-pb-sm"
                  v-if="!query || query.length == 0"
                  >{{ $t('top_controls.top_tags_in_area') }}:</q-item-label
                >

                <div
                  class="flex column"
                  v-for="(tag, index) in tagOptions"
                  :key="index"
                >
                  <q-separator v-if="index > 0" />
                  <q-item
                    dense
                    clickable
                    @click="clickTag(tag)"
                    :active="
                      controlTagSelectedOptions.findIndex(
                        (x) => x.tag == tag.tag
                      ) > -1
                    "
                  >
                    <div
                      class="flex row grow justify-between items-center no-wrap"
                    >
                      <q-item-label>
                        {{ tag.tag }} &nbsp;<span class="t4"
                          >({{ tag.count }})</span
                        >
                      </q-item-label>
                      <q-checkbox
                        :value="
                          controlTagSelectedOptions.findIndex(
                            (x) => x.tag == tag.tag
                          ) > -1
                        "
                        @input="clickTag(tag)"
                      />
                    </div>
                  </q-item>
                </div>
              </q-list>
              <div class="row justify-center q-my-md" v-if="hasNext">
                <q-spinner-tail
                  :color="$q.dark.isActive ? 'white' : 'black'"
                  size="2em"
                />
              </div>
              <div
                class="flex row grow justify-center items-center q-my-md"
                v-if="loading && page == 1"
                style="height: 100%"
              >
                <q-spinner-tail
                  :color="$q.dark.isActive ? 'white' : 'black'"
                  size="2em"
                />
              </div>
            </div>
          </q-scroll-area>
        </div>
      </q-menu>
    </q-btn>
  </div>
</template>

<script>
import { getTagRequest } from '@/api';
export default {
  components: {},
  props: {},
  data() {
    return {
      menuShowing: false,
      query: null,
    };
  },
  watch: {},
  methods: {
    onBeforeShowMenu() {
      // used to stop the ed list refrshing on mobile viewport size change
      //this.blockUpdates = true;
      if (!this.tagOptions || this.tagOptions.length === 0) {
        this.loadInitialList();
      }
    },
    onBeforeHideMenu() {
      setTimeout(() => {
        this.blockUpdates = false;
      }, 1500);
    },
    clickTag(tag) {
      // mutation toggles tag
      this.controlTagSelectedOptions = tag;
    },
    onScrollMainContent(info) {
      if (info.verticalPercentage === 1) {
        // reached bottom
        this.loadMore();
      }
    },
    loadInitialList() {
      this.loading = true;
      this.page = 1;
      getTagRequest({
        tag_name: this.query,
        page: this.page,
        sort: 'count',
        desc: true,
        per_page: 20,
      }).then((response) => {
        // list concatenation handled in store mutation
        this.tagOptions = response.data;
        this.loading = false;
      });
    },
    loadMore() {
      if (this.hasNext) {
        this.page += 1;
        this.loading = true;
        getTagRequest({
          tag_name: this.query,
          page: this.page,
          sort: 'count',
          desc: true,
          per_page: 20,
        }).then(
          (response) => {
            // list concatenation handled in store mutation
            this.tagOptions = response.data;
            this.loading = false;
          },
          () => {}
        );
      }
    },
  },
  computed: {
    blockUpdates: {
      // used to stop the ed list refrshing on mobile viewport size change
      get() {
        return this.$store.state.main.blockUpdates;
      },
      set(val) {
        this.$store.commit('main/setBlockUpdates', val);
      },
    },
    controlTagSelectedOptions: {
      get() {
        return this.$store.state.main.controlTagSelectedOptions;
      },
      set(val) {
        this.$store.commit('main/setControlTagSelectedOptions', val);
      },
    },
    tagOptions: {
      get() {
        return this.$store.state.main.tagOptions;
      },
      set(val) {
        this.$store.commit('main/settagOptions', val);
      },
    },
    page: {
      get() {
        return this.$store.state.main.tagOptionsPage;
      },
      set(val) {
        this.$store.commit('main/settagOptionsPage', val);
      },
    },
    hasNext() {
      return this.$store.state.main.tagOptionsHasNext;
    },
    loading: {
      get() {
        return this.$store.state.main.tagOptionsLoading;
      },
      set(val) {
        this.$store.commit('main/settagOptionsLoading', val);
      },
    },
  },
  created() {},

  destroyed() {},
  beforeMount() {},
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
  .sticky-input {
    background: black;
  }
}

.body--light {
  .sticky-input {
    background: white;
  }
}

.sticky-input {
  position: sticky;
  z-index: 1;
  top: 0;
}
.date-picker {
  border-radius: 0px !important;
  border-bottom-left-radius: 9px !important;
  border-bottom-rightradius: 9px !important;

  /deep/.vc-container {
  }
}

@media only (max-width: 1023px) {
}
</style>
