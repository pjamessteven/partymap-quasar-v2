import { defineStore } from 'pinia';
import {
  loginRequest,
  checkAuthenticatedRequest,
  logoutRequest,
  registerRequest,
  editUserRequest,
} from 'src/api';
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
    currentUserIsStaff: (state) =>
      state.currentUser?.role && state.currentUser?.role >= 20,
  },
  actions: {
    async checkAuthCookie() {
      const response = await checkAuthenticatedRequest();
      const user: PrivateUser = response.data;
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
    async register(payload: {
      email: string;
      password: string;
      username: string;
      token: string;
    }) {
      try {
        await registerRequest(payload);
        return;
      } catch (error) {
        throw error;
      }
    },
    async login(identifier: string, password: string) {
      try {
        const response = await loginRequest({
          identifier,
          password,
        });
        this.currentUser = response.data;
      } catch (error) {
        throw error;
      }
    },
    async logout() {
      try {
        await logoutRequest();
        this.currentUser = null;
      } catch (error) {
        throw error;
      }
    },
    async editUser(payload: any) {
      try {
        const response = await editUserRequest(
          this.currentUser?.email,
          payload
        );
        this.currentUser = response.data;
      } catch (e) {
        throw e;
      }
    },
  },
});
