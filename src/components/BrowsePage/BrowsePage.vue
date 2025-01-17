<template>
  <div class="browse-page">
    <div class="region-list" v-if="$q.screen.gt.sm">
      <CustomQScroll style="width: 100%; height: 100%">
        <CountryRegionList />
      </CustomQScroll>
    </div>
    <SolidPage>
      <template v-slot>
        <div
          class="flex column justify-center q-mb-xl"
          :class="$q.screen.gt.xs ? 'q-pb-xl q-mt-xl' : 'q-mt-m'"
        >
          <TypographyTabs
            v-show="$q.screen.lt.md"
            :model-value="tab"
            @update:model-value="tab = $event"
            class="typography-tabs"
          >
            <q-route-tab
              name="featured"
              exact
              :to="{
                name: 'BrowsePage',
              }"
              :label="$t('browse_page.featured_events')"
            >
            </q-route-tab>
            <q-route-tab
              name="all"
              :to="{
                name: 'BrowsePage',
                params: {
                  country: 'all',
                },
              }"
              :label="$t('browse_page.all_events')"
            >
            </q-route-tab>
            <q-route-tab
              style="display: none"
              :name="country.code"
              :to="{
                name: 'BrowsePage',
                params: {
                  country: country.code,
                },
              }"
              v-for="(country, index) in countryCodes"
            >
            </q-route-tab>
            <q-tab
              name="countrylist"
              :label="$t('browse_page.by_country')"
              @click="tab = 'countrylist'"
            >
            </q-tab>
          </TypographyTabs>
          <div class="" v-if="tab === 'featured' || !tab">
            <div class="flex column" v-if="ready">
              <!--
                <div class="q-mb-lg q-ml-lg">
                  <span class="text-h5 bolder inter">
                    {{ $t('browse_page.featured_events') }}
                  </span>
                  <p />
                  <span>Feature your event on PartyMap</span>
                </div>
-->
              <q-intersection
                v-for="(tag, index) in Object.keys(taggedEvents)"
                :key="index"
                :style="$q.screen.gt.xs ? 'height: 400px' : 'height: 372px'"
              >
                <BrowseTaggedEvents
                  :title="items[tag].title"
                  :tagline="items[tag].tagline"
                  :description="items[tag].description"
                  :eventDates="taggedEvents?.[tag]?.eventDates"
                />
              </q-intersection>
            </div>
            <InnerLoading v-else />
          </div>
          <div v-else-if="tab === 'countrylist'">
            <CountryRegionList />
          </div>
          <div v-else>
            <div class="text-h5 inter bolder q-ml-lg q-mb-lg">
              <span v-if="$route.params.country !== 'all'">
                {{ $t('browse_page.events_in') }}&nbsp;<span
                  v-if="$route.params.region"
                  >{{ $route.params.region }},&nbsp;</span
                >{{
                  countryCodes.find((x) => x.code == $route.params.country)
                    ?.name
                }}&nbsp;
                {{
                  countryCodes.find((x) => x.code == $route.params.country)
                    ?.emoji_flag
                }}</span
              ><span v-else>
                {{ $t('browse_page.all_events') }}
              </span>
            </div>

            <BrowseEventDateList />
          </div>
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
import BrowseTaggedEvents from './BrowseTaggedEvents.vue';
import InnerLoading from 'src/components/InnerLoading.vue';
import ControlsComponent from '../Controls/ControlsComponent.vue';
import CountryRegionList from '../Controls/CountryRegionList.vue';
import CustomQScroll from '../CustomQScroll.vue';
import countryCodes from 'src/assets/country-code-emoji';
import TypographyTabs from '../TypographyTabs.vue';
import BrowseEventDateList from './BrowseEventDateList.vue';
export default {
  name: 'BrowsePage',
  components: {
    SolidPage,
    BrowseTaggedEvents,
    InnerLoading,
    ControlsComponent,
    CountryRegionList,
    CustomQScroll,
    TypographyTabs,
    BrowseEventDateList,
  },
  props: {
    username: {
      default: null,
    },
  },
  data() {
    return {
      tab: 'featured',
      ready: false,
      user: null,
      drawer: true,
      items: {
        nature: {
          title: this.$t('browse_page.nature'),
          tagline: this.$t('browse_page.nature_desc'),
          description: '',
        },
        burn: {
          title: this.$t('browse_page.burn'),
          tagline: this.$t('browse_page.burn_desc'),
          description: '',
        },
        beach: {
          title: this.$t('browse_page.beach'),
          tagline: this.$t('browse_page.beach_desc'),
          description: '',
        },
        psychedelic: {
          title: this.$t('browse_page.psychedelic'),
          tagline: this.$t('browse_page.psychedelic_desc'),
          description: '',
        },
        sustainability: {
          title: this.$t('browse_page.sustainability'),
          tagline: this.$t('browse_page.sustainability_desc'),
          description: '',
        },
        healing: {
          title: this.$t('browse_page.healing'),
          tagline: this.$t('browse_page.healing_desc'),
          description: '',
          tag: '',
        },
      },
    };
  },
  activated() {},
  async mounted() {
    this.tab = this.$route.params.country;
    if (!this.tab) {
      this.tab = 'featured';
    }
    for (const tag of Object.keys(this.items)) {
      try {
        await this.loadEventDates(tag);
        this.ready = true;
      } catch (e) {
        console.log(e);
      }
    }
  },
  methods: { ...mapActions(useBrowseStore, ['loadEventDates']) },
  watch: {},
  computed: {
    ...mapState(useBrowseStore, ['taggedEvents', 'countries']),
  },
  created() {
    this.timeAgo = common.timeAgo;
    this.dateUTCToLocal = common.dateUTCToLocal;

    this.countryCodes = countryCodes;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}

.body--light {
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

      :deep(.q-tabs__content) {
        // padding: 0 8px;
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
