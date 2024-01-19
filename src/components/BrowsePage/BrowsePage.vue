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
          title: 'Nature',
          tagline: 'Festivals set in idyllic locations',
          description: '',
        },
        burn: {
          title: 'Burns',
          tagline:
            'Anarchistic self-organized festivals that follow the ten prinicpals',
          description: '',
        },
        beach: {
          title: 'Beach',
          tagline: 'Get your toes wet',
          description: '',
        },
        psychedelic: {
          title: 'Psychedelic',
          tagline: 'Think outside the box ',
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
      for (const tag of Object.keys(this.items)) {
        try {
          await this.loadEventDates(tag);
          this.ready = true;
        } catch (e) {
          console.log(e);
        }
      }
    } else {
      setTimeout(() => {
        // wait for transition before displaying content for smoothness
        this.ready = true;
      }, 350);
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
@media only screen and (max-width: 600px) {
  .browse-page {
    padding-bottom: 68px;
  }
}
</style>
