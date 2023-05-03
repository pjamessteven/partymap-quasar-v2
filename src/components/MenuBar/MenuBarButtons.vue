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
-->
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

    <!--
    <div class="flex items-center">
      <q-btn
        no-caps
        class="add-button flex items-center"
        @click="showAddEventDialog()"
        :class="{
          'light-button': transparentMenuBar,
        }"
      >
        <div class="flex items-center row no-wrap chicago">
          <div class="q-mr-sm">SUBMIT</div>
          <q-icon name="mdi-plus" />
        </div>
        <q-tooltip
          :content-class="
            $q.dark.isActive ? 'bg-black text-white' : 'bg-white text-black'
          "
          :offset="[10, 10]"
          content-style="font-size: 16px"
        >
          {{ $t('top_controls.quick_submit') }}
        </q-tooltip>
      </q-btn>
    </div>
    -->
    <q-btn
      class="button-menu"
      icon="mdi-menu"
      flat
      :class="{
        'light-button':
          (($route.name === 'EventPage' || $route.name === 'Explore') &&
            $q.screen.lt.sm) ||
          ($route.meta.fullscreenLayout === true && this.$q.screen.gt.xs),
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
import AddEventDialog from 'components/dialogs/AddEventDialog.vue';
import { useMainStore } from 'src/stores/main';
import { useAuthStore } from 'src/stores/auth';
import { mapState } from 'pinia';

export default {
  name: 'MenuBarButtons',
  components: {
    TopControlsMenu,
  },
  props: {
    color: {
      type: String,
      default: 'light',
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
            this.$router.push({
              path: '/login',
              query: { from: this.$route.path },
            });
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
.add-button {
  font-size: 1em;
  background: linear-gradient(45deg, orange, yellow);
  border: 1px solid darkorange;
  border-radius: 9px !important;
  color: black;
  padding: 4px 6px 4px 12px;
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
