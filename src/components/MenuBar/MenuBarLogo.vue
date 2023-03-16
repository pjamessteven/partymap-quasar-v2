<template>
  <router-link
    :to="{ name: 'Explore' }"
    style="color: unset; text-decoration: none"
  >
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div class="logo q-pa-md row no-wrap items-center" v-if="!hideLogo">
        <img
          src="~assets/marker-dark.png"
          v-if="logoColor === 'light'"
          class="logo-image"
        />
        <img src="~assets/marker-light.png" class="logo-image" v-else />
        <div>
          <i
            class="q-ml-sm text-large logo-text"
            :class="{
              'text-white': logoColor === 'light',
            }"
            >partymap &nbsp;</i
          >
        </div>
      </div>
    </transition>
  </router-link>
</template>

<script>
import { useMainStore } from 'src/stores/main';
import { mapState } from 'pinia';

export default {
  name: 'MenuBarLogo',
  components: {},
  watch: {},
  data() {
    return {};
  },
  methods: {},
  computed: {
    ...mapState(useMainStore, ['sidebarExpanded', 'showSearchBox']),

    hideLogo() {
      // hide logo when searchbar is expanded on small pane
      if (
        this.$route.name === 'Explore' &&
        !this.sidebarExpanded &&
        this.showSearchBox
      ) {
        return true;
      } else return false;
    },
    logoColor() {
      if (
        this.$q.dark.isActive ||
        (this.$route.name === 'EventPage' && this.$q.screen.lt.lg) ||
        (this.$route.name === 'Explore' && this.$q.screen.lt.sm) ||
        (this.$route.meta.mapOverlay &&
          this.$route.name !== 'Explore' &&
          this.$route.name !== 'EventPage' &&
          this.$q.screen.gt.xs)
      ) {
        return 'light';
      } else {
        return 'dark';
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.logo {
  cursor: pointer;
  font-family: chicagoflf;

  .logo-image {
    display: flex;
    height: 30px;
  }
}
</style>
