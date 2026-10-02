<template>
  <div class="min-h-screen bg-slate-50">
    <nav class="bg-white border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <span class="text-xl font-bold text-blue-600">Client App</span>
            </div>
          </div>
          <div class="flex items-center">
            <button @click="logout" class="text-sm font-medium text-slate-500 hover:text-slate-700">Sign out</button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8">
      <div v-if="loading" class="text-center py-10 text-slate-500">
        Loading profile...
      </div>
      <div v-else-if="error" class="bg-rose-50 text-rose-700 p-4 rounded-lg">
        {{ error }}
      </div>
      <div v-else-if="user" class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 class="text-lg leading-6 font-medium text-slate-900">User Profile</h3>
            <p class="mt-1 max-w-2xl text-sm text-slate-500">Information retrieved from Central SSO.</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
            {{ user.name?.charAt(0)?.toUpperCase() || 'U' }}
          </div>
        </div>
        <div class="border-t border-slate-200">
          <dl>
            <div class="bg-slate-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-slate-500">Full name</dt>
              <dd class="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{{ user.name }}</dd>
            </div>
            <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-slate-100">
              <dt class="text-sm font-medium text-slate-500">Email address</dt>
              <dd class="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{{ user.email }}</dd>
            </div>
            <div class="bg-slate-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-slate-100">
              <dt class="text-sm font-medium text-slate-500">Username / Preferred ID</dt>
              <dd class="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{{ user.preferred_username }}</dd>
            </div>
            <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-slate-100">
              <dt class="text-sm font-medium text-slate-500">Subject (ID)</dt>
              <dd class="mt-1 text-sm font-mono text-slate-900 sm:mt-0 sm:col-span-2">{{ user.sub }}</dd>
            </div>
            <div class="bg-slate-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-slate-100">
              <dt class="text-sm font-medium text-slate-500">Group / Role</dt>
              <dd class="mt-1 text-sm font-mono text-slate-900 sm:mt-0 sm:col-span-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ user.group || 'user' }}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const user = ref(null);
const loading = ref(true);
const error = ref('');
const router = useRouter();

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:4000/api/user', {
      withCredentials: true
    });
    user.value = response.data;
  } catch (err) {
    if (err.response?.status === 401) {
      router.push('/login');
    } else {
      error.value = 'Failed to load profile from backend';
    }
  } finally {
    loading.value = false;
  }
});

const logout = async () => {
  try {
    await axios.post('http://localhost:4000/api/logout', {}, { withCredentials: true });
  } catch (err) {
    console.error('Logout failed', err);
  } finally {
    // Terminate Central SSO session and return to client login
    window.location.href = 'http://localhost:5173/logout?redirect_uri=' + encodeURIComponent('http://localhost:5174/login');
  }
};
</script>
