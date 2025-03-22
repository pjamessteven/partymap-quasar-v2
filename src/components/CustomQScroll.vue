<template>
  <div
    class="custom-scroll"
    ref="scroll"
    :class="{ 'disable-scroll': disableScroll, vertical, horizontal }"
    @scroll="handleScroll($event)"
  >
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    disableScroll: Boolean,
    vertical: {
      type: Boolean,
      default: true,
    },
    horizontal: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isScrolling: null,
      scrollElement: null,
    };
  },
  methods: {
    setScrollPosition(offset, duration) {
      this.scrollElement.scrollTo({
        top: offset,
        behavior: duration ? 'smooth' : 'auto',
      });
    },
    setScrollPercentage(percentage, duration) {
      const maxScroll =
        this.scrollElement.scrollHeight - this.scrollElement.clientHeight;
      const offset = maxScroll * (percentage / 100);
      this.setScrollPosition(offset, duration);
    },
    onScrollEnd() {
      this.$emit('scrollend');
    },
    handleScroll(event) {
      const scrollElement = event.target;
      const verticalPosition = scrollElement.scrollTop;
      const verticalPercentage =
        (verticalPosition /
          (scrollElement.scrollHeight - scrollElement.clientHeight)) *
        100;
      const horizontalPosition = this.horizontal ? scrollElement.scrollLeft : 0;
      const horizontalPercentage = this.horizontal
        ? (horizontalPosition /
            (scrollElement.scrollWidth - scrollElement.clientWidth)) *
          100
        : 0;

      this.$emit('onScroll', {
        verticalPosition,
        verticalPercentage,
        horizontalPosition,
        horizontalPercentage,
      });

      if (this.isScrolling) window.clearTimeout(this.isScrolling);
      this.isScrolling = setTimeout(() => {
        this.onScrollEnd();
      }, 100);
    },
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
  },
};
</script>

<style lang="scss" scoped>
.body--light {
}

.body--dark {
}
.custom-scroll {
  width: 100%;
  height: 100%;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;

  &.disable-scroll {
    overflow: hidden !important;
    pointer-events: none;
  }

  &.vertical {
    overflow-y: auto;
    overflow-x: hidden;
  }

  &.horizontal {
    overflow-y: hidden;
    overflow-x: auto;
  }

  /* Scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
    transition: background 0.2s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
}

.body--light {
  .custom-scroll {
    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
    }

    &::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }
}

.body--dark {
  .custom-scroll {
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
    }

    &::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }
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
