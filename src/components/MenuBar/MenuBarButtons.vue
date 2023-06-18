<template>
  <div class="menubar-content flex row justify-end items-stretch grow no-wrap">
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
-->
    <q-btn
      icon="mdi-magnify"
      @click="() => (sidebarPanel = 'search')"
      :class="{
        'light-button': color === 'white',
        'q-mr-md': $q.screen.gt.xs,
      }"
      flat
    >
    </q-btn>
    <q-btn
      class="button-menu"
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
    .searchbar-wrapper {
      &.searchbar-expanded {
        background: black !important;
        border-left: 1px solid rgba(255, 255, 255, 0.05);
        border-right: 1px solid rgba(255, 255, 255, 0.05);
      }
    }
    .add-button {
      //backdrop-filter: darken(0.5);
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
  }
}

.menubar-content {
  width: 368px;
  //pointer-events: all;
}
.q-btn {
  pointer-events: all;
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
.button-menu {
  border-radius: 0px !important;
  pointer-events: all;
}
.light-button {
  color: white;
}
@media only screen and (min-width: 1920px) {
  .submit-button {
    font-size: 1rem;
  }
}
</style>
