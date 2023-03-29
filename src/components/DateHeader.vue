<template>
  <div class="date-header-wrapper q-m">
    <div
      class="date-header flex row grow ellipsis q-py-md t1 chicago"
      :class="$q.screen.gt.xs ? ' q-px-md' : 'q-px-sm'"
    >
      Events in {{ dateString }}
      <q-separator class="grow q-ml-md" v-if="$q.screen.gt.lg" />
    </div>
    <div class="date-header-shadow" />
  </div>
</template>
<script>
import moment from 'moment-timezone';

export default {
  props: {
    date: String,
  },
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
    font-size: 1rem;
    margin-bottom: 4px;
    //padding: 32px 0;
  }
  /*
  .date-header-shadow {
    box-shadow: 0px 0px 46px -6px rgba(0, 0, 0, 0.2);
    position: absolute;
    top: 0px;
    height: 30px;
    width: 100%;
    z-index: 3005;
  }
  */
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
  .date-header {
    //width: calc(100% - 64px) !important;
    //padding-right: 64px !important;
  }
}
</style>
