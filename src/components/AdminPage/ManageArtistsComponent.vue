<template>
  <q-card>
    <q-card-section class="text-h6"> Artists: </q-card-section>
    <q-card-section>
      <div class="q-mb-md flex items-center q-gutter-sm">
        <q-input
          v-model="searchQuery"
          outlined
          dense
          debounce="300"
          placeholder="Search artists..."
          class="flex-grow"
        />

        <q-select
          v-model="sortField"
          :options="sortOptions"
          emit-value
          label="Sort by"
          option-label="label"
          dense
          outlined
          style="min-width: 150px"
        />
        <q-toggle
          v-model="sortDesc"
          :label="sortDesc ? 'Descending' : 'Ascending'"
        />
      </div>

      <q-list v-if="artists && artists.length > 0">
        <q-item v-for="(artist, index) in artists" :key="index" tag="label">
          <q-item-section side>
            <q-checkbox v-model="selectedArtists" :val="artist.id" />
          </q-item-section>
          <q-item-section>
            <div class="flex row grow justify-between no-wrap items-center">
              <div class="flex column no-wrap">
                <q-item-label class="flex row items-center">
                  <router-link
                    class="link-hover"
                    :to="{ name: 'ArtistPage', params: { id: artist.id } }"
                  >
                    {{ artist.name }}
                  </router-link>
                </q-item-label>

                <q-item-label caption>
                  created {{ timeAgo(artist.created_at) }}
                </q-item-label>
                <q-item-label caption>
                  Events: {{ artist.event_count || 0 }}
                </q-item-label>
              </div>
              <div class="controls">
                <q-btn
                  color="blue"
                  round
                  size="sm"
                  flat
                  @click.stop="refreshArtist(artist.id)"
                  :loading="artist.refreshing"
                >
                  <q-icon name="las la-sync" />
                  <q-tooltip>Refresh artist data</q-tooltip>
                </q-btn>
                <q-btn
                  color="red"
                  round
                  size="sm"
                  flat
                  @click.stop="deleteArtist(artist.id)"
                >
                  <q-icon name="las la-trash" />
                  <q-tooltip>Delete artist</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-item-section>
        </q-item>
        <div class="flex grow justify-center">
          <q-btn
            :label="$t('activity.load_more')"
            v-if="hasNext"
            icon="mdi-chevron-down"
            @click="loadMore"
            flat
          />
        </div>
      </q-list>
      <div class="t3 flex grow justify-center" v-else>No artists found</div>
    </q-card-section>
    <q-card-actions style="position: sticky; bottom: 0" class="q-gutter-sm">
      <q-btn
        v-if="selectedArtists.length > 0"
        color="red"
        icon="las la-trash"
        label="Delete Selected"
        @click="deleteSelectedArtists"
        :loading="bulkDeleting"
      />
      <q-btn
        color="primary"
        icon="las la-check-square"
        label="Select All"
        @click="selectAllArtists"
      />
      <q-btn
        v-if="selectedArtists.length > 0"
        color="grey"
        icon="las la-times-circle"
        label="Unselect All"
        @click="selectedArtists = []"
      />
    </q-card-actions>
    <q-inner-loading :showing="loading">
      <q-spinner-ios :color="$q.dark.isActive ? 'white' : 'black'" size="2em" />
    </q-inner-loading>
  </q-card>
</template>

<script>
import { getArtistsRequest, deleteArtistRequest, refreshArtistRequest } from 'src/api';
import { mapState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
import { debounce } from 'lodash';
import common from 'assets/common';

export default {
  components: {},
  props: {
    id: {
      default: null,
      loading: false,
    },
  },
  data() {
    return {
      artists: null,
      page: 1,
      perPage: 50,
      hasNext: false,
      loading: false,
      searchQuery: '',
      sortField: 'created_at',
      sortDesc: true,
      sortOptions: [
        { label: 'Created Date', value: 'created_at' },
        { label: 'Name', value: 'name' },
        { label: 'Upcoming event count', value: 'event_count' },
        { label: 'Spotify rank', value: 'popularity' },
      ],
      debouncedRefresh: null,
      selectedArtists: [],
      bulkDeleting: false,
    };
  },
  watch: {
    sortField() {
      this.debouncedRefresh();
    },
    sortDesc() {
      this.debouncedRefresh();
    },
    searchQuery() {
      this.debouncedRefresh();
    },
  },
  mounted() {
    this.refreshArtists();
  },
  methods: {
    refreshArtists() {
      this.loading = true;
      this.page = 1;
      getArtistsRequest({
        page: this.page,
        sort: this.sortField,
        desc: this.sortDesc,
        per_page: this.perPage,
        query: this.searchQuery || undefined,
      }).then((response) => {
        this.artists = response.data.items;
        this.loading = false;
        this.hasNext = response.data.has_next;
      });
    },
    deleteArtist(id) {
      this.$q
        .dialog({
          title: 'Delete artist',
          message: 'Are you sure?',
          color: 'primary',
          persistent: false,
        })
        .onOk(() => {
          const progressDialog = this.$q.dialog({
            title: 'Deleting...',
            color: 'primary',
            progress: true,
            cancel: false,
            persistent: true,
            ok: false,
          });
          deleteArtistRequest(id).then(
            () => {
              progressDialog.hide();
              this.refreshArtists();
              this.selectedArtists = this.selectedArtists.filter(
                (artistId) => artistId !== id,
              );
            },
            () => {
              progressDialog.hide();
            },
          );
        });
    },
    selectAllArtists() {
      this.selectedArtists = this.artists.map(artist => artist.id);
    },
    refreshArtist(id) {
      const artistIndex = this.artists.findIndex(a => a.id === id);
      this.$set(this.artists[artistIndex], 'refreshing', true);
      
      refreshArtistRequest(id).then(() => {
        this.$q.notify({
          type: 'positive',
          message: 'Artist refreshed successfully',
        });
      }).catch(() => {
        this.$q.notify({
          type: 'negative',
          message: 'Failed to refresh artist',
        });
      }).finally(() => {
        this.$set(this.artists[artistIndex], 'refreshing', false);
      });
    },
    deleteSelectedArtists() {
      this.$q
        .dialog({
          title: 'Delete selected artists',
          message: `Are you sure you want to delete ${this.selectedArtists.length} artists?`,
          color: 'primary',
          persistent: false,
        })
        .onOk(() => {
          this.bulkDeleting = true;
          const deletePromises = this.selectedArtists.map((id) =>
            deleteArtistRequest(id),
          );

          Promise.all(deletePromises)
            .then(() => {
              this.bulkDeleting = false;
              this.refreshArtists();
              this.selectedArtists = [];
            })
            .catch(() => {
              this.bulkDeleting = false;
            });
        });
    },
    loadMore() {
      if (!this.hasNext || this.loading) return;

      this.page += 1;
      this.loading = true;
      getArtistsRequest({
        page: this.page,
        sort: this.sortField,
        desc: this.sortDesc,
        per_page: this.perPage,
        query: this.searchQuery || undefined,
      }).then((response) => {
        this.loading = false;
        this.artists = [...this.artists, ...response.data.items];
        this.hasNext = response.data.has_next;
      });
    },
  },
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
  },
  created() {
    this.timeAgo = common.timeAgo;
    this.debouncedRefresh = debounce(this.refreshArtists, 300);
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}

.body--light {
}
</style>
