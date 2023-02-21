<template>
  <div class="flex row items-center">
    <span class="t2"
      >{{ $t('activity.updated') }}
      {{ relativeHumanTime(event.most_recent_activity.time) }}
      {{ $t('activity.by') }} {{ event.most_recent_activity.actor }}
    </span>
    <span style="cursor: pointer" @click="showDialog"
      >&nbsp;[{{ $t('activity.view_all_activity') }}]</span
    >

    <q-dialog
      v-model="showingDialog"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card v-if="showingDialog">
        <div class="text-h6 t1 q-pa-md">Changes</div>
        <Activities :activities="eventActivity" />
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import common from 'assets/common';
import Activities from './Activities.vue';
export default {
  components: {
    Activities,
  },
  props: {
    loading: Boolean,
  },
  data() {
    return {
      showingDialog: false,
    };
  },
  methods: {
    getVerb(verb) {
      if (verb === 'update') {
        return this.$t('activity.updated');
      } else if (verb === 'create') {
        return this.$t('activity.created');
      } else if (verb === 'revert') {
        return this.$t('activity.reverted');
      } else return null;
    },
    getModelName(modelName) {
      if (modelName === 'Event') {
        return this.$t('activity.event');
      } else if (modelName === 'EventDate') {
        return this.$t('activity.event_date');
      } else return null;
    },
    showDialog() {
      if (!this.eventActivity) {
        this.loading = true;
        this.$store
          .dispatch('currentEvent/loadEventActivity', this.event.id)
          .then((response) => {
            this.loading = false;
          });
      }
      this.showingDialog = true;
    },
  },
  watch: {},
  computed: {
    event() {
      return this.$store.state.currentEvent.event;
    },
    eventActivity() {
      return this.$store.state.currentEvent.eventActivity;
    },
  },
  beforeMount() {},
  mounted() {},
  created() {
    this.relativeHumanTime = common.relativeHumanTime;
  },
  unmounted() {},
};
</script>

<style lang="scss" scoped>
.body--dark {
}

.body--light {
}

a {
  text-decoration: none;
  font-weight: 700;
}
@media only screen and (max-width: 1023px) {
  .card {
    margin-top: 0px;
    width: 100%;
    height: 100%;
  }
}
</style>
