<template>
  <div class="date-header-wrapper">
    <div
      class="date-header flex row no-wrap grow ellipsis inter"
      :class="{
        ' q-px-md q-pb-md  semibold t1 inter  ': $q.screen.gt.sm,
        'q-pt-md': $q.screen.gt.xs && $route.name !== 'Explore',
        'q-px-sm q-ml-xs q-py-md t1 semibold': $q.screen.lt.md,
      }"
    >
      <span v-if="!!altLabel">{{ altLabel }}</span>
      <span v-else-if="dateString">Events in {{ dateString }}</span>

      <slot />
      <!--
      <q-separator class="grow q-ml-md" v-if="$q.screen.gt.lg" />
      -->
    </div>
    <div class="date-header-shadow" />
  </div>
</template>
<script>
import moment from 'moment-timezone';

export default {
  props: {
    date: String,
    altLabel: String,
  },
  components: {},
  computed: {
    dateString() {
      if (this.date) {
        return '' + moment(this.date).format('MMMM YYYY');
      } else {
        return '';
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.date-header-wrapper {
  position: sticky;
  top: -1px;
  width: 100%;
  z-index: 501;

  .date-header {
    height: 100%;
    position: relative;
    //position: absolute;
    width: 100%;
    display: flex;
    align-items: center;
    // font-size: 1rem;
    font-weight: 600;
    //bottom: 4px;
    //padding: 32px 0;
  }
}

.body--light {
  .date-header {
    background: white !important;
  }
}
.body--dark {
  .date-header {
    background: black !important;
  }
}
@media only screen and (max-width: 599px) {
  .body--light {
    .date-header {
      background: white !important;
    }
  }
  .body--dark {
    .date-header {
      background: black !important;
    }
  }
  .date-header-wrapper {
    .date-header {
      //width: calc(100% - 64px) !important;
      //padding-right: 64px !important;
      font-size: unset;
      font-weight: 600;
    }
  }
}
</style>
