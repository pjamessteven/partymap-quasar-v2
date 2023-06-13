<template>
  <div class="scroll-area-wrapper">
    <q-scroll-area
      horizontal
      ref="scrollArea"
      @scroll="onScrollMainContent"
      class="artist-scroll-area"
      v-if="artists && artists.length > 0"
      :thumb-style="
        $q.screen.gt.xs
          ? {
              bottom: '0px',
              height: '8px',
              marginLeft: '16px',
            }
          : { bottom: '0px', height: '0px' }
      "
    >
      <div
        class="flex row no-wrap q-gutter-md q-pr-xl"
        :class="$q.screen.lt.sm ? 'q-pl-md' : 'q-pl-md'"
      >
        <ArtistHead
          v-for="(artist, index) in artists"
          :key="index"
          :artist="artist"
        ></ArtistHead>
        <div
          v-if="hasNext"
          class="pagination-icon flex justify-center items-center t3 link-hover"
          style="width: 128px"
        >
          <q-spinner-ios
            :thickness="2"
            :color="$q.dark.isActive ? 'white' : 'black'"
            size="2em"
          />
        </div>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup lang="ts">
import ArtistHead from 'components/ArtistHead.vue';
import { Artist } from 'src/types/autogen_types';

interface Props {
  hasNext: boolean;
  artists?: Artist[];
  loadMore: () => void;
}
const props = withDefaults(defineProps<Props>(), {
  hasNext: () => false,
  artists: () => [],
});

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
    console.log('load more');
    // reached end
    props.loadMore();
  }
}
</script>

<style lang="scss" scoped>
.body--dark {
  .pagination-icon {
    :deep(.q-icon) {
      background: black;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}
.body--light {
  .pagination-icon {
    :deep(.q-icon) {
      border: 1px solid rgba(0, 0, 0, 0.1);
      background: white;
    }
  }
}

.scroll-area-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  .artist-scroll-area {
    height: 176px;
    width: 100%;
    mask-image: linear-gradient(
      to left,
      transparent 0px,
      white 32px,
      white calc(100% - 16px),
      transparent 100%
    );
  }
  .pagination-icon {
    z-index: 100;
    height: 154px;
    width: auto;
    display: flex;
    align-items: center;
    :deep(.q-icon) {
      border-radius: 100%;
    }
  }
}

@media only screen and (min-width: 1920px) {
  .scroll-area-wrapper {
    .artist-scroll-area {
      height: 186px;
    }
  }
}

@media only screen and (max-width: 600px) {
  .scroll-area-wrapper {
    .artist-scroll-area {
      height: 160px;
    }
  }
}
</style>
