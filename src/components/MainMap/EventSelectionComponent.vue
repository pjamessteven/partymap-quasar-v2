<template>
  <q-dialog ref="dialog">
    <q-card class="q-dialog-plugin dialog-card">
      <q-list bordered separator v-if="data && data.events">
        <q-item-label header
          >{{ $t('event.events_at') }} {{ data.name }}</q-item-label
        >
        <q-separator />
        <q-item
          clickable
          v-ripple
          class="event q-pa-md"
          v-for="(item, index) in consolidatedList"
          :key="index"
          @click="showEventPage(item)"
        >
          <q-item-section>
            <q-item-label>{{ item.name }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-dialog>
</template>

<script>
import { useMapStore } from 'src/stores/map';
import { mapWritableState } from 'pinia';

export default {
  name: 'EventSelectionComponent',
  components: {},
  watch: {},
  props: {
    data: Object,
  },
  data() {
    return {};
  },
  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.dialog.show();
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.dialog.hide();
    },
    showEventPage(data) {
      this.focusMarker = {
        lat: this.data.lat,
        lng: this.data.lng,
      };
      this.$router.push({
        name: 'EventPage',
        params: {
          id: data.event_id,
          eventDateId: data.event_date_id,
        },
        query: {
          name: data.name.replace(/ /g, '_'),
        },
      });
    },
  },
  computed: {
    ...mapWritableState(useMapStore, ['focusMarker']),
    consolidatedList() {
      // consolidate event_dates by returning only first one of the same event_id
      var consolidated = [];
      if (this.data.events) {
        for (var item of this.data.events) {
          if (
            consolidated.findIndex((x) => x.event_id === item.event_id) === -1
          ) {
            consolidated.push(item);
          }
        }
      }
      return consolidated;
    },
  },
};
</script>

<style lang="scss" scoped></style>
