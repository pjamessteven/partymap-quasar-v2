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
      style="width: 260px; height: 40px"
      dense
      autofocus
      @focus="onSearchbarFocus()"
      @clear="clearSearch()"
      class="searchbar-input inter bold"
      v-model="query"
      @keyup.enter="() => $refs.search.blur()"
      placeholder="Search places, artists and events"
    >
      <template v-slot:prepend>
        <div class="q-mr-xs q-ml-">
          <q-icon size="1.2em" name="mdi-magnify" />
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
      } else {
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
      this.searchbarShowing = false;
      this.hideResultsAndPreviousPanel();
    },
    onSearchbarFocus() {
      if (this.query?.length > 0) {
        this.sidebarPanel = 'search';
        this.showPanel = true;
      }
    },
    onSearchbarBlur() {
      if (!this.query || this.query.length === 0) {
        this.searchbarShowing = false;
        this.hideResultsAndPreviousPanel();
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
    ...mapState(useMainStore, [
      'fineLocation',
      'userLocationLoading',
      'userLocationCity',
      'userLocation',
    ]),
  },
};
</script>

<style lang="scss" scoped>
.body--light {
  .search-component {
    .controls-wrapper {
      box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);

      .controls-wrapper-inner {
        .location-button-wrapper {
          //background: white;
          color: $ti-1;
          .q-btn {
            color: $ti-1;
          }
          &.show-panel {
            .q-btn {
              color: $t-1;
            }
          }
        }
      }
    }
  }
  .controls-wrapper-inner {
    //
    background: white !important;
    //background: #f5f5f5;
    color: $t-1;
    //border: 1px solid rgba(0, 0, 0, 0.1);
    //box-shadow: none;
  }
  .search-popup-wrapper {
    background: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
}
.body--dark {
  .controls-wrapper-inner {
    color: $ti-1;
    background: $bi-1;

    //background: rgba(0, 0, 0, 0.5);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }
}
.search-component {
  z-index: 104;
  position: absolute;
  top: 72px;
  width: 100%;
  display: flex;
  justify-content: center;
  pointer-events: none;
  //max-width: 33vw;
  .controls-wrapper {
    //z-index: 105;
    justify-content: center;
    position: relative;
    border-radius: 48px;

    overflow: hidden;
    .controls-wrapper-inner {
      pointer-events: all;

      // stupid border radius fix for ios 15
      -webkit-transform: translateZ(0);
      -webkit-mask-image: -webkit-radial-gradient(
        circle,
        white 100%,
        black 100%
      );

      //transition: all 0.3s;
      cursor: pointer;
      width: 510px;
      height: 100%;
      border-radius: 48px;

      position: relative;
      .location-button-wrapper {
        position: absolute;
        left: -80px;
        top: 4px;
        border-radius: 24px;
        background: transparent;
      }
    }
  }
  .search-dialog {
    z-index: 1000;
  }
}

.animated.slowest {
  animation-duration: calc(var(--animate-duration) * 10);
}

@media only screen and (min-width: 1921px) {
  .search-component {
  }
}

@media only screen and (max-width: 1280px) {
  .search-component {
    width: 100%;
    display: flex;
    justify-content: center;
    left: unset;
    padding: 0 16px;
    top: 72px;
    //max-width: 50vw;
  }
}
@media only screen and (max-width: 1681px) {
  .search-component {
    //width: 50vw;
    //max-width: 50vw;
    .sidebar-content {
    }
  }
}

@media only screen and (max-width: 599px) {
  .body--light {
    .controls-wrapper-inner {
      box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 1);
      border: 1px solid rgba(0, 0, 0, 0.05);

      &.show-panel {
        box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);
      }
    }
  }
  .body--dark {
    .controls-wrapper-inner {
      border: 1px solid $bi-3;
      background: $bi-2;
      box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.4);
    }
  }
}
</style>
