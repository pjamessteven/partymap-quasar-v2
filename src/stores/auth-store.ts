import { defineStore } from 'pinia';
import { checkAuthenticatedRequest } from 'src/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null,
    hasCheckedAuthCookie: false,
  }),
  getters: {
    authenticated: (state) => state.currentUser != null,
  },
  actions: {
    async checkAuthCookie() {
      const user = (await checkAuthenticatedRequest()).data;
      if (user) {
        this.currentUser = user;
        // for facebook signup
        // ask user to choose a username if they haven't
        if (user.username === null) {
          this.$router.replace('/username');
        }
      }
      this.hasCheckedAuthCookie = true;
    },
  },
});
