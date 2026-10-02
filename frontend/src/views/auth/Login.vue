<template>
  <div>
    <div class="text-center">
      <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Portal SSO</h2>
      <p class="mt-2 text-sm text-gray-600">Sign in to your account</p>
    </div>
    <form class="mt-8 space-y-6" @submit.prevent="submitLogin">
      <div class="rounded-md shadow-sm -space-y-px">
        <div>
          <label for="username" class="sr-only">Username</label>
          <input id="username" v-model="username" name="username" type="text" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Username">
        </div>
        <div>
          <label for="password" class="sr-only">Password</label>
          <input id="password" v-model="password" name="password" type="password" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Password">
        </div>
      </div>

      <div class="flex items-center justify-between">
        <div class="text-sm">
          <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
            Forgot your password?
          </a>
        </div>
      </div>

      <div>
        <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Sign in
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../store/authStore';
import { useRouter, useRoute } from 'vue-router';

const username = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const submitLogin = async () => {
  try {
    const user = await authStore.login(username.value, password.value);
    
    if (route.query.returnTo) {
      router.push(route.query.returnTo);
    } else if (user && user.group === 'admin') {
      router.push('/admin');
    } else {
      router.push('/portal');
    }
  } catch (err) {
    alert(err.response?.data?.errors || "Login failed. Please check your username and password.");
  }
};
</script>
