<template>
  <SolidPage>
    <template v-slot>
      <div
        class="flex column browse-page q-mb-xl"
        :class="$q.screen.gt.xs ? 'q-pb-xl' : 'q-mt-m'"
        :style="$q.screen.gt.xs ? '' : 'margin-top: -16px'"
      >
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
    </template>
  </SolidPage>
</template>

<script>
import common from 'assets/common';
import { mapActions, mapState } from 'pinia';
import SolidPage from 'src/components/dialogs/SolidPage.vue';
import { useBrowseStore } from 'src/stores/browse';
import BrowseTaggedEvents from './BrowseTaggedEvents.vue';
import InnerLoading from 'src/components/InnerLoading.vue';

export default {
  name: 'BrowsePage',
  components: { SolidPage, BrowseTaggedEvents, InnerLoading },
  props: {
    username: {
      default: null,
    },
  },
  data() {
    return {
      ready: false,
      user: null,
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
  }
}
@media only screen and (max-width: 599px) {
  .browse-page {
    padding-bottom: 68px;
  }
}
</style>
