<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Audit Logs</h2>
        <p class="text-sm text-slate-500">Immutable record of security events, administrative changes, and user activities.</p>
      </div>
      <button 
        @click="fetchLogs" 
        class="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        Refresh Logs
      </button>
    </div>

    <!-- Filter -->
    <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
      <div class="relative w-full sm:w-80">
        <input 
          v-model="actionFilter" 
          @input="fetchLogs"
          type="text" 
          placeholder="Filter by action (e.g. USER, LOGIN)..." 
          class="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
        />
        <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      <span class="text-xs text-slate-500">Showing <strong class="text-slate-700 font-semibold">{{ logs.length }}</strong> events</span>
    </div>

    <!-- Logs Table -->
    <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-slate-400">
        Loading audit logs...
      </div>
      <div v-else-if="logs.length === 0" class="p-12 text-center text-slate-400">
        <svg class="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p class="font-medium text-slate-600">No audit events found</p>
        <p class="text-sm text-slate-400 mt-1">Activities such as user management, login attempts, and client app creations will appear here.</p>
      </div>
      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider font-semibold text-slate-500">
            <th class="py-3 px-6">Timestamp</th>
            <th class="py-3 px-6">Action</th>
            <th class="py-3 px-6">Actor</th>
            <th class="py-3 px-6">Target</th>
            <th class="py-3 px-6 text-right">Details</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-sm">
          <tr v-for="log in logs" :key="log.id" class="hover:bg-slate-50/60 transition">
            <td class="py-4 px-6 text-xs font-mono text-slate-500 whitespace-nowrap">
              {{ formatDate(log.createdAt) }}
            </td>
            <td class="py-4 px-6">
              <span 
                :class="getActionBadgeClass(log.action)"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border">
                {{ log.action }}
              </span>
            </td>
            <td class="py-4 px-6 text-slate-700">
              <div v-if="log.actor" class="flex items-center space-x-2">
                <span class="font-medium text-slate-900">{{ log.actor.fullName || log.actor.username }}</span>
                <span class="text-xs text-slate-400">(@{{ log.actor.username }})</span>
              </div>
              <span v-else class="text-xs text-slate-400 italic">System / Anonymous</span>
            </td>
            <td class="py-4 px-6 text-slate-600 font-mono text-xs">
              <span v-if="log.targetType" class="text-slate-800 font-semibold">{{ log.targetType }}</span>
              <span v-if="log.targetId" class="text-slate-400 ml-1 truncate max-w-[120px] inline-block align-bottom" :title="log.targetId">#{{ log.targetId.slice(0, 8) }}...</span>
              <span v-if="!log.targetType && !log.targetId" class="text-slate-400">-</span>
            </td>
            <td class="py-4 px-6 text-right">
              <button 
                v-if="log.metadata"
                @click="openMetadata(log)"
                class="text-xs text-blue-600 hover:text-blue-800 font-medium">
                View Meta
              </button>
              <span v-else class="text-xs text-slate-400">-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Metadata Modal -->
    <div v-if="selectedMeta" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-lg text-slate-900">Event Metadata</h3>
          <button @click="selectedMeta = null" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <div class="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-auto max-h-72">
          <pre>{{ selectedMeta }}</pre>
        </div>
        <div class="flex justify-end pt-2">
          <button @click="selectedMeta = null" class="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../services/api';

const logs = ref([]);
const loading = ref(false);
const actionFilter = ref('');
const selectedMeta = ref(null);

const fetchLogs = async () => {
  loading.value = true;
  try {
    const params = {};
    if (actionFilter.value) {
      params.action = actionFilter.value;
    }
    const response = await api.get('/api/audit-logs', { params });
    logs.value = response.data.data || [];
  } catch (err) {
    console.error('Failed to load audit logs', err);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const getActionBadgeClass = (action = '') => {
  if (action.includes('CREATE')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (action.includes('DELETE')) return 'bg-rose-50 text-rose-700 border-rose-200';
  if (action.includes('UPDATE') || action.includes('RESET')) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (action.includes('LOGIN')) return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
};

const openMetadata = (log) => {
  try {
    selectedMeta.value = JSON.stringify(JSON.parse(log.metadata), null, 2);
  } catch (e) {
    selectedMeta.value = log.metadata;
  }
};

onMounted(() => {
  fetchLogs();
});
</script>
