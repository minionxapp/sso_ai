<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
        <p class="text-sm text-slate-500">SSO System status, user counts, client apps, and recent activities.</p>
      </div>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <router-link to="/admin/users" class="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition">
        <div class="flex items-center justify-between">
          <span class="text-blue-600 font-semibold text-xs uppercase tracking-wider">Total Users</span>
          <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          </div>
        </div>
        <p class="text-3xl font-bold text-slate-900 mt-3">{{ stats.users }}</p>
        <span class="text-xs text-slate-400 mt-1 inline-block">Active accounts in directory</span>
      </router-link>

      <router-link to="/admin/applications" class="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition">
        <div class="flex items-center justify-between">
          <span class="text-indigo-600 font-semibold text-xs uppercase tracking-wider">Connected Apps</span>
          <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
        </div>
        <p class="text-3xl font-bold text-slate-900 mt-3">{{ stats.apps }}</p>
        <span class="text-xs text-slate-400 mt-1 inline-block">OAuth2 / OIDC clients</span>
      </router-link>

      <router-link to="/admin/audit-logs" class="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition">
        <div class="flex items-center justify-between">
          <span class="text-emerald-600 font-semibold text-xs uppercase tracking-wider">Audit Events</span>
          <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
        </div>
        <p class="text-3xl font-bold text-slate-900 mt-3">{{ stats.auditCount }}</p>
        <span class="text-xs text-slate-400 mt-1 inline-block">Recorded security actions</span>
      </router-link>

      <div class="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-amber-600 font-semibold text-xs uppercase tracking-wider">SSO Status</span>
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">Operational</span>
        </div>
        <p class="text-lg font-bold text-slate-900 mt-3">RS256 Enabled</p>
        <span class="text-xs text-slate-400 mt-1 inline-block">PKCE & Multi-Tenant Active</span>
      </div>
    </div>

    <!-- Recent Audit Logs widget -->
    <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-bold text-slate-800">Recent Security & Admin Activities</h3>
        <router-link to="/admin/audit-logs" class="text-xs font-medium text-blue-600 hover:text-blue-800">View all logs →</router-link>
      </div>

      <div v-if="recentLogs.length === 0" class="text-sm text-slate-400 text-center py-6">
        No recent audit events.
      </div>
      <div v-else class="divide-y divide-slate-100 text-sm">
        <div v-for="log in recentLogs" :key="log.id" class="py-3 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <span class="px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 text-slate-700">
              {{ log.action }}
            </span>
            <span class="text-slate-700 text-xs font-medium">
              By {{ log.actor ? log.actor.fullName || log.actor.username : 'System' }}
            </span>
          </div>
          <span class="text-xs text-slate-400 font-mono">{{ new Date(log.createdAt).toLocaleTimeString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../services/api';

const stats = ref({
  users: 0,
  apps: 0,
  auditCount: 0
});

const recentLogs = ref([]);

const fetchOverview = async () => {
  try {
    const [usersRes, appsRes, auditRes] = await Promise.all([
      api.get('/api/users').catch(() => ({ data: { data: [] } })),
      api.get('/api/applications').catch(() => ({ data: { data: [] } })),
      api.get('/api/audit-logs').catch(() => ({ data: { data: [], paging: { total_item: 0 } } }))
    ]);

    stats.value.users = usersRes.data?.paging?.total_item || usersRes.data?.data?.length || 0;
    stats.value.apps = appsRes.data?.data?.length || 0;
    stats.value.auditCount = auditRes.data?.paging?.total_item || auditRes.data?.data?.length || 0;
    recentLogs.value = (auditRes.data?.data || []).slice(0, 5);
  } catch (err) {
    console.error('Failed to load dashboard statistics', err);
  }
};

onMounted(() => {
  fetchOverview();
});
</script>
