<template>
  <div class="contributors-main flex column grow no-wrap">
    <div class="contributors-container grow q-mt-md">
      <q-list bordered separator>
        <q-item
          clickable
          v-ripple
          v-for="(item, index) in contributorsSorted"
          :key="index"
        >
          <q-item-section>
            <q-item-label class="flex row items-center">
              {{ item[0].username }}
              <q-badge
                color="primary"
                class="q-ml-xs"
                :label="item[0].version_count"
              />
            </q-item-label>
            <q-item-label caption>
              {{ $t('contributors.edited_this_page') }}
              {{ item[1] }}
              <span v-if="item[1] === 1">
                {{ $t('contributors.time') }}
              </span>
              <span v-else>
                {{ $t('contributors.times') }}
              </span>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <q-inner-loading :showing="loading">
        <q-spinner-ios
          :color="$q.dark.isActive ? 'white' : 'black'"
          size="2em"
        />
      </q-inner-loading>
    </div>
  </div>
</template>

<script>
import { getEventContributorsRequest } from 'src/api';
// import Contributor from './Contributor.vue'
import common from 'assets/common';

export default {
  components: {},
  props: {},
  data() {
    return {
      selectedRevisionIndex: null,
      loading: false,
      loadingActivities: false,
      items: null,
      contributors: null,
      total: 0,
    };
  },
  methods: {},
  watch: {},
  computed: {
    contributorsSorted() {
      if (this.contributors != null) {
        var contributors = this.contributors;
        contributors.sort((a, b) => {
          if (a[1] > b[1]) {
            return -1;
          } else if (a[1] < b[1]) {
            return 1;
          } else {
            return 0;
          }
        });
        return contributors;
      } else {
        return [];
      }
    },
    event() {
      return this.$store.state.currentEvent.event;
    },
  },
  beforeMount() {},
  mounted() {
    this.loading = true;
    getEventContributorsRequest(this.event.id, { page: 0 }).then(
      (response) => {
        this.contributors = response.data.items;
        this.loading = false;
        this.total = response.data.total;
      },
      () => {
        this.loading = false;
      }
    );
  },
  created() {
    this.relativeHumanTime = common.relativeHumanTime;
  },
  unmounted() {},
};
</script>

<style lang="scss" scoped>
.contributors {
  position: relative;
}
.contributors-container {
  position: relative;
  min-height: 100px;
}

@media only screen and (max-width: 1023px) {
}
</style>
