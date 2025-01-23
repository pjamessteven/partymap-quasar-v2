<template>
  <div
    class="desktop-search-component q-mt-md flex row items-center no-wrap"
    :class="{
      'transport-map': mapStyle !== 'satellite',
      'overlaying-map': overlayingMap,
      'center-absolute': $route.name !== 'Explore' && $q.screen.gt.xs,
    }"
  >
    <div
      class="controls-wrapper flex no-wrap"
      :style="fullWidth ? 'width: 100%' : ''"
    >
      <div class="controls-wrapper-inner" style="width: 100%; overflow-x: auto">
        <q-btn
          style="min-width: 100%"
          :ripple="false"
          no-caps
          @click="showDialog = true"
          class="button-control search-button flex items-center grow"
        >
          <div
            class="flex items-center no-wrap grow justify-between text-large metropolis"
            style="opacity: 0.9"
          >
            <div class="flex no-wrap items-center">
              <div
                class="q-mr-xs q-ml- flex items-center"
                style="transform: scale(-1, 1)"
              >
                <q-icon size="22px" name="las la-search" />
              </div>
              <div
                class="metropolis q-ml-sm"
                v-if="
                  (!controlTag.length &&
                    !controlSize.length &&
                    !controlDuration.length &&
                    $q.screen.gt.sm) ||
                  ($q.screen.lt.sm && !anyFiltersEnabled)
                "
              >
                {{ $t('search.search_and_filter') }}
              </div>
              <div class="flex row no-wrap">
                <Tag
                  v-if="
                    controlDateRangeSelectedOption?.value && $q.screen.lt.md
                  "
                >
                  {{ controlDateRangeSelectedOption.label }}
                  <q-icon
                    @click.stop="clearDateFilter"
                    style="margin-right: -4px; font-size: 18px"
                    name="mdi-close-circle q-ml-sm"
                  />
                </Tag>

                <Tag v-for="(tag, index) in controlTag">
                  {{ tag.tag_t || tag.tag }}
                  <q-icon
                    style="margin-right: -4px; font-size: 18px"
                    name="mdi-close-circle q-ml-sm"
                    @click.stop="clickTag(index)"
                  />
                </Tag>
                <Tag v-for="(duration, index) in controlDuration">
                  {{ duration.label }}
                  <q-icon
                    style="margin-right: -4px; font-size: 18px"
                    name="mdi-close-circle q-ml-sm"
                    @click.stop="controlDuration.splice(index, 1)"
                  />
                </Tag>
                <Tag v-for="(size, index) in controlSize">
                  {{ size.label }}
                  <q-icon
                    style="margin-right: -4px; font-size: 18px"
                    name="mdi-close-circle q-ml-sm"
                    @click.stop="controlSize.splice(index, 1)"
                  />
                </Tag>
              </div>
            </div>
            <div class="flex no-wrap items-center">
              <q-separator
                vertical
                class="q-mx-md o-030"
                :color="$q.dark.isActive || overlayingMap ? 'white' : 'black'"
              />
              <div
                class="q-mr-xs q-ml- flex items-center"
                style="transform: scale(-1, 1)"
              >
                <q-icon size="22px" name="las la-calendar" />
              </div>
              <div
                class="flex row q-ml-xs"
                v-if="controlDateRangeSelectedOption?.value && $q.screen.gt.sm"
                style="margin-right: -12px"
              >
                <Tag>
                  {{ controlDateRangeSelectedOption.label }}
                  <q-icon
                    @click.stop="clearDateFilter"
                    style="margin-right: -4px; font-size: 18px"
                    name="mdi-close-circle q-ml-sm"
                  />
                </Tag>
              </div>
              <div v-else class="flex row items-center">
                <div class="metropolis q-mx-sm" v-if="$q.screen.gt.sm">
                  Select dates
                </div>
                <div
                  class="q-mr-xs q-ml- flex items-center"
                  style="transform: scale(-1, 1)"
                  v-if="$q.screen.gt.sm"
                >
                  <q-icon size="22px" name="mdi-chevron-down" />
                </div>
              </div>
            </div>
          </div>
        </q-btn>
      </div>
    </div>
    <div class="controls-wrapper flex no-wrap q-mr-sm" v-if="false">
      <div class="controls-wrapper-inner">
        <q-btn
          no-caps
          @click="
            () => {
              showingDateControl = !showingDateControl;
            }
          "
          class="button-control flex items-center"
          :class="{
            active: isActive,
          }"
        >
          <div class="flex items-center row no-wrap">
            <div
              class="close-icon-wrapper"
              v-if="isActive"
              @click.stop="$emit('clear')"
            >
              <q-icon style="font-size: 16px" name="mdi-close" />
            </div>

            <div class="button-label flex row items-center row no-wrap">
              {{
                controlDateRangeSelectedOption?.label ||
                $t(`nearby_view.any_dates`)
              }}
            </div>
            <q-icon
              class="q-ml-sm"
              :size="'1.5em'"
              :name="'las la-calendar'"
              v-if="!isActive"
            />
            <q-icon
              v-if="$q.screen.gt.xs && false"
              class="q-ml-xs"
              size="1.4em"
              name="mdi-menu-down"
              style="margin-right: -8px"
            />
          </div>
          <DateControl
            :showing="showingDateControl"
            :hide="showingDateControl = false"
          />
        </q-btn>
      </div>
    </div>
    <BackdropBlurDialog
      v-model="showDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <SearchDialog @hide="showDialog = false" />
    </BackdropBlurDialog>
  </div>
</template>

<script>
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useMainStore } from 'src/stores/main';
import { useMapStore } from 'src/stores/map';
import { useSearchStore } from 'src/stores/search';
import { useQueryStore } from 'src/stores/query';
import DateControl from 'src/components/Controls/DateControl.vue';

import SearchComponent from 'src/components/Search/SearchComponent.vue';
import BackdropBlurDialog from '../BackdropBlurDialog.vue';
import SearchDialog from '../Search/SearchDialog.vue';
import Tag from '../Tag.vue';
export default {
  components: {
    SearchComponent,
    DateControl,
    BackdropBlurDialog,
    SearchDialog,
    Tag,
  },
  props: ['overlayingMap', 'fullWidth'],
  data() {
    return { showingDateControl: false, showDialog: false };
  },
  watch: {},
  methods: {
    ...mapActions(useQueryStore, ['clearDateFilter']),
    goToExplore() {
      this.sidebarPanel = 'explore';
      if (this.$route.name !== 'Explore') {
        this.$router.push({ name: 'Explore', query: { view: 'explore' } });
      }
    },
    clickTag(index) {
      this.controlTag.splice(index, 1);
    },
  },
  computed: {
    ...mapState(useMapStore, ['mapStyle']),
    ...mapWritableState(useSearchStore, ['query']),
    ...mapWritableState(useMainStore, [
      'sidebarPanel',
      'showPanel',
      'menubarOpacity',
    ]),
    ...mapState(useMainStore, ['windowWidth']),
    ...mapWritableState(useQueryStore, [
      'controlDateRange',
      'controlDateRangeSelectedOption',
      'anyFiltersEnabled',
      'controlTag',
      'controlSize',
      'controlArtist',
      'controlDuration',
      'controlEmptyLineup',
      'controlDateUnconfirmed',
    ]),
  },
};
</script>

<style lang="scss" scoped>
.body--light {
}
.body--dark {
}

.desktop-search-component {
  z-index: 104;

  width: 100%;
  display: flex;
  pointer-events: none;

  justify-content: center;

  :deep(.search-button) {
    .q-btn__content {
      width: 100%;

      .tag {
        padding: 4px 12px;
        color: $ti-1;
        font-size: 0.9rem;
        text-transform: capitalize;
        background: rgba(255, 255, 255, 0.2);
        font-family: Inter;
        &:first-child {
          margin-left: 6px;
        }
        &:not(:first-child) {
          margin-left: 6px;
        }
      }
    }
  }
  &.center-absolute {
    position: absolute;
    width: 100%;
    justify-content: center;
  }

  .control-scroll-area {
    height: 48px;
    width: 100%;
    .scroll-inner {
      //justify-content: start;
      //padding-left: 256px;
      justify-content: center;
      pointer-events: all;
      .separator {
        height: 16px;
        border-left: 1px solid;
      }
    }
  }
}

.animated.slowest {
  animation-duration: calc(var(--animate-duration) * 10);
}

@media only screen and (max-width: 1023px) {
  .desktop-search-component {
    padding-left: 0px;
    top: 48px;
    z-index: 501;
    padding: 0 16px;

    .search-button {
    }

    .controls-wrapper {
      width: 100%;
      .controls-wrapper-inner {
        width: 100%;
        :deep(.searchbar-wrapper) {
          .searchbar-input {
            width: 100% !important;
          }
        }
      }
    }
  }
}

@media only screen and (min-width: 600px) and (max-width: 1023px) {
  .desktop-search-component {
    top: 52px;
  }
}
</style>

<style lang="scss"></style>
