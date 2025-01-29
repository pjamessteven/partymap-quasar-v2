<template>
  <div class="browse-page">
    <div class="region-list" v-if="$q.screen.gt.sm">
      <CustomQScroll style="width: 100%; height: 100%">
        <CountryRegionList />
      </CustomQScroll>
    </div>
    <SolidPage @scrollPercentage="scrollPercent = $event">
      <template v-slot="{ scrollPercentage, resetScrollPosition }">
        <div
          class="flex column justify-center q-mb-xl"
          :class="$q.screen.gt.xs ? 'q-pb-xl q-mt-lg' : ''"
        >
          <TypographyTabs
            :key="stickyTabs"
            v-show="$q.screen.lt.md"
            :model-value="tab"
            @update:model-value="tab = $event"
            class="typography-tabs"
            :class="{
              sticky: $route.name === 'CountryRegionList',
            }"
          >
            <q-route-tab
              exact
              name="featured"
              :to="{
                name: 'FeaturedEvents',
              }"
              :label="$t('browse_page.featured_events')"
            >
            </q-route-tab>
            <q-route-tab
              name="all"
              exact
              :to="{
                name: 'BrowseEventDateList',
                params: {
                  country: 'all',
                },
              }"
              :label="$t('browse_page.all_events')"
            >
            </q-route-tab>
            <q-route-tab
              name="countrylist"
              :to="{
                name: 'CountryRegionList',
              }"
              :label="$t('browse_page.by_country')"
            >
            </q-route-tab>
          </TypographyTabs>
          <router-view v-slot="{ Component }">
            <keep-alive :max="1">
              <component
                :is="Component"
                :scrollPercentage="scrollPercentage"
                :resetScrollPosition="resetScrollPosition"
              /> </keep-alive
          ></router-view>
        </div>
      </template>
    </SolidPage>
  </div>
</template>

<script>
import common from 'assets/common';
import { mapActions, mapState } from 'pinia';
import SolidPage from 'src/components/dialogs/SolidPage.vue';
import { useBrowseStore } from 'src/stores/browse';

import InnerLoading from 'src/components/InnerLoading.vue';
import CountryRegionList from './CountryRegionList.vue';
import CustomQScroll from '../CustomQScroll.vue';
import TypographyTabs from '../TypographyTabs.vue';
export default {
  name: 'BrowsePage',
  components: {
    SolidPage,
    InnerLoading,
    CountryRegionList,
    CustomQScroll,
    TypographyTabs,
  },
  props: {
    username: {
      default: null,
    },
  },
  data() {
    return {
      ready: false,
      user: null,
      tab: null,
      scrollPercent: 0,
      stickyTabs: false,
    };
  },
  activated() {},
  async mounted() {},
  methods: { ...mapActions(useBrowseStore, ['loadEventDates']) },
  /*
  watch: {
    scrollPercent: {
      handler: function (newv, oldv) {
        if (oldv > newv) {
          this.stickyTabs = true;
        } else {
          this.stickyTabs = false;
        }
      },*/

  computed: {
    ...mapState(useBrowseStore, ['taggedEvents', 'countries']),
  },
  created() {
    this.timeAgo = common.timeAgo;
    this.dateUTCToLocal = common.dateUTCToLocal;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .typography-tabs {
    background: black;
  }
}

.body--light {
  .typography-tabs {
    background: white;
  }
}

.browse-page {
  .region-list {
    position: absolute;
    left: 0px;
    padding-top: 72px;
    height: 100%;
    width: 300px;
    z-index: 4001;
  }
  .controls-component {
    position: sticky;
    top: 16px;
  }
}
@media only screen and (min-width: 600px) {
  .solid-page {
    :deep(.solid-page-content) {
      padding: 0px !important;
      margin-left: 250px;
    }
  }
}
@media only screen and (max-width: 599px) {
  .solid-page {
    padding-top: 64px !important;
  }
  .browse-page {
    .typography-tabs {
      width: 100%;
      z-index: 1000;

      position: relative; /* Initially, the header is positioned relative */
      :deep(.q-tabs__content) {
        // padding: 0 8px;
      }
      &.sticky {
        position: sticky;
        top: 0px;
        left: 0;
      }
    }
    :deep(.q-tab-panels) {
      width: 100%;
      .q-tab-panel {
        padding: 0px !important;
      }
    }
  }
}
</style>
