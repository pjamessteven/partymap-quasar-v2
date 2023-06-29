<template>
  <div
    v-if="selectedEventDate"
    class="flex row items-start no-wrap ed-inline-card editing-outline"
    :class="[editing || showMoreFields ? 'editing q-px-md' : '']"
    @click="editing || showMoreFields ? (showEditingDialog = true) : null"
  >
    <q-icon
      :size="$q.screen.gt.sm ? '2em' : '1.5rem'"
      :class="
        selectedEventDate.description &&
        selectedEventDate.description.length > 0
          ? ' t2'
          : 't4'
      "
      name="las la-info-circle"
    />
    <div
      class="flex column q-ml-md t2"
      :class="$q.screen.gt.sm ? 'text-large' : ''"
    >
      <div class="flex column" v-if="selectedEventDate.description?.length > 0">
        <div>
          <span
            v-if="
              selectedEventDate.description_attribute &&
              selectedEventDate.description_attribute.length > 0
            "
            >"</span
          ><span
            style="white-space: pre-line"
            v-html="selectedEventDate.description"
          ></span
          ><span
            v-if="
              selectedEventDate.description_attribute &&
              selectedEventDate.description_attribute.length > 0
            "
            >"
            <a
              class="link-hover o-050"
              target="_blank"
              :href="computedAttributeUrl"
              >[source]</a
            ></span
          >
        </div>

        <div
          class="t4 link-hover underline q-mt-md flex"
          v-if="showMoreFields"
          @click="showEditingDialog = true"
        >
          Edit description
        </div>
      </div>
      <div
        v-else
        class="t4"
        @click="showEditingDialog = true"
        style="cursor: pointer"
      >
        <span>
          <u>{{ $t('event_date_inline.add_info') }}</u>
        </span>
      </div>
    </div>
    <q-dialog
      v-if="editing || showMoreFields"
      v-model="showEditingDialog"
      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <EditEventDateDialog :ed="selectedEventDate" mode="description" />
    </q-dialog>
  </div>
</template>

<script>
import EditEventDateDialog from './EditEventDateDialog.vue';

import { mapState } from 'pinia';
import { useEventStore } from 'src/stores/event';
import { useAuthStore } from 'src/stores/auth';

export default {
  name: 'EventDateDescriptionComponent',
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
    ...mapState(useEventStore, [
      'event',
      'selectedEventDate',
      'currentUserCanEdit',
    ]),
    ...mapState(useAuthStore, ['currentUser']),
    computedAttributeUrl() {
      if (
        this.selectedEventDate &&
        this.selectedEventDate.description_attribute &&
        this.selectedEventDate.description_attribute.length > 0
      ) {
        // ensure that there is a protocol prefix
        if (
          this.selectedEventDate.description_attribute.indexOf('http://') < 0 &&
          this.selectedEventDate.description_attribute.indexOf('https://') < 0
        ) {
          return '//' + this.selectedEventDate.description_attribute;
        } else return this.selectedEventDate.description_attribute;
      } else {
        return null;
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
