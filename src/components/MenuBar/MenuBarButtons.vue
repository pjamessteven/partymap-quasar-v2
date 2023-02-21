<template>
  <div class="menubar-content flex row justify-end items-stretch grow no-wrap">
    <!--
      <div
        class="flex row items-center q-mx-md"
        v-if="currentUser && $q.screen.gt.xs"
      >
        <q-item
          style="min-height: unset;"
          class="user-indicator q-pl-sm q-pr-md q-py-xs "
          clickable
          v-on:click="
            $router.push({
              name: 'UserPage',
              params: { id: currentUser.username }
            })
          "
        >
          <div class="flex row items-center align-center no-wrap ">
            <q-avatar size="sm" color="primary" icon="las la-user"> </q-avatar>

            <div class="username text-subtitle1 q-ml-sm">
              {{ currentUser.username }}
            </div>
          </div>
        </q-item>
      </div>

      <div class="flex row no-wrap searchbar-wrapper justify-end">
        <q-input
          borderless
          ref="search"
          dense
          debounce="300"
          class="searchbar-input "
          :placeholder="$t('search.search_box_text')"
          v-model="query"
          bg-color="transparent"
          @keyup.enter="search"
          @focus="onFocusInput"
          @blur="onBlurInput"
        >
          <template v-slot:prepend>
            <q-icon name="mdi-magnify" class="q-my-md" />
          </template>
        </q-input>

        <q-btn
          :class="{
            'q-px-sm ': $q.screen.gt.xs
          }"
          v-if="showSearchBox"
          icon="mdi-close"
          flat
          v-on:click="toggleSearchBox(false)"
        />
        <q-btn
          v-else
          :class="{
            'q-px-sm ': $q.screen.gt.xs,
            'light-button':
              $route.name === 'EventPage' ||
              $route.name === 'Explore'
          }"
          icon="mdi-magnify"
          flat
          v-on:click="toggleSearchBox(true)"
        />
      </div>

      <div class="flex row items-center separator-wrapper">
        <div class="item-separator" />
      </div>
    -->
    <!--
      <q-btn
        no-caps
        flat
        class="flex items-center"
        @click="showAddEventDialog()"
        :class="{
          'q-px-sm ': $q.screen.gt.xs,
          'light-button': transparentMenuBar
        }"
      >
        <div class="flex items-center row no-wrap">
          <div
            class="btn-text chicago text-large q-mr-sm"
            v-if="$q.screen.gt.md"
          >
            QUICK SUBMIT
          </div>
          <q-icon name="mdi-plus" v-else />
        </div>
        <q-tooltip
          :content-class="
            $q.dark.isActive ? 'bg-black text-white' : 'bg-white text-black'
          "
          :offset="[10, 10]"
          content-style="font-size: 16px"
        >
          {{ $t("top_controls.quick_submit") }}
        </q-tooltip>
      </q-btn>-->
    <!--
    <div
      class="flex row no-wrap searchbar-wrapper justify-end"
      :class="showSearchBox ? 'searchbar-expanded' : ''"
    >
      <q-input
        borderless
        ref="search"
        dense
        debounce="300"
        class="searchbar-input "
        :placeholder="$t('search.search_box_text')"
        v-model="query"
        bg-color="transparent"
        @keyup.enter="search"
        @focus="onFocusInput"
        @blur="onBlurInput"
      >
        <template v-slot:prepend>
          <q-icon name="mdi-magnify" class="q-my-md" />
        </template>
      </q-input>

      <q-btn
        :class="{
          'q-px-sm ': $q.screen.gt.xs
        }"
        v-if="showSearchBox"
        icon="mdi-close"
        flat
        v-on:click="toggleSearchBox(false)"
      />
      <q-btn
        v-else
        :class="{
          'q-px-sm ': $q.screen.gt.xs,
          'light-button': transparentMenuBar
        }"
        icon="mdi-magnify"
        flat
        v-on:click="toggleSearchBox(true)"
      />
    </div>
    -->
    <q-btn
      class="button-menu"
      :class="{
        'light-button':
          $route.name === 'LandingPage' ||
          $route.name === 'EventPage' ||
          $route.name === 'Explore' ||
          ($route.meta.fullscreenLayout === true && this.$q.screen.gt.xs),
      }"
      icon="mdi-menu"
      flat
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
//import AddEventDialog from 'components/dialogs/AddEventPrompt';
import { useMainStore } from 'src/stores/main';
import { useAuthStore } from 'src/stores/auth';
import { mapState } from 'pinia';

export default {
  name: 'MenuBarButtons',
  components: {
    //AddEventPrompt,
    TopControlsMenu,
  },
  watch: {
    /*
    query: {
      handler: function (newVal) {
        if (newVal && newVal.length > 0) {
          this.search();
        } else if (newVal === null) {
          this.searchSuggestions = null;
        } else {
          // when newval is '',  clear
          this.searchSuggestions = null;
        }
      },
    },
    */
  },
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
    /*
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
    /*
    toggleSearchBox(value) {
      if (value === true) {
        this.showSearchBox = true;
        this.$refs.search.focus();
      } else {
        this.showSearchBox = false;
        this.query = null;
      }
    },
    search() {
      this.$store.dispatch('main/getSearchSuggestions', { query: this.query });
      this.searchLocations();
    },
    searchLocations() {
      const provider = new OpenStreetMapProvider();
      provider.search({ query: this.query }).then((results) => {
        var locationSearchResults = results.map((res) => {
          return { label: res.label, location: { lat: res.y, lon: res.x } };
        });
        this.searchLocationResults = locationSearchResults;
      });
    },
    */
  },
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
    ...mapState(useMainStore, ['menubarOpacity']),
    transparentMenuBar() {
      return (
        this.$q.screen.lt.sm &&
        (this.$route.name === 'EventPage' || this.$route.name === 'Explore')
      );
    },
    lightMenuIconRoute() {
      return this.$route.name === 'Explore' || this.$route.name === 'Home';
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
.q-btn {
  border-radius: 0px !important;
  pointer-events: all;
}
.light-button {
  color: white;
}
.searchbar-wrapper {
  pointer-events: all;
  overflow: hidden;
  transition: all 0.3s ease;
  width: auto;
  //flex-grow: 1;
  .searchbar-input {
    width: 0px;
    opacity: 0;
    transition: all 0.3s ease;

    :deep(.q-field__control) {
      height: 100%;
      font-size: 1rem;
      border: none;
      padding-left: 18px;
      .q-field__marginal {
        height: 100%;
      }
      .q-field__label {
        top: 12px;
      }
    }
  }
  &.searchbar-expanded {
    z-index: 3000;
    .searchbar-input {
      opacity: 1;
      width: 250px;
    }
  }
}

/*
@media only screen and (max-width: 600px) {
  .menubar-content {
    .separator-wrapper {
      display: none;
    }
    .button-locate {
      display: none;
    }
    .button-menu {
      display: none;
    }
    .searchbar-wrapper {
      .searchbar-input {
        opacity: 1;
        width: calc(100vw - 56px) !important;
      }
    }
  }
}
*/
</style>
