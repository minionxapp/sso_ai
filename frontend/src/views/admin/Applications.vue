<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Applications</h2>
        <p class="text-sm text-slate-500">Manage registered OAuth 2.0 & OIDC client applications and their credentials.</p>
      </div>
      <button 
        @click="showCreateModal = true" 
        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all duration-150">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Register Application
      </button>
    </div>

    <!-- Apps List Grid -->
    <div v-if="loading" class="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400">
      Loading applications...
    </div>
    <div v-else-if="apps.length === 0" class="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400">
      <svg class="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
      </svg>
      <p class="font-medium text-slate-600">No applications registered</p>
      <p class="text-sm text-slate-400 mt-1">Register your first OAuth2 client to start authenticating third-party services.</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        v-for="app in apps" 
        :key="app.id" 
        class="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition">
        <div>
          <div class="flex items-start justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                {{ app.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <h3 class="font-bold text-slate-900 text-base">{{ app.name }}</h3>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 mt-0.5">
                  OAuth 2.0 / OIDC
                </span>
              </div>
            </div>
            <button 
              @click="deleteApp(app)" 
              class="text-slate-400 hover:text-rose-600 transition p-1"
              title="Delete application">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
            <button 
              @click="openManageUsers(app)" 
              class="text-slate-400 hover:text-blue-600 transition p-1 ml-2"
              title="Manage Users">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </button>
          </div>

          <p class="text-xs text-slate-500 mt-3">{{ app.description || 'No description provided.' }}</p>

          <div class="mt-4 space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
            <div>
              <span class="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Client ID</span>
              <div class="flex items-center justify-between font-mono text-slate-700 mt-0.5 bg-white px-2 py-1 rounded border border-slate-200">
                <span class="truncate mr-2">{{ app.clientId }}</span>
                <button @click="copyToClipboard(app.clientId)" class="text-blue-600 hover:text-blue-800 font-sans font-medium text-[11px]">Copy</button>
              </div>
            </div>

            <div>
              <span class="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Client Secret</span>
              <div class="flex items-center justify-between font-mono text-slate-700 mt-0.5 bg-white px-2 py-1 rounded border border-slate-200">
                <span class="truncate mr-2">{{ showSecrets[app.id] ? app.clientSecret : '••••••••••••••••••••••••••••••••' }}</span>
                <div class="flex items-center space-x-2 font-sans text-[11px]">
                  <button @click="toggleSecret(app.id)" class="text-slate-600 hover:text-slate-800 font-medium">
                    {{ showSecrets[app.id] ? 'Hide' : 'Show' }}
                  </button>
                  <button @click="copyToClipboard(app.clientSecret)" class="text-blue-600 hover:text-blue-800 font-medium">Copy</button>
                </div>
              </div>
            </div>

            <div class="pt-1">
              <span class="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Redirect URIs</span>
              <div class="mt-1 space-y-1">
                <div v-for="(uri, idx) in app.redirectUris" :key="idx" class="font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px] truncate">
                  {{ uri }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Register App Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-lg text-slate-900">Register Application</h3>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <form @submit.prevent="handleCreateApp" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Application Name</label>
            <input v-model="newApp.name" required class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. Employee Portal" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
            <input v-model="newApp.description" class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Internal staff portal app" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Redirect URIs (comma separated)</label>
            <input v-model="newApp.redirectUris" required class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="http://localhost:8080/callback, https://app.example.com/oauth/callback" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Post-Logout Redirect URIs</label>
            <input v-model="newApp.postLogoutUris" class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="http://localhost:8080/login" />
          </div>
          <div v-if="createError" class="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg">{{ createError }}</div>
          <div class="flex justify-end space-x-2 pt-2">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" :disabled="submitting" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
              {{ submitting ? 'Registering...' : 'Register' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Manage Users Modal -->
    <div v-if="showManageUsersModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-lg text-slate-900">Manage Users for {{ currentManageApp?.name }}</h3>
          <button @click="showManageUsersModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <div class="max-h-96 overflow-y-auto space-y-2">
          <div v-if="appUsers.length === 0" class="text-center text-sm text-slate-500 py-4">No users found.</div>
          <label v-for="u in appUsers" :key="u.id" class="flex items-center p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
            <input type="checkbox" v-model="u.hasAccess" class="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
            <div class="ml-3 flex flex-col">
              <span class="text-sm font-medium text-slate-900">{{ u.fullName }} ({{ u.username }})</span>
              <span class="text-xs text-slate-500">{{ u.email }}</span>
            </div>
          </label>
        </div>
        <div class="flex justify-end space-x-2 pt-2 border-t mt-4">
          <button type="button" @click="showManageUsersModal = false" class="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="button" @click="saveManageUsers" :disabled="savingUsers" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
            {{ savingUsers ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../services/api';

const apps = ref([]);
const loading = ref(false);
const showCreateModal = ref(false);
const showManageUsersModal = ref(false);
const currentManageApp = ref(null);
const appUsers = ref([]);
const savingUsers = ref(false);
const submitting = ref(false);
const createError = ref('');
const showSecrets = ref({});

const newApp = ref({
  name: '',
  description: '',
  redirectUris: '',
  postLogoutUris: ''
});

const fetchApps = async () => {
  loading.value = true;
  try {
    const response = await api.get('/api/applications');
    apps.value = response.data.data || [];
  } catch (err) {
    console.error('Failed to load apps', err);
  } finally {
    loading.value = false;
  }
};

const toggleSecret = (appId) => {
  showSecrets.value[appId] = !showSecrets.value[appId];
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  alert('Copied to clipboard!');
};

const handleCreateApp = async () => {
  submitting.value = true;
  createError.value = '';
  try {
    const redirectUrisArr = newApp.value.redirectUris
      .split(',')
      .map(u => u.trim())
      .filter(u => u.length > 0);

    const postLogoutUrisArr = newApp.value.postLogoutUris
      ? newApp.value.postLogoutUris.split(',').map(u => u.trim()).filter(u => u.length > 0)
      : [];

    await api.post('/api/applications', {
      name: newApp.value.name,
      description: newApp.value.description,
      redirectUris: redirectUrisArr,
      postLogoutUris: postLogoutUrisArr
    });

    showCreateModal.value = false;
    newApp.value = { name: '', description: '', redirectUris: '', postLogoutUris: '' };
    await fetchApps();
  } catch (err) {
    createError.value = err.response?.data?.errors || 'Failed to register application';
  } finally {
    submitting.value = false;
  }
};

const deleteApp = async (app) => {
  if (confirm(`Are you sure you want to delete application "${app.name}"?`)) {
    try {
      await api.delete(`/api/applications/${app.id}`);
      await fetchApps();
    } catch (err) {
      alert('Failed to delete application');
    }
  }
};

const openManageUsers = async (app) => {
  currentManageApp.value = app;
  showManageUsersModal.value = true;
  appUsers.value = [];
  try {
    const response = await api.get(`/api/applications/${app.id}/users`);
    appUsers.value = response.data.data;
  } catch (err) {
    alert('Failed to fetch users');
  }
};

const saveManageUsers = async () => {
  savingUsers.value = true;
  try {
    const userIds = appUsers.value.filter(u => u.hasAccess).map(u => u.id);
    await api.post(`/api/applications/${currentManageApp.value.id}/users`, { userIds });
    showManageUsersModal.value = false;
  } catch (err) {
    alert('Failed to save users');
  } finally {
    savingUsers.value = false;
  }
};

onMounted(() => {
  fetchApps();
});
</script>
