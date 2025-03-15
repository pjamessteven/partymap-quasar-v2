<template>
  <q-card>
    <q-card-section class="text-h6"> Artists: </q-card-section>
    <q-card-section class="">
      <q-list v-if="events && events.length > 0">
        <q-item v-for="(item, index) in events" :key="index">
          <q-item-section>
            <div class="flex row grow justify-between no-wrap items-center">
              <div class="flex column no-wrap">
                <q-item-label class="flex row items-center">
                  <router-link
                    class="link-hover"
                    :to="{ name: 'EventPage', params: { id: item.id } }"
                    >{{ item.name }} </router-link
                  ><q-icon
                    class="q-ml-sm"
                    name="mdi-check-decagram"
                    v-if="item.host"
                  >
                    <q-tooltip
                      :content-class="
                        $q.dark.isActive
                          ? 'bg-black text-white'
                          : 'bg-white text-black'
                      "
                      :offset="[10, 10]"
                      content-style="font-size: 16px"
                    >
                      {{ $t('event.official_page') }}
                    </q-tooltip></q-icon
                  >
                </q-item-label>
                <q-item-label caption>
                  created {{ timeAgo(item.created_at) }} by
                  <router-link
                    class="link-hover"
                    v-if="item.creator"
                    :to="{
                      name: 'UserPage',
                      params: { username: item.creator?.username },
                    }"
                    >{{ item.creator?.username }}</router-link
                  >
                </q-item-label>
              </div>
              <div class="controls">
                <q-btn
                  color="red"
                  round
                  size="sm"
                  flat
                  @click="deleteEvent(item.id)"
                >
                  <q-icon name="las la-trash" />
                </q-btn>
                <q-btn
                  color="green"
                  round
                  size="sm"
                  flat
                  @click="approveEvent(item.id)"
                >
                  <q-icon name="las la-check" />
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
      <div class="t3 flex grow justify-center" v-else>No pending events :(</div>
    </q-card-section>
    <q-inner-loading :showing="loading">
      <q-spinner-ios :color="$q.dark.isActive ? 'white' : 'black'" size="2em" />
    </q-inner-loading>
  </q-card>
</template>

<script>
import {
  getEventsRequest,
  deleteEventRequest,
  editEventRequest,
} from 'src/api';
import { mapState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';

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
      events: null,
      page: 1,
      perPage: 10,
      hasNext: false,
      loading: false,
    };
  },
  mounted() {
    // load user activities
    this.loading = true;
    getEventsRequest({
      hidden: true,
      page: this.page,
      sort: 'created_at',
      desc: true,
      per_page: this.perPage,
    }).then((response) => {
      this.events = response.data.items;
      this.loading = false;
      this.hasNext = response.data.has_next;
    });
  },
  methods: {
    deleteEvent(id) {
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
    approveEvent(id) {
      editEventRequest(id, { hidden: false }).then(
        () => {
          var indexToDelete = this.events.findIndex((x) => x.id === id);
          this.events.splice(indexToDelete, 1);
        },
        () => {
          // on error
        },
      );
    },
    loadMore() {
      this.page += 1;
      this.loading = true;
      getEventsRequest({
        hidden: true,
        page: this.page,
        sort: 'created_at',
        desc: true,
        per_page: 10,
      }).then((response) => {
        this.loading = false;
        this.events = [...this.events, ...response.data.items];
        this.hasNext = response.data.has_next;
      });
    },
  },
  watch: {},
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
