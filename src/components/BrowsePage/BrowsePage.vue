<template>
  <div class="browse-page">
    <div class="region-list">
      <CustomQScroll style="width: 100%; height: 100%">
        <CountryRegionList v-if="$q.screen.gt.sm" />
      </CustomQScroll>
    </div>
    <SolidPage>
      <template v-slot>
        <div
          class="flex column justify-center q-mb-xl"
          :class="$q.screen.gt.xs ? 'q-pb-xl' : 'q-mt-m'"
          :style="$q.screen.gt.xs ? '' : 'margin-top: -16px'"
        >
          <div class="flex column" v-if="!$route.params.country">
            <!--
            <div class="text-h5 bolder inter q-mt-lg q-ml-lg">
              Featured Events
            </div>
            <div class="text-h4 bolder inter q-mt-lg q-ml-lg">...</div>
-->
            <div class="flex column" v-if="ready">
              <BrowseTaggedEvents
                v-for="(tag, index) in Object.keys(taggedEvents)"
                :key="index"
                :title="items[tag].title"
                :tagline="items[tag].tagline"
                :description="items[tag].description"
                :eventDates="taggedEvents?.[tag]?.eventDates"
              />
            </div>
            <InnerLoading v-else />
          </div>
          <div class="flex column" v-else>
            <div class="text-h5 bolder inter q-mt-lg q-ml-lg">
              <span v-if="$route.params.country === 'all'">
                {{ $t('browse_page.all_worldwide') }}
              </span>
              <span v-else>
                {{ $t('browse_page.events_in') }}&nbsp;<span
                  v-if="$route.params.region"
                  >{{ $route.params.region }},&nbsp;</span
                >{{
                  countryCodes.find((x) => x.code == $route.params.country)
                    ?.name
                }}&nbsp;{{
                  countryCodes.find((x) => x.code == $route.params.country)
                    ?.emoji_flag
                }}
              </span>
            </div>
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

export default {
  name: 'BrowsePage',
  components: {
    SolidPage,
    BrowseTaggedEvents,
    InnerLoading,
    ControlsComponent,
    CountryRegionList,
    CustomQScroll,
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
  async mounted() {
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
    ...mapState(useBrowseStore, ['taggedEvents']),
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

.solid-page {
  :deep(.solid-page-content) {
    padding: 0px !important;
    margin-left: 250px;
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
@media only screen and (max-width: 599px) {
  .solid-page {
    padding-top: 118px !important;
  }
  .browse-page {
  }
}
</style>
