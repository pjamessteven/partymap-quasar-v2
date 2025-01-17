<template>
  <div
    v-if="selectedEventDate?.artists?.length > 0 || lineupImages?.length > 0"
    class="lineup-component flex column grow no-wrap"
  >
    <div
      class="inter bolder text-h6 t1 q-pr-md event-page-header"
      :class="{ 'q-px-md': $q.screen.lt.sm }"
    >
      {{ $t('event_dates.lineup') }}
    </div>
    <div
      class="flex row no-wrap q-gutter-sm"
      :class="{ 'q-mb-': $q.screen.gt.xs }"
      v-if="lineupImages?.length > 0"
    >
      <GalleryDialog
        :open="lineupGalleryIndex != null"
        :items="lineupImages"
        :showThumbnails="false"
        :currentItemIndex="lineupGalleryIndex"
        @onClose="lineupGalleryIndex = null"
      />
      <div v-for="(media_item, index) of lineupImages" :key="index">
        <img
          @click="lineupGalleryIndex = index"
          style="cursor: pointer; width: 100%"
          :src="media_item.image_med_url"
        />
      </div>
    </div>
    <ArtistsComponent
      :editing="editing"
      class="q-mb-lg"
      v-if="selectedEventDate?.artists?.length > 0"
    />
  </div>
</template>

<script>
import GalleryDialog from './../Gallery/GalleryDialog.vue';
import ArtistsComponent from 'components/EventPage/EventDates/Artists/ArtistsComponent.vue';
import { mapState, mapWritableState } from 'pinia';
import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';

export default {
  components: {
    ArtistsComponent,
    GalleryDialog,
  },
  data() {
    return {
      loading: false,
      showMoreFields: false,
      lineupGalleryIndex: null,
      computedImagesGalleryIndex: null,
    };
  },

  watch: {},
  computed: {
    ...mapState(useEventStore, [
      'event',
      'loadingEventDate',
      'selectedEventDateIndex',
      'selectedEventDate',
      'currentUserIsHost',
    ]),
    ...mapWritableState(useEventStore, ['editing']),
    ...mapState(useAuthStore, ['currentUser', 'currentUserIsStaff']),
    lineupImages() {
      return this.selectedEventDate?.media_items?.filter(
        (x) => x.attributes?.isLineupImage,
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .lineup-component {
    border: 1px solid rgba(255, 255, 255, 0.1);
    //background: $bi-3;
    :deep(.q-separator) {
      opacity: 0.3;
    }
  }
}
.body--light {
  .lineup-component {
    border: 1px solid rgba(0, 0, 0, 0.1);

    //background: $b-2;
    :deep(.q-separator) {
      opacity: 0.6;
    }
  }
}

.lineup-component {
  .event-page-header {
    margin-left: 16px;
  }
}
@media only screen and (max-width: 1023px) {
  .lineup-component {
    background: none !important;
    border: none !important;
    .event-page-header {
      margin-left: unset;
    }
  }
}
</style>
