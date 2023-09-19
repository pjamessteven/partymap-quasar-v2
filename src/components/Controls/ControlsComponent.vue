<template>
  <div
    class="inner-wrapper flex column grow no-wrap"
    :class="$q.screen.gt.xs ? ' ' : ' t2'"
  >
    <q-scroll-area
      v-if="!searchbarShowing"
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
              <div>everything</div>
            </div>
          </div>
        </q-btn>
        <div class="separator vertical" />

        <DateControl v-if="showDateControl" :key="1" />
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

        <SizeControl v-if="showSizeControl" :key="4" />
        <div class="separator vertical" />

        <DurationControl v-if="showDurationControl" :key="5" />

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
        ref="search"
        borderless
        autofocus
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
    sidebarPanel(newv, oldv) {
      // so we can return to previous sidebar panel after triggering search
      this.previousSidebarPanel = oldv;
    },
    query(newv) {
      if (newv?.length > 0) {
        this.sidebarPanel = 'search';
        if (this.$route.name !== 'Explore') {
          this.$router.push({ name: 'Explore', query: { view: 'explore' } });
        }
      }
    },
    controlArtist: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.goToExplore();
          if (this.$q.screen.lt.sm) {
            this.$refs.scroll.setScrollPosition(
              'horizontal',
              this.$refs.artistControl.$el.offsetLeft - 16,
              300
            );
          }
        }
      },
      deep: true,
    },
    controlTag: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.goToExplore();
          if (this.$q.screen.lt.sm) {
            this.$refs.scroll.setScrollPosition(
              'horizontal',
              this.$refs.tagControl.$el.offsetLeft - 16,
              300
            );
          }
        }
      },
      deep: true,
    },
    controlDateRange: {
      handler(newVal) {
        if (newVal && newVal.end) {
          this.goToExplore();
          if (this.$q.screen.lt.sm) {
            this.$refs.scroll.setScrollPosition(
              'horizontal',
              this.$refs.tagControl.$el.offsetLeft - 16,
              300
            );
          }
        }
      },
      deep: true,
    },
    controlSize: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.goToExplore();
          if (this.$q.screen.lt.sm) {
            this.$refs.scroll.setScrollPosition(
              'horizontal',
              this.$refs.tagControl.$el.offsetLeft - 16,
              300
            );
          }
        }
      },
      deep: true,
    },
    controlDuration: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.goToExplore();
          if (this.$q.screen.lt.sm) {
            this.$refs.scroll.setScrollPosition(
              'horizontal',
              this.$refs.tagControl.$el.offsetLeft - 16,
              300
            );
          }
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
      searchbarShowing: false,
      previousSidebarPanel: '',
      previousShowPanel: '',
    };
  },
  methods: {
    ...mapActions(useMapStore, ['setExploreMapViewToWorld']),
    goToExplore() {
      this.sidebarPanel = 'explore';
      if (this.$route.name !== 'Explore') {
        this.$router.push({ name: 'Explore', query: { view: 'explore' } });
      }
    },
    clearSearch() {
      this.query = null;
      this.searchbarShowing = false;
      if (this.sidebarPanel === 'search') {
        // hide results and restore previous sidebar state
        this.sidebarPanel = this.previousSidebarPanel;
        if (this.sidebarPanel === 'explore') {
          this.showPanel = false;
        }
      }
    },
  },
  computed: {
    ...mapWritableState(useSearchStore, ['query']),
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
      box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;
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
  }
}

.inner-wrapper {
  width: 100%;
  position: relative;
  height: 48px;
  border-radius: 48px;
  overflow: hidden;
  .control-scroll-area {
    height: 48px;
    width: 100%;

    mask-image: linear-gradient(
      to left,
      transparent 0%,
      transparent 64px,
      white 96px,
      white calc(100% - 64px),
      white 100%
    );
    overflow-y: hidden;

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
