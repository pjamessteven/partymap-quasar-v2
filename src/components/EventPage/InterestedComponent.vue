<template>
  <div class="">
    <q-btn
      flat
      size="1rem"
      style="opacity: 0.8"
      label="Interested"
      icon="mdi-star-outline"
      icon-right="mdi-chevron-down"
      no-caps
    ></q-btn>
    <!--
    <q-btn-group outline class="interested-button-group">
      <q-btn outline icon="mdi-help-circle-outline" no-caps></q-btn>
      <q-btn outline icon="mdi-star-outline" label="Interested" no-caps></q-btn>
      <q-btn
        outline
        icon="mdi-check-circle-outline"
        label="Going"
        no-caps
      ></q-btn>
    </q-btn-group>
    -->
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';

export default {
  components: {},
  props: {},
  data() {
    return {
      loading: false,
      showMoreFields: false,
    };
  },
  methods: {
    ...mapActions(useEventStore, ['toggleInterested', 'toggleGoing']),
  },
  watch: {},
  computed: {
    ...mapState(useEventStore, [
      'event',
      'loadingEventDate',
      'selectedEventDateIndex',
      'selectedEventDate',
      'editing',
      'currentUserIsHost',
    ]),
    ...mapState(useAuthStore, ['currentUser', 'currentUserIsStaff']),
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}
.body--light {
}
</style>
