<template>
  <div class="date-header-wrapper">
    <div
      class="date-header flex row no-wrap justify-between grow ellipsis inter semibold"
      :class="{
        ' q-px-md q-pb-md  t2': $q.screen.gt.xs,
        'q-pt-md': $q.screen.gt.xs && $route.name !== 'Explore',
        'q-px-sm q-ml-xs q-py-md t2': $q.screen.lt.sm,
      }"
    >
      <span v-if="!!altLabel">{{ altLabel }}</span>
      <span v-else> Events in {{ dateString }}</span>
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
        return '' + moment(this.date).format('MMM YYYY');
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
  top: 0px;
  width: 100%;
  z-index: 501;

  .date-header {
    height: 100%;
    position: relative;
    //position: absolute;
    width: 100%;
    display: flex;
    align-items: center;
    //font-size: 1rem;
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
@media only screen and (max-width: 600px) {
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
  .date-header {
    //width: calc(100% - 64px) !important;
    //padding-right: 64px !important;
  }
}
</style>
