<template>
  <div class="solid-page">
    <InnerLoading v-if="loading" :solid="true" />

    <div class="flex column grow no-wrap">
      <CustomQScroll
        vertical
        @scroll="onScrollMainContent"
        ref="scroll"
        :thumb-style="{
          borderRadius: '0px',
          right: $q.screen.gt.xs ? '0px' : '-16px',
          width: $q.screen.gt.xs ? '10px' : '4px',
        }"
        class="solid-page-scroll-area flex grow"
        stye="width: 100%;"
      >
        <div class="flex column no-wrap items-center" style="width: 100%">
          <div
            v-if="$slots.title"
            class="solid-page-title flex justify-center inter bolder"
            style="width: 100%"
            :class="
              $q.screen.gt.xs
                ? 'q-pt-xl q-pb-sm text-h4'
                : 'q-pt-md q-pb-md text-h5'
            "
          >
            <div
              class="solid-page-content-width"
              :class="$q.screen.gt.sm ? 'q-px-lg' : ''"
            >
              <slot name="title" class=""></slot>
            </div>
          </div>
          <div
            class="q-pb-xl solid-page-content solid-page-content-width"
            :class="$q.screen.gt.sm ? 'q-px-lg' : ''"
          >
            <transition
              appear
              enter-active-class="animated fadeIn slow"
              leave-active-class="animated fadeOut"
            >
              <slot
                :scrollPercentage="scrollPercentage"
                :resetScrollPosition="resetScrollPosition"
              ></slot>
            </transition>
          </div>
        </div>
        <div v-if="hasFooter" class="flex justify-center solid-page-footer">
          <div
            class="solid-page-content-width"
            :class="$q.screen.gt.xs ? 'q-px-lg' : ''"
          >
            <slot name="footer"></slot>
          </div>
        </div>
      </CustomQScroll>
    </div>
  </div>
</template>

<script>
import InnerLoading from 'src/components/InnerLoading.vue';
import CustomQScroll from 'components/CustomQScroll.vue';

export default {
  name: 'SolidPage',
  components: { InnerLoading, CustomQScroll },
  props: ['title', 'loading'],
  data() {
    return { scrollPosition: 0, scrollPercentage: 0 };
  },
  methods: {
    setScrollPercentage(axis, percentage) {
      this.$refs.scroll.setScrollPercentage(axis, percentage);
    },
    onScrollMainContent(info) {
      this.scrollPosition = info.verticalPosition;
      this.scrollPercentage = info.verticalPercentage;
      // trigger field validation errors once we scroll to the bottom of the page
      this.$emit('scrollPercentage', info.verticalPercentage);
    },
    resetScrollPosition() {
      this.setScrollPercentage('vertical', 0);
    },
  },
  computed: {
    hasFooter() {
      return !!this.$slots.footer;
    },
  },
};
</script>

<style lang="scss">
.body--light {
  .solid-page {
    background: white;
    // border-top: 1px solid rgba(0, 0, 0, 0.1);

    .solid-page-footer {
      background: $b-2;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }
  }
}
.body--dark {
  .solid-page {
    background: black;

    .solid-page-footer {
      background: $bi-3;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
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
  padding-top: 78px;
  display: flex;
  justify-content: center;

  .solid-page-scroll-area > .q-scrollarea__container > .q-scrollarea__content {
    width: 100%;
  }

  //overflow: hidden;
  .solid-page-content {
    overflow: visible;
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .solid-page-content-width {
    width: 1024px;
    //max-width: 11024px;
    //min-width: 50vw;
  }
  .solid-page-footer {
    width: 100%;
  }
}
// lg
@media only screen and (max-width: 1440px) {
  .solid-page {
    .solid-page-content-width {
      max-width: 1023px;
    }
  }
}
// md
@media only screen and (max-width: 1023px) {
  .solid-page {
    padding-top: 56px;

    .solid-page-content-width {
      //padding: 0px 32px;
      //max-width: 800px;
    }
  }
  // sm
  @media only screen and (max-width: 599px) {
    .solid-page {
      //: 16px !important;
      overflow: hidden;
      width: 100%;
      max-width: 100%;
      .solid-page-content {
      }
      .solid-page-content-width {
        max-width: 100%;
      }
    }
  }
}
</style>
