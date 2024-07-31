<template>
  <!-- add `data-active` and the event listeners -->
  <div
    :data-active="active"
    @dragenter.prevent="setActive"
    @dragover.prevent="setActive"
    @dragleave.prevent="setInactive"
    @drop.prevent="onDrop"
    :class="active ? 'o-050' : ''"
  >
    <!-- share state with the scoped slot -->
    <slot></slot>
  </div>
</template>

<script setup>
// make sure to import `ref` from Vue
import { ref, onMounted, onUnmounted } from 'vue';
const emit = defineEmits(['files-dropped']);

let active = ref(false);
let inActiveTimeout = null; // add a variable to hold the timeout key

function setActive() {
  active.value = true;
  clearTimeout(inActiveTimeout); // clear the timeout
}
function setInactive() {
  // wrap it in a `setTimeout`
  inActiveTimeout = setTimeout(() => {
    active.value = false;
  }, 50);
}

const imageUrlToFile = async (url) => {
  const data = await fetch(url);
  const blob = await data.blob();
  return new File([blob], 'image.jpg', { type: blob.type });
};

const onDrop = async (e) => {
  const url = e?.dataTransfer?.getData('Text');
  if (e.dataTransfer.files?.length) {
    setInactive(); // add this line too
    emit('files-dropped', [...e.dataTransfer.files]);
  } else if (url) {
    // maybe a url dropped from another browser window
    // attempt to load
    try {
      active.value = true;
      const downloadedImage = await imageUrlToFile(url);
      emit('files-dropped', [downloadedImage]);
      active.value = false;
    } catch (e) {
      active.value = false;

      Notify.create({
        closeBtn: true,
        message:
          'Blocked by source website. Manually download and upload instead.',
      });
    }
  }
};
function preventDefaults(e) {
  e.preventDefault();
}

const events = ['dragenter', 'dragover', 'dragleave', 'drop'];

onMounted(() => {
  events.forEach((eventName) => {
    document.body.addEventListener(eventName, preventDefaults);
  });
});

onUnmounted(() => {
  events.forEach((eventName) => {
    document.body.removeEventListener(eventName, preventDefaults);
  });
});
</script>
