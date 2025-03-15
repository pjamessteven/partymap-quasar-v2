<template>
  <q-card>
    <q-card-section class="text-h6"> Artists: </q-card-section>
    <q-card-section>
      <div class="q-mb-md flex items-center gap-4">
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
        <q-item v-for="(artist, index) in artists" :key="index">
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
                  color="red"
                  round
                  size="sm"
                  flat
                  @click="deleteArtist(artist.id)"
                >
                  <q-icon name="las la-trash" />
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
    <q-inner-loading :showing="loading">
      <q-spinner-ios :color="$q.dark.isActive ? 'white' : 'black'" size="2em" />
    </q-inner-loading>
  </q-card>
</template>

<script>
import { getArtistsRequest, deleteArtistRequest } from 'src/api';
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
      perPage: 10,
      hasNext: false,
      loading: false,
      searchQuery: '',
      sortField: 'created_at',
      sortDesc: true,
      sortOptions: [
        { label: 'Created Date', value: 'created_at' },
        { label: 'Name', value: 'name' },
        { label: 'Popularity', value: 'event_count' },
      ],
      debouncedRefresh: null,
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
          title: 'Delete event',
          message: 'Are you sure?',
          color: 'primary',
          persistent: false, // we want the user to not be able to close it
        })
        .onOk(() => {
          const progressDialog = this.$q.dialog({
            title: 'Doo do doo..',
            color: 'primary',
            progress: true, // we enable default settings
            cancel: false,
            persistent: true, // we want the user to not be able to close it
            ok: false,
          });
          deleteEventRequest(id).then(
            () => {
              progressDialog.hide();
              var indexToDelete = this.events.findIndex((x) => x.id === id);
              this.events.splice(indexToDelete, 1);
            },
            () => {
              // on error
              progressDialog.hide();
            },
          );
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
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}

.body--light {
}
</style>
