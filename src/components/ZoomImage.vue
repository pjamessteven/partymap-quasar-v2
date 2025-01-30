<template>
  <div
    class="zoom-container"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchEnd"
  >
    <img
      ref="imageRef"
      :src="src"
      :style="imageStyle"
      class="zoom-image"
      @mousedown="handleMouseDown"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Props
const props = defineProps({
  src: String,
});

const imageRef = ref(null);
const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const lastTouchDistance = ref(null);
const initialTouchPosition = ref({ x: 0, y: 0 });

// Image transform style
const imageStyle = computed(() => ({
  transform: `translate3d(${translateX.value}px, ${translateY.value}px, 0) scale(${scale.value})`,
  transition: 'transform 0.3s ease-out', // Optional smooth transition
}));

// Touch handlers
const handleTouchStart = (e) => {
  if (e.touches.length === 2) {
    // Store initial pinch distance
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    lastTouchDistance.value = getDistance(touch1, touch2);
  } else if (e.touches.length === 1) {
    // Store initial touch position for panning
    initialTouchPosition.value = {
      x: e.touches[0].clientX - translateX.value,
      y: e.touches[0].clientY - translateY.value,
    };
  }
};

const handleTouchMove = (e) => {
  e.preventDefault();

  if (e.touches.length === 2) {
    // Handle pinch zoom
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const currentDistance = getDistance(touch1, touch2);

    if (lastTouchDistance.value) {
      const newScale =
        scale.value * (currentDistance / lastTouchDistance.value);
      scale.value = Math.min(Math.max(newScale, 0.5), 4); // Limit scale between 0.5x and 4x
    }
    lastTouchDistance.value = currentDistance;
  } else if (e.touches.length === 1) {
    // Handle panning
    translateX.value = e.touches[0].clientX - initialTouchPosition.value.x;
    translateY.value = e.touches[0].clientY - initialTouchPosition.value.y;
  }
};

const handleTouchEnd = () => {
  lastTouchDistance.value = null;
  // Optional: Snap back to boundaries when user releases
  if (scale.value < 1) {
    resetImage();
  }
};

// Mouse handling for desktop (optional)
const handleMouseDown = (e) => {
  e.preventDefault();
  // Implement mouse drag panning if needed
};

// Helper functions
const getDistance = (touch1, touch2) => {
  return Math.hypot(
    touch2.clientX - touch1.clientX,
    touch2.clientY - touch1.clientY,
  );
};

const resetImage = () => {
  scale.value = 1;
  translateX.value = 0;
  translateY.value = 0;
};
</script>

<style scoped>
.zoom-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  touch-action: none; /* Disable browser touch actions */
  position: fixed;
  top: 0;
  left: 0;
}

.zoom-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform-origin: center center;
  will-change: transform; /* Optimize for smooth transitions */
}
</style>
