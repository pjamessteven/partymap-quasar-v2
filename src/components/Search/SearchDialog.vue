<template>
  <div class="search-dialog flex column no-wrap" @click="clickAway">
    <CustomQScroll
      vertical
      @scroll="onScroll"
      ref="scrollArea"
      style="height: 100%; width: 100%"
      :thumb-style="
        $q.screen.gt.xs
          ? {
              bottom: '0px',
              height: '8px',
              marginLeft: '16px',
              borderRadius: '0px',
            }
          : { bottom: '0px', height: '0px', borderRadius: '0px', width: '4px' }
      "
    >
      <div class="flex row justify-center grow">
        <div
          class="flex column search-column no-wrap"
          :class="{
            'q-py-xl ': $q.screen.gt.sm,
            ' q-py-md ': $q.screen.lt.md,
          }"
        >
          <div class="q-px-md" :class="{ 'q-mb-sm': $q.screen.gt.sm }">
            <q-input
              @keydown.esc="
                () => {
                  $refs.search.blur();

                  clearSearch();
                }
              "
              @click.stop
              ref="search"
              rounded
              borderless
              bg-color="white"
              :style="$q.screen.gt.sm ? 'height: 48px' : 'height: 40px'"
              :autofocus="true"
              @focus="onSearchbarFocus()"
              @blur="onSearchbarBlur()"
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
                  class="q-mr-xs q-ml-md q-ml- flex items-center"
                  style="transform: scale(-1, 1)"
                >
                  <q-icon size="22px" name="las la-search" />
                </div>
              </template>
              <template v-slot:append>
                <div
                  class="search-button q-mr-md q-mb-xs"
                  v-if="query?.length"
                  @click.stop="clearSearch()"
                >
                  <q-icon
                    name="mdi-close"
                    style="cursor: pointer"
                    size="large"
                  ></q-icon>
                </div>
              </template>
            </q-input>
          </div>
          <SearchView
            class="search-results q-mt-lg"
            v-if="query?.length > 0"
            @closeDialog="$emit('hide')"
          />

          <div class="flex column" v-else>
            <div
              class="q-px-md search-header metropolis text-h5 bolder q-mt-lg q-mb-md"
            >
              Dates
            </div>
            <div
              class="q-px-md search-component q-mb-sm"
              v-if="$q.screen.gt.sm"
            >
              <DateControl
                class="date-control"
                @click.stop
                style="pointer-events: all"
                @hide="$emit('hide')"
              />
            </div>
            <div
              v-else
              style="pointer-events: all"
              class="q-px-md search-component flex row no-wrap q-gutter-md"
            >
              <q-card
                class="tag q-pa-xs grow flex row items-center no-wrap justify-between"
                :class="{ selected: controlDateRangeSelectedOption?.value }"
                @click.stop="showingDateControl = true"
                style="
                  border-radius: 50px !important;
                  overflow: hidden;
                  font-size: unset;
                  padding: 4px 10px;
                "
              >
                <q-icon name="las la-calendar" size="sm" class="q-ml-xs q-p" />
                <div class="flex row items-center grow justify-around q-px-md">
                  <div class="">
                    {{ computedStartLabel }}
                  </div>
                  <q-icon
                    name="mdi-chevron-right"
                    size="sm"
                    class="q-pa-xs q-p"
                  />
                  <div>
                    {{ computedEndLabel }}
                  </div>
                </div>
                <q-icon
                  @click.stop="clearDateFilter"
                  style="font-size: 22px"
                  name="mdi-close-circle q-mr-xs"
                  v-if="controlDateRangeSelectedOption?.value"
                />
              </q-card>
            </div>

            <div
              v-if="$q.screen.lt.sm && $route.name === 'Explore'"
              class="q-px-md search-header metropolis text-h5 bolder q-mt-lg q-mb-md"
            >
              Top Tags in this area
            </div>
            <div
              v-if="$q.screen.lt.sm && $route.name === 'Explore'"
              @click.stop
              class="flex column search-component q-px-md"
              style="width: 100%"
            >
              <TagExplorer mode="explore" @tagSelected="$emit('hide')" />
            </div>

            <div
              class="q-px-md search-header metropolis text-h5 bolder q-mt-lg q-mb-md"
            >
              Top Tags Worldwide
            </div>
            <div
              @click.stop
              class="flex column search-component q-px-md q-mb-sm"
              style="width: 100%"
            >
              <TagExplorer mode="all" @tagSelected="$emit('hide')" />
            </div>

            <div
              class="q-px-md search-header metropolis text-h5 bolder q-mt-lg q-mb-md"
            >
              Size
            </div>

            <div class="q-px-md search-component flex row q-gutter-sm q-mb-md">
              <div
                v-for="(size, index) in sizeOptions"
                :key="index"
                @click="clickSize(size)"
                class="tag t2"
                style="text-transform: capitalize"
                :class="{
                  'no-hover': $q.platform.is.ios,
                  selected:
                    controlSize.findIndex((x) => x.val === size.val) > -1,
                }"
              >
                {{ size.label }}
              </div>
            </div>

            <div
              class="q-px-md search-header metropolis text-h5 bolder q-mt-lg q-mb-md"
            >
              Duration
            </div>
            <div class="q-px-md search-component flex row q-gutter-sm">
              <div
                v-for="(duration, index) in durationOptions"
                :key="index"
                @click="clickDuration(duration)"
                class="tag t2"
                style="text-transform: capitalize"
                :class="{
                  'no-hover': $q.platform.is.ios,
                  selected:
                    controlDuration.findIndex((x) => x.val === duration.val) >
                    -1,
                }"
              >
                {{ duration.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomQScroll>
    <MenuWrapper
      v-if="$q.screen.lt.md"
      :showing="showingDateControl"
      @hide="showingDateControl = false"
    >
      <DateControl
        @hide="
          () => {
            showingDateControl = false;
            $nextTick(() => $emit('hide'));
          }
        "
      />
    </MenuWrapper>
  </div>
</template>

<script>
import { mapState, mapActions, mapWritableState } from 'pinia';
import { useMainStore } from 'src/stores/main';
import { useSearchStore } from 'src/stores/search';
import { useQueryStore } from 'src/stores/query';
import DateControl from '../Controls/DateControl.vue';
import ControlSelect from 'src/components/Controls/ControlSelect.vue';
import CustomQScroll from '../CustomQScroll.vue';
import SearchView from '../SideBar/SearchView/SearchView.vue';
import TagExplorer from '../TagExplorer.vue';
import { default as dayjs } from 'dayjs';
import MenuWrapper from '../Controls/MenuWrapper.vue';

export default {
  components: {
    DateControl,
    ControlSelect,
    CustomQScroll,
    SearchView,
    TagExplorer,
    MenuWrapper,
  },
  props: ['placeholder', 'autofocus'],
  data() {
    return {
      showingDateControl: false,
      showSearch: false,
      inputFocused: false,
      previousSidebarPanel: '',
      previousShowPanel: '',
      sizeOptions: [
        {
          val: '0,1000',
          label: this.$t('top_controls.less_than_one_thousand'),
        },
        {
          val: '1000,5000',
          label: '1000 - 5000 ' + this.$t('top_controls.people'),
        },
        {
          val: '5000,20000',
          label: '5000 - 20,000 ' + this.$t('top_controls.people'),
        },
        {
          val: '20000,50000',
          label: '20,000 - 50,000 ' + this.$t('top_controls.people'),
        },
        {
          val: '50000,200000',
          label: this.$t('top_controls.more_than_fifty_thousand'),
        },
      ],
      durationOptions: [
        { val: 1, label: this.$t('top_controls.one_day') },
        { val: 2, label: this.$t('top_controls.two_days') },
        { val: 3, label: this.$t('top_controls.three_days') },
        { val: 4, label: this.$t('top_controls.four_days') },
        { val: 5, label: this.$t('top_controls.five_days_plus') },
      ],
    };
  },
  watch: {
    query(newv) {
      if (newv?.length > 0) {
      } else if (this.$q.screen.gt.xs) {
        this.hideResultsAndPreviousPanel();
      }
    },
  },
  mounted() {},
  methods: {
    ...mapActions(useQueryStore, ['clearDateFilter']),
    onScroll(info) {
      this.scrollPercentage = info.verticalPercentage;
      //  this.$refs.search.blur();
    },
    clickSize(size) {
      const index = this.controlSize.findIndex((x) => x.val === size.val);
      if (index === -1) {
        this.controlSize.push(size);
      } else {
        this.controlSize.splice(index, 1);
      }
    },
    clickDuration(duration) {
      const index = this.controlDuration.findIndex(
        (x) => x.val === duration.val,
      );
      if (index === -1) {
        this.controlDuration.push(duration);
      } else {
        this.controlDuration.splice(index, 1);
      }
    },
    clickAway() {
      if (this.$q.platform.is.mobile && this.inputFocused) {
        // hide keyboard if input is focused first

        this.$refs.search.blur();
      } else {
        this.$emit('hide');
      }
    },
    swipeDown(event) {
      if (this.scrollPercentage <= 0) {
        this.clickAway();
      } else {
        event.stopPropagation();
      }
    },
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
    },
    onSearchbarFocus() {
      this.inputFocused = true;
    },
    onSearchbarBlur() {
      this.inputFocused = false;
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
    ...mapWritableState(useQueryStore, [
      'controlSize',
      'controlTag',
      'controlDuration',
      'controlDateRange',
      'controlDateRangeSelectedOption',
      'tagOptions',
      'tagOptionsHasNext',
      'eventDatesGroupedByMonth',
      'eventDates',
      'eventDatesLoading',
    ]),
    computedStartLabel() {
      if (
        !this.controlDateRangeSelectedOption?.value ||
        dayjs(this.controlDateRange.start).isSame(dayjs(), 'day')
      ) {
        return this.$t('top_controls.today');
      }
      return dayjs(this.controlDateRange.start).format('L');
    },
    computedEndLabel() {
      if (!this.controlDateRange.end) {
        return this.$t('top_controls.all_d');
      }
      return dayjs(this.controlDateRange.end).format('L');
    },
  },
};
</script>

<style lang="scss" scoped>
.body--light {
  .search-dialog {
    .search-column {
      .search-header {
      }
      .search-component {
        .date-control {
          background: white;
          color: $t-1;
          :deep(.date-picker-container) {
            background: rgba(255, 255, 255, 0.5);
          }
        }
      }
      :deep(.tag) {
        background: rgba(150, 150, 150, 0.68);
        color: white !important;
        &.selected {
          background: white;
          color: black !important;
        }

        border: 1px solid rgba(255, 255, 255, 0.05);
        &:not(.no-hover) {
          &:hover {
            opacity: 1;
            background: rgba(170, 170, 170, 1);
          }
        }
      }
    }
  }
}
.body--dark {
  .search-dialog {
    .search-column {
      .search-header {
      }
      .search-component {
        .date-control {
          background: rgba(100, 100, 100, 0.8);
          color: white;

          :deep(.date-picker-container) {
            background: rgba(50, 50, 50, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-top-right-radius: 9px;
            border-bottom-right-radius: 9px;
          }
        }
      }
      :deep(.tag) {
        background: rgba(80, 80, 80, 1);

        &.selected {
          background: white;
          color: $t-1;
        }
        opacity: 1;
        transition: all 0.3s ease;

        color: white;
        border: 1px solid rgba(255, 255, 255, 0.05);
        &:not(.no-hover) {
          &:hover {
            opacity: 1;
            background: rgba(150, 150, 150, 1);
          }
        }
      }
    }
  }
}

.search-dialog {
  height: 100vh;
  width: 100vw;
  max-width: unset;
  max-height: unset;
  overflow: hidden;
  overflow-y: auto;
  .search-column {
    width: 668px;
    pointer-events: none;
    overflow: visible;
    .date-control {
      border-radius: 9px;
      :deep(.date-picker-container) {
        border-top-right-radius: 9px;
        border-bottom-right-radius: 9px;
      }
    }
    .search-header {
      color: white;
    }

    .search-results {
      color: white;
      :deep(.q-icon) {
        color: white;
      }
    }
    .searchbar-input {
      pointer-events: all;
      //background: white;
    }
    :deep(.q-input) {
      font-size: 1rem;

      .q-field__marginal {
        height: 100%;
        color: black;
      }
      .q-field__inner {
        border: none !important;
        .q-field__control {
          height: 100%;
          border: none !important;

          border-radius: 60px !important;
          box-shadow:
            0 1px 1px rgba(0, 0, 0, 0.14),
            0 2px 1px -1px rgba(0, 0, 0, 0.12);
        }
      }
    }
    .searchbar-input {
      :deep(.q-field__inner) {
        color: black;

        .q-field__native {
          color: black;
        }
        .q-placeholder::placeholder {
          //   font-family: 'Metropolis';
          color: black;
          opacity: 0.9;
        }
      }
    }

    :deep(.tag) {
      pointer-events: all;
      opacity: 1;
      transition: all 0.3s ease;
      white-space: nowrap;
      cursor: pointer;
      border-radius: 18px;
      padding: 6px 12px;
      border-radius: 18px;
    }
  }
}

@media only screen and (max-width: 599px) {
  .search-dialog {
    width: 100%;
    .search-column {
      padding-bottom: 50vh;

      width: 100%;
      :deep(.q-input) {
        width: 100%;
        font-size: unset;
      }

      .q-input {
      }
    }
  }
}
</style>
