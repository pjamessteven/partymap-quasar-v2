<template>
  <div
    class="custom-scroll"
    ref="scroll"
    :class="{ 'disable-scroll': disableScroll }"
    @scroll="handleScroll"
  >
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: ['disableScroll'],
  data() {
    return { 
      isScrolling: null,
      scrollElement: null
    };
  },
  methods: {
    setScrollPosition(offset, duration) {
      this.scrollElement.scrollTo({
        top: offset,
        behavior: duration ? 'smooth' : 'auto'
      });
    },
    setScrollPercentage(percentage, duration) {
      const maxScroll = this.scrollElement.scrollHeight - this.scrollElement.clientHeight;
      const offset = maxScroll * (percentage / 100);
      this.setScrollPosition(offset, duration);
    },
    onScrollEnd() {
      this.$emit('scrollend');
    },
    handleScroll() {
      if (this.isScrolling) window.clearTimeout(this.isScrolling);
      this.isScrolling = setTimeout(() => {
        this.onScrollEnd();
      }, 100);
    }
  },
  mounted() {
    this.scrollElement = this.$refs.scroll;
    if (this.$q.platform.is.ios || this.$q.platform.is.safari) {
      this.scrollElement.addEventListener('scroll', this.handleScroll);
    } else {
      this.scrollElement.addEventListener('scrollend', this.onScrollEnd);
    }
  },
  beforeUnmount() {
    if (this.$q.platform.is.ios || this.$q.platform.is.safari) {
      this.scrollElement.removeEventListener('scroll', this.handleScroll);
    } else {
      this.scrollElement.removeEventListener('scrollend', this.onScrollEnd);
    }
  }
};
</script>

<style lang="scss" scoped>
.custom-scroll {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  
  &.disable-scroll {
    overflow: hidden !important;
    pointer-events: none;
  }
}

@media only screen and (max-width: 599px) {
  .custom-scroll {
    scrollbar-width: none; /* Firefox */
    &::-webkit-scrollbar {
      display: none; /* Safari and Chrome */
    }
  }
}
</style>
