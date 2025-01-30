<template>
  <transition appear enter-active-class="animated fadeIn slow">
    <div class="flex column browse-">
      <div
        @click="viewAll"
        class="flex row justify-between no-wrap"
        :class="{
          'items-end': $q.screen.gt.sm,
          'items-center': $q.screen.lt.md,
        }"
      >
        <div class="flex column">
          <div
            class="text-h5 metropolis bolder"
            :class="$q.screen.gt.xs ? 'q-px-lg ' : 'q-px-md '"
          >
            {{ title }}
          </div>
          <div
            class="text-large inter bold t3"
            :class="$q.screen.gt.xs ? 'q-px-lg' : 'q-px-md q-mt-xs'"
          >
            {{ tagline }}
          </div>
        </div>
        <q-btn
          flat
          no-caps
          class="nav-button q-ml-md"
          @click.stop="viewAll"
          v-if="$q.screen.gt.sm"
        >
          <div class="inter">
            {{ $t('nearby_view.view_all') }}&nbsp;{{ title }}
          </div>
          <q-icon
            name="mdi-chevron-right"
            size="1rem"
            :class="{ 'q-ml-sm': $q.screen.gt.xs }"
          />
        </q-btn>
        <div v-else class="q-pr-md">
          <q-icon size="2em" name="mdi-chevron-right" />
        </div>
      </div>
      <div :class="$q.screen.gt.xs ? 'q-mt-lg q-mb-xl' : 'q-mt-md q-mb-lg'">
        <CustomQScroll
          horizontal
          @scroll="debouncedOnScroll"
          class="user-event-scroll-area"
          style="width: 100%"
          :thumb-style="
            $q.screen.gt.xs
              ? {
                  bottom: '0px',
                  height: '8px',
                  marginLeft: '24px',
                }
              : { bottom: '0px', height: '0px' }
          "
        >
          <div
            class="flex row no-wrap items-center q-gutter-md"
            :class="$q.screen.gt.xs ? 'q-px-lg' : 'q-px-md'"
          >
            <EventDatePoster
              v-for="(ed, index) in eventDates"
              :key="index"
              :hideInfo="false"
              :event="ed"
            />
            <div
              class="row justify-center q-px-xl"
              v-if="hasNext && eventDates?.length > 0"
            >
              <q-spinner-ios
                :color="$q.dark.isActive ? 'white' : 'black'"
                size="2em"
              />
            </div>
          </div>
        </CustomQScroll>
      </div>
      <div class="flex row justify-end q-px-md q-mb-sm" v-if="false">
        <q-btn
          flat
          no-caps
          class="nav-button q-ml-md"
          @click="viewAll"
          v-if="$q.screen.lt.md"
        >
          <div class="inter">
            {{ $t('nearby_view.view_all') }}&nbsp;{{ title }}
          </div>
          <q-icon
            name="mdi-chevron-right"
            size="1rem"
            :class="{ 'q-ml-sm': $q.screen.gt.xs }"
          />
        </q-btn>
      </div>
    </div>
  </transition>
</template>

<script>
import EventDatePoster from 'src/components/EventDatePoster.vue';
import CustomQScroll from 'components/CustomQScroll.vue';
import { mapState, mapWritableState, mapActions } from 'pinia';
import { useBrowseStore } from 'src/stores/browse';
import _ from 'lodash';
import { useQueryStore } from 'src/stores/query';

export default {
  components: { EventDatePoster, CustomQScroll },
  props: {
    title: { default: '' },
    tagline: { default: '' },
    eventDates: {
      default: [],
    },
    tag: { default: '' },
    hasNext: { default: false },
  },
  data() {
    return {};
  },

  //mounted() {},
  methods: {
    ...mapActions(useBrowseStore, ['loadEventDates']),
    ...mapActions(useQueryStore, ['clearResults']),
    loadMore() {
      this.loadEventDates(this.tag);
    },
    onScroll(info) {
      if (info.horizontalPercentage > 0.99 && this.hasNext) {
        // reached bottom
        this.debouncedLoadMore();
      }
    },
    viewAll() {
      const tag = this.tag;
      // force loading state after clicking to prevent glitchy feeling ui
      this.clearResults();
      let index = this.controlTag?.findIndex((x) => x.tag === tag.tag);
      if (index > -1) {
        // tag already selected, do nothing
      } else {
        this.controlTag.push({ tag: tag, tag_t: this.title });
      }
      // go to browse page
      this.$router.push({
        name: 'BrowseEventDateList',
        params: { country: 'all' },
      });
    },
  },
  watch: {},
  computed: {
    ...mapState(useBrowseStore, ['taggedEvents']),
    ...mapWritableState(useQueryStore, ['controlTag']),
  },
  created() {
    this.debouncedOnScroll = _.debounce(this.onScroll, 10);
    this.debouncedLoadMore = _.debounce(this.loadMore, 150, {
      leading: true,
      trailing: false,
    });
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}

.body--light {
}

.user-event-scroll-area {
  height: 280px;
  margin-bottom: -8px;
  mask-image: linear-gradient(
    to left,
    transparent 0px,
    white 32px,
    white calc(100% - 16px),
    transparent 100%
  );
  width: 100%;
  :deep(.ed-poster) {
    width: 150px;
  }
}
</style>
