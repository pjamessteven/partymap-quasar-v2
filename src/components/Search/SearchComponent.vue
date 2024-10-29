<template>
  <div class="searchbar-wrapper">
    <q-input
      @keydown.esc="
        () => {
          $refs.search.blur();

          clearSearch();
        }
      "
      ref="search"
      borderless
      style="width: 328px; height: 40px"
      dense
      autofocus
      @focus="onSearchbarFocus()"
      @clear="clearSearch()"
      class="searchbar-input inter bold"
      v-model="query"
      @keyup.enter="() => $refs.search.blur()"
      :placeholder="
        $q.screen.gt.xs
          ? $t('search.search_box_text')
          : $t('search.search_box_text_mobile')
      "
    >
      <template v-slot:prepend>
        <div class="q-mr-xs q-ml-" v-if="$q.screen.gt.xs">
          <q-icon size="26px" name="mdi-magnify" />
        </div>
      </template>
      <template v-slot:append>
        <div class="search-button" v-if="query?.length" @click="clearSearch()">
          <q-icon
            name="mdi-close"
            style="cursor: pointer"
            size="large"
          ></q-icon>
        </div>
      </template>
    </q-input>
  </div>
</template>

<script>
import { mapState, mapActions, mapWritableState } from 'pinia';
import { useMainStore } from 'src/stores/main';
import { useSearchStore } from 'src/stores/search';

export default {
  data() {
    return {
      showSearch: false,
      previousSidebarPanel: '',
      previousShowPanel: '',
    };
  },
  watch: {
    sidebarPanel(newv, oldv) {
      // so we can return to previous sidebar panel after triggering search
      this.previousSidebarPanel = oldv;

      if (oldv === 'search') this.query = null;
      if (newv === 'search') {
        setTimeout(() => {
          this.$refs.search.focus();
        }, 500);
      }
    },
    query(newv) {
      if (newv?.length > 0) {
        this.showPanel = true;
        this.sidebarPanel = 'search';
        if (this.$route.name !== 'Explore') {
          this.$router.push({ name: 'Explore' });
        }
      } else if (this.$q.screen.gt.xs) {
        this.hideResultsAndPreviousPanel();
      }
    },
  },
  methods: {
    hideResultsAndPreviousPanel() {
      if (this.sidebarPanel === 'search') {
        // hide results and restore previous sidebar state
        this.sidebarPanel = this.previousSidebarPanel;
        if (this.sidebarPanel === 'explore') {
          this.showPanel = false;
        }
      }
    },
    clearSearch() {
      this.query = null;
      this.$refs.search.focus();
      if (this.$q.screen.gt.xs) {
        this.searchbarShowing = false;
        this.hideResultsAndPreviousPanel();
      }
    },
    onSearchbarFocus() {
      if (this.query?.length > 0) {
        this.sidebarPanel = 'search';
        this.showPanel = true;
      }
    },
  },
  computed: {
    ...mapWritableState(useSearchStore, ['query', 'searchbarShowing']),
    ...mapWritableState(useMainStore, [
      'sidebarPanel',
      'showPanel',
      'menubarOpacity',
    ]),
  },
};
</script>

<style lang="scss" scoped>
.body--light {
}
.body--dark {
}

.searchbar-wrapper {
  .searchbar-input {
    :deep(.q-placeholder::placeholder) {
      //   font-family: 'Metropolis';

      opacity: 0.9;
    }
  }
}

@media only screen and (max-width: 599px) {
}
</style>
