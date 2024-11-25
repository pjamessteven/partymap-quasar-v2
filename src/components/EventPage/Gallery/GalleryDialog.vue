<template>
  <q-dialog
    :model-value="open"
    ref="dialog"
    @hide="$emit('onClose')"
    transition-show="jump-up"
    transition-hide="jump-down"
    @keyup.left="currentIndex > 0 ? (currentIndex -= 1) : undefined"
    @keyup.right="
      currentIndex < items.length - 1 ? (currentIndex += 1) : undefined
    "
  >
    <div class="gallery-dialog">
      <div class="button-wrapper flex row items-center no-wrap">
        <div class="close-button-wrapper" @click="$emit('onClose')">
          <q-icon size="2em" name="mdi-close"></q-icon>
        </div>

        <div class="info-panel shadow-5 q-pr-sm q-pl-md q-py-xs flex column r">
          <div class="flex row items-center no-wrap">
            <div class="flex row">
              <router-link
                v-if="items[currentIndex]?.creator?.username"
                class="link-hover inter semibold"
                :to="{
                  name: 'UserPage',
                  params: { username: items[currentIndex]?.creator?.username },
                }"
                >@{{ items[currentIndex]?.creator?.username }}</router-link
              ><span v-else>anon</span>&nbsp;{{
                timeAgo(items[currentIndex]?.created_at)
              }}
            </div>
            <q-btn
              flat
              :text-color="'grey-6'"
              icon="mdi-dots-vertical"
              class="q-px-sm"
              size="sm"
            >
              <q-menu
                transition-show="jump-down"
                transition-hide="jump-up"
                anchor="bottom right"
                self="top right"
              >
                <q-item
                  v-if="currentUserCanEdit"
                  v-close-popup
                  v-ripple
                  v-on:click="deleteItem(items[currentIndex])"
                  clickable
                >
                  <q-item-section avatar>
                    <q-icon name="mdi-delete-outline" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{
                      $t('reviews.delete_photo')
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
                <!-- SHOW REPORT if not host -->

                <q-item
                  v-close-popup
                  v-ripple
                  v-on:click="showingReportDialog = true"
                  clickable
                >
                  <q-item-section avatar>
                    <q-icon name="mdi-alert-circle-outline" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{
                      $t('reviews.report_photo')
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-menu>
            </q-btn>
          </div>
          <div class="t2" v-if="items[currentIndex]?.caption?.length > 0">
            Caption: {{ items[currentIndex]?.caption }}
          </div>
        </div>
      </div>
      <q-carousel
        swipeable
        animated
        v-touch-swipe.vertical="() => $emit('onClose')"
        :arrows="items.length > 1"
        v-model="currentIndex"
        :thumbnails="items.length > 1"
        infinite
        transition-prev="jump-right"
        transition-next="jump-left"
      >
        <q-carousel-slide
          @click="$emit('onClose')"
          v-for="(item, index) in items"
          :key="index"
          :name="index"
          :img-src="item.image_url || item.poster_url"
        >
          <q-linear-progress
            class="linear-progress"
            size="2px"
            :color="$q.dark.isActive ? 'grey-6' : 'grey-8'"
            indeterminate
            v-if="!loaded.includes(index)"
          />

          <div class="image-container">
            <img
              :src="item.thumb_url"
              class="image not-loaded"
              v-show="!loaded.includes(index)"
            />
            <img
              :src="item.image_url"
              class="image"
              @load="() => loaded.push(index)"
              v-show="loaded.includes(index)"
            />
          </div>
        </q-carousel-slide>
      </q-carousel>
    </div>
    <q-dialog v-model="showingReportDialog">
      <ReportDialog
        :mode="'reportMediaItem'"
        :mediaItemId="items?.[currentIndex]?.id"
        @closeDialog="showingReportDialog = false"
      />
    </q-dialog>
  </q-dialog>
</template>

<script>
import common from 'src/assets/common';
import ReportDialog from 'components/EventPage/ReportDialog.vue';
import { mapActions, mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';

export default {
  components: { ReportDialog },
  data() {
    return {
      loaded: [],
      currentIndex: this.currentItemIndex,
      showingReportDialog: false,
    };
  },
  props: {
    open: { type: Boolean, default: false },
    showThumbnails: { type: Boolean, default: false },
    items: {
      type: Array,
      default: null,
    },
    currentItemIndex: {
      type: Number,
      default: null,
    },
  },
  watch: {
    currentItemIndex(newValue) {
      this.currentIndex = newValue;
    },
  },
  computed: {
    ...mapState(useEventStore, ['currentUserCanEdit']),
  },
  methods: {
    ...mapActions(useEventStore, ['deleteMediaItem']),
    deleteItem(media_item) {
      this.$q
        .dialog({
          title: 'Delete item',
          message: 'Are you sure?',
          color: 'primary',
          persistent: false, // we want the user to not be able to close it
        })
        .onOk(() => {
          const progressDialog = this.$q.dialog({
            title: 'Doo do doo..',
            color: 'primary',
            progress: true, // we enable default settings
            cancel: false,
            persistent: true, // we want the user to not be able to close it
            ok: false,
          });
          this.deleteMediaItem(media_item.id).then(
            () => {
              progressDialog.hide();
              this.$q.dialog({
                title: 'Image deleted',
                message: 'Refresh page to see changes',
                color: 'primary',
                cancel: false,
              });
            },
            () => {
              // on error
              progressDialog.hide();
            }
          );
        });
    },
  },
  created() {
    this.timeAgo = common.timeAgo;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .gallery-dialog {
    .q-carousel {
      background: black;
    }
  }
}
.body--light {
  .gallery-dialog {
    .q-carousel {
      background: black;
    }
  }
}

.gallery-dialog {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: unset !important;
  position: absolute;
  .button-wrapper {
    position: absolute;
    z-index: 1;
    top: 0px;
    left: 0px;

    .close-button-wrapper {
      cursor: pointer;

      padding: 16px;
      color: grey;
      transition: color 0.3s ease;
      &:hover {
        color: white;
      }
    }
    .info-panel {
      background: $bi-3;
      border-radius: 18px;
      color: $ti-2;
    }
  }
  .q-carousel {
    height: 100%;
    width: 100%;
    :deep(.q-carousel__slide) {
      padding: 0px !important;
      background: none !important;
    }
    .linear-progress {
      position: absolute;
      top: 0px;
      z-index: 10;
    }
    .image-container {
      pointer-events: none;
      display: flex;
      justify-content: center;
      align-content: center;
      align-items: center;
      background: none;
      max-height: 100%;
      max-width: 100%;
      position: relative;
      height: 100%;
      width: 100%;
      .image {
        height: 100%;
        width: 100%;
        max-height: 100%;
        max-width: 100%;
        object-fit: contain;
        &.not-loaded {
          //opacity: 0.48;
        }
      }
    }
  }
}
</style>
