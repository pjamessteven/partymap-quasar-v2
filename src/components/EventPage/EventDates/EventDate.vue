<template>
  <div
    class="ed-inline flex column no-wrap align-center items-center no-wrap"
    :class="editing ? 'editing' : ''"
  >
    <q-btn
      @click="deleteEd"
      size="sm"
      class="delete-button"
      round
      v-if="editing"
      style="border-radius: 100px"
    >
      <q-icon size="1em" name="las la-times" />
    </q-btn>
    <div
      class="ed-inline-card flex column q-pa-sm justify-center align-center items-center editing-outline"
      :class="expanded ? 'active-card' : 'inactive-card'"
    >
      <div
        class="date-text flex row justify-center items-end align-center"
        :style="getOpacity"
      >
        <div
          class="flex column t2"
          :class="$q.screen.gt.sm ? 'text-large items-start' : 'items-center'"
        >
          <div class="t2" v-if="ed.date_confirmed">
            <span>{{ localDay(ed.start_naive, null) }}</span>
          </div>
          <span v-else class="t2">Date TBC</span>
          <div class="t2" style="text-align: center">
            <span v-if="ed.date_confirmed">{{
              localDate(ed.start_naive, null)
            }}</span>
            <span v-else>{{ monthYear(ed.start_naive, null) }}</span>
          </div>
        </div>
      </div>
      <div class="background" />
      <div class="line" :style="getOpacity" v-if="!editing" />
      <div class="flex timeline-icon-wrapper q-mt-md" v-if="!editing">
        <transition
          appear
          enter-active-class="animated fadeIn slow"
          leave-active-class="animated fadeOut"
        >
          <q-icon
            class="timeline-icon t2"
            v-if="expanded"
            name="mdi-circle"
            size="1em"
            :style="getOpacity"
          />
        </transition>
        <transition
          appear
          enter-active-class="animated fadeIn slow"
          leave-active-class="animated fadeOut"
        >
          <q-icon
            class="timeline-icon t2"
            v-if="!expanded"
            name="mdi-circle-outline"
            size="1em"
            :style="getOpacity"
          />
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import common from 'assets/common';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { mapActions, mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';

export default {
  data() {
    return {
      showMap: false,
      opened: false,
      mapOptions: {
        scrollWheelZoom: false,
        zoomSnap: 1,
        zoom: 3,
        zoomControl: true,
        minZoom: 2,
        maxBounds: L.latLngBounds(
          L.latLng(-89.98155760646617, -Infinity),
          L.latLng(89.99346179538875, Infinity)
        ),
        maxBoundsViscosity: 0.5,
        worldCopyJump: true,
        preferCanvas: true,
        attribution:
          'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.',
      },
      map: null,
      tileLayer: null,
      markers: null,
    };
  },
  components: {},
  props: {
    ed: Object,
    expanded: Boolean,
    next: Boolean,
    opacity: Number,
    editing: Boolean,
  },
  watch: {},
  methods: {
    ...mapActions(useEventStore, ['deleteEventDate']),
    deleteEd() {
      this.$q
        .dialog({
          title: this.$t('event_dates.delete_event_date'),
          message: this.$t('event_dates.delete_event_date_confirm'),
          cancel: true,
          persistent: false,
        })
        .onOk(async () => {
          const progressDialog = this.$q.dialog({
            title: this.$t('edit_event.updating_event'),
            color: 'primary',
            progress: true, // we enable default settings
            cancel: false,
            persistent: true, // we want the user to not be able to close it
            ok: false,
          });

          await this.deleteEventDate(this.ed.id);
          progressDialog.hide();
          this.$emit('closeDialog'); // close parent dialog
          // window.bus.$emit('closeDialog');
        });
    },
  },
  computed: {
    ...mapState(useEventStore, ['event']),
    getOpacity() {
      return `opacity: ${this.opacity};
      transition: all 300ms;`;
    },
  },
  created() {
    // import common methods
    this.relativeHumanTime = common.relativeHumanTime;
    this.localTime = common.localTime;
    this.localDate = common.localDate;
    this.monthYear = common.monthYear;
    this.localDay = common.localDay;
    this.localTimeCompact = common.localTimeCompact;
    this.timeZoneAbbreviention = common.timeZoneAbbreviention;
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .ed-inline {
    .delete-button {
      background-color: grey;
    }
    .ed-inline-card {
      .line {
        border-color: rgb(48, 48, 48);
      }
      .timeline-icon-wrapper {
        background: $bi-2;
        .timeline-icon {
          position: absolute;
        }
      }
    }
    &.editing {
      border: 1px dashed rgba(255, 255, 255, 0.3) !important;
      border-radius: 9px;
      .active-card {
        background: $bi-3;
      }
    }
  }

  .active-card {
    .timeline-icon {
      background: $bi-3;
    }
  }
  .inactive-card {
    &:hover {
      box-shadow: none;
      //border: 1px solid $bi-4;
      background: $bi-3;
    }
    .timeline-icon {
      background: $bi-3;
    }
  }
  .navigate-button {
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: $bi-3;
  }
}

.body--light {
  .ed-inline {
    .delete-button {
      background-color: $b-1;
    }
    .ed-inline-card {
      .line {
        border-color: lightgrey;
      }
      .timeline-icon-wrapper {
        background: white;
        .timeline-icon {
          position: absolute;
        }
      }
    }
    &.editing {
      .active-card {
        background: $b-2;
      }
    }
  }

  .active-card {
    .timeline-line {
      opacity: 0;
    }
    .timeline-icon {
      background: $b-2;
    }
  }
  .inactive-card {
    &:hover {
      box-shadow: none;
      background: $b-3;
      .timeline-icon-wrapper {
        background: $b-3;
      }
    }
  }
  .navigate-button {
    border: 1px solid rgba(0, 0, 0, 0.1);
    :deep(.q-btn__wrapper::before) {
      box-shadow: none !important;
    }
  }
}

.timeline-icon {
  z-index: 2;
  position: relative;
  border-radius: 50px;
  pointer-events: none;
}

.ed-inline {
  position: relative;
  width: max-content;
  z-index: 1;
  transition: all 150ms ease-in-out;
  cursor: pointer;
  margin-right: 18px;
  &:active {
    // transform: scale(1.05);
  }
  &:first-child {
    margin-left: 0px;
  }
  .delete-button {
    position: absolute;
    right: -10px;
    top: -10px;
    z-index: 2;
    border-radius: 100px !important;
  }
  .inactive-card {
    box-shadow: none;
    cursor: pointer;
    border: none;
    // border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 300ms;
    background: transparent;
  }
  .ed-inline-card {
    width: max-content;
    transition: all 0.5s;
    width: 180px;
    height: 102px;
    border-radius: 0px;
    position: relative;
    &.editing {
      border-radius: 9px !important;
    }

    .date-text {
      z-index: 2;
    }
    .background {
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: 1;
    }
    .line {
      z-index: -1;
      position: absolute;
      height: 1px;
      border-top: 1px solid black;
      width: calc(100% + 18px);
      left: 50%;
      //margin-left: calc(100% + 24px);
      bottom: 18px;
    }
    .timeline-icon-wrapper {
      z-index: 2;
      transition: all 150ms ease-in-out;

      position: relative;
      height: 14px;
      width: 14px;
      border-radius: 100%;
      .timeline-icon {
        position: absolute;
      }
    }
  }
}
@media only screen and (max-width: 1023px) {
  .ed-inline {
    .ed-inline-card {
      .line {
        bottom: 21px;
      }
    }
  }
}
</style>
