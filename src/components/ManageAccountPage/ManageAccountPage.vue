<template>
  <SolidPage>
    <template v-slot:title> <div>Manage Account</div></template>
    <template v-slot>
      <div
        class="flex column"
        :class="$q.screen.lt.sm ? 'q-px-md q-mt-sm' : 'q-mt-lg'"
      >
        <UpdateEmailAddressComponent />
        <UpdatePasswordComponent class="q-mt-lg" />
        <!--<AccessLevelComponent class="q-mt-lg" />-->
        <DeleteAccountComponent class="q-mt-lg q-mb-xl" />
      </div>
    </template>
  </SolidPage>
</template>

<script>
import SolidPage from 'src/components/dialogs/SolidPage.vue';

import DeleteAccountComponent from './DeleteAccountComponent.vue';
import UpdateEmailAddressComponent from './UpdateEmailAddressComponent.vue';
import UpdatePasswordComponent from './UpdatePasswordComponent.vue';
// import AccessLevelComponent from './AccessLevelComponent'
export default {
  components: {
    UpdatePasswordComponent,
    UpdateEmailAddressComponent,
    DeleteAccountComponent,
    SolidPage,
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
