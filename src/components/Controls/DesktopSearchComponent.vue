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
  .desktop-search-component {
    .controls-wrapper {
      //box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.);

      .controls-wrapper-inner {
        background: $b-2;
        color: $t-1;
        border: 1px solid rgba(0, 0, 0, 0);

        .button-control {
          &.active {
            background: white;
            color: $t-1;
          }
          .q-btn__content {
            .close-icon-wrapper {
              background: $bi-4;
              color: white;
            }
            .tag {
              background: $b-1;
              color: $t-1;
            }
          }
        }
      }
    }
    &.overlaying-map {
      .separator {
        color: $ti-4;
      }
      .controls-wrapper {
        backdrop-filter: blur(40px);
        //   box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);

        .controls-wrapper-inner {
          //background: rgba(255, 255, 255, 0.3);
          background: linear-gradient(
            rgba(110, 110, 110, 0.4),
            rgba(120, 120, 120, 0.4)
          );
          color: $ti-1;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          .button-control {
            .q-btn__content {
              .tag {
                background: rgba(255, 255, 255, 0.2);
                color: $ti-1;
              }
            }
          }
        }
      }
    }
    &.transport-map {
      .controls-wrapper {
        backdrop-filter: none;

        .controls-wrapper-inner {
          //border: 1px solid rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(2px);
          color: $t-1;

          .searchbar-wrapper {
            .searchbar-input {
              .q-field__inner {
                .q-placeholder::placeholder {
                  opacity: 1;
                }
                input {
                  color: $t-1 !important;
                }
                .q-field__marginal {
                  font-size: unset;
                  color: $t-1 !important;
                }
              }
            }
          }
        }
      }
      &.overlaying-map {
        .controls-wrapper {
          box-shadow: rgba(0, 0, 0, 0.2) 1.95px 1.95px 2.6px;

          .controls-wrapper-inner {
            //border: 1px solid rgba(0, 0, 0, 0.1);
            background: rgba(255, 255, 255, 1);
          }
        }
      }
    }
  }
}
.body--dark {
  .desktop-search-component {
    .controls-wrapper {
      .controls-wrapper-inner {
        color: $ti-2;
        background: $bi-3;

        //background: rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0);

        .button-control {
          .q-btn__content {
            .tag {
              background: rgba(255, 255, 255, 0.2);
              color: $ti-1;
            }
            .close-icon-wrapper {
              background: $bi-4;
              color: white;
            }
          }
          &.active {
            background: white;
            color: $t-1;
          }
        }
      }
    }
    &.overlaying-map {
      .separator {
        color: $ti-4;
      }
      .controls-wrapper {
        backdrop-filter: blur(40px);
        // box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);

        .controls-wrapper-inner {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          border-left: 1px solid rgba(255, 255, 255, 0.05);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          //    border-color: transparent;
          background: linear-gradient(
            rgba(110, 110, 110, 0.4),
            rgba(120, 120, 120, 0.4)
          );
          color: $ti-1;
          //border: 1px solid rgba(255, 255, 255, 0.15);

          .button-control {
            .q-btn__content {
              .tag {
                background: rgba(255, 255, 255, 0.2);
                color: $ti-1;
              }
            }
          }
        }
      }
    }
  }
}

.desktop-search-component {
  z-index: 104;

  width: 100%;
  display: flex;
  pointer-events: none;

  justify-content: center;

  .controls-wrapper {
    //z-index: 105;
    justify-content: center;
    position: relative;
    border-radius: 48px;
    overflow: hidden;
    font-family: 'Metropolis';
    &:lang(ru) {
      font-family: 'InterDisplay';
    }
    .controls-wrapper-inner {
      pointer-events: all;
      overflow: hidden;
      //transition: all 0.3s;
      cursor: pointer;
      // width: 510px;
      height: 100%;
      border-radius: 48px;

      position: relative;
      height: 44px;
      align-content: center;
      transition: filter 0.3s ease;

      &:hover {
        //filter: brightness(1);
      }
      .searchbar-wrapper {
        padding-left: 18px;
        padding-right: 18px;
        margin-top: 2px;

        .searchbar-input {
          margin-top: -2px;

          .q-field__inner {
            .q-field__control::before {
              border-color: transparent;
              border: none;
              font-size: larger;
            }
            .q-field__marginal {
              font-size: unset;
              font-size: larger;
            }
            input {
              font-weight: 500;
              font-size: 1rem;
              letter-spacing: 0.5px;
              font-family: 'Metropolis';
              &:lang(ru) {
                font-family: 'InterDisplay';
              }
            }
          }
        }
      }

      .q-btn::before {
        box-shadow: none !important;
      }
      .button-control {
        height: 42px;
        display: flex;
        align-items: baseline;
        .button-label {
          //font-size: 1em;
          letter-spacing: 0.5px;
          white-space: nowrap;
          font-weight: 600;
          margin-top: 1px;
          //font-size: 0.9rem;
        }
        .q-btn__content {
          // padding-left: 8px;
          // padding-right: 8px;

          .tag {
            padding: 4px 12px;
            font-size: 0.9rem;
            text-transform: capitalize;
            font-weight: 600;
            font-family: Inter;
            &:first-child {
              margin-left: 6px;
            }
            &:not(:first-child) {
              margin-left: 6px;
            }
          }

          .close-icon-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 48px;
            padding: 2px;
            margin-right: 8px;
            margin-left: -6px;
          }

          white-space: nowrap;
        }
      }

      .location-button-wrapper {
        position: absolute;
        left: -80px;
        top: 4px;
        border-radius: 24px;
        background: transparent;
      }
    }
    &.search-wrapper {
      .controls-wrapper-inner {
        height: 44px;
        align-content: center;
      }
    }
  }

  :deep(.search-button) {
    .q-btn__content {
      width: 100%;
    }
  }
  &.center-absolute {
    position: absolute;
    width: 100%;
    justify-content: center;
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
