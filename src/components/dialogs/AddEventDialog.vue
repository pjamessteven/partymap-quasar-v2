<template>
  <BackdropBlurDialog
    ref="dialog"
    transition-show="jump-up"
    transition-hide="jump-down"
  >
    <q-card class="q-dialog-plugin dialog-card">
      <q-card-section class="flex items-center dialog-card-header">
        <div class="text-h6 inter bolder">
          {{ $t('add_event.please_select_an_option') }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section class="q-mt-md" style="">
        {{ $t('about.5') }}
      </q-card-section>
      <q-separator />
      <q-list class="q-py-sm">
        <q-item clickable class="q-pa-md" @click="selectHost(true)">
          <q-item-section>
            <q-item-label
              class="text-large inter bold q-mb-sm flex items-center"
            >
              {{ $t('add_event.i_am_host') }}
              &nbsp;<i class="mdi mdi-check-decagram-outline" />
            </q-item-label>
            <q-item-label class="t2" @click="host = false">
              {{ $t('add_event.i_am_host_msg') }}
            </q-item-label>
          </q-item-section>
          <q-item-section avatar v-if="$q.screen.gt.xs || true">
            <q-icon name="mdi-chevron-right" />
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable class="q-pa-md" @click="selectHost(false)">
          <q-item-section>
            <q-item-label class="text-large inter bold q-mb-sm">
              {{ $t('add_event.event_i_know_about') }}
            </q-item-label>
            <q-item-label class="t2">
              {{ $t('add_event.event_i_know_about_msg') }}
            </q-item-label>
          </q-item-section>
          <q-item-section avatar v-if="$q.screen.gt.xs || true">
            <q-icon name="mdi-chevron-right" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </BackdropBlurDialog>
</template>

<script>
import BackdropBlurDialog from '../BackdropBlurDialog.vue';

export default {
  name: 'AddEventDialog',
  data() {
    return {
      host: null,
    };
  },
  components: {
    BackdropBlurDialog,
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
  watch: {
    route() {
      this.hide();
    },
  },
  computed: {
    route() {
      return this.$route;
    },
  },
  mounted() {
    window.history.pushState({}, '');
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
@media only screen and (max-width: 599px) {
  .q-dialog-plugin {
    min-width: unset;
    max-width: 90vw;
  }
}
</style>
