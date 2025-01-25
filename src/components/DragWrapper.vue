<template>
  <div class="drag-wrapper" ref="dragWrapper">
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

import { useDrag } from '@vueuse/gesture';

import {
  useMotionControls,
  useMotionProperties,
  useMotionTransitions,
} from '@vueuse/motion';

// Props
const { enableDrag, hiddenYPosition } = defineProps({
  enableDrag: Boolean,
  hiddenYPosition: Number,
});

// Emits
const emit = defineEmits(['hide']);

// Refs
const dragWrapper = ref();
const motionProperties = ref();
const motionControls = ref();
const motionTransitions = ref();

function hide() {
  motionTransitions.value.push('y', hiddenYPosition, motionProperties.value, {
    type: 'spring',
    stiffness: 600,
    damping: 50,
    mass: 1.8,
  });
  setTimeout(() => {
    emit('hide');
  }, 200);
}

const dragHandler = ({
  movement: [x, y],
  dragging,
  swipe: [swipeX, swipeY],
  offset,
  delta,
  initial,
  active,
}) => {
  if (enableDrag) {
    if (swipeY == 1) {
      hide();
      return;
    }

    if (!dragging) {
      if (y > 100) {
        hide();
      } else {
        // bounce back to top
        motionTransitions.value.push('y', 0, motionProperties.value, {
          type: 'spring',
          stiffness: 600,
          damping: 50,
          mass: 1.8,
        });
      }
      return;
    }
    // only allow dragging down
    if (y > 0) {
      // update motion position but don't animate
      motionTransitions.value.push('y', y, motionProperties.value, {
        type: 'keyframes',
        duration: 0,
      });
    }
  }
};

useDrag(dragHandler, {
  domTarget: dragWrapper,
  axis: 'y',
});

const setupSpring = () => {
  // start hidden
  const { motionProperties: mp } = useMotionProperties(dragWrapper, {
    y: window.innerHeight,
  });
  motionProperties.value = mp;
  motionControls.value = useMotionControls(motionProperties.value);
  motionTransitions.value = useMotionTransitions();
  // spring up
  motionTransitions.value.push('y', 0, motionProperties.value, {
    type: 'spring',
    stiffness: 600,
    damping: 50,
    mass: 1.8,
  });
};

onMounted(() => {
  setupSpring();
});
</script>

<style lang="scss" scoped>
.body--light {
}
.body--dark {
}

@media only screen and (max-width: 599px) {
}
</style>
