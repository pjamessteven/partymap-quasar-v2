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
              v-if="!editing"
              class="inter bold t1"
              :class="$q.screen.lt.sm ? ' ' : 'bolder text-large'"
            >
              @{{ user.username
              }}<q-icon
                name="mdi-check-decagram"
                v-if="user.hosted_events?.length > 0"
                class="q-ml-sm"
              /><span v-if="user.alias"> -&nbsp;{{ user.alias }} </span>
            </div>
            <q-input
              v-if="editing"
              v-model="user.username"
              label="Username"
              maxlength="80"
            />

            <q-input
              v-if="editing"
              v-model="user.alias"
              label="Full Name (Optional)"
              maxlength="200"
            />

            <div
              v-if="!editing"
              class="inter t3 q-mt-sm"
              :class="$q.screen.lt.sm ? '' : '  text-large'"
            >
              <span v-if="user.description">
                {{ user.description }}
              </span>
            </div>
            <q-input
              v-else
              v-model="user.description"
              label="A little bit about yourself"
              maxlength="1000"
              counter
            />
          </div>

          <div class="action-buttons flex row q-mt-md">
            <div
              v-if="currentUser?.username === username && !editing"
              @click.stop="() => (editing = !editing)"
              class="nav-button flex items-center justify-between q-mr-sm"
            >
              <span>Edit Profile</span>
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
              @click.stop="share()"
              class="nav-button flex items-center justify-between q-mr-sm"
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
              @click.stop="() => updateUser()"
              class="nav-button flex items-center justify-between q-mr-sm"
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
              @click.stop="() => loadCurrentUserDetails()"
              class="nav-button flex items-center justify-between q-mr-sm"
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
            @click="() => (user.avatar = null)"
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
          <div class="flex row q-gutter-sm q-mt-sm" v-if="user.avatar">
            <q-btn color="primary" label="Save" @click="uploadAvatar()"></q-btn>
            <q-btn flat label="Select new" @click="selectAvatar()"></q-btn>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <input
      :value="computedUrl"
      ref="copyProfileUrlInput"
      style="display: none"
    />
  </div>
</template>

<script>
import _ from 'lodash';
import { toRaw } from 'vue';
import { getUserRequest } from 'src/api';
import MultipleMediaSelector from 'components/MultipleMediaSelector.vue';
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useSearchStore } from 'src/stores/search';
import { useMainStore } from 'src/stores/main';
import { useAuthStore } from 'src/stores/auth';
export default {
  components: { MultipleMediaSelector },
  props: {
    username: { type: String, default: undefined },
  },
  data() {
    return {
      editing: false,
      showAvatarDialog: false,
      user: {
        avatar: null,
        username: null,
        alias: null,
        description: null,
      },
    };
  },
  methods: {
    ...mapActions(useAuthStore, ['editUser', 'checkAuthCookie']),
    share() {
      if (navigator.share) {
        navigator.share({
          title: this.username + "'s Calendar'",
          text: 'Check out ' + this.user.username + "'s calendar on PartyMap",
          url: this.computedUrl,
        });
      } else {
        // copy url to clipboard
        var copyText = this.$refs.copyProfileUrlInput;
        /* Select the text field */
        copyText.select();
        copyText.setSelectionRange(0, 99999); /* For mobile devices */

        /* Copy the text inside the text field */
        document.execCommand('copy');

        /* Alert the copied text */
        this.$q.notify('Copied link to clipboard');
      }
    },
    loadCurrentUserDetails() {
      this.user = this.currentUser;
      console.log(this.user);
      this.editing = false;
    },
    selectFile(event) {
      const file = toRaw(event)?.[0];
      if (file) {
        this.user.avatar = file;
      } else {
        this.user.avatar = null;
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
        await this.editUser({ avatar: this.user.avatar });
      } catch {}
      await this.checkAuthCookie();
      this.loadCurrentUserDetails();
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
        description: this.user.description || undefined,
        alias: this.user.alias || undefined,
        username:
          this.user.username !== this.currentUser?.username
            ? this.user.username
            : undefined,
      };
    },
    computedUrl() {
      if (this.user?.username) {
        return 'https://partymap.com/user/' + this.user.username;
      } else {
        return '';
      }
    },
  },
  async mounted() {
    if (this.currentUser) {
      this.loadCurrentUserDetails();
    } else if (this.username) {
      getUserRequest(this.username).then((response) => {
        this.user = response.data;
      });
    }
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .profile-view {
    .avatar-wrapper {
      .avatar {
        background: $bi-2;
        border: 1px solid $bi-3;
      }
    }
  }
}

.body--light {
  .profile-view {
    .nav-button {
      color: $t-1;
    }
    .avatar-wrapper {
      .avatar {
        background: $b-2;
        border: 1px solid $b-3;
      }
    }
  }
}

.profile-view {
  height: 100%;
  .nav-button {
    padding: 8px 12px;
  }
  .avatar-wrapper {
    .avatar {
      border-radius: 100px;
      width: 128px;
      height: 128px;
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
