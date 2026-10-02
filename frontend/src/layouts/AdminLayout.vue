<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 text-white flex flex-col hidden md:flex shrink-0">
      <div class="h-16 flex items-center px-6 font-bold text-xl tracking-wide border-b border-slate-800 text-blue-400">
        <svg class="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
        SSO Admin
      </div>
      <nav class="flex-1 px-4 py-6 space-y-1.5">
        <router-link 
          to="/admin" 
          exact-active-class="bg-blue-600 text-white font-medium shadow-sm" 
          class="flex items-center px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-sm">
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          Dashboard
        </router-link>

        <router-link 
          to="/admin/users" 
          active-class="bg-blue-600 text-white font-medium shadow-sm" 
          class="flex items-center px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-sm">
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
          User Management
        </router-link>

        <router-link 
          to="/admin/applications" 
          active-class="bg-blue-600 text-white font-medium shadow-sm" 
          class="flex items-center px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-sm">
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          Applications
        </router-link>

        <router-link 
          to="/admin/audit-logs" 
          active-class="bg-blue-600 text-white font-medium shadow-sm" 
          class="flex items-center px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-sm">
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
          Audit Logs
        </router-link>
      </nav>

      <div class="p-4 border-t border-slate-800">
        <button 
          @click="handleLogout" 
          class="w-full flex items-center justify-center space-x-2 bg-rose-600/90 hover:bg-rose-600 text-white py-2 px-4 rounded-lg transition text-sm font-medium">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0">
      <header class="h-16 bg-white border-b border-slate-200/80 shadow-xs flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center space-x-3">
          <div class="md:hidden flex items-center text-slate-800 font-bold">SSO Admin</div>
          <span class="text-sm font-medium text-slate-500 hidden sm:inline">Identity & Access Management Portal</span>
        </div>
        <div class="flex items-center space-x-4">
          <div class="text-right hidden sm:block">
            <div class="text-sm font-semibold text-slate-800">{{ authStore.user?.fullName || authStore.user?.username || 'Administrator' }}</div>
            <div class="text-xs text-slate-400">Tenant: Default</div>
          </div>
          <div class="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            {{ (authStore.user?.username || 'A').charAt(0).toUpperCase() }}
          </div>
        </div>
      </header>

      <div class="flex-1 p-6 md:p-8 overflow-auto">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>
