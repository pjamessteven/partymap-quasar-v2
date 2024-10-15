<template>
  <div
    class="desktop-search-component q-mt-md flex row items-center no-wrap"
    :class="{
      'transport-map': mapStyle === 'transport',
      'overlaying-map': overlayingMap,
      'center-absolute': $route.name !== 'Explore' && $q.screen.gt.xs,
    }"
  >
    <div
      class="controls-wrapper search-wrapper flex no-wrap q-mr-sm"
      :class="{
        'mobile-search-wrapper': $q.screen.lt.lg && sidebarPanel === 'search',
      }"
    >
      <div class="controls-wrapper-inner">
        <SearchComponent />
      </div>
    </div>
  </div>
</template>

<script>
import SearchComponent from './SearchComponent.vue';
export default {
  components: {
    SearchComponent,
  },
  props: ['overlayingMap'],
  data() {
    return {};
  },
  watch: {},
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
        border: 1px solid rgba(0, 0, 0, 0.1);

        :deep(.searchbar-wrapper) {
          .searchbar-input {
            .q-field__inner {
              .q-placeholder::placeholder {
                opacity: 1;
              }
              input {
                color: black !important;
              }
              .q-field__marginal {
                font-size: unset !important;
              }
            }
          }
        }
      }
    }
    &.overlaying-map {
      .controls-wrapper {
        backdrop-filter: blur(40px);
        //   box-shadow: 0px 0px 26px -6px rgba(0, 0, 0, 0.2);

        .controls-wrapper-inner {
          //background: rgba(255, 255, 255, 0.3);
          background: linear-gradient(
            rgba(100, 100, 100, 0.68),
            rgba(100, 100, 100, 0.68)
          );
          color: $ti-1;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          border-right: 1px solid rgba(255, 255, 255, 0.1);

          :deep(.searchbar-wrapper) {
            .searchbar-input {
              .q-field__inner {
                .q-placeholder::placeholder {
                  opacity: 1;
                }
                input {
                  color: white !important;
                }
                .q-field__marginal {
                  font-size: unset;
                  color: white !important;
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
            border: 1px solid rgba(0, 0, 0, 0.2);
            background: white;
            color: $t-1;

            :deep(.searchbar-wrapper) {
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
      }
    }
  }
}
.body--dark {
  .desktop-search-component {
    .separator {
      color: $ti-4;
    }
    .controls-wrapper {
      .controls-wrapper-inner {
        color: $ti-2;
        background: $bi-3;

        //background: rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);

        :deep(.button-control) {
          .q-btn__content {
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
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          border-right: 1px solid rgba(255, 255, 255, 0.1);

          background: linear-gradient(
            rgba(80, 80, 80, 0.6),
            rgba(80, 80, 80, 0.6)
          );
          color: $ti-1;
          //border: 1px solid rgba(255, 255, 255, 0.15);
        }
      }
    }
  }
}

.desktop-search-component {
  z-index: 104;
  position: absolute;
  top: 8px;
  padding-left: 532px;
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

  .controls-wrapper {
    //z-index: 105;
    justify-content: center;
    position: relative;
    border-radius: 48px;
    overflow: hidden;

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

      :deep(.searchbar-wrapper) {
        padding-left: 18px;
        padding-right: 18px;
        margin-top: 2px;

        .searchbar-input {
          margin-top: -4px;
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
            }
          }
        }
      }

      :deep(.q-btn::before) {
        box-shadow: none !important;
      }
      :deep(.button-control) {
        height: 42px;
        .button-label {
          white-space: nowrap;
          font-weight: 500;
        }
        .q-btn__content {
          padding-left: 8px;
          padding-right: 8px;
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
}

.animated.slowest {
  animation-duration: calc(var(--animate-duration) * 10);
}
</style>
