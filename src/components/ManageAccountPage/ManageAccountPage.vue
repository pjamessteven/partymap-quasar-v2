<template>
  <DialogPage>
    <template v-slot:title>
      <div :class="$q.screen.gt.xs ? 'q-px-lg' : 'q-px-md'">
        Manage Account
      </div></template
    >
    <template v-slot>
      <div class="flex column" :class="$q.screen.gt.xs ? 'q-px-lg' : 'q-px-md'">
        <UpdateEmailAddressComponent class="q-mt-md" />
        <UpdatePasswordComponent class="q-mt-lg" />
        <!--<AccessLevelComponent class="q-mt-lg" />-->
        <DeleteAccountComponent class="q-mt-lg q-mb-xl" />
      </div>
    </template>
  </DialogPage>
</template>

<script>
import DialogPage from 'components/dialogs/DialogPage.vue';

import DeleteAccountComponent from './DeleteAccountComponent.vue';
import UpdateEmailAddressComponent from './UpdateEmailAddressComponent.vue';
import UpdatePasswordComponent from './UpdatePasswordComponent.vue';
// import AccessLevelComponent from './AccessLevelComponent'
export default {
  components: {
    UpdatePasswordComponent,
    UpdateEmailAddressComponent,
    DeleteAccountComponent,
    DialogPage,
    // AccessLevelComponent
  },
  data() {
    return {};
  },
  methods: {},
  watch: {},
  computed: {},
};
</script>

<style lang="scss" scoped></style>
