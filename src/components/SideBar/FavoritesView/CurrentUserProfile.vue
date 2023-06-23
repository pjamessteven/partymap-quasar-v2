<template>
  <div class="profile-view flex column grow no-wrap">
    <div class="content flex column grow">
      <div class="user-info flex row no-wrap">
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
              <q-icon name="mdi-upload-outline" class="text-white" size="2em" />
            </div>
            <img
              v-if="currentUser.avatar.thumb_url"
              :src="currentUser.avatar.thumb_url"
            />
            <q-icon
              v-else-if="!editing"
              name="mdi-account-box-outline"
              class="t4"
              size="2em"
            />
          </div>
        </div>
        <div class="flex column grow justify-between">
          <div class="flex column">
            <div
              v-if="!editing"
              class="inter bold t1"
              :class="$q.screen.lt.sm ? ' ' : ' text-h6'"
            >
              @{{ currentUser.username
              }}<q-icon
                name="mdi-check-decagram"
                v-if="currentUser.hosted_events?.length > 0"
                class="q-ml-sm"
              /><span v-if="currentUser.alias">
                -&nbsp;{{ currentUser.alias }}
              </span>
            </div>
            <q-input
              v-if="editing"
              v-model="username"
              label="Username"
              maxlength="80"
            />

            <q-input
              v-if="editing"
              v-model="alias"
              label="Full Name (Optional)"
              maxlength="200"
            />

            <div
              v-if="!editing"
              class="inter t3 q-mt-sm"
              :class="$q.screen.lt.sm ? '' : '  text-large'"
            >
              <span v-if="currentUser.description">
                {{ currentUser.description }}
              </span>
              <span class="t4" v-else>No description</span>
            </div>
            <q-input
              v-else
              v-model="description"
              label="A little bit about yourself"
              maxlength="1000"
              counter
            />
          </div>

          <div class="action-buttons flex row q-mt-md">
            <div
              v-if="!editing"
              flat
              @click.stop="() => (editing = !editing)"
              class="nav-button flex items-center justify-between q-mr-sm q-px-md q-py-sm"
            >
              <span>Edit</span>
              <q-icon
                name="mdi-square-edit-outline"
                :size="$q.screen.gt.xs ? '1rem' : '1rem'"
                :class="{
                  'q-ml-md': $q.screen.gt.xs,
                  'q-ml-sm': $q.screen.lt.sm,
                }"
              />
            </div>
            <div
              v-if="!editing"
              flat
              @click.stop="showAddEventDialog()"
              class="nav-button flex items-center justify-between q-mr-sm q-px-md q-py-sm"
            >
              <span v-if="$q.screen.lt.sm">Share</span><span v-else>Share</span>
              <q-icon
                name="mdi-share"
                :size="$q.screen.gt.xs ? '1rem' : '1rem'"
                :class="{
                  'q-ml-md': $q.screen.gt.xs,
                  'q-ml-sm': $q.screen.lt.sm,
                }"
              />
            </div>
            <div
              v-if="editing"
              flat
              @click.stop="() => updateUser()"
              class="nav-button flex items-center justify-between q-mr-sm q-px-md q-py-sm"
            >
              <span>Done</span>
              <q-icon
                name="mdi-check"
                :size="$q.screen.gt.xs ? '1.5rem' : '1rem'"
                :class="{
                  'q-ml-md': $q.screen.gt.xs,
                  'q-ml-sm': $q.screen.lt.sm,
                }"
              />
            </div>
            <div
              v-if="editing"
              flat
              @click.stop="() => loadUserDetails()"
              class="nav-button flex items-center justify-between q-mr-sm q-px-md q-py-sm"
            >
              <span>Cancel</span>
              <q-icon
                name="mdi-close"
                :size="$q.screen.gt.xs ? '1.5rem' : '1rem'"
                :class="{
                  'q-ml-md': $q.screen.gt.xs,
                  'q-ml-sm': $q.screen.lt.sm,
                }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <q-dialog
      v-model="showAvatarDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <q-card class="avatar-dialog dialog-card fullscreen-mobile-card">
        <q-card-section class="row items-center dialog-card-header">
          <div class="text-h6 inter bolder">Upload new avatar</div>
          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
            @click="() => (avatar = null)"
            class="q-ml-xl"
          />
        </q-card-section>

        <q-card-section
          class="t2 dialog-card-content flex column no-wrap items-start justify-start"
        >
          Your avatar will be visible to everyone on PartyMap.
          <MultipleMediaSelector
            ref="mediaSelector"
            :avatarMode="true"
            class="q-mt-md"
            :singleSelectMode="true"
            :showUploadButton="false"
            :disableCaption="true"
            @filesSelected="selectFile($event)"
            :label="'Select image'"
          />
          <div class="flex row q-gutter-sm q-mt-sm" v-if="avatar">
            <q-btn color="primary" label="Save" @click="uploadAvatar()"></q-btn>
            <q-btn flat label="Select new" @click="selectAvatar()"></q-btn>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import _ from 'lodash';
import { toRaw } from 'vue';

import MultipleMediaSelector from 'components/MultipleMediaSelector.vue';
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useSearchStore } from 'src/stores/search';
import { useMainStore } from 'src/stores/main';
import { useAuthStore } from 'src/stores/auth';
export default {
  components: { MultipleMediaSelector },
  data() {
    return {
      editing: false,
      avatar: null,
      showAvatarDialog: false,
      username: null,
      alias: null,
      description: null,
    };
  },
  methods: {
    ...mapActions(useAuthStore, ['editUser']),
    loadUserDetails() {
      this.username = this.currentUser.username;
      this.alias = this.currentUser.alias;
      this.description = this.currentUser.description;
      this.editing = false;
    },
    selectFile(event) {
      const file = toRaw(event)?.[0];
      if (file) {
        this.avatar = file;
      } else {
        this.avatar = null;
      }
    },
    selectAvatar() {
      this.$refs.mediaSelector.removeFile(0);
      this.$refs.mediaSelector.openSelectDialog();
    },
    async uploadAvatar() {
      const progressDialog = this.$q.dialog({
        title: 'Uploading avatar...',
        color: 'primary',
        progress: true, // we enable default settings
        cancel: false,
        persistent: true, // we want the user to not be able to close it
        ok: false,
      });
      try {
        await this.editUser({ avatar: this.avatar });
      } catch {}
      progressDialog.hide();
      this.showAvatarDialog = false;
      this.editing = false;
    },
    async updateUser() {
      const progressDialog = this.$q.dialog({
        title: 'Saving changes',
        color: 'primary',
        progress: true, // we enable default settings
        cancel: false,
        persistent: true, // we want the user to not be able to close it
        ok: false,
      });
      try {
        await this.editUser(this.computedChanges);
      } catch {}
      progressDialog.hide();
      this.editing = false;
    },
  },
  watch: {},
  computed: {
    ...mapWritableState(useSearchStore, ['query']),
    ...mapState(useMainStore, ['sidebarPanel']),
    ...mapState(useAuthStore, ['currentUser']),
    computedChanges() {
      return {
        description: this.description || undefined,
        alias: this.alias || undefined,
        username:
          this.username !== this.currentUser.username
            ? this.username
            : undefined,
      };
    },
  },
  mounted() {
    if (this.currentUser) {
      this.loadUserDetails();
    }
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .profile-view {
    .avatar-wrapper {
      .avatar {
        background: $bi-3;
      }
    }
  }
}

.body--light {
  .profile-view {
    .avatar-wrapper {
      .avatar {
        background: $b-3;
      }
    }
  }
}

.profile-view {
  height: 100%;
  .avatar-wrapper {
    .avatar {
      border-radius: 100px;
      width: 150px;
      height: 150px;
      overflow: hidden;
      position: relative;
      img {
        max-height: 100%;
        max-width: 100%;
        height: 100%;
        width: 100%;
        object-fit: cover;
      }
      .editing-overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.4);
      }
    }
    &.editing {
      cursor: pointer;
    }
  }
}
.avatar-dialog {
  min-width: 300px;
}

@media only screen and (max-width: 600px) {
  .profile-view {
    .avatar-wrapper {
      margin-right: 16px;
      .avatar {
        width: 66px;
        height: 66px;
      }
      &.editing {
        cursor: pointer;
      }
    }
  }
}
</style>
