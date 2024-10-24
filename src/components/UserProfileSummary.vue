<template>
  <router-link
    class="flex link-hover"
    :to="
      user
        ? {
            name: 'UserPage',
            params: { username: user.username },
          }
        : { path: '/login', query: { from: $route.path } }
    "
  >
    <div
      class="user-profile-summary grow"
      :class="{
        'q-pa-md': $q.screen.gt.xs,
        'q-pa-sm': $q.screen.lt.sm,
      }"
    >
      <div class="user-info flex row items-center no-wrap">
        <div
          class="avatar-wrapper"
          :class="{ editing: editing, 'q-mr-lg': $q.screen.gt.xs }"
          @click="() => (editing ? (showAvatarDialog = true) : undefined)"
        >
          <div class="avatar flex items-center justify-center">
            <div
              class="editing-overlay flex justify-center items-center"
              v-if="editing"
            >
              <q-icon
                name="mdi-account-arrow-up-outline"
                class="text-white"
                size="2em"
              />
            </div>
            <img v-if="user?.avatar?.thumb_url" :src="user.avatar.thumb_url" />
            <q-icon
              v-else-if="!editing"
              name="mdi-account-outline"
              class="t4"
              size="2em"
            />
          </div>
        </div>
        <div class="flex column grow justify-between">
          <div class="flex column">
            <div
              class="inter bold t1"
              :class="$q.screen.lt.sm ? ' ' : 'bold2 text-large'"
            >
              <span v-if="user">
                @{{ user.username
                }}<q-icon
                  name="mdi-check-decagram"
                  v-if="user.hosted_events?.length > 0"
                  class="q-ml-sm"
                /><span v-if="user.alias">
                  -&nbsp;{{ user.alias }}
                </span> </span
              ><span v-else> You're not signed in </span>
            </div>

            <div
              class="inter t3"
              :class="{
                'q-mt-sm text-large': $q.screen.gt.xs,
                'q-mt-xs': $q.screen.lt.sm,
              }"
            >
              <span v-if="user?.description"> {{ user.description }} </span
              ><span v-else
                >Get on PartyMap to stay up to date with what's going on!</span
              >
            </div>
          </div>
        </div>
        <div class="action-buttons flex row items-center t3">
          <span v-if="$q.screen.gt.xs">
            <span v-if="user">View Profile</span>
            <span v-else>Let's go</span>
          </span>
          <q-icon
            name="mdi-chevron-right"
            :size="$q.screen.gt.xs ? '1.5rem' : '1rem'"
            :class="{
              'q-ml-md': $q.screen.gt.xs,
              'q-ml-sm': $q.screen.lt.sm,
            }"
          />
        </div>
      </div>
    </div>
  </router-link>
</template>

<script>
import _ from 'lodash';

import { mapActions } from 'pinia';

import { useAuthStore } from 'src/stores/auth';
export default {
  components: {},
  props: {
    username: { type: String, default: undefined },
    user: { type: Object },
  },
  data() {
    return {};
  },
  methods: {
    ...mapActions(useAuthStore, ['checkAuthCookie']),
  },
  watch: {},
  computed: {},
};
</script>

<style lang="scss" scoped>
.body--dark {
  .user-profile-summary {
    border-color: rgba(255, 255, 255, 0.1);
    background: $bi-3;
    border-radius: 18px;

    &:hover {
      filter: brightness(1.2);
    }
    .avatar-wrapper {
      .avatar {
        background: $bi-4;
        border: 1px solid $bi-3;
      }
    }
  }
}

.body--light {
  .user-profile-summary {
    border-color: transparent;
    background: $b-2;
    border-radius: 18px;

    .nav-button {
      color: $t-1;
    }
    .avatar-wrapper {
      .avatar {
        background: $b-3;
      }
    }

    &:hover {
      background: $b-3;
      .avatar-wrapper {
        .avatar {
          background: $b-4;
        }
      }
    }
  }
}

.user-profile-summary {
  border: 1px solid;
  transition: all 0.3s;
  cursor: pointer;
  height: 100%;
  .nav-button {
    padding: 8px 12px;
  }
  .avatar-wrapper {
    .avatar {
      border-radius: 100px;
      width: 56px;
      height: 56px;
      overflow: hidden;
      position: relative;
      transition: all 0.3s;

      img {
        max-height: 100%;
        max-width: 100%;
        height: 100%;
        width: 100%;
        object-fit: cover;
      }
    }
  }
}
.avatar-dialog {
  min-width: 300px;
}

@media only screen and (max-width: 599px) {
  .user-profile-summary {
    .avatar-wrapper {
      margin-right: 16px;
      .avatar {
        width: 48px;
        height: 48px;
      }
    }
  }
}
</style>
