<template>
  <DragWrapper
    :hiddenYPosition="hiddenYPosition"
    :enableDrag="scrollPercentage <= 0"
    class="search-dialog flex column no-wrap"
    @click="clickAway"
    @hide="$emit('hide')"
    @onDrag="search.blur()"
  >
    <CustomQScroll
      vertical
      @scroll="onScroll"
      ref="scrollArea"
      style="height: 100%; width: 100%"
      :thumb-style="
        Screen.gt.xs
          ? {
              bottom: '0px',
              height: '8px',
              marginLeft: '16px',
              borderRadius: '0px',
            }
          : {
              bottom: '0px',
              height: '0px',
              borderRadius: '0px',
              width: '4px',
            }
      "
    >
      <div class="flex row justify-center grow">
        <div
          class="flex column search-column no-wrap"
          :class="{
            'q-py-xl ': Screen.gt.sm,
            ' q-py-lg ': Screen.lt.md,
          }"
        >
          <div class="q-px-md" :class="{ 'q-mb-sm': Screen.gt.sm }">
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
              :style="Screen.gt.sm ? 'height: 48px' : 'height: 40px'"
              @focus="onSearchbarFocus()"
              @blur="onSearchbarBlur()"
              @clear="clearSearch()"
              class="searchbar-input inter bold"
              v-model="query"
              @keyup.enter="() => $refs.search.blur()"
              :placeholder="
                placeholder && false
                  ? placeholder
                  : Screen.gt.xs
                    ? t('search.search_box_text')
                    : t('search.search_box_text_mobile')
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
            @closeDialog="emit('hide')"
          />

          <div class="flex column" v-else>
            <div
              class="q-px-md search-header metropolis text-h5 bolder q-mt-lg q-mb-md"
            >
              {{ t('event.dates') }}
            </div>
            <div class="q-px-md search-component q-mb-sm" v-if="Screen.gt.sm">
              <DateControl
                class="date-control"
                @click.stop
                style="pointer-events: all"
                @hide="emit('hide')"
              />
            </div>
            <div
              v-else
              style="pointer-events: all"
              class="q-px-md search-component flex row no-wrap q-gutter-m q-mb-sm"
            >
              <q-card
                class="tag q-pa-xs grow flex row items-center no-wrap justify-between"
                :class="{
                  'no-hover': Platform.is.ios,
                  selected: controlDateRangeSelectedOption?.value,
                }"
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
                  @click.stop="queryStore.clearDateFilter"
                  style="font-size: 22px"
                  name="mdi-close-circle q-mr-xs"
                  v-if="controlDateRangeSelectedOption?.value"
                />
              </q-card>
            </div>

            <div
              v-if="
                Screen.lt.sm &&
                $route.name === 'Explore' &&
                queryStore.topTagsInArea.length
              "
              class="q-px-md search-header metropolis text-h5 bolder q-mt-lg q-mb-md"
            >
              {{ t('top_controls.top_tags_in_area') }}
            </div>
            <div
              v-if="
                Screen.lt.sm &&
                $route.name === 'Explore' &&
                queryStore.topTagsInArea.length
              "
              @click.stop
              class="flex column search-component q-px-md"
              style="width: 100%; position: relative"
            >
              <TagExplorer mode="explore" @tagSelected="emit('hide')" />
            </div>

            <div
              class="q-px-md search-header metropolis text-h5 bolder q-mt-lg q-mb-md"
            >
              {{ t('top_controls.top_tags_worldwide') }}
            </div>
            <div
              @click.stop
              class="flex column search-component q-px-md q-mb-sm"
              style="width: 100%; min-height: 139px; position: relative"
            >
              <TagExplorer mode="all" @tagSelected="emit('hide')" />
              <InnerLoading
                :solid="false"
                v-if="
                  queryStore.tagOptionsLoading &&
                  queryStore.tagOptions.length == 0
                "
              />
            </div>

            <div
              class="q-px-md search-header metropolis text-h5 bolder q-mt-lg q-mb-md"
            >
              {{ t('top_controls.size') }}
            </div>

            <div class="q-px-md search-component flex row q-gutter-sm q-mb-md">
              <div
                v-for="(size, index) in sizeOptions"
                :key="index"
                @click="clickSize(size)"
                class="tag t2"
                style="text-transform: capitalize"
                :class="{
                  'no-hover': Platform.is.ios,
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
              {{ t('top_controls.duration') }}
            </div>
            <div class="q-px-md search-component flex row q-gutter-sm">
              <div
                v-for="(duration, index) in durationOptions"
                :key="index"
                @click="clickDuration(duration)"
                class="tag t2"
                style="text-transform: capitalize"
                :class="{
                  'no-hover': Platform.is.ios,
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
      v-if="Screen.lt.md"
      :showing="showingDateControl"
      @hide="showingDateControl = false"
    >
      <DateControl @hide="handleDateControlHide" />
    </MenuWrapper>
  </DragWrapper>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useMainStore } from 'src/stores/main';
import { useSearchStore } from 'src/stores/search';
import { useQueryStore } from 'src/stores/query';
import DateControl from '../Controls/DateControl.vue';
import CustomQScroll from '../CustomQScroll.vue';
import SearchView from '../SideBar/SearchView/SearchView.vue';
import TagExplorer from '../TagExplorer.vue';
import dayjs from 'dayjs';
import MenuWrapper from '../Controls/MenuWrapper.vue';
import { useI18n } from 'vue-i18n';
import { Platform, Screen } from 'quasar';

import InnerLoading from '../InnerLoading.vue';
import DragWrapper from '../DragWrapper.vue';

// Props
const props = defineProps({
  placeholder: String,
  autofocus: Boolean,
});

// Emits
const emit = defineEmits(['hide']);

// Stores
const mainStore = useMainStore();
const searchStore = useSearchStore();
const queryStore = useQueryStore();

// Destructure store refs
const { sidebarPanel, showPanel } = storeToRefs(mainStore);

const { query } = storeToRefs(searchStore);

const {
  controlSize,
  controlDuration,
  controlDateRange,
  controlDateRangeSelectedOption,
} = storeToRefs(queryStore);

// Refs
const scrollPercentage = ref(0);
const showingDateControl = ref(false);
const showSearch = ref(false);
const inputFocused = ref(false);
const scrollArea = ref(null);
const search = ref(null);
const { t } = useI18n();
const hiddenYPosition = ref(window.innerHeight);
// Constants
const sizeOptions = [
  {
    val: '0,1000',
    label: t('top_controls.less_than_one_thousand'),
  },
  {
    val: '1000,5000',
    label: '1000 - 5000 ' + t('top_controls.people'),
  },
  {
    val: '5000,20000',
    label: '5000 - 20,000 ' + t('top_controls.people'),
  },
  {
    val: '20000,50000',
    label: '20,000 - 50,000 ' + t('top_controls.people'),
  },
  {
    val: '50000,200000',
    label: t('top_controls.more_than_fifty_thousand'),
  },
];

const durationOptions = [
  { val: 1, label: t('top_controls.one_day') },
  { val: 2, label: t('top_controls.two_days') },
  { val: 3, label: t('top_controls.three_days') },
  { val: 4, label: t('top_controls.four_days') },
  { val: 5, label: t('top_controls.five_days_plus') },
];

const computedStartLabel = computed(() => {
  if (
    !controlDateRangeSelectedOption.value?.value ||
    dayjs(controlDateRange.value.start).isSame(dayjs(), 'day')
  ) {
    return t('top_controls.today');
  }
  return dayjs(controlDateRange.value.start).format('L');
});

const computedEndLabel = computed(() => {
  if (!controlDateRange.value.end) {
    return t('top_controls.all_d');
  }
  return dayjs(controlDateRange.value.end).format('L');
});

// Watchers
watch(query, (newv) => {
  if (!newv?.length && Screen.gt.xs) {
    hideResultsAndPreviousPanel();
  }
});

onMounted(() => {
  // wait for animation before showing keyboard
  setTimeout(() => search.value.focus(), 500);
});

// Methods
function onScroll(info) {
  scrollPercentage.value = info.verticalPercentage;
}

function clickSize(size) {
  const index = controlSize.value.findIndex((x) => x.val === size.val);
  if (index === -1) {
    controlSize.value.push(size);
  } else {
    controlSize.value.splice(index, 1);
  }
}

function clickDuration(duration) {
  const index = controlDuration.value.findIndex((x) => x.val === duration.val);
  if (index === -1) {
    controlDuration.value.push(duration);
  } else {
    controlDuration.value.splice(index, 1);
  }
}

function clickAway() {
  if (Platform.is.mobile && inputFocused.value) {
    search.value.blur();
  } else {
    emit('hide');
  }
}

function hideResultsAndPreviousPanel() {
  if (sidebarPanel.value === 'search') {
    sidebarPanel.value = mainStore.previousSidebarPanel;
    if (sidebarPanel.value === 'explore') {
      showPanel.value = false;
    }
  }
}

function clearSearch() {
  query.value = null;
  search.value.focus();
}

function handleDateControlHide() {
  console.log('test1');
  showingDateControl.value = false;

  emit('hide');
}

function onSearchbarFocus() {
  inputFocused.value = true;
}

function onSearchbarBlur() {
  inputFocused.value = false;
}

// Export methods that might be needed externally
defineExpose({
  clearSearch,
});
</script>

<style lang="scss" scoped>
.body--light {
  .search-dialog {
    .search-column {
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
  position: relative;
  .swipe-overlay {
    position: absolute;
    height: 100%;
    width: 100%;
    z-index: 1;
  }
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
