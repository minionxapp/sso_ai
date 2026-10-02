<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Navbar -->
    <header class="bg-white border-b border-slate-200/80 shadow-xs h-16 flex items-center justify-between px-6 sm:px-10">
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <div>
          <h1 class="font-bold text-slate-900 text-lg leading-tight">SSO User Portal</h1>
          <p class="text-xs text-slate-400">Single Sign-On Identity Hub</p>
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <div class="text-right hidden sm:block">
          <div class="text-sm font-semibold text-slate-800">{{ authStore.user?.fullName || authStore.user?.username }}</div>
          <div class="text-xs text-slate-500 font-mono">Role: {{ authStore.user?.group || 'user' }}</div>
        </div>
        <button 
          @click="handleLogout" 
          class="inline-flex items-center px-3.5 py-1.5 border border-slate-200 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-xs transition">
          <svg class="w-4 h-4 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Logout
        </button>
      </div>
    </header>

    <!-- Main Container -->
    <main class="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-10 space-y-8">
      <!-- Welcome Banner -->
      <div class="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div class="relative z-10 space-y-2 max-w-xl">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-100 border border-blue-400/30">
            Authenticated as Standard User
          </span>
          <h2 class="text-2xl sm:text-3xl font-bold tracking-tight">Welcome, {{ authStore.user?.fullName }}!</h2>
          <p class="text-blue-100/80 text-sm">
            You are securely authenticated via the Enterprise SSO Service. Use this portal to launch your authorized business applications.
          </p>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- User Info Card -->
        <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h3 class="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-400">Account Details</h3>
          
          <div class="flex items-center space-x-3 pt-2">
            <div class="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-lg">
              {{ (authStore.user?.fullName || authStore.user?.username || 'U').charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="font-bold text-slate-900">{{ authStore.user?.fullName }}</div>
              <div class="text-xs text-slate-400">@{{ authStore.user?.username }}</div>
            </div>
          </div>

          <div class="divide-y divide-slate-100 text-xs pt-2">
            <div class="py-2.5 flex justify-between">
              <span class="text-slate-500">Email</span>
              <span class="font-medium text-slate-800">{{ authStore.user?.email }}</span>
            </div>
            <div class="py-2.5 flex justify-between">
              <span class="text-slate-500">Access Group</span>
              <span class="px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 uppercase font-mono text-[10px]">
                {{ authStore.user?.group || 'user' }}
              </span>
            </div>
            <div class="py-2.5 flex justify-between">
              <span class="text-slate-500">SSO Status</span>
              <span class="inline-flex items-center text-emerald-600 font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                Active
              </span>
            </div>
          </div>
        </div>

        <!-- Available Apps Card -->
        <div class="md:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-900 text-sm uppercase tracking-wider text-slate-400">Authorized Applications</h3>
            <span class="text-xs text-slate-400">Single Sign-On Enabled</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div class="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition bg-slate-50/50 flex items-start space-x-3">
              <div class="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                HR
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-slate-900 text-sm">HRIS Portal</h4>
                <p class="text-xs text-slate-500 mt-0.5">Employee & attendance management system.</p>
                <span class="inline-flex items-center text-[11px] text-blue-600 font-medium mt-2">
                  Launch SSO App →
                </span>
              </div>
            </div>

            <div class="p-4 rounded-xl border border-slate-200/60 bg-slate-50/20 flex items-start space-x-3 opacity-75">
              <div class="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                CRM
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-slate-900 text-sm">Customer Portal</h4>
                <p class="text-xs text-slate-500 mt-0.5">Customer relations and support management.</p>
                <span class="inline-flex items-center text-[11px] text-slate-400 font-medium mt-2">
                  SSO Linked
                </span>
              </div>
            </div>
          </div>

          <!-- Notice about privilege levels -->
          <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-3 mt-4">
            <svg class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>
              <strong>Privilege Notice:</strong> Your account is registered under the <strong>'user'</strong> group. User group accounts are restricted to login and client applications access only. Administrative privileges (user management, app registrations, audit logs) require the <strong>'admin'</strong> group.
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>
