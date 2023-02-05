<template>
  <div>
    <q-btn
      @click="getLocation"
      no-caps
      class="button-control flex items-center"
      :loading="userLocationLoading"
    >
      <div class="flex items-center row no-wrap">
        <!--<q-icon left name="las la-calendar " />-->
        <q-icon
          v-if="true == false"
          style="font-size: 18px"
          name="mdi-close-thick"
          class="q-pr-md"
        />

        <div
          v-if="userLocationLoading"
          class="q-mr-sm"
          style="position: relative; height: 17px; width: 14px"
        >
          <i
            class="absolute mdi mdi-crosshairs q-py-none"
            style="left: 0; top: -4px"
          />
          <i
            class="absolute mdi mdi-crosshairs-gps animated q-py-none infinite flash slowest absolute"
            style="left: 0; top: -4px"
          />
        </div>
        <div v-else>
          <i
            class="mdi mdi-crosshairs-gps q-mr-sm q-ml-none q-pr-none"
            v-if="fineLocation"
          />
          <i class="mdi mdi-crosshairs q-mr-sm q-ml-none q-pr-none" v-else />
        </div>
        <!--
        <div v-if="userLocationName">
          {{ userLocationName }}
        </div>
      -->
        <div>
          {{ $t('top_controls.nearby') }}
        </div>
      </div>
    </q-btn>
  </div>
</template>

<script>
import { mapActions, mapState } from 'pinia';
import { useMainStore } from 'src/stores/main';
export default {
  components: {},
  props: {},
  data() {
    return {};
  },
  watch: {},
  methods: {
    ...mapActions(useMainStore, ['getFineLocation']),
  },
  computed: {
    ...mapState(useMainStore, [
      'userLocationName',
      'userLocationLoading',
      'fineLocation',
    ]),
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}
.body--light {
}

.animated.slowest {
  animation-duration: calc(var(--animate-duration) * 10);
}

@media only screen and (max-width: 1023px) {
}
</style>
