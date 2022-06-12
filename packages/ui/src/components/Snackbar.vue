<template>
  <v-snackbar v-model="snackbarStore.showing">
    {{ snackbarStore.message }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { useSnackbarStore } from "../stores/snackbar";

const snackbarStore = useSnackbarStore();
</script>
