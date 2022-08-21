<template>
  <v-main>
    <v-container fluid>
      <div v-if="loading"><v-progress-circular indeterminate color="primary" /> Connecting...</div>
      <div v-else-if="error">{{ error }}</div>
      <div v-else>Successfully connected to GoTo Connect. You may safely close this window.</div>
    </v-container>
  </v-main>
</template>
<script setup lang="ts">
import { ref, Ref } from "vue";
import { useSettingsStore } from "../stores/settings";

interface Props {
  code: string;
  state: string;
  [index: string]: string;
}

const props = defineProps<Props>();

const loading = ref(true);
const error: Ref<string | null> = ref(null);
const settingsStore = useSettingsStore();

async function executeAuthCallback() {
  try {
    await settingsStore.goToConnectAuthCallback(props.code, props.state);
    loading.value = false;
    setTimeout(window.close, 200);
  } catch (err) {
    error.value = (err as Error).message;
    loading.value = false;
  }
}

for (const prop of ["state", "code"]) {
  if (!props[prop]) {
    error.value = `The authentication redirect was unsuccessful, no ${prop} response was provided.`;
    loading.value = false;
  }
}

if (!error.value) {
  executeAuthCallback();
}
</script>
