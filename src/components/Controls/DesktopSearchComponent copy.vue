<template>
  <div
    class="desktop-search-component q-mt-md flex row items-center no-wrap"
    :class="{
      'transport-map': mapStyle !== 'satellite',
      'overlaying-map': overlayingMap,
      'center-absolute': $route.name !== 'Explore' && $q.screen.gt.xs,
    }"
  >
    <div class="controls-wrapper flex no-wrap q-mr-sm">
      <div class="controls-wrapper-inner">
        <SearchComponent />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapWritableState } from 'pinia';
import { useMainStore } from 'src/stores/main';
import { useMapStore } from 'src/stores/map';
import { useSearchStore } from 'src/stores/search';

import SearchComponent from 'src/components/Search/SearchComponent.vue';
export default {
  components: { SearchComponent },
  props: ['overlayingMap'],
  data() {
    return {};
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
  position: absolute;
  top: 8px;
  padding-left: min(50vw, 568px);
  width: 100%;
  display: flex;
  pointer-events: none;
  //max-width: 33vw;
  justify-content: center;
  //overflow-x: auto;
  //overflow-y: visible;
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

    .control-scroll-area {
      pointer-events: all;

      .scroll-inner {
        .scroll-inner-inner {
          width: 100%;
          .mobile-search-wrapper {
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
