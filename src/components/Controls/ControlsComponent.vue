<template>
  <div
    class="inner-wrapper flex column grow no-wrap"
    :class="$q.screen.gt.xs ? ' ' : ' t2'"
  >
    <q-scroll-area
      v-show="!searchbarShowing"
      ref="scroll"
      horizontal
      class="control-scroll-area"
      :thumb-style="
        $q.screen.gt.xs
          ? { bottom: '0px', height: '4px' }
          : { bottom: '-8px', height: '0px' }
      "
    >
      <div class="flex row scroll-wrapper items-center justify-start no-wrap">
        <q-btn
          no-caps
          @click="
            () => {
              searchbarShowing = true;
            }
          "
          style="padding-left: 8px"
          class="button-control flex items-center"
          :class="{
            active: sidebarPanel === 'search',
          }"
        >
          <div class="flex items-center row no-wrap">
            <div class="button-label flex row items-center row no-wrap">
              <div class="q-mr-sm">
                <i class="mdi mdi-magnify" />
              </div>
              <div>search</div>
            </div>
          </div>
        </q-btn>
        <div class="separator vertical" />

        <DateControl v-if="showDateControl" ref="dateControl" :key="1" />
        <!--
        <div class="separator vertical" />
        <q-btn
          no-caps
          @click="
            () => {
              showing = !showing;
            }
          "
          class="button-control flex items-center"
          :class="{
            active: sidebarPanel === 'search',
          }"
        >
          <div class="flex items-center row no-wrap">
            <div class="button-label flex row items-center row no-wrap">
              <div class="q-mr-sm">
                <i class="las la-map-marker" />
              </div>
              <div>Places</div>
            </div>
          </div>
        </q-btn>
-->
        <div class="separator vertical" />

        <TagControl v-if="showTagControl" :key="2" ref="tagControl" />
        <div class="separator vertical" />

        <ArtistControl v-if="showArtistControl" :key="3" ref="artistControl" />
        <div class="separator vertical" />

        <SizeControl v-if="showSizeControl" ref="sizeControl" :key="4" />
        <div class="separator vertical" />

        <DurationControl
          v-if="showDurationControl"
          ref="durationControl"
          :key="5"
        />

        <!--
          <LocalityControl
            v-if="showLocalityControl"
            :key="6"
            :showSelectedValue="showSelectedValue"
          />
          -->
      </div>
    </q-scroll-area>
    <div class="searchbar-wrapper" v-if="searchbarShowing">
      <q-input
        @keydown.esc="
          () => {
            query = '';
            $refs.search.blur();
          }
        "
        ref="search"
        borderless
        autofocus
        @focus="onSearchbarFocus()"
        @blur="onSearchbarBlur()"
        @clear="clearSearch()"
        class="searchbar-input inter bold"
        v-model="query"
        @keyup.enter="() => $refs.search.blur()"
        placeholder="Search places, events and more"
      >
        <template v-slot:prepend>
          <q-icon name="mdi-magnify" class="q-my-md" />
        </template>
      </q-input>
    </div>
    <div class="search-button-wrapper q-ml-md flex items-center justify-center">
      <div
        class="search-button"
        v-if="!searchbarShowing"
        @click="() => (searchbarShowing = true)"
      >
        <q-icon name="mdi-magnify" size="large"></q-icon>
      </div>
      <div class="search-button" v-else @click="clearSearch()">
        <q-icon name="mdi-close" size="large"></q-icon>
      </div>
    </div>
  </div>
</template>

<script>
import ArtistControl from './ArtistControl.vue';
import DateControl from './DateControl.vue';
import DurationControl from './DurationControl.vue';
import SizeControl from './SizeControl.vue';
import TagControl from './TagControl.vue';
import LocalityControl from './LocalityControl.vue';
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useMainStore } from 'src/stores/main';
import { useQueryStore } from 'src/stores/query';
import { useSearchStore } from 'src/stores/search';
import { useMapStore } from 'src/stores/map';

export default {
  name: 'ControlsComponent',
  components: {
    DateControl,
    DurationControl,
    SizeControl,
    ArtistControl,
    TagControl,
    // LocalityControl,
  },
  watch: {
    anyFiltersEnabled(newv) {
      if (!newv) {
        // scroll to start when removing filters
        this.$refs.scroll.setScrollPosition('horizontal', 0, 150);
      }
    },
    sidebarPanel(newv, oldv) {
      // so we can return to previous sidebar panel after triggering search
      this.previousSidebarPanel = oldv;
    },
    query(newv) {
      if (newv?.length > 0) {
        this.sidebarPanel = 'search';
        if (this.$route.name !== 'Explore') {
          this.$router.push({ name: 'Explore' });
        }
      }
    },
    controlArtist: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.goToExplore();
          setTimeout(() => {
            this.$refs.scroll.setScrollPosition(
              'horizontal',
              this.$refs.artistControl.$el.offsetLeft,
              150
            );
          }, 100);
        }
      },
      deep: true,
    },
    controlTag: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.goToExplore();
          this.$refs.scroll.setScrollPosition(
            'horizontal',
            this.$refs.tagControl.$el.offsetLeft,
            150
          );
        }
      },
      deep: true,
    },
    controlDateRange: {
      handler(newVal) {
        if (newVal && newVal.end) {
          this.goToExplore();
          this.$refs.scroll.setScrollPosition(
            'horizontal',
            this.$refs.dateControl.$el.offsetLeft,
            150
          );
        }
      },
      deep: true,
    },
    controlSize: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.goToExplore();
          this.$refs.scroll.setScrollPosition(
            'horizontal',
            this.$refs.sizeControl.$el.offsetLeft - 16,
            150
          );
        }
      },
      deep: true,
    },
    controlDuration: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.goToExplore();
          this.$refs.scroll.setScrollPosition(
            'horizontal',
            this.$refs.durationControl.$el.offsetLeft,
            150
          );
        }
      },
      deep: true,
    },
  },
  props: {
    data: { type: Object },
    showSelectedValue: {
      default: false,
      type: Boolean,
    },
    showOnlySelected: {
      defaut: false,
      type: Boolean,
    },
  },
  data() {
    return {
      previousSidebarPanel: '',
      previousShowPanel: '',
    };
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
    goToExplore() {
      this.sidebarPanel = 'explore';
      if (this.$route.name !== 'Explore') {
        this.$router.push({ name: 'Explore', query: { view: 'explore' } });
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
    ...mapWritableState(useMainStore, ['showPanel', 'sidebarPanel']),
    ...mapState(useQueryStore, [
      'controlDateRange',
      'controlFavorites',
      'controlDuration',
      'controlSize',
      'controlArtist',
      'controlTag',
      'controlCountry',
      'controlRegion',
      'controlLocality',
      'anyFiltersEnabled',
    ]),
    dateControlActive() {
      return !!this.controlDateRange.end;
    },
    durationControlActive() {
      return this.controlDuration.length > 0;
    },
    sizeControlActive() {
      return this.controlSize.length > 0;
    },
    artistControlActive() {
      return this.controlArtist.length > 0;
    },
    tagControlActive() {
      return this.controlTag.length > 0;
    },
    showDateControl() {
      return (
        !this.showOnlySelected ||
        (this.showOnlySelected && this.dateControlActive)
      );
    },

    showDurationControl() {
      return (
        !this.showOnlySelected ||
        (this.showOnlySelected && this.durationControlActive)
      );
    },
    showSizeControl() {
      return (
        !this.showOnlySelected ||
        (this.showOnlySelected && this.sizeControlActive)
      );
    },
    showArtistControl() {
      return (
        !this.showOnlySelected ||
        (this.showOnlySelected && this.artistControlActive)
      );
    },
    showTagControl() {
      return (
        !this.showOnlySelected ||
        (this.showOnlySelected && this.tagControlActive)
      );
    },
    showLocalityControl() {
      return (
        !this.showOnlySelected ||
        (this.showOnlySelected &&
          (!!this.controlCountry ||
            !!this.controlRegion ||
            !!this.controlLocality))
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .inner-wrapper {
    .separator {
      border-color: $bi-4;
    }
    :deep(.button-control) {
      // background: black;
      color: $ti-1;

      .q-btn__content {
        .close-icon-wrapper {
          background: $bi-4;
          color: white;
        }
      }

      .q-btn__wrapper {
        &:before {
          box-shadow: none;
        }
      }
      &.active {
        background: $bi-3 !important;
      }
    }
  }
}
.body--light {
  $item-inactive-background: $b-3;
  $item-inactive-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px 0px;
  $item-inactive-border: 1px solid rgba(255, 255, 255, 0.2);

  .inner-wrapper {
    .separator {
      border-color: $b-4;
    }

    :deep(.button-control) {
      color: $t-1;
      text-shadow: 1px 1px 2px rgba(255, 255, 255, 1);
      /*
      1
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.2);
      */
      //background: $b-2;
      transition: none;
      //box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;
      //box-shadow: none !important;
      &::before {
        box-shadow: none !important;
      }
      .q-btn__content {
        .close-icon-wrapper {
          background: $b-4;
          color: black;
        }
      }
      .q-btn__wrapper {
        &:before {
          box-shadow: none;
        }
      }
      &.active {
        background: $b-3 !important;
      }
    }
    .search-button-wrapper {
      .search-button {
        background: $b-3;
        color: black;
      }
    }
  }
}

.inner-wrapper {
  width: 100%;
  position: relative;
  height: 48px;
  border-radius: 48px;
  overflow: hidden !important;
  .control-scroll-area {
    height: 48px;
    width: 100%;
    padding-right: 32px;

    mask-image: linear-gradient(
      to left,
      transparent 0%,
      transparent 64px,
      white 96px,
      white calc(100% - 64px),
      white 100%
    );
    overflow-y: hidden;
    :deep(.q-scrollarea__container) {
      overflow-y: hidden !important;
    }

    &.disable-scroll {
      overflow: visible;
      height: 200px;
      .scroll-wrapper {
        padding: 4px;
      }
    }

    .scroll-wrapper {
      height: 48px;
      padding-right: 64px;
    }
  }

  .searchbar-wrapper {
    padding-left: 18px;
    padding-right: 18px;

    .searchbar-input {
      margin-top: -4px;
      :deep(.q-field__inner) {
        .q-field__control::before {
          border-color: transparent;
          border: none;
        }
      }
    }
  }
  .separator {
    height: 16px;
    border-left: 1px solid;
    margin-left: -1px;
    margin-right: -1px;
  }
  :deep(.button-control) {
    height: 100%;
    padding: 0px;
    font-weight: 500;
    font-family: Inter;
    text-transform: capitalize;
    font-size: normal;
    border-radius: 0px !important;
    box-shadow: none !important;
    overflow: hidden;

    &.active {
      // font-weight: 600;
    }

    .q-btn__wrapper {
      padding: 0;
    }
    .q-btn__content {
      .close-icon-wrapper {
        background: white;
        color: black;
        height: 48px;
        padding: 4px 16px 4px 12px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .button-label {
        padding: 0px 12px;
      }
      white-space: nowrap;
      .q-icon {
        margin-right: -6px;
      }
    }
  }
  .search-button-wrapper {
    position: absolute;
    right: 16px;
    height: 100%;
    .search-button {
      padding: 4px 6px;
      border-radius: 100%;
      background: lightgrey;
      color: black;
    }
  }
}

@media only screen and (max-width: 600px) {
  .body--light {
  }
  .body--dark {
  }

  .inner-wrapper {
    mask-image: none;
    height: 44px;
    overflow-y: hidden;

    .control-scroll-area {
      margin-top: -2px;
      overflow-y: hidden !important;
      mask-image: linear-gradient(
        to left,
        transparent 0%,
        transparent 48px,
        white 96px,
        white calc(100% - 64px),
        white 100%
      );
      overflow-y: hidden;

      .scroll-wrapper {
        //height: 44px;
        overflow-y: hidden;
        padding-left: 0px;
        padding-right: 24px;
      }
    }
    .searchbar-wrapper {
      margin-top: -2px;
    }
    .search-button-wrapper {
      position: absolute;
      right: 8px;
      height: 100%;
    }
    :deep(.button-control) {
      .button-label {
        :first-child {
          //display: none
        }
      }
    }
  }
}
</style>
