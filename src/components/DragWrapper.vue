<template>
  <div class="drag-wrapper" ref="dragWrapper">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, toRefs } from 'vue';

import { useDrag } from '@vueuse/gesture';

import {
  useMotionControls,
  useMotionProperties,
  useMotionTransitions,
} from '@vueuse/motion';

const props = withDefaults(
  defineProps<{
    enableDrag?: boolean;
    hiddenYPosition?: number;
    showingYPosition?: number;
  }>(),
  {
    enableDrag: true,
    hiddenYPosition: () => window.innerHeight,
    showingYPosition: 0,
  },
);
const { enableDrag, hiddenYPosition, showingYPosition } = toRefs(props);

// Emits
const emit = defineEmits(['hide', 'onDrag']);

// Refs
const dragWrapper = ref();
const motionProperties = ref();
const motionControls = ref();
const motionTransitions = ref();

watch(
  () => showingYPosition.value,
  (newValue, oldValue) => {
    show();
  },
);

function hideAndEmit() {
  hide();
  setTimeout(() => {
    emit('hide');
  }, 200);
}

function hide() {
  motionTransitions.value.push(
    'y',
    hiddenYPosition.value,
    motionProperties.value,
    {
      type: 'spring',
      stiffness: 600,
      damping: 50,
      mass: 1.8,
    },
  );
}
function show() {
  // bounce back to top
  motionTransitions.value.push(
    'y',
    showingYPosition.value,
    motionProperties.value,
    {
      type: 'spring',
      stiffness: 600,
      damping: 50,
      mass: 1.8,
    },
  );
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
  if (enableDrag.value) {
    console.log(1);
    if (swipeY == 1) {
      hideAndEmit();
      return;
    }

    if (!dragging) {
      console.log(2);

      if (y > 100) {
        hideAndEmit();
      } else {
        // bounce back to top
        show();
      }
      return;
    }
    // only allow dragging down
    if (y > 0) {
      console.log(3);

      emit('onDrag');
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

defineExpose({
  hide,
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
