<template>
  <v-app>
    <v-navigation-drawer app permanent elevation="3" width="80">
      <v-list>
        <v-list-item to="/calls">
          <div class="d-flex flex-column align-center flex-grow-1">
            <v-icon icon="mdi-phone" /><span class="subheading">Calls</span>
          </div>
        </v-list-item>

        <v-list-item to="/messages" :active="messagesLink.isActive.value">
          <div class="d-flex flex-column align-center flex-grow-1">
            <v-icon icon="mdi-message-outline" /><span class="subheading">Chat</span>
          </div>
        </v-list-item>

        <v-list-item to="/settings">
          <div class="d-flex flex-column align-center flex-grow-1">
            <v-icon icon="mdi-cog" /><span class="subheading">Settings</span>
          </div>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <NavBar />

    <Loading v-if="loading"></Loading>

    <router-view v-else />

    <Snackbar />
  </v-app>
</template>

<script setup lang="ts">
import Snackbar from "./components/Snackbar.vue";
import Loading from "./views/Loading.vue";
import NavBar from "./components/NavBar.vue";

import { useAuthStore } from "./stores/auth";
import { ref, watchEffect } from "vue";
import { RouterLink } from "vue-router";

const loading = ref(true);
const authStore = useAuthStore();
const messagesLink = RouterLink.useLink({
  to: "/messages",
});

watchEffect(() => (loading.value = !authStore.initialized));
</script>

<style lang="scss" scoped>
.subheading {
  font-size: 0.75rem;
  text-align: center;
}
</style>
