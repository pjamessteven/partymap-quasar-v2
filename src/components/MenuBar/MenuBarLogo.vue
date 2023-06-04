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
          v-if="color === 'white'"
          class="logo-image"
        />
        <img src="~assets/marker-light.png" class="logo-image" v-else />
        <div>
          <i
            class="q-ml-sm text-large logo-text"
            :class="{
              'text-white': color === 'white',
            }"
            >partymap&nbsp;</i
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
  props: {
    color: {
      type: String,
    },
  },
  components: {},
  watch: {},
  data() {
    return {};
  },
  methods: {},
  computed: {
    ...mapState(useMainStore, ['showSearchBox', 'sidebarPanel']),
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
