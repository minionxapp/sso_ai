<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">User Management</h2>
        <p class="text-sm text-slate-500">Manage user accounts, roles/groups, and permissions within the SSO identity directory.</p>
      </div>
      <button 
        @click="showCreateModal = true" 
        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all duration-150">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Add New User
      </button>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="relative w-full sm:w-80">
        <input 
          v-model="searchQuery" 
          @input="fetchUsers"
          type="text" 
          placeholder="Search by name or email..." 
          class="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
        />
        <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      <span class="text-xs text-slate-500">Total Users: <strong class="text-slate-700 font-semibold">{{ users.length }}</strong></span>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-slate-400">
        Loading users...
      </div>
      <div v-else-if="users.length === 0" class="p-12 text-center text-slate-400">
        <svg class="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        <p class="font-medium text-slate-600">No users found</p>
        <p class="text-sm text-slate-400 mt-1">Try a different search keyword or create a new user.</p>
      </div>
      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider font-semibold text-slate-500">
            <th class="py-3 px-6">User</th>
            <th class="py-3 px-6">Email</th>
            <th class="py-3 px-6">Group / Privileges</th>
            <th class="py-3 px-6">Status</th>
            <th class="py-3 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-sm">
          <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50/60 transition">
            <td class="py-4 px-6 flex items-center space-x-3">
              <div 
                :class="user.group === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
                class="w-9 h-9 rounded-full font-bold flex items-center justify-center text-sm shrink-0">
                {{ user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase() }}
              </div>
              <div>
                <div class="font-medium text-slate-900">{{ user.fullName }}</div>
                <div class="text-xs text-slate-400">@{{ user.username }}</div>
              </div>
            </td>
            <td class="py-4 px-6 text-slate-600 font-mono text-xs">{{ user.email }}</td>
            <td class="py-4 px-6">
              <span 
                v-if="user.group === 'admin'"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                <svg class="w-3 h-3 mr-1 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                Admin (Full Access)
              </span>
              <span 
                v-else
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                User (Login only)
              </span>
            </td>
            <td class="py-4 px-6">
              <span 
                :class="user.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border">
                <span :class="user.isActive ? 'bg-emerald-500' : 'bg-rose-500'" class="w-1.5 h-1.5 rounded-full mr-1.5"></span>
                {{ user.isActive ? 'Active' : 'Disabled' }}
              </span>
            </td>
            <td class="py-4 px-6 text-right space-x-2">
              <button 
                @click="toggleStatus(user)" 
                :title="user.isActive ? 'Disable User' : 'Enable User'"
                class="px-2.5 py-1 text-xs font-medium rounded border border-slate-200 hover:bg-slate-100 text-slate-700 transition">
                {{ user.isActive ? 'Disable' : 'Enable' }}
              </button>
              <button 
                @click="openResetPassword(user)" 
                class="px-2.5 py-1 text-xs font-medium rounded border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 transition">
                Reset Pass
              </button>
              <button 
                @click="deleteUser(user)" 
                class="px-2.5 py-1 text-xs font-medium rounded border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create User Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-lg text-slate-900">Create New User</h3>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <form @submit.prevent="handleCreateUser" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name</label>
            <input v-model="newUser.fullName" required class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. John Doe" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Username</label>
            <input v-model="newUser.username" required class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. jdoe" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
            <input v-model="newUser.email" type="email" required class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. jdoe@example.com" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Group / Privilege Level</label>
            <select v-model="newUser.group" required class="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="user">User (Standard - Login only)</option>
              <option value="admin">Admin (Full administrative privileges)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Initial Password (min 8 chars)</label>
            <input v-model="newUser.password" type="password" required minlength="8" class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="••••••••" />
          </div>
          <div v-if="createError" class="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg">{{ createError }}</div>
          <div class="flex justify-end space-x-2 pt-2">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" :disabled="submitting" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
              {{ submitting ? 'Creating...' : 'Create User' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Reset Password Modal -->
    <div v-if="showResetModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-lg text-slate-900">Reset Password for @{{ targetUser?.username }}</h3>
          <button @click="showResetModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <form @submit.prevent="handleResetPassword" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">New Password (min 8 chars)</label>
            <input v-model="newPassword" type="password" required minlength="8" class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="••••••••" />
          </div>
          <div v-if="resetSuccess" class="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg">{{ resetSuccess }}</div>
          <div v-if="resetError" class="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg">{{ resetError }}</div>
          <div class="flex justify-end space-x-2 pt-2">
            <button type="button" @click="showResetModal = false" class="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50">Close</button>
            <button type="submit" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg">Update Password</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../services/api';

const users = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const showCreateModal = ref(false);
const showResetModal = ref(false);
const submitting = ref(false);
const createError = ref('');

const newUser = ref({
  fullName: '',
  username: '',
  email: '',
  group: 'user',
  password: ''
});

const targetUser = ref(null);
const newPassword = ref('');
const resetSuccess = ref('');
const resetError = ref('');

const fetchUsers = async () => {
  loading.value = true;
  try {
    const params = {};
    if (searchQuery.value) {
      params.name = searchQuery.value;
    }
    const response = await api.get('/api/users', { params });
    users.value = response.data.data || [];
  } catch (err) {
    console.error('Failed to load users', err);
  } finally {
    loading.value = false;
  }
};

const handleCreateUser = async () => {
  submitting.value = true;
  createError.value = '';
  try {
    await api.post('/api/users', newUser.value);
    showCreateModal.value = false;
    newUser.value = { fullName: '', username: '', email: '', group: 'user', password: '' };
    await fetchUsers();
  } catch (err) {
    createError.value = err.response?.data?.errors || 'Failed to create user';
  } finally {
    submitting.value = false;
  }
};

const toggleStatus = async (user) => {
  try {
    await api.patch(`/api/users/${user.id}/status`, { isActive: !user.isActive });
    user.isActive = !user.isActive;
  } catch (err) {
    alert('Failed to update user status');
  }
};

const openResetPassword = (user) => {
  targetUser.value = user;
  newPassword.value = '';
  resetSuccess.value = '';
  resetError.value = '';
  showResetModal.value = true;
};

const handleResetPassword = async () => {
  resetSuccess.value = '';
  resetError.value = '';
  try {
    await api.post(`/api/users/${targetUser.value.id}/reset-password`, { newPassword: newPassword.value });
    resetSuccess.value = 'Password reset successfully!';
    setTimeout(() => {
      showResetModal.value = false;
    }, 1200);
  } catch (err) {
    resetError.value = err.response?.data?.errors || 'Failed to reset password';
  }
};

const deleteUser = async (user) => {
  if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
    try {
      await api.delete(`/api/users/${user.id}`);
      await fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
    }
  }
};

onMounted(() => {
  fetchUsers();
});
</script>
