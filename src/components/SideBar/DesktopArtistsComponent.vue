<template>
  <div class="flex row q-pr-xl q-gutter-sm">
    <ArtistHeadBg
      class="artist-head"
      v-for="artist in $props.artists"
      :key="artist.id"
      :artist="artist"
      :size="size"
    ></ArtistHeadBg>

    <div
      v-if="hasNext && false"
      class="flex justify-center items-center t3 link-hover q-ml-md"
      style="width: 128px"
    >
      <q-spinner-ios
        :thickness="2"
        :color="$q.dark.isActive ? 'white' : 'black'"
        size="2em"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ArtistHeadBg from 'components/ArtistHeadBg.vue';
import { Artist } from 'src/types/autogen_types';

interface Props {
  hasNext: boolean;
  artists?: Artist[];
  loadMore: () => void;
  size: 'sm' | 'md' | 'lg';
}
const props = withDefaults(defineProps<Props>(), {
  hasNext: () => false,
  artists: () => [],
  size: () => 'lg',
});

console.log(props.artists);

function onScrollMainContent(info: {
  horizontalSize: number;
  horizontalContainerSize: number;
  horizontalPosition: number;
  horizontalPercentage: number;
}) {
  /*
  const triggerPositoion =
    info.horizontalSize - info.horizontalContainerSize - 128; // width of loading spinner
*/

  if (info.horizontalPercentage == 1) {
    // reached end
    props.loadMore();
  }
}
</script>

<style lang="scss" scoped>
.body--dark {
}
.body--light {
}

@media only screen and (max-width: 599px) {
}
</style>
