<template>
  <transition appear enter-active-class="animated fadeIn slow">
    <div class="flex column browse-">
      <div
        class="text-h5 metropolis bolder"
        :class="$q.screen.gt.xs ? 'q-px-lg q-mt-xl' : 'q-px-md q-mt-lg'"
      >
        {{ title }}
      </div>
      <div
        class="text-large inter bold t3"
        :class="$q.screen.gt.xs ? 'q-px-lg' : 'q-px-md q-mt-xs'"
      >
        {{ tagline }}
      </div>
      <div :class="$q.screen.gt.xs ? 'q-mt-lg' : 'q-mt-md'">
        <CustomQScroll
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
              :hideInfo="false"
              :event="ed"
            />
          </div>
        </CustomQScroll>
      </div>
    </div>
  </transition>
</template>

<script>
//import InnerLoading from 'src/components/InnerLoading.vue';
import EventDatePoster from 'src/components/EventDatePoster.vue';
import CustomQScroll from 'components/CustomQScroll.vue';

export default {
  components: { EventDatePoster, CustomQScroll },
  props: {
    title: { default: '' },
    tagline: { default: '' },
    eventDates: {
      default: [],
    },
  },
  data() {
    return {};
  },
  //mounted() {},
  methods: {},
  watch: {},
};
</script>

<style lang="scss" scoped>
.body--dark {
}

.body--light {
}

.user-event-scroll-area {
  height: 280px;
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
