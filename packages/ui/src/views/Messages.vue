<template>
  <v-navigation-drawer permanent width="240" app>
    <ConversationList />
  </v-navigation-drawer>
  <router-view />
</template>

<script setup lang="ts">
import ConversationList from "../components/messages/ConversationList.vue";
</script>
