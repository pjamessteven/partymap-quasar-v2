import { defineStore } from 'pinia';
import { checkAuthenticatedRequest, logoutRequest } from 'src/api';
import { PrivateUser } from 'src/types/autogen_types';

interface AuthState {
  currentUser: PrivateUser | null;
  hasCheckedAuthCookie: boolean;
}
export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    currentUser: null,
    hasCheckedAuthCookie: false,
  }),
  getters: {
    authenticated: (state) => state.currentUser != null,
  },
  actions: {
    async checkAuthCookie() {
      const user: PrivateUser = (await checkAuthenticatedRequest()).data;
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
    async logout() {
      try {
        await logoutRequest();
        this.currentUser = null;
      } catch (error) {
        return error;
      }
    },
  },
});
