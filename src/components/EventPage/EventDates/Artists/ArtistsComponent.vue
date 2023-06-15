<template>
  <div
    v-if="selectedEventDate"
    class="flex row items-start no-wrap ed-inline-card editing-outline"
    :class="[editing ? 'editing q-px-md' : '']"
    @click="editing ? (showEditingDialog = true) : null"
  >
    <div class="flex row items-start no-wrap" style="width: 100%">
      <div class="flex column grow">
        <!--
        <div
          class="q-ml-md t2"
          :class="$q.screen.gt.sm ? 'text-large' : ''"
          v-if="
            selectedEventDate.artists && selectedEventDate.artists.length > 0
          "
        >
          {{ $t('suggestions.artists') }}:
        </div>
        <div
          v-else
          class="t4 q-ml-md"
          :class="$q.screen.gt.sm ? 'text-large' : ''"
          @click="showEditingDialog = true"
          style="cursor: pointer"
        >
          <span>
            <u>{{ $t('event_date_inline.add_lineup') }}</u>
          </span>
        </div>
      -->
        <div
          style="width: 100%"
          class="flex column no-wrap grow"
          v-if="
            selectedEventDate.artists && selectedEventDate.artists.length > 0
          "
        >
          <div class="flex q-mb-md q-mt- artist-tabs" v-if="stages.length > 1">
            <q-tabs
              v-model="selectedStage"
              inline-label
              shrink
              :active-color="$q.dark.isActive ? 'grey-4' : 'grey-9'"
              class="t3"
              outside-arrows
              mobile-arrows
            >
              <q-tab
                v-for="stage in stages"
                :key="stage"
                :label="stage"
                :name="stage"
              />
            </q-tabs>
          </div>
          <q-list class="t2" style="width: 100%">
            <div
              class="flex column"
              v-for="(artist, index) in trimmedArtistsOfStage"
              :key="index"
            >
              <q-separator v-if="index > 0" />
              <ArtistListItem :artist="artist" />
            </div>
            <!-- SHOW MORE ARTISTS -->
            <div
              v-if="artistsOfStage != null && artistsOfStage.length > 10"
              class="flex row items-center no-wrap link-hover q-py-md q-pl-lg"
              @click="showAllArtists = !showAllArtists"
              style="cursor: pointer"
            >
              <q-icon
                size="2em"
                :name="showAllArtists ? 'las la-angle-up' : 'las la-angle-down'"
                class="t4"
              />
              <div
                class="flex column q-ml-md t2"
                :class="{ 'text-large': $q.screen.gt.sm }"
              >
                <u class="t4 q-ml-sm" v-if="!showAllArtists">{{
                  $t('event_date_inline.show_all')
                }}</u>
                <u class="t4 q-ml-sm" v-else>{{
                  $t('event_date_inline.show_less')
                }}</u>
              </div>
            </div>
          </q-list>
        </div>
      </div>
    </div>

    <q-dialog
      v-if="editing || showMoreFields"
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
import ArtistListItem from './ArtistListItem.vue';
import SelectArtistsDialog from './SelectArtistsDialog.vue';

import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';

export default {
  name: 'ArtistsComponent',
  components: {
    SelectArtistsDialog,
    ArtistListItem,
  },
  watch: {
    selectedEventDateArtists: {
      deep: true,
      handler() {
        this.loadArtistList();
        this.loadStages();
      },
    },
  },
  data() {
    return {
      showEditingDialog: false,
      stages: [],
      artistsList: [],
      selectedStage: null,
      showAllArtists: false,
    };
  },
  props: {
    editing: Boolean,
    showMoreFields: Boolean,
  },
  methods: {
    loadStages() {
      var stages = [];
      // first get stages that exist in artist list
      stages = this.selectedEventDate.artists.map((x) => x.stage);
      stages = [...new Set(stages)]; // remove duplicates
      stages = stages.sort((a, b) => a.localeCompare(b));
      if (stages.length === 0) {
        stages.push('main stage');
      } else if (stages.indexOf('main stage') > -1) {
        // move main stage to front of list
        stages.splice(stages.indexOf('main stage'), 1);
        stages.splice(0, 0, 'main stage');
      }
      this.stages = stages;
      this.selectedStage = stages[0];
    },
    hideDialog() {
      this.showEditingDialog = false;
      this.loadArtistList();
    },
    loadArtistList() {
      this.artistsList = _.cloneDeep(this.selectedEventDate.artists);
      this.sortArtistList();
    },
    sortArtistList() {
      // sort by name
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
      // sort by popularity
      this.artistsList.sort((a, b) => b.popularity - a.popularity);
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
    trimmedArtistsOfStage() {
      // show all or nah?
      if (this.artistsOfStage.length > 10 && !this.showAllArtists) {
        return this.artistsOfStage.slice(0, 10);
      } else {
        return this.artistsOfStage;
      }
    },
    artistsOfStage() {
      if (this.selectedStage === 'main stage') {
        // if main stage is selected, show artists with no stage assigned
        return this.artistsList.filter(
          (x) => x.stage === 'main stage' || !x.stage
        );
      } else {
        return this.artistsList.filter((x) => x.stage === this.selectedStage);
      }
    },

    selectedEventDateArtists() {
      if (this.selectedEventDate && this.selectedEventDate.artists) {
        return this.selectedEventDate.artists;
      } else {
        return [];
      }
    },
  },
  beforeMount() {
    this.loadArtistList();
    this.loadStages();
  },
};
</script>

<style lang="scss" scoped>
.artist-tabs {
  width: 100%;
}
.body--light {
  .artist-tabs {
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  }
}
.body--dark {
  .artist-tabs {
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }
}
</style>
