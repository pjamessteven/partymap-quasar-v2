<template>
  <div
    v-if="!!selectedEventDate"
    class="flex row items-center no-wrap ed-inline-card editing-outline"
    :class="[editing || showMoreFields ? 'editing q-px-md' : '']"
    @click="showEditingDialog = true"
  >
    <q-icon
      :size="$q.screen.gt.sm ? '2em' : '1.5rem'"
      class="t4"
      name="las la-music"
    />
    <div
      class="flex column q-ml-md t2"
      :class="$q.screen.gt.sm ? 'text-large' : ''"
    >
      <div
        class="t4 link-hover underline"
        @click="showEditingDialog = true"
        style="cursor: pointer"
      >
        <span v-if="selectedEventDate.artists?.length === 0">
          {{ $t('event_date_inline.add_lineup') }}
        </span>
        <span v-else> Edit the lineup </span>
      </div>
    </div>
    <q-dialog
      v-model="showEditingDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <SelectArtistsDialog
        @hideDialog="hideDialog()"
        :defaultDate="selectedEventDate.start_naive"
      />
    </q-dialog>
  </div>
</template>

<script>
import _ from 'lodash';
import SelectArtistsDialog from './Artists/SelectArtistsDialog.vue';
import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';
export default {
  name: 'EventDateAddArtistsComponent',
  components: {
    SelectArtistsDialog,
  },
  watch: {},
  data() {
    return { showEditingDialog: false };
  },
  props: {
    editing: Boolean,
    showMoreFields: Boolean,
  },
  methods: {
    hideDialog() {
      this.showEditingDialog = false;
      this.loadArtistList();
    },
    loadArtistList() {
      this.artistsList = _.cloneDeep(this.selectedEventDate.artists);
      this.sortArtistList();
    },
    sortArtistList() {
      // sort by name first
      this.artistsList.sort((a, b) => {
        var nameA = a.name.toUpperCase(); // ignore upper and lowercase
        var nameB = b.name.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
      // then sort by date
      this.artistsList.sort((a, b) => {
        if (!a.start_naive && !b.start_naive) {
          return 0;
        } else if (!a.start_naive) {
          return 1;
        } else if (!b.start_naive) {
          return -1;
        } else if (a.start_naive && b.start_naive) {
          return new Date(a.start_naive) - new Date(b.start_naive);
        }
      });
    },
  },
  computed: {
    ...mapState(useEventStore, ['event', 'selectedEventDate']),
  },
  beforeMount() {
    this.loadArtistList();
  },
};
</script>

<style lang="scss" scoped></style>
