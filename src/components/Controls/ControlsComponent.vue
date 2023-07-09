<template>
  <div
    class="inner-wrapper flex column grow no-wrap"
    :class="$q.screen.gt.xs ? ' ' : ' t2'"
  >
    <q-scroll-area
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
          style="padding-left: 8px"
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
                <i class="mdi mdi-magnify" />
              </div>
              <div>everything</div>
            </div>
          </div>
        </q-btn>
        <div class="separator vertical" />

        <DateControl
          v-if="showDateControl"
          :key="1"
          :showSelectedValue="showSelectedValue"
        />
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

        <div class="separator vertical" />

        <TagControl
          v-if="showTagControl"
          :key="2"
          :showSelectedValue="showSelectedValue"
          ref="tagControl"
        />
        <div class="separator vertical" />

        <ArtistControl
          v-if="showArtistControl"
          :key="3"
          :showSelectedValue="showSelectedValue"
          ref="artistControl"
        />
        <div class="separator vertical" />

        <SizeControl
          v-if="showSizeControl"
          :key="4"
          :showSelectedValue="showSelectedValue"
        />
        <div class="separator vertical" />

        <DurationControl
          v-if="showDurationControl"
          :key="5"
          :showSelectedValue="showSelectedValue"
        />
        <q-input
          ref="search"
          clearable
          @clear="clearSearchResults"
          dense
          rounded
          outlined
          class="searchbar-input inter bold"
          v-model="query"
          @keyup.enter="() => $refs.search.blur()"
          @update:model-value="onInput()"
          label="Search places, events and more"
        >
          <template v-slot:prepend>
            <q-icon name="mdi-magnify" class="q-my-md" />
          </template>
        </q-input>
        <!--
          <LocalityControl
            v-if="showLocalityControl"
            :key="6"
            :showSelectedValue="showSelectedValue"
          />
          -->
      </div>
    </q-scroll-area>
    <div class="search-button-wrapper q-ml-md flex items-center justify-center">
      <div class="search-button">
        <q-icon name="mdi-magnify" size="large"></q-icon>
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
import { mapState, mapWritableState } from 'pinia';
import { useMainStore } from 'src/stores/main';
import { useQueryStore } from 'src/stores/query';
import { useSearchStore } from 'src/stores/search';

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
    query() {
      this.sidebarPanel = 'search';
      this.showPanel = true;
    },
    controlArtist(newVal) {
      if (newVal && newVal.length > 0 && this.$q.screen.lt.sm) {
        this.$refs.scroll.setScrollPosition(
          this.$refs.artistControl.$el.offsetLeft - 16,
          300
        );
      }
    },
    controlTagSelectedOptions(newVal) {
      if (newVal && newVal.length > 0 && this.$q.screen.lt.sm) {
        this.$refs.scroll.setScrollPosition(
          this.$refs.tagControl.$el.offsetLeft - 16,
          300
        );
      }
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
    return {};
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
      .searchbar-input {
        margin-left: 16px;
        width: 300px;
      }
    }
  }
  .separator {
    height: 16px;
    border-left: 1px solid;
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
        height: 100%;
        padding: 4px 16px 4px 12px;
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
    .control-scroll-area {
      height: 48px;
      overflow-y: hidden !important;

      .scroll-wrapper {
        overflow-y: hidden;
        padding-left: 0px;
        padding-right: 24px;
      }
    }
  }
}
</style>
