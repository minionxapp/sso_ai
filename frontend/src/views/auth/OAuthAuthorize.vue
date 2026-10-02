<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
      <div v-if="loading" class="text-center text-slate-500">
        <svg class="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p>Authenticating and preparing authorization...</p>
      </div>
      <div v-else-if="error" class="text-center">
        <div class="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-slate-900">Authorization Failed</h3>
        <p class="text-slate-500 text-sm mt-2">{{ error }}</p>
        <div class="mt-6 space-y-3">
          <button @click="goBack" class="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition">
            Return to Application
          </button>
          <button @click="loginDifferentAccount" class="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-xs">
            Login with Different Account
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  // If prompt=login is requested, clear existing SSO session to force credential input
  if (route.query.prompt === 'login') {
    authStore.logout();
    const cleanPath = route.fullPath.replace(/([?&])prompt=login(&|$)/, '$1').replace(/[?&]$/, '');
    router.push({ name: 'Login', query: { returnTo: cleanPath } });
    return;
  }

  // If not logged in, redirect to login with current path as returnTo
  if (!authStore.token) {
    router.push({ name: 'Login', query: { returnTo: route.fullPath } });
    return;
  }

  // Proceed with authorization approval
  try {
    const payload = {
      client_id: route.query.client_id,
      redirect_uri: route.query.redirect_uri,
      response_type: route.query.response_type,
      scope: route.query.scope,
      state: route.query.state,
      code_challenge: route.query.code_challenge,
      code_challenge_method: route.query.code_challenge_method
    };

    const response = await api.post('/api/oauth/authorize', payload);
    
    // Redirect to the client application
    if (response.data.redirect_uri) {
      window.location.href = response.data.redirect_uri;
    } else {
      error.value = "Failed to get redirect URI from server.";
      loading.value = false;
    }
  } catch (err) {
    error.value = err.response?.data?.errors || err.message || "An error occurred during authorization.";
    loading.value = false;
  }
});

const goBack = () => {
  authStore.logout();
  if (route.query.redirect_uri) {
    window.location.href = `${route.query.redirect_uri}?error=access_denied`;
  } else {
    router.push('/login');
  }
};

const loginDifferentAccount = () => {
  authStore.logout();
  router.push({ name: 'Login', query: { returnTo: route.fullPath } });
};
</script>
