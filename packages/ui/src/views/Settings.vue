<template>
  <v-main>
    <v-container fluid>
      <GoToConnectSettings />
      <RhapsodySettings />
      <LabelSettings />
      <SearchSettings />
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import GoToConnectSettings from "../components/settings/GoToConnectSettings.vue";
import RhapsodySettings from "../components/settings/RhapsodySettings.vue";
import SearchSettings from "../components/settings/SearchSettings.vue";
import LabelSettings from "../components/settings/LabelSettings.vue";
</script>
