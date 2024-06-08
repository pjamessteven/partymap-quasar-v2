<template>
  <SolidPage @scrollPercentage="scrollPercentage = $event">
    <template v-slot>
      <FavoritesView
        :scrollPercentage="scrollPercentage"
        :username="username"
      />
    </template>
  </SolidPage>
</template>

<script>
import common from 'assets/common';
import { mapState } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
import SolidPage from 'src/components/dialogs/SolidPage.vue';
import InnerLoading from 'src/components/InnerLoading.vue';
import FavoritesView from '../SideBar/FavoritesView/FavoritesView.vue';

import { getUserRequest, getUserFullProfileRequest } from 'src/api';
export default {
  name: 'UserPage',

  components: { SolidPage, FavoritesView },
  props: {
    username: {
      default: null,
    },
  },
  data() {
    return {
      scrollPercentage: 0,
      user: null,
      loading: false,
    };
  },
  mounted() {
    // load user activities
    /*
    this.loading = true;
    if (this.currentUser && this.currentUser.role >= 20) {
      // get full profile if admin
      getUserFullProfileRequest(this.id).then((response) => {
        this.user = response.data;
        this.loading = false;
      });
    } else {
      getUserRequest(this.id).then((response) => {
        this.user = response.data;
        this.loading = false;
      });
    }*/
  },
  methods: {},
  watch: {},
  computed: {
    ...mapState(useAuthStore, ['currentUser']),
  },
  created() {
    this.timeAgo = common.timeAgo;
    this.dateUTCToLocal = common.dateUTCToLocal;
  },
};
</script>

<style lang="scss" scoped>
.solid-page {
  :deep(.solid-page-content) {
    padding: 0px !important;
  }
}
.body--dark {
}

.body--light {
}
</style>
