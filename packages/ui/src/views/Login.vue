<template>
  <v-main>
    <v-container fluid>
      <v-row>
        <v-col>
          <v-card class="mx-auto" max-width="344" variant="outlined">
            <v-card-text
              >This site requires authentication. Please click Log In to to proceed.</v-card-text
            >
            <v-card-actions>
              <v-btn :loading="authenticating" @click="authenticate">Log In</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { ref, Ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const authenticating = ref(false);
const error: Ref<string | null> = ref(null);
const authStore = useAuthStore();
const router = useRouter();

async function authenticate() {
  try {
    authenticating.value = true;
    const user = await authStore.authenticate();
    if (user) {
      router.replace("/");
    } else {
      error.value = "Authentication failed";
    }
  } catch (err) {
    error.value = (err as Error).message;
  }
}
</script>
