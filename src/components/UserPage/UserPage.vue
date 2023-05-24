<template>
  <SolidPage>
    <template v-slot:title> User profile: {{ id }} </template>
    <template v-slot>
      <InnerLoading v-if="loading" :solid="true" />

      <div class="col-12 col-md-8 col-lg-8 flex column q-mb-xl">
        <div class="text-h5 q-mb-lg">User profile: {{ id }}</div>

        <div class="flex column" v-if="user">
          <div class="text-large t3 flex items-center" v-if="user.email">
            <a class="link-hover" :href="'mailto:' + user.email">{{
              user.email
            }}</a>
            <q-icon name="las la-lock" class="q-ml-xs">
              <q-tooltip
                :content-class="
                  $q.dark.isActive
                    ? 'bg-black text-white'
                    : 'bg-white text-black'
                "
                :offset="[10, 10]"
                content-style="font-size: 16px"
              >
                {{ $t('user_profile.only_visible_to_you') }}
              </q-tooltip></q-icon
            >
          </div>
          <div class="text-large t3" v-if="user.created_at">
            Joined {{ timeAgo(user.created_at) }} ({{
              dateUTCToLocal(user.created_at)
            }})
          </div>
          <div class="text-large t3" v-if="user.version_count">
            {{ user.version_count }} contributions so far
          </div>
          <div
            class="text-large t3"
            v-if="user.status && currentUser.role >= 20"
          >
            Account status: {{ user.status }}
          </div>
          <div
            class="flex column q-mb-lg q-mt-xl"
            v-if="user && user.hosted_events && user.hosted_events.length > 0"
          >
            <div class="text-h6 t3 q-mb-md">Host of:</div>
            <q-card
              class="event-card q-pa-md q-mb-sm flex row"
              v-for="event in user.hosted_events"
              :key="event.id"
            >
              <div
                class="q-gutter-sm flex row grow justify-between items-center"
              >
                <div class="flex row items-center">
                  <router-link
                    class="link-hover"
                    :to="{
                      name: 'EventPage',
                      params: { id: event.id },
                      query: { name: event.name.replace(/ /g, '_') },
                    }"
                  >
                    <span :class="$q.screen.gt.xs ? 'text-large' : ''">{{
                      event.name
                    }}</span>
                  </router-link>
                  <q-icon
                    :class="$q.screen.gt.xs ? 'text-large' : ''"
                    class="q-ml-sm"
                    name="mdi-check-decagram"
                    v-if="event.host"
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
                  <span class="t3 q-ml-md" v-if="event.hidden"
                    >&nbsp;({{ $t('user_profile.pending_moderation') }})</span
                  >
                </div>
                <div
                  class="action-buttons"
                  v-if="currentUser && currentUser.id === user.id"
                >
                  <q-btn
                    flat
                    icon="las la-edit"
                    :label="$q.screen.gt.xs ? $t('user_profile.edit') : null"
                    @click.prevent="
                      $router.push({
                        name: 'EventPage',
                        params: { id: event.id, editing: true },
                      })
                    "
                  />
                  <q-btn
                    flat
                    icon="las la-trash"
                    :label="$q.screen.gt.xs ? $t('user_profile.delete') : null"
                    @click.prevent="deleteEvent(event.id)"
                  />
                </div>
              </div>
            </q-card>
          </div>
          <div
            class="flex column"
            v-if="user && user.created_events && user.created_events.length > 0"
          >
            <div class="text-h6 t3 q-mb-md">Created events:</div>
            <q-card
              class="event-card q-pa-md q-mb-sm flex row"
              v-for="event in user.created_events"
              :key="event.id"
            >
              <div
                class="q-gutter-sm flex row grow justify-between items-center"
              >
                <div class="flex row items-center">
                  <router-link
                    class="link-hover"
                    :to="{
                      name: 'EventPage',
                      params: { id: event.id },
                      query: { name: event.name.replace(/ /g, '_') },
                    }"
                  >
                    <span :class="$q.screen.gt.xs ? 'text-large' : ''">{{
                      event.name
                    }}</span>
                  </router-link>
                  <span class="t3 q-ml-md" v-if="event.hidden"
                    >&nbsp;({{ $t('user_profile.pending_moderation') }})</span
                  >
                </div>
              </div>
            </q-card>
          </div>
        </div>
      </div>
    </template>
  </SolidPage>
</template>

<script>
import common from 'assets/common';
import { mapState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
import SolidPage from 'src/components/dialogs/SolidPage.vue';
import InnerLoading from 'src/components/InnerLoading.vue';

import { getUserRequest, getUserFullProfileRequest } from 'src/api';
export default {
  components: { InnerLoading, SolidPage },
  props: {
    id: {
      default: null,
    },
  },
  data() {
    return {
      user: null,
      loading: false,
    };
  },
  mounted() {
    // load user activities
    this.loading = true;
    if (this.currentUser && this.currentUser.role >= 20) {
      // get full profile if admin
      getUserFullProfileRequest(this.id).then((response) => {
        this.user = response.data;
        this.loading = false;
      });
    } else {
      getUserRequest(this.id).then((response) => {
        this.user = response.data;
        this.loading = false;
      });
    }
  },
  methods: {},
  watch: {},
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
  },
  created() {
    this.timeAgo = common.timeAgo;
    this.dateUTCToLocal = common.dateUTCToLocal;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
}

.body--light {
}
</style>
