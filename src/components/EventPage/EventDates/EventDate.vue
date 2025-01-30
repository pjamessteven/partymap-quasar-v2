<template>
  <div
    class="ed-inline flex column no-wrap align-center items-center no-wrap"
    :class="editing ? 'editing' : ''"
  >
    <q-btn
      @click="deleteEd"
      size="sm"
      class="delete-button items-center justify-center flex"
      round
      v-if="editing"
      style="border-radius: 100px"
    >
      <q-icon size="1.5em" name="las la-times" />
    </q-btn>
    <div
      class="ed-inline-card flex column q-pa-sm justify-center align-center items-center"
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
          <q-badge
            v-if="ed?.cancelled && false"
            class="q-my-xs"
            color="red"
            :label="$t('event_dates.cancelled')"
          />
          <div class="t2" v-else-if="ed.date_confirmed">
            <span>{{ localDay(ed.start_naive, null) }}</span>
          </div>
          <span v-else-if="!hasOccured" class="t2">{{
            $t('event_dates.date_tbc')
          }}</span>
          <span v-else-if="hasOccured" class="t2">{{
            $t('event_dates.past_event')
          }}</span>
          <div class="t2" style="text-align: center">
            <span v-if="ed.date_confirmed">{{
              localDate(ed.start_naive, null)
            }}</span>
            <span v-else>{{ monthYear(ed.start_naive, null) }}</span>
          </div>
        </div>
      </div>
      <div class="background" />
      <div class="line" :style="getOpacity" />
      <div class="flex timeline-icon-wrapper q-mt-md">
        <q-icon
          class="timeline-icon"
          v-if="event?.next_date?.id === ed.id"
          name="mdi-circle"
          color="primary"
          style="
            z-index: -1;
            margin-top: -7px;
            margin-left: -7px;
            filter: opacity(0.48);
          "
          size="2em"
          :style="getOpacity"
        />
        <transition
          appear
          enter-active-class="animated fadeIn slow"
          leave-active-class="animated fadeOut"
        >
          <q-icon
            class="timeline-icon t2"
            v-if="expanded"
            color="primary"
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

import { mapActions, mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';

export default {
  data() {
    return {};
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
          this.$nextTick(() => {
            this.$emit('closeDialog'); // close parent dialog
          });
        });
    },
  },
  computed: {
    ...mapState(useEventStore, ['event']),
    getOpacity() {
      return `opacity: ${this.opacity};
      transition: all 300ms;`;
    },
    hasOccured() {
      return this.isInPast(this.ed?.start_naive, this.ed.tz);
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
    this.isInPast = common.isInPast;
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
      &.active-card {
        //background: rgba(48, 48, 48, 0.5);

        //border: 1px solid rgba(255, 255, 255, 0.2) !important;
      }
      &.inactive-card {
        &:hover {
          box-shadow: none;
          background: rgba(48, 48, 48, 0.5);
        }
        .timeline-icon {
          background: $bi-3;
        }
      }
    }
    &.editing {
      //  border: 1px solid rgba(255, 255, 255, 0.1) !important;
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
      &.active-card {
        background: rgba(240, 240, 240, 0.6);
        position: relative;
        // border: 1px solid rgba(0, 0, 0, 0.1) !important;
      }
    }

    &.editing {
      //  border: 1px solid rgba(0, 0, 0, 0.1) !important;
    }
  }

  .active-card {
    .timeline-line {
      opacity: 0;
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
  border-radius: 18px;
  &:active {
    // transform: scale(1.05);
  }
  &:first-child {
    margin-left: 0px;
  }
  .delete-button {
    position: absolute;
    right: 8px;
    top: 8px;
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
    position: relative;
    border-radius: 18px;
    &.inactive-card {
      &:hover {
        box-shadow: none;
        background: rgba(240, 240, 240, 0.6);

        .timeline-icon-wrapper {
          background: $b-3;
        }
      }
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
