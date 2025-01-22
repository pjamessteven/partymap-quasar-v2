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
      <div class="controls-wrapper-inner" style="width: 100%">
        <!--
        <SearchComponent />
        -->

        <q-btn
          style="width: 100%"
          :ripple="false"
          no-caps
          @click="showDialog = true"
          class="button-control search-button flex items-center grow"
        >
          <div
            class="flex items-center no-wrap grow justify-between text-large metropolis"
            style="opacity: 0.9"
          >
            <div class="flex items-center">
              <div
                class="q-mr-xs q-ml- flex items-center"
                style="transform: scale(-1, 1)"
              >
                <q-icon size="22px" name="las la-search" />
              </div>
              <div class="metropolis q-ml-sm">
                {{ $t('search.search_and_filter') }}
              </div>
            </div>
            <div class="flex items-center">
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
import { mapState, mapWritableState } from 'pinia';
import { useMainStore } from 'src/stores/main';
import { useMapStore } from 'src/stores/map';
import { useSearchStore } from 'src/stores/search';
import { useQueryStore } from 'src/stores/query';
import DateControl from 'src/components/Controls/DateControl.vue';

import SearchComponent from 'src/components/Search/SearchComponent.vue';
import BackdropBlurDialog from '../BackdropBlurDialog.vue';
import SearchDialog from '../Search/SearchDialog.vue';
export default {
  components: {
    SearchComponent,
    DateControl,
    BackdropBlurDialog,
    SearchDialog,
  },
  props: ['overlayingMap', 'fullWidth'],
  data() {
    return { showingDateControl: false, showDialog: false };
  },
  watch: {},
  methods: {
    goToExplore() {
      this.sidebarPanel = 'explore';
      if (this.$route.name !== 'Explore') {
        this.$router.push({ name: 'Explore', query: { view: 'explore' } });
      }
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
      width: 100%;
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
