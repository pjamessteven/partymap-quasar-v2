<template>
  <div
    v-if="selectedEventDate != null"
    class="flex row justify-center no-wrap ed-inline-card editing-outline"
    style="max-width: 100%"
    :class="{
      'editing q-px-md': editing || showMoreFields,
      'items-start': $q.screen.lt.sm,
      'items-center': $q.screen.gt.xs,
    }"
    @click="editing || showMoreFields ? (showEditingDialog = true) : null"
  >
    <q-icon
      :size="$q.screen.gt.sm ? '2em' : '1.5rem'"
      :class="
        selectedEventDate.url && selectedEventDate.url.length > 0 ? ' t2' : 't4'
      "
      name="las la-external-link-alt"
    />
    <!--Display grid fixes overflow issues (..somehow...)-->
    <div
      class="ellipsis q-ml-md t2"
      style="display: grid; width: 100%"
      :class="$q.screen.gt.sm ? 'text-large' : ''"
    >
      <div
        class="ellipsis flex no-wrap"
        :class="$q.screen.gt.xs ? 'justify-between' : 'column'"
        style="white-space: pre-line; width: 100%"
        v-if="computedExternalUrl"
      >
        <div
          class="flex column justify-center"
          :class="$q.screen.gt.sm ? 'text-large' : ''"
          :style="editing ? 'pointer-events: none' : ''"
        >
          <a
            class="t3 link-hover ellipsis q-mr-sm"
            :href="computedExternalUrl"
            style="text-decoration: none; line-break: anywhere"
            target="_blank"
          >
            {{ computedExternalUrl }}
          </a>
        </div>
        <!--
        <a
          class="link-hover underline ellipsis"
          target="_blank"
          :href="!editing ? computedExternalUrl : undefined"
          >{{ selectedEventDate.url }}</a
        >
        -->
        <a
          style="text-decoration: none; color: unset"
          :href="computedExternalUrl"
          target="_blank"
          v-if="computedExternalUrl && !editing"
        >
          <q-btn
            no-caps
            class="nav-button"
            flat
            style="width: 190px"
            :label="
              computedExternalUrl &&
              computedExternalUrl.indexOf('facebook') > -1
                ? $t('event_dates.facebook_page')
                : $t('event_dates.visit_website')
            "
            :color="$q.dark.isActive ? 'white' : 'black'"
            icon="las la-external-link-alt"
            :class="$q.screen.gt.sm ? '' : 'flex grow q-mt-sm'"
          />
        </a>
      </div>
      <div
        v-else
        class="t4"
        @click="showEditingDialog = true"
        style="cursor: pointer"
      >
        <span>
          <u>{{ $t('event_dates.add_url') }}</u>
        </span>
      </div>
    </div>
    <q-dialog
      v-if="editing || showMoreFields"
      v-model="showEditingDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <EditEventDateDialog :ed="selectedEventDate" mode="url" />
    </q-dialog>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';

import EditEventDateDialog from './EditEventDateDialog.vue';

export default {
  name: 'EventDateUrlComponent',
  components: {
    EditEventDateDialog,
  },
  watch: {},
  data() {
    return { showEditingDialog: false };
  },
  props: {
    editing: Boolean,
    showMoreFields: Boolean,
  },
  methods: {},
  computed: {
    ...mapState(useEventStore, ['event', 'selectedEventDate']),

    computedExternalUrl() {
      if (this.selectedEventDate && this.selectedEventDate.url) {
        // ensure that there is a protocol prefix
        if (
          this.selectedEventDate.url.indexOf('http://') < 0 &&
          this.selectedEventDate.url.indexOf('https://') < 0
        ) {
          return '//' + this.selectedEventDate.url;
        } else return this.selectedEventDate.url;
      } else {
        return null;
      }
    },
    urlSubstring() {
      if (this.selectedEventDate.url) {
        let substring = this.selectedEventDate.url.substring(0, 36);
        if (this.selectedEventDate.url.length > 36) substring += '...';

        return substring;
      } else {
        return '';
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.body--light {
  .square-map {
  }
}
.body--dark {
  .square-map {
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  .nav-button {
    background: $bi-3;
  }
}
</style>
