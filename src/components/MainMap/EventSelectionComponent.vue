<template>
  <BackdropBlurDialog ref="dialog">
    <q-card class="q-dialog-plugin dialog-card">
      <q-card-section
        class="header row no-wrap items-center justify-between dialog-card-header"
      >
        <div class="flex column">
          <div class="text-h6">{{ data.name }}</div>
        </div>
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <div
        class="t3 q-mt-md q-mb-md q-ml-md"
        style="font-weight: 600 !important"
      >
        {{ $t('event.events_at') }}
      </div>
      <q-separator />
      <q-list separator v-if="data && data.events">
        <q-item
          clickable
          v-ripple
          class="event"
          v-for="(item, index) in consolidatedList"
          :key="index"
          @click="showEventPage(item)"
        >
          <q-item-section>
            <q-item-label class="inter bold">{{ item.name }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </BackdropBlurDialog>
</template>

<script>
import { useMapStore } from 'src/stores/map';
import { mapWritableState } from 'pinia';
import BackdropBlurDialog from '../BackdropBlurDialog.vue';

export default {
  name: 'EventSelectionComponent',
  components: { BackdropBlurDialog },
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
        place_id: this.data.place_id,
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

<style lang="scss" scoped>
.dialog-card {
  max-width: 90vw;
}
</style>
