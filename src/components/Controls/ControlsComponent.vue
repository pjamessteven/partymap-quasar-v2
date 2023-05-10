<template>
  <div :class="this.mapStyle === 'satellite' ? 'satellite-enabled' : ''">
    <div
      class="inner-wrapper flex column grow no-wrap"
      :class="$q.screen.gt.xs ? ' q-pl-md' : ' t2'"
    >
      <q-scroll-area
        ref="scroll"
        horizontal
        class="scroll-area"
        :style="$q.screen.gt.xs ? 'height: 54px' : 'height: 44px'"
        :thumb-style="
          $q.screen.gt.xs
            ? { bottom: '0px', height: '4px' }
            : { bottom: '-8px', height: '0px' }
        "
      >
        <div
          class="flex row scroll-wrapper tag-controls"
          :class="[
            $q.screen.gt.xs
              ? 'q-gutter-sm q-pr-md q-py-xs  no-wrap'
              : 'q-gutter-sm q-px-sm  no-wrap',
          ]"
        >
          <DateControl
            v-if="showDateControl"
            :key="1"
            class="flex"
            :showSelectedValue="showSelectedValue"
          />
          <TagControl
            v-if="showTagControl"
            :key="2"
            :showSelectedValue="showSelectedValue"
            ref="tagControl"
          />
          <ArtistControl
            v-if="showArtistControl"
            :key="3"
            :showSelectedValue="showSelectedValue"
            ref="artistControl"
          />
          <SizeControl
            v-if="showSizeControl"
            :key="4"
            :showSelectedValue="showSelectedValue"
          />
          <DurationControl
            v-if="showDurationControl"
            :key="5"
            :showSelectedValue="showSelectedValue"
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
      <div class="artist-profile-wrapper" v-if="$q.screen.lt.sm">
        <ArtistProfile
          :key="controlArtist[0].id"
          class="artist-profile"
          v-if="controlArtist.length > 0"
          :id="controlArtist[0].id"
        />
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
import ArtistProfile from 'src/components/ArtistProfile.vue';
import LocalityControl from './LocalityControl.vue';
import { mapState, mapWritableState } from 'pinia';
import { useMainStore } from 'src/stores/main';
import { useQueryStore } from 'src/stores/query';

export default {
  name: 'ControlsComponent',
  components: {
    DateControl,
    DurationControl,
    SizeControl,
    ArtistControl,
    TagControl,
    ArtistProfile,
    // LocalityControl,
  },
  watch: {
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
    ...mapWritableState(useMainStore, ['showPanel']),
    ...mapState(useMainStore, ['mapStyle']),
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
    showDateControl() {
      return (
        !this.showOnlySelected ||
        (this.showOnlySelected && !!this.controlDateRange.end)
      );
    },
    showDurationControl() {
      return (
        !this.showOnlySelected ||
        (this.showOnlySelected && this.controlDuration.length > 0)
      );
    },
    showSizeControl() {
      return (
        !this.showOnlySelected ||
        (this.showOnlySelected && this.controlSize.length > 0)
      );
    },
    showArtistControl() {
      return (
        !this.showOnlySelected ||
        (this.showOnlySelected && this.controlArtist.length > 0)
      );
    },
    showTagControl() {
      return (
        !this.showOnlySelected ||
        (this.showOnlySelected && this.controlTag.length > 0)
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
    // background: black;
    // border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    .msg {
      color: $ti-3;
      font-weight: bold;
      text-shadow: 1px 1px 2px black;
      display: none;
    }
    :deep(.select-control-wrapper) {
      background: transparent;
      color: rgba(255, 255, 255, 0.68);
      text-shadow: 1px 1px 2px black;
      background: rgba(48, 48, 48, 0.68);

      border: 1px solid rgba(255, 255, 255, 0.1);
      .q-btn__wrapper {
        &:before {
          box-shadow: none;
        }
      }
      &.active {
        //background: white !important;
        color: $t-1 !important;
        // font-weight: bold;
        text-shadow: none !important;
        border: 1px solid rgba(0, 0, 0, 1);
      }
    }

    :deep(.tag) {
      background: rgba(48, 48, 48, 0.68);
      color: rgba(255, 255, 255, 0.68);
      text-shadow: 1px 1px 2px black;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: rgba(0, 0, 0, 0.5) 0px 1px 2px 0px;
      &.selected {
        opacity: 1;
        color: $t-1 !important;
        background: white !important;
        border: 1px solid rgba(0, 0, 0, 1);
        text-shadow: none !important;

        .tag-inner-wrapper {
          opacity: 1;
          .tag-inner {
            font-weight: bold;
          }
        }
      }

      &:hover {
        background: $bi-4;
      }
    }
  }
}
.body--light {
  $item-inactive-background: $b-3;
  $item-inactive-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px 0px;
  $item-inactive-border: 1px solid rgba(255, 255, 255, 0.2);

  .inner-wrapper {
    // border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    //border-left: 1px solid rgba(0, 0, 0, 0.05);
    .separator-vertical {
      background: rgba(0, 0, 0, 0.1) !important;
      width: 1px;
    }
    .msg {
      color: $t-3;
      font-weight: bold;
      text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.2);
      display: none;
    }
    :deep(.select-control-wrapper) {
      background: rgba(255, 255, 255, 0.48);
      color: $t-3;
      text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.48);

      box-shadow: rgba(0, 0, 0, 0.4) 0px 1px 2px 0px;

      border: 1px solid rgba(255, 255, 255, 0.2);
      .q-btn__wrapper {
        &:before {
          box-shadow: none;
        }
      }
      &.active {
        background: white !important;
        color: $t-1 !important;
        // font-weight: bold;
        border: 1px solid rgba(255, 255, 255, 0);
      }
    }

    :deep(.tag) {
      background: rgba(255, 255, 255, 0.48);
      color: $t-3;
      text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.48);
      box-shadow: rgba(0, 0, 0, 0.4) 0px 1px 2px 0px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      &.selected {
        color: black !important;
        background: white !important;
        .tag-inner-wrapper {
          .tag-inner {
            font-weight: bold;
          }
        }
      }
    }
    &.satellite-enabled {
      :deep(button-control) {
        background: rgba(255, 255, 255, 0.68);
        box-shadow: rgba(0, 0, 0, 0.4) 0px 1px 2px 0px;
      }
    }
  }
}

.inner-wrapper {
  .scroll-area {
    mask-image: linear-gradient(
      to left,
      transparent 0%,
      white 64px,
      white calc(100% - 20px),
      white 100%
    );
    overflow-y: hidden;
  }
  .artist-profile-wrapper {
    padding-left: 16px;
    padding-right: 16px;
    .artist-profile {
      width: 500px;
      max-width: 100%;
      //height: 200px;
      border-radius: 9px !important;
    }
  }

  .scroll-area {
    width: 100%;
    //height: 48px;
    overflow-y: hidden;
    :deep(.select-control-wrapper) {
      border-radius: 50px;
      font-weight: 400;
      padding: 0px 12px;
    }

    :deep(.tag) {
      border-radius: 50px;

      .tag-inner-wrapper {
        padding: 0px 8px;
        text-transform: capitalize;
      }
    }
    &.disable-scroll {
      overflow: visible;
      height: 200px;
      .scroll-wrapper {
        padding: 4px;
        :deep(.tag) {
          //height: 42px;
        }
      }
    }
  }

  width: 100%;
}

@media only screen and (max-width: 600px) {
  .body--light {
  }
  .body--dark {
  }

  .inner-wrapper {
    mask-image: none;

    .artist-profile-wrapper {
      width: 100%;
    }
    .scroll-area {
      overflow-y: hidden !important;
      mask-image: linear-gradient(
        to left,
        transparent 0%,
        white 20px,
        white calc(100% - 20px),
        white calc(100% - 8px),
        transparent 100%
      );

      .scroll-wrapper {
        overflow-y: hidden;
        padding-left: 8px;
        padding-right: 24px;
      }
    }
  }
}
</style>
