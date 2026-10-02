import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 10000,
});

api.interceptors.request.use(config => {
    const authStore = useAuthStore();
    if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const authStore = useAuthStore();
            const success = await authStore.refreshToken();
            if (success) {
                originalRequest.headers.Authorization = `Bearer ${authStore.token}`;
                return api(originalRequest);
            } else {
                authStore.logout();
            }
        }
        return Promise.reject(error);
    }
);

export default api;
