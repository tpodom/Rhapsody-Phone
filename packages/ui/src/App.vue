<template>
  <v-app>
    <v-app-bar color="primary"></v-app-bar>
    <v-main>
      <v-container fluid>
        <div v-if="loading">
          <v-progress-circular indeterminate color="primary" /> Loading...
          {{ loading }}
        </div>

        <router-view v-else />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import CallList from "./components/CallList.vue";
import { useAuthStore } from "./stores/auth";
import { ref, watchEffect } from "vue";

const loading = ref(true);
const authStore = useAuthStore();

watchEffect(() => (loading.value = !authStore.initialized));
</script>
