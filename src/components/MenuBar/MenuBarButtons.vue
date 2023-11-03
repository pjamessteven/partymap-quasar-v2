<template>
  <div class="menubar-content flex row justify-end items-stretch no-wrap">
    <!--
    <transition
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div
        class="items-center flex justify-center q-mr-md"
        v-if="$route.name === 'Explore' && $q.screen.gt.xs"
      >
        <q-btn
          color="primary shadow-xl"
          class="inter bold submit-button"
          no-caps
          @click="showAddEventDialog"
        >
          Add Event <q-icon name="mdi-plus" class="q-ml-sm" size="1rem" />
        </q-btn>
      </div>
    </transition>
    <q-btn
      v-if="$q.screen.lt.sm"
      icon="mdi-magnify"
      @click="() => (sidebarPanel = 'search')"
      :class="{
        'light-button': color === 'white',
      }"
      flat
    >
    </q-btn>

    <div class="flex items-center" v-else>
      <q-btn
        no-caps
        size="medium"
        label="Seach"
        icon="mdi-magnify"
        @click="() => (sidebarPanel = 'search')"
        :class="{
          'light-button': color === 'white',
        }"
        class="inter bold desktop-search-button q-pl-md q-pr-lg"
        flat
      >
      </q-btn>
    </div>
        -->
    <div
      v-if="$q.screen.gt.xs && false"
      class="flex items-center q-mr-sm q-pr-xs"
      :class="{
        'light-button': color === 'white',
      }"
    >
      <div
        class="inter add-button q-py-md flex items-center"
        @click="showAddEventDialog"
      >
        Submit an event!
      </div>
      <!-- <div class="separator vertical"></div>-->
    </div>
    <router-link
      v-if="$q.screen.gt.xs"
      class="flex link-hover"
      :to="
        currentUser
          ? {
              name: 'UserPage',
              params: { username: currentUser.username },
            }
          : { path: '/login', query: { from: $route.path } }
      "
    >
      <q-btn
        flat
        no-caps
        class="profile-button t2"
        :class="{
          'light-button': color === 'white',
        }"
      >
        <div class="profile-button-inner flex row items-center">
          <!--
          <q-icon name="mdi-calendar-star" class="q-mr-md q-ml-md t2" />
          -->
          <div class="q-px-md q-pl-md" v-if="!currentUser">Sign in</div>
          <div class="q-px-md q-pl-md" v-else>@{{ currentUser.username }}</div>
          <q-avatar
            :color="color"
            class="o-080"
            :text-color="color === 'white' ? 'black' : 'white'"
            icon="mdi-account-circle"
            font-size="14px"
            size="36px"
          />
        </div>
      </q-btn>
    </router-link>
    <q-btn
      class="menubar-button"
      icon="mdi-menu"
      flat
      :class="{
        'light-button': color === 'white',
      }"
      style="position: relative"
    >
      <q-menu
        transition-show="jump-down"
        transition-hide="jump-up"
        anchor="bottom right"
        self="top right"
        class="main-menu"
      >
        <TopControlsMenu />
      </q-menu>
      <q-tooltip
        :content-class="
          $q.dark.isActive ? 'bg-black text-white' : 'bg-white text-black'
        "
        :offset="[10, 10]"
        content-style="font-size: 16px"
      >
        {{ $t('sidebar.more') }}
      </q-tooltip>
    </q-btn>
  </div>
</template>

<script>
import TopControlsMenu from './TopControlsMenu.vue';
import { useMainStore } from 'src/stores/main';
import { useAuthStore } from 'src/stores/auth';
import { mapState, mapWritableState } from 'pinia';
import AddEventDialog from 'components/dialogs/AddEventDialog.vue';

export default {
  name: 'MenuBarButtons',
  components: {
    TopControlsMenu,
  },
  props: {
    color: {
      type: String,
    },
  },
  watch: {},
  data() {
    return {
      options: [],
      selectedOptions: null,
      settings: [
        { label: this.$t('nav.dark_mode'), value: 'darkmode' },
        { label: this.$t('nav.watercolor'), value: 'watercolor' },
      ],
    };
  },
  methods: {
    showAddEventDialog() {
      this.$q
        .dialog({
          parent: this,
          component: AddEventDialog,
        })
        .onOk((data) => {
          if (!this.currentUser && data.host) {
            this.$router.push({ name: 'Login' });
          } else if (data.host) {
            this.$router.push({
              name: 'AddEventHost',
            });
          } else {
            this.$router.push({
              name: 'AddEventPublic',
            });
          }
        });
    },
  },
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
    ...mapState(useMainStore, ['menubarOpacity']),
    ...mapWritableState(useMainStore, ['sidebarPanel']),
    transparentMenuBar() {
      return (
        this.$q.screen.lt.sm &&
        (this.$route.name === 'EventPage' || this.$route.name === 'Explore')
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .menubar-content {
    :deep(.q-tabs) {
      .q-tab {
        &.q-tab--active {
        }
      }
    }

    .searchbar-wrapper {
      &.searchbar-expanded {
        background: black !important;
        border-left: 1px solid rgba(255, 255, 255, 0.05);
        border-right: 1px solid rgba(255, 255, 255, 0.05);
      }
    }
    .add-button {
      color: $ti-2;
      &:before,
      &:after {
        background-color: $ti-2;
      }
    }

    .profile-button {
      .profile-button-inner {
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: $bi-2;
      }
      &:hover {
        .profile-button-inner {
          background: $bi-3;
        }
      }
    }
  }
}

.body--light {
  .menubar-content {
    .searchbar-wrapper {
      &.searchbar-expanded {
        background: white !important;
        border-left: 1px solid rgba(0, 0, 0, 0.05);
        border-right: 1px solid rgba(0, 0, 0, 0.05);
      }
    }
    .separator {
      border-color: grey;
    }
    .add-button {
      color: $t-2;

      &:before,
      &:after {
        background-color: black;
      }
    }
    .light-button {
      .add-button {
        color: $ti-1;
        &:before,
        &:after {
          background-color: $ti-1;
        }
      }
    }
    .light-button {
      .separator {
        border-color: grey;
      }
    }

    .profile-button {
      .profile-button-inner {
        border: 1px solid rgba(0, 0, 0, 0.1);
        background: #fafafa;
      }
      &:hover {
        .profile-button-inner {
          background: $b-3;
        }
      }

      &.light-button {
        .profile-button-inner {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);

          .q-icon {
            color: $ti-1;
          }
        }
        &:hover {
          .profile-button-inner {
            background: $bi-3;
          }
        }
      }
    }
  }
}
.profile-button {
  border-radius: 0px !important;

  background: none !important;
  :deep(.q-focus-helper) {
    display: none;
  }
  .profile-button-inner {
    border-radius: 38px;
    transition: background 0.3s;
    // background: none !important;
    // font-size: 16px;
    font-weight: 400;
  }
}
.q-btn {
  pointer-events: all;
}
.desktop-search-button {
  border-radius: 100px !important;
}

.submit-button {
  //border-radius: 100px !important;
  overflow: hidden;
}
.logo {
  position: absolute;
  opacity: 1;
  transition: opacity 0.3s ease;
  pointer-events: all;
}
.q-menu {
  max-height: 100vh !important;
}
.user-indicator {
  border-radius: 100px;
}
.tabs {
  pointer-events: all;
}
.menubar-content {
  :deep(.q-tabs) {
    .q-tab {
      //padding-top: 4px;
      //padding-bottom: 4px;
      padding: 10px;
      //margin: 4px 4px;
      //border-radius: 64px;
      transition: all 0.3s;
      color: white;

      opacity: 1 !important;
      border: 1px solid transparent;
      &.q-tab--active {
      }
      &.q-tab--inactive {
        color: grey;
        // opacity: 0.3 !important;
      }
    }
  }

  .separator {
    height: 24px;
    margin-left: 18px;
    margin-right: 4px;
  }
  .add-button {
    font-weight: 500;
    pointer-events: all;
    cursor: pointer;
    $duration: 0.4s;
    $outDuration: 0.1s;
    $distance: 10px;
    $easeOutBack: cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    &:before,
    &:after {
      content: '';
      position: absolute;
      bottom: 6px;
      left: 0;
      right: 0;
      height: 1px;
      //background-color: black;
    }
    &:before {
      opacity: 0;
      transform: translateY(-$distance);
      transition: transform 0s $easeOutBack, opacity 0s;
    }
    &:after {
      opacity: 0;
      transform: translateY($distance/2);
      transition: transform $duration $easeOutBack, opacity $duration;
    }
    &:hover {
      &:before,
      &:after {
        opacity: 1;
        transform: translateY(0);
      }
      &:before {
        transition: transform $duration $easeOutBack, opacity $duration;
      }
      &:after {
        transition: transform 0s $duration $easeOutBack, opacity 0s $duration;
      }
    }
  }
}
.menubar-button {
  border-radius: 0px !important;
  pointer-events: all;
}
.light-button {
  color: white;
}
@media only screen and (max-width: 600px) {
  .light-button {
    color: white;
  }
}
</style>
