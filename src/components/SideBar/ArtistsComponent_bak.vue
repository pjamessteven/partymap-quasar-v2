<template>
  <div class="scroll-area-wrapper">
    <CustomQScroll
      horizontal
      ref="scrollArea"
      @scroll="onScrollMainContent"
      class="artist-scroll-area"
      v-if="artists && artists.length > 0"
      :thumb-style="
        $q.screen.gt.xs
          ? {
              borderRadius: '0px',
              bottom: '8px',
              height: '4px',
              marginLeft: '16px',
            }
          : { bottom: '0px', height: '0px' }
      "
      ><div>
        <div
          class="flex row no-wrap q-gutter-md q-pr-xl"
          :class="$q.screen.lt.sm ? 'q-pl-md' : 'q-pl-lg'"
        >
          <ArtistHead
            v-for="artist in $props.artists"
            :key="artist.id"
            :artist="artist"
          ></ArtistHead>

          <div
            v-if="hasNext"
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
      </div>
    </CustomQScroll>
  </div>
</template>

<script setup lang="ts">
import ArtistHead from 'components/ArtistHead.vue';
import { Artist } from 'src/types/autogen_types';
import CustomQScroll from 'components/CustomQScroll.vue';

interface Props {
  hasNext: boolean;
  artists?: Artist[];
  loadMore: () => void;
}
const props = withDefaults(defineProps<Props>(), {
  hasNext: () => false,
  artists: () => [],
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
    height: 196px;
    width: 100%;
    /*
    mask-image: linear-gradient(
      to left,
      transparent 0px,
      white 32px,
      white calc(100% - 16px),
      transparent 100%
    );*/
  }
  .pagination-icon {
    z-index: 100;
    height: 154px;
    display: flex;
    align-items: center;
    :deep(.q-icon) {
      border-radius: 100%;
    }
  }
}

@media only screen and (min-width: 1921px) {
  .scroll-area-wrapper {
    .artist-scroll-area {
      height: 186px;
    }
  }
}

@media only screen and (max-width: 599px) {
  .scroll-area-wrapper {
    .artist-scroll-area {
      height: 160px;
      mask-image: unset;
    }
  }
}
</style>
