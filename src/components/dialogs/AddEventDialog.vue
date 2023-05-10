<template>
  <q-dialog
    ref="dialog"
    @hide="onDialogHide"
    transition-show="jump-up"
    transition-hide="jump-down"
  >
    <q-card class="q-dialog-plugin">
      <q-card-section class="flex items-center sticky-card-header">
        <div class="text-h6 chicago">
          {{ $t('add_event.please_select_an_option') }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-list class="q-py-sm">
        <q-item clickable class="q-pa-md" @click="selectHost(true)">
          <q-item-section>
            <q-item-label class="text-h6 chicago q-mb-sm">
              {{ $t('add_event.i_am_host') }}
              &nbsp;<i class="mdi mdi-check-decagram-outline" />
            </q-item-label>
            <q-item-label class="t3" @click="host = false">
              {{ $t('add_event.i_am_host_msg') }}
            </q-item-label>
          </q-item-section>
          <q-item-section avatar v-if="$q.screen.gt.xs">
            <q-icon name="mdi-chevron-right" />
          </q-item-section>
        </q-item>
        <q-item clickable class="q-pa-md" @click="selectHost(false)">
          <q-item-section>
            <q-item-label class="text-h6 chicago q-mb-sm">
              {{ $t('add_event.event_i_know_about') }}
            </q-item-label>
            <q-item-label class="t3">
              {{ $t('add_event.event_i_know_about_msg') }}
            </q-item-label>
          </q-item-section>
          <q-item-section avatar v-if="$q.screen.gt.xs">
            <q-icon name="mdi-chevron-right" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'AddEventDialog',
  data() {
    return {
      host: null,
    };
  },
  methods: {
    selectHost(bool) {
      this.$emit('ok', {
        host: bool,
      });
      this.hide();
    },
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.dialog.show();
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.dialog.hide();
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide');
    },
  },
};
</script>

<style lang="scss" scoped>
.body--dark {
  .hover-option {
    &:hover {
      background: $bi-3;
      //color: $primary;
    }
  }
}

.body--light {
  .host-options {
    .host-option {
      border: 1px solid rgba(0, 0, 0, 0);
      color: $t-1;
      &:hover {
        background: $b-3;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }
    }
  }
  .hover-option {
    &:hover {
      background: $b-3;
      //color: $primary;
    }
  }
}

.q-dialog-plugin {
  min-width: 500px;
}

.hover-option {
  cursor: pointer;
}

.card-disabled {
  opacity: 0.48;
  pointer-events: none;
  cursor: default;
}
//lg
@media only screen and (min-width: 1919px) {
}

// md
@media only screen and (max-width: 1919px) and (min-width: 1023px) {
}

// sm
@media only screen and (max-width: 600px) {
  .q-dialog-plugin {
    min-width: unset;
    max-width: 90vw;
  }
}
</style>
