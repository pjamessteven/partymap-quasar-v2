<template>
  <div class="solid-page">
    <InnerLoading v-if="loading" :solid="true" />

    <div class="solid-page-inner flex column no-wrap">
      <div
        class="inter bolder"
        :class="
          $q.screen.gt.xs
            ? 'q-pt-xl q-pb-sm text-h4'
            : 'q-px-md q-pt-md q-pb-sm text-h6'
        "
      >
        <slot name="title"></slot>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script>
import InnerLoading from 'src/components/InnerLoading.vue';

export default {
  name: 'SolidPage',
  components: { InnerLoading },
  props: ['title', 'loading'],
  data() {
    return {};
  },
  methods: {},
};
</script>

<style lang="scss">
.body--light {
  .solid-page {
    background: white;
  }
}
.body--dark {
  .solid-page {
    background: $bi-1;
  }
}
.solid-page {
  height: 100%;
  overflow: auto;
  position: relative;
  z-index: 4000;
  overflow: auto;
  width: 100%;
  height: 100%;
  padding-top: 60px;
  display: flex;
  justify-content: center;
  //overflow: hidden;
  .solid-page-inner {
    overflow: visible;
    height: 100%;
    max-width: 960px;
    min-width: 50vw;
  }
}
// lg
@media only screen and (max-width: 1440px) {
  .solid-page {
    .solid-page-inner {
      max-width: 1024px;
    }
  }
}
// md
@media only screen and (max-width: 1024px) {
  .solid-page {
    .solid-page-inner {
      max-width: 600px;
    }
  }
}
// sm
@media only screen and (max-width: 600px) {
  .solid-page {
    //padding-top: 16px !important;
    overflow: hidden;
    width: 100%;
    max-width: 100%;
    .solid-page-inner {
      overflow-y: auto;
      position: relative;
      width: 100%;
      max-width: 100%;
    }
  }
}
</style>
