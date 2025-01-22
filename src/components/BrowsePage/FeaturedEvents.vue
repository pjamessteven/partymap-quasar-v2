<template>
  <div class="featured-events">
    <div
      class="flex column justify-center q-mb-xl"
      :class="$q.screen.gt.xs ? 'q-pb-xl q-mt-md ' : 'q-mt-lg'"
    >
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
      <InnerLoading :solid="false" v-else />
    </div>
  </div>
</template>

<script>
import common from 'assets/common';
import { mapActions, mapState } from 'pinia';
import { useBrowseStore } from 'src/stores/browse';
import BrowseTaggedEvents from './BrowseTaggedEvents.vue';
import InnerLoading from 'src/components/InnerLoading.vue';

export default {
  name: 'FeaturedEvents',
  components: {
    BrowseTaggedEvents,
    InnerLoading,
  },
  props: {},
  data() {
    return {
      ready: false,
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
    for (const tag of Object.keys(this.items)) {
      if (Object.keys(this.taggedEvents).indexOf(tag) == -1) {
        try {
          await this.loadEventDates(tag);
          this.ready = true;
        } catch (e) {
          console.log(e);
        }
      }
    }
    this.ready = true;
  },
  methods: { ...mapActions(useBrowseStore, ['loadEventDates']) },
  watch: {},
  computed: {
    ...mapState(useBrowseStore, ['taggedEvents']),
  },
  created() {},
};
</script>

<style lang="scss" scoped>
.body--dark {
}

.body--light {
}

@media only screen and (min-width: 600px) {
}
@media only screen and (max-width: 599px) {
}
</style>
