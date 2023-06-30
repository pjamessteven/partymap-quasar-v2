<template>
  <div class="search-component">
    <div class="search-dummy-wrapper" @click="() => (showSearch = true)">
      <div
        class="search-dummy-outer flex justify-between items-center q-pl-md q-pr-sm"
      >
        <div class="inter bold">
          Anywhere<span class="separator">|</span>Any dates<span
            class="separator"
            >|</span
          >Any artists<span class="separator">|</span>Any type
        </div>
        <div class="search-button q-ml-md flex items-center justify-center">
          <q-icon name="mdi-magnify" size="large"></q-icon>
        </div>
      </div>
    </div>
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div class="search-wrapper" v-if="showSearch">
        <ControlsComponent />
      </div>
    </transition>
  </div>
</template>

<script>
import ControlsComponent from 'src/components/Controls/ControlsComponent.vue';

export default {
  components: {
    ControlsComponent,
  },
  props: {},
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
.body--light {
  .search-dummy-outer {
    background: white;
    color: $t-1;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
}
.body--dark {
  .search-dummy-outer {
    color: $ti-1;
    background: $bi-2;

    //background: rgba(0, 0, 0, 0.5);
    //border: 1px solid rgba(255, 255, 255, 0.2);
  }
}
.search-dummy-wrapper {
  pointer-events: all;
  position: absolute;
  top: 16px;
  left: calc(50% - 200px);
  height: 100%;
  padding: 8px;
  &:hover {
    .search-dummy-outer {
      background: rgba(255, 255, 255, 0.1);
    }
  }
  .search-dummy-outer {
    transition: all 0.3s;
    cursor: pointer;
    width: 100%;
    height: 100%;
    border-radius: 48px;
    backdrop-filter: blur(10px);
    .search-button {
      padding: 4px 4px;
      border-radius: 100%;
      background: lightgrey;
      color: black;
    }
    .separator {
      margin: 0px 8px;
      color: grey;
    }
  }
}
@media only screen and (max-width: 600px) {
  .search-dummy-wrapper {
    top: 54px;
  }
}
</style>
