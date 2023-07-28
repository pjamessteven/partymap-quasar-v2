<template>
  <div class="splash-screen flex justify-center items-center">
    <q-linear-progress
      class="q-mt-xl"
      indeterminate
      size="2px"
      :color="$q.dark.isActive ? 'grey-6' : 'grey-8'"
      rounded
      :style="$q.screen.gt.xs ? 'max-width: 200px' : 'max-width: 120px'"
    />
    <div class="logo q-pa-md">
      <img
        style="height: 30px; width: auto"
        src="~assets/partymap-logo-light-sm.png"
        v-if="$q.dark.isActive"
        class="logo-image"
      />
      <img
        style="height: 30px; width: auto"
        src="~assets/partymap-logo-dark-sm.png"
        class="logo-image"
        v-else
      />
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
  background: black;
}
.splash-screen {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 4000;
  top: 0px;
  left: 0px;
  .logo {
    position: absolute;
    top: 0px;
    left: 0px;
    z-index: 1;
  }
}
</style>
