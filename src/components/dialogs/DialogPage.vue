<template>
  <q-dialog
    v-if="$q.screen.gt.xs && false"
    :model-value="true"
    @hide="$router.go(-1)"
    transition-show="jump-up"
    transition-hide="jump-down"
  >
    <q-card class="dialog flex column no-wrap">
      <q-card-section
        class="flex items-center sticky-card-header text-h6 chicago"
      >
        <slot name="title"></slot>

        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="content">
        <slot></slot>
      </q-card-section>
    </q-card>
  </q-dialog>
  <div v-else class="solid-page">
    <div class="solid-page-inner">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DialogPage',
  components: {},
  props: ['title'],
  data() {
    return {};
  },
  methods: {},
};
</script>

<style lang="scss">
.body--light {
  .dialog {
    .header {
      background: white;
    }
  }
}
.body--dark {
  .dialog {
    .header {
      background: black;
    }
  }
}
.dialog {
  max-height: 90vh !important;
  min-width: 960px;
  height: 100%;
  .header {
    position: sticky;
    top: 0;
    z-index: 1000;
    width: 100%;
  }
  .content {
    padding-top: 0px !important;
    //margin-top: 16px !important;
    flex-grow: 1;
    //height: 100%;
    overflow: auto;
  }
}
// sm
@media only screen and (max-width: 600px) {
  .dialog {
    max-height: 100% !important;
    min-width: unset;
  }
}
</style>
