<template>
  <v-navigation-drawer permanent width="240" app elevation="2">
    <ConversationList />
  </v-navigation-drawer>
  <router-view />
</template>

<script setup lang="ts">
import { useMessagingStore } from "../stores/messaging";
import { ref, toRefs, watch } from "vue";
import ConversationList from "../components/messages/ConversationList.vue";
import { useSearchParameters } from "../composables/search";

const messagingStore = useMessagingStore();

const searchParameters = useSearchParameters();

watch(
  searchParameters,
  () => {
    messagingStore.updateFilter(searchParameters.value);
  },
  { immediate: true },
);
</script>
