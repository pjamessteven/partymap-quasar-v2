<template>
  <q-card>
    <q-card-section class="flex row grow justify-between">
      <div class="text-h6">Pending reports and claims:</div>

      <q-btn-dropdown :label="open ? 'unread' : 'read'">
        <q-list>
          <q-item v-ripple v-if="open" v-on:click="toggleShowRead" clickable>
            <q-item-section>
              <q-item-label>Show read reports</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-ripple v-if="!open" v-on:click="toggleShowRead" clickable>
            <q-item-section>
              <q-item-label>Show unread reports</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </q-card-section>
    <q-card-section class="">
      <q-list v-if="reports && reports.length > 0">
        <div class="flex column" v-for="(item, index) in reports" :key="index">
          <q-separator spaced v-if="index !== 0" />

          <q-item>
            <q-item-section>
              <div class="flex row grow justify-between no-wrap items-center">
                <div class="flex row no-wrap items-center">
                  <q-icon name="mdi-circle" v-if="item.open" />
                  <q-icon name="mdi-circle-outline" v-else />

                  <div class="flex column no-wrap q-ml-md">
                    <q-item-label class="flex row items-center">
                      <router-link
                        class="link-hover"
                        :to="{
                          name: 'EventPage',
                          params: { id: item.event.id },
                        }"
                        >{{ item.event.name }}
                        <q-icon
                          class="q-ml-md"
                          name="mdi-check-decagram"
                          v-if="item.event.host"
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
                        ></router-link
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
                      &nbsp;<a class="link-hover" :href="'mailto:' + item.email"
                        >({{ item.email }})</a
                      >
                    </q-item-label>
                    <q-item-label>
                      {{ item.message }}
                    </q-item-label>
                  </div>
                </div>
                <div class="controls">
                  <q-btn
                    v-if="item.open"
                    label="mark read"
                    flat
                    @click="updateReport(item.id, false)"
                  />
                  <q-btn
                    v-else
                    label="mark unread"
                    flat
                    @click="updateReport(item.id, true)"
                  >
                  </q-btn>
                </div>
              </div>
            </q-item-section>
          </q-item>
        </div>
        <div class="flex grow justify-center q-mt-md">
          <q-btn
            :label="$t('activity.load_more')"
            v-if="hasNext"
            icon="mdi-chevron-down"
            @click="loadMore"
            flat
          />
        </div>
      </q-list>
      <div class="t3 flex grow justify-center" v-else>
        No content reports :D
      </div>
    </q-card-section>
    <q-inner-loading :showing="loading">
      <q-spinner-ios :color="$q.dark.isActive ? 'white' : 'black'" size="2em" />
    </q-inner-loading>
  </q-card>
</template>

<script>
import { getReportsRequest, updateReportRequest } from 'src/api';
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
      open: true,
      reports: null,
      page: 1,
      perPage: 10,
      hasNext: false,
      loading: false,
    };
  },
  mounted() {
    this.loadInitialList();
  },
  methods: {
    toggleShowRead() {
      this.open = !this.open;
      this.loadInitialList();
    },
    updateReport(id, openStatus) {
      const progressDialog = this.$q.dialog({
        title: 'Doo do doo..',
        color: 'primary',
        progress: true, // we enable default settings
        cancel: false,
        persistent: true, // we want the user to not be able to close it
        ok: false,
      });
      updateReportRequest(id, { open: openStatus }).then(
        (response) => {
          progressDialog.hide();
          if (openStatus === false) {
            var indexToDelete = this.reports.findIndex((x) => x.id === id);
            this.reports.splice(indexToDelete, 1);
          } else {
            var indexToUpdate = this.reports.findIndex((x) => x.id === id);
            this.reports[indexToUpdate] = response.data;
            this.reports = [...this.reports];
          }
        },
        () => {
          // on error
          progressDialog.hide();
        }
      );
    },
    loadInitialList() {
      this.loading = true;
      getReportsRequest({
        open: this.open,
        page: this.page,
        sort: 'created_at',
        desc: true,
        per_page: this.perPage,
      }).then((response) => {
        this.reports = response.data.items;
        this.loading = false;
        this.hasNext = response.data.has_next;
      });
    },
    loadMore() {
      this.page += 1;
      this.loading = true;
      getReportsRequest({
        open: this.open,
        page: this.page,
        sort: 'created_at',
        desc: true,
        per_page: 10,
      }).then((response) => {
        this.loading = false;
        this.reports = [...this.reports, ...response.data.items];
        this.hasNext = response.data.has_next;
      });
    },
  },
  watch: {},
  computed: {},
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
