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
      :autofocus="autofocus"
      @focus="onSearchbarFocus()"
      @clear="clearSearch()"
      class="searchbar-input inter bold"
      v-model="query"
      @keyup.enter="() => $refs.search.blur()"
      :placeholder="
        placeholder && false
          ? placeholder
          : $q.screen.gt.xs
            ? $t('search.search_box_text')
            : $t('search.search_box_text_mobile')
      "
    >
      <template v-slot:prepend>
        <div
          class="q-mr-xs q-ml- flex items-center"
          style="transform: scale(-1, 1)"
        >
          <q-icon size="22px" name="las la-search" />
        </div>
      </template>
      <template v-slot:append>
        <div
          class="search-button"
          v-if="query?.length && sidebarPanel === 'search'"
          @click="clearSearch()"
        >
          <q-icon
            name="mdi-close"
            style="cursor: pointer"
            size="large"
          ></q-icon>
        </div>
        <div v-else-if="false">
          <q-btn
            flat
            class=""
            :class="{
              'q-ml-md q-pa-sm': $q.screen.lt.sm,
              'q-pa-md q-ml-md  ': $q.screen.gt.xs,
            }"
            @click.stop="() => getFineLocation()"
            :style="
              $q.screen.gt.sm
                ? 'margin-right: -16px; border-radius: 100px!important;'
                : 'margin-left: 0px; border-radius: 100px!important;'
            "
          >
            <template v-slot:default>
              <div v-if="!userLocationLoading" class="flex">
                <q-icon
                  name="mdi-crosshairs-gps"
                  class=""
                  size="sm"
                  v-if="fineLocation && !currentLocationFromSearch"
                />
                <q-icon size="sm" name="mdi-crosshairs" class="" v-else />
              </div>
              <div v-else style="position: relative" class="flex">
                <q-icon size="sm" style="z-index: 1" name="mdi-crosshairs" />
                <q-icon
                  size="sm"
                  style="z-index: 2; left: 0px"
                  class="animated infinite flash slowest absolute"
                  name="mdi-crosshairs-gps"
                />
              </div>
              <q-tooltip
                style="font-size: 1em !important"
                :content-class="
                  $q.dark.isActive
                    ? 'bg-black text-white'
                    : 'bg-white text-black'
                "
                :offset="[10, 10]"
              >
                <span v-if="!fineLocation">
                  {{ $t('nearby_view.improve_location') }}
                </span>
                <span v-else>
                  {{ $t('nearby_view.improve_location') }}
                </span>
              </q-tooltip>
            </template>
          </q-btn>
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
  props: ['placeholder', 'autofocus'],
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
      } else if (this.$q.screen.gt.xs) {
        this.hideResultsAndPreviousPanel();
      }
    },
  },
  mounted() {},
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
        this.hideResultsAndPreviousPanel();
      }
    },
    onSearchbarFocus() {
      if (this.query?.length > 0) {
      }
    },
  },
  computed: {
    ...mapWritableState(useSearchStore, ['query']),
    ...mapWritableState(useMainStore, [
      'sidebarPanel',
      'showPanel',
      'currentLocationFromSearch',
      'menubarOpacity',
      'userLocationLoading',
      'fineLocation',
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
