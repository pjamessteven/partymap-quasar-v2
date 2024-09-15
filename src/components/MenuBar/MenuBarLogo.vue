<template>
  <router-link
    :to="{ name: 'Explore' }"
    @click="() => (sidebarPanel = 'nearby')"
    style="color: unset; text-decoration: none"
  >
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div class="logo q-pa-md row no-wrap items-center">
        <img src="~assets/partymap-logo-light-sm.png" class="logo-image" />
      </div>
    </transition>
  </router-link>
</template>

<script>
import { useMainStore } from 'src/stores/main';
import { mapWritableState } from 'pinia';

export default {
  name: 'MenuBarLogo',
  props: {},
  components: {},
  watch: {},
  data() {
    return {};
  },
  methods: {},
  computed: {
    ...mapWritableState(useMainStore, ['showSearchBox', 'sidebarPanel']),
  },
};
</script>

<style lang="scss" scoped>
.logo {
  cursor: pointer;
  font-family: chicagoflf;

  .logo-image {
    display: flex;
    width: auto;
    height: 30px;
  }
}
</style>
