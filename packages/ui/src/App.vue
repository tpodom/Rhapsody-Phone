<template>
  <v-app>
    <v-app-bar color="primary">Rhapsody Connect - Call Queue</v-app-bar>
    <v-main>
      <v-container fluid>
        <div v-if="loading"><v-progress-circular indeterminate color="primary" /> Loading...</div>

        <router-view v-else />
        <Snackbar />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import Snackbar from "./components/Snackbar.vue";

import { useAuthStore } from "./stores/auth";
import { ref, watchEffect } from "vue";

const loading = ref(true);
const authStore = useAuthStore();

watchEffect(() => (loading.value = !authStore.initialized));
</script>
