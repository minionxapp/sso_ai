import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/authStore';

const routes = [
    {
        path: '/',
        component: () => import('../layouts/AuthLayout.vue'),
        children: [
            { path: '', redirect: '/login' },
            { path: 'login', name: 'Login', component: () => import('../views/auth/Login.vue') },
            { path: 'logout', name: 'Logout', component: () => import('../views/auth/Logout.vue') },
            { path: 'oauth/authorize', name: 'OAuthAuthorize', component: () => import('../views/auth/OAuthAuthorize.vue') }
        ]
    },
    {
        path: '/portal',
        name: 'UserPortal',
        component: () => import('../views/portal/UserPortal.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/admin',
        component: () => import('../layouts/AdminLayout.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
        children: [
            { path: '', name: 'Dashboard', component: () => import('../views/admin/Dashboard.vue') },
            { path: 'users', name: 'Users', component: () => import('../views/admin/Users.vue') },
            { path: 'applications', name: 'Applications', component: () => import('../views/admin/Applications.vue') },
            { path: 'audit-logs', name: 'AuditLogs', component: () => import('../views/admin/AuditLogs.vue') }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to) => {
    const authStore = useAuthStore();
    
    // If route requires authentication and user has no token
    if (to.meta.requiresAuth && !authStore.token) {
        return { name: 'Login' };
    }

    // If route requires admin role and user is not in 'admin' group
    if (to.meta.requiresAdmin && authStore.user?.group !== 'admin') {
        return { name: 'UserPortal' };
    }

    // If user is already authenticated and navigates to login
    if (to.name === 'Login' && authStore.token) {
        if (authStore.user?.group === 'admin') {
            return { name: 'Dashboard' };
        } else {
            return { name: 'UserPortal' };
        }
    }
});

export default router;
