<template>
  <div v-if="messagingStore.loading" class="pa-3">
    <v-progress-circular indeterminate color="primary" /> Loading...
  </div>
  <div v-else class="d-flex flex-column fill-height">
    <v-btn rounded class="mt-3 ml-3 mr-3 mb-1 align-self-start" color="primary">
      <v-icon icon="mdi-message-outline" /> New Chat
    </v-btn>
    <div
      v-if="!messagingStore.conversations?.length"
      class="d-flex flex-grow-1 justify-center ma-3"
    >
      <div>No conversations found. Use New Chat to start one.</div>
    </div>
    <v-list two-lines>
      <template v-for="conversation in messagingStore.conversations">
        <ConversationListItem :conversation="conversation" />
        <v-divider />
      </template>
    </v-list>
  </div>
</template>

<script setup lang="ts">
import { useMessagingStore } from "../../stores/messaging";
import ConversationListItem from "./ConversationListItem.vue";

const messagingStore = useMessagingStore();
</script>
