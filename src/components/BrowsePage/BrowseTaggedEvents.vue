<template>
  <div class="flex column browse-">
    <div
      class="text-h5 inter bolder"
      :class="$q.screen.gt.xs ? 'q-px-lg q-mt-xl' : 'q-px-md'"
    >
      {{ title }}
    </div>
    <div
      class="text-large inter bold t3"
      :class="$q.screen.gt.xs ? 'q-px-lg' : 'q-px-md'"
    >
      {{ tagline }}
    </div>
    <div :class="$q.screen.gt.xs ? 'q-mt-lg' : ''">
      <q-scroll-area
        horizontal
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
          class="flex row no-wrap q-gutter-md"
          :class="$q.screen.gt.xs ? 'q-px-lg' : 'q-px-md'"
        >
          <EventDatePoster
            v-for="(ed, index) in eventDates"
            :key="index"
            :hideInfo="true"
            :event="ed[0]"
          />
        </div>
      </q-scroll-area>
    </div>
  </div>
</template>

<script>
import common from 'assets/common';
import { mapState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
//import InnerLoading from 'src/components/InnerLoading.vue';
import EventDatePoster from 'src/components/EventDatePoster.vue';

export default {
  components: { EventDatePoster },
  props: {
    tag: {},
    title: {},
    tagline: {},
    description: {},
    eventDates: [],
  },
  data() {
    return {
      user: null,
      loading: false,
    };
  },
  //mounted() {},
  methods: {},
  watch: {},
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
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

.user-event-scroll-area {
  height: 288px;
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
