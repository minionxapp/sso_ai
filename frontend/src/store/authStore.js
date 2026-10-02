import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('sso_user') || 'null'),
        token: localStorage.getItem('access_token') || null,
        permissions: []
    }),
    getters: {
        isAdmin: (state) => state.user?.group === 'admin'
    },
    actions: {
        async login(username, password) {
            try {
                const response = await api.post('/api/auth/login', { username, password });
                this.token = response.data.data.token || "stub-token";
                this.user = response.data.data;
                localStorage.setItem('access_token', this.token);
                localStorage.setItem('sso_user', JSON.stringify(this.user));
                return this.user;
            } catch (e) {
                console.error("Login failed", e);
                throw e;
            }
        },
        async refreshToken() {
            return false;
        },
        logout() {
            this.user = null;
            this.token = null;
            this.permissions = [];
            localStorage.removeItem('access_token');
            localStorage.removeItem('sso_user');
        },
        hasPermission(perm) {
            return this.permissions.includes(perm);
        }
    }
});
