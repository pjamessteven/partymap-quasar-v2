<template>
  <SolidPage>
    <template v-slot>
      <div class="flex column browse-page q-pb-xl">
        <BrowseTaggedEvents
          v-for="(tag, index) in Object.keys(taggedEvents)"
          :key="index"
          :title="items[tag].title"
          :tagline="items[tag].tagline"
          :description="items[tag].description"
          :eventDates="taggedEvents[tag].eventDates"
        >
        </BrowseTaggedEvents>
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
//import InnerLoading from 'src/components/InnerLoading.vue';

export default {
  components: { SolidPage, BrowseTaggedEvents },
  props: {
    username: {
      default: null,
    },
  },
  data() {
    return {
      user: null,
      loading: false,
      items: {
        nature: {
          title: 'Nature',
          tagline: 'Festivals set in idyllic locations',
          description: '',
        },
        burner: {
          title: 'Burner',
          tagline:
            'Anarchistic self-organized festivals that follow the ten prinicpals',
          description: '',
        },
        beach: {
          title: 'Beach',
          tagline: 'Get your toes wet',
          description: '',
        },
        sustainability: {
          title: 'Sustainability',
          tagline:
            'Festivals that emphasize their effort to reduce their environmental footprint',
          description: '',
        },
        healing: {
          title: 'Healing',
          tagline: 'Renew and transform...',
          description: '',
          tag: '',
        },
      },
    };
  },
  async mounted() {
    if (
      Object.keys(this.taggedEvents).length !== Object.keys(this.items).length
    ) {
      this.loading = true;
      for (const tag of Object.keys(this.items)) {
        await this.loadEventDates(tag);
      }
      this.loading = false;
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
</style>
