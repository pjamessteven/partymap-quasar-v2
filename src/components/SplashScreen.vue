<template>
  <div class="splash-screen flex justify-center items-center">
    <q-linear-progress
      class="progress"
      indeterminate
      size="2px"
      :color="$q.dark.isActive ? 'grey-6' : 'grey-8'"
      rounded
      :style="$q.screen.gt.xs ? 'max-width: 200px' : 'max-width: 120px'"
    />
    <div class="splash-inner">
      <div
        class="logo q-pa-md"
        :class="{
          iphone: $q.platform.is.iphone || $q.platform.is.ipod,
          ipad: $q.platform.is.ipad && $q.platform.is.capacitor,
        }"
      >
        <transition appear enter-active-class="animated fadeIn slow">
          <img
            style="height: 30px; width: auto"
            src="~assets/partymap-logo-light-sm.png"
            v-if="$q.dark.isActive"
            class="logo-image"
          />
        </transition>
        <transition appear enter-active-class="animated fadeIn slow">
          <img
            style="height: 30px; width: auto"
            src="~assets/partymap-logo-dark-sm.png"
            class="logo-image"
            v-if="!$q.dark.isActive"
          />
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
<style lang="scss" scoped>
.body--light {
  .splash-screen {
    background: white;
  }
}
.body--dark {
  .splash-screen {
    background: black;
  }
}
.splash-screen {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 4000;
  top: 0px;
  left: 0px;

  .splash-inner {
    position: absolute;
    height: 100%;
    width: 100%;

    .logo {
      position: absolute;
      top: 5px;
      left: 8px;
      z-index: 1;
    }
  }
}

.native-mobile {
  .splash-screen {
    .splash-inner {
      .logo {
        // android
        @supports ((top: var(--safe-area-inset-top))) {
          top: calc(var(--safe-area-inset-top));
        }

        &.ipad {
          top: 0px !important;
        }

        &.iphone {
          @supports (
            (top: var(--safe-area-inset-top)) and (font: -apple-system-body) and
              (-webkit-appearance: none)
          ) {
            @media screen and (max-width: 375px) {
              //  iphone 7
              top: var(--safe-area-inset-top);
            }
            @media screen and (min-width: 376px) {
              top: calc(var(--safe-area-inset-top) - 8px);
            }
          }
        }
      }
    }
  }
}

@media only screen and (max-width: 1023px) {
  .splash-screen {
    .splash-inner {
      .logo {
        position: absolute;
        top: 0px;
        left: 0px;
        z-index: 1;

        @supports ((top: var(--safe-area-inset-top))) {
          top: calc(var(--safe-area-inset-top) + 0px);
        }
      }
    }
  }
}
</style>
