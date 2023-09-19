<template>
  <div class="versions-main flex column grow no-wrap q-mt-md">
    <div class="controls flex row items-center no-wrap">
      <q-btn
        flat
        icon="mdi-chevron-left"
        @click="loadMoreRevisions"
        :disable="!hasNext"
        :label="$t('activity.older')"
      />
      <transition appear enter-active-class="animated slideInUp slow">
        <q-slider
          class="q-ma-md"
          v-model="selectedRevisionIndex"
          color="primary"
          label
          :disable="items && items.length == 1"
          :label-value="
            selectedRevision
              ? $t('activity.revision') +
                ' ' +
                selectedRevisionIndex +
                ' ' +
                $t('activity.by') +
                ' ' +
                selectedRevision.transaction.user.username
              : null
          "
          :label-always="items != null && items.length > 0"
          markers
          snap
          :min="minIndex"
          :max="maxIndex"
          :step="1"
          @pan="onSliderPress"
          @change="onSliderRelease($event)"
        />
      </transition>
      <q-btn
        flat
        :label="$t('activity.revert')"
        @click="loadMoreRevisions"
        :disable="!hasNext"
      />
      <q-inner-loading :showing="loading">
        <q-spinner-ios
          :color="$q.dark.isActive ? 'white' : 'black'"
          size="2em"
        />
      </q-inner-loading>
    </div>
    <div
      class="activities-header text-bold q-mb-sm q-mt-md"
      v-if="selectedRevision != null"
    >
      {{ $t('activity.revision') }} {{ selectedRevision.index }}
      {{ $t('activity.by') }}
      <router-link
        :to="{
          path: '/user/' + selectedRevision.transaction.user.username,
          params: selectedRevision.transaction.user.username,
        }"
        class="t1"
        >{{ selectedRevision.transaction.user.username }}</router-link
      >
      {{ relativeHumanTime(selectedRevision.transaction.issued_at) }}:
    </div>
    <div class="activities-container">
      <div
        class="activities"
        v-if="activitiesComputed != null && activitiesComputed.length > 0"
      >
        <div
          v-for="(a, index) in activitiesComputed"
          :key="index"
          class="flex column"
        >
          <Activity :activity="a" :compact="true" class="q-mb-sm" />
        </div>
      </div>
      <q-inner-loading :showing="loadingActivities">
        <q-spinner-ios
          :color="$q.dark.isActive ? 'white' : 'black'"
          size="2em"
        />
      </q-inner-loading>
    </div>
  </div>
</template>

<script>
import { getEventVersionsRequest, getActivitiesOfTransaction } from 'src/api';
import Activity from './Activity.vue';
import common from 'assets/common';

import { useEventStore } from 'src/stores/event';
import { mapState } from 'pinia';

export default {
  components: { Activity },
  props: {},
  data() {
    return {
      selectedRevisionIndex: null,
      loading: false,
      loadingActivities: false,
      items: null,
      activities: null,
      hasNext: false,
      page: 1,
      total: 0,
      perPage: 20,
      blockSliderUpdates: false,
    };
  },
  methods: {
    close() {
      // revert to most recent revision
      this.event = this.items[0];
      this.$emit('close');
    },
    onSliderPress() {
      this.activities = null;
      this.blockActivityUpdates = true;
    },
    onSliderRelease() {
      this.blockActivityUpdates = false;
      this.loadActivities(this.selectedRevision.transaction_id);
    },
    loadMoreRevisions() {
      this.page += 1;
      this.loading = true;
      getEventVersionsRequest(this.event.id, {
        page: this.page,
        per_page: this.perPage,
      }).then((response) => {
        this.items = [...this.items, ...response.data.items];
        this.hasNext = response.data.has_next;
        this.loading = false;
        this.total = response.data.total;
      });
    },
    loadActivities(transactionId) {
      if (this.selectedRevision != null) {
        this.loadingActivities = true;
        getActivitiesOfTransaction(transactionId, { page: 0 }).then(
          (response) => {
            this.loadingActivities = false;
            this.activities = response.data.items;
          },
          () => {
            this.loadingActivities = false;
          }
        );
      }
    },
  },
  watch: {
    selectedRevision: function (newValue) {
      this.activities = null;
      this.event = newValue;
    },
  },
  computed: {
    ...mapWritableState(useEventStore, ['event']),

    activitiesComputed() {
      if (this.activities) {
        var sorted = this.activities;
        sorted.sort((a, b) => {
          if (a.object_type === 'Rrule') {
            // show Rrule activities first
            // because they are usually proceeded by several create/delete events
            return -1;
          } else {
            return 1;
          }
        });
        return sorted;
      } else {
        return [];
      }
    },
    selectedRevision() {
      if (
        this.selectedRevisionIndex != null &&
        this.items &&
        this.items.length > 0
      ) {
        return this.items.find((x) => x.index === this.selectedRevisionIndex);
      } else {
        return null;
      }
    },
    minIndex() {
      if (this.items != null) {
        return this.items[this.items.length - 1].index;
      } else {
        return 0;
      }
    },
    maxIndex() {
      if (this.items != null) {
        return this.items[0].index;
      } else {
        return 0;
      }
    },
  },
  mounted() {
    this.loading = true;
    getEventVersionsRequest(this.event.id, {
      page: 1,
      per_page: this.perPage,
    }).then((response) => {
      this.items = response.data.items;
      this.hasNext = response.data.has_next;
      this.loading = false;
      this.total = response.data.total;
      this.selectedRevisionIndex = this.items[0].index;
      this.loadActivities(this.items[0].transaction_id);
    });
  },
  created() {
    this.relativeHumanTime = common.relativeHumanTime;
  },
};
</script>

<style lang="scss" scoped>
.versions-main {
  position: relative;
  .controls {
    position: relative;
  }
}
.activities-container {
  position: relative;
  min-height: 100px;
  .activities {
    max-height: 400px;
    overflow-y: auto;
  }
}

@media only screen and (max-width: 1023px) {
}
</style>
