<template>
  <v-list-item lines="two" :to="messageRoute">
    <v-list-item-header class="mr-3">
      <v-list-item-title>{{ displayName }}</v-list-item-title>
      <v-list-item-subtitle>
        <span v-if="props.conversation.latestMessage">{{
          props.conversation.latestMessage?.body
        }}</span>
        <span v-else class="empty-messages">No messages</span>
      </v-list-item-subtitle>
    </v-list-item-header>
    <v-list-item-avatar end>
      <UnreadIndicator v-if="props.conversation.unreadCount" />
    </v-list-item-avatar>
  </v-list-item>
</template>

<script lang="ts" setup>
import { Conversation } from "../../stores/messaging";
import { computed } from "vue";
import { formatPhoneNumber } from "../../lib/formatters";
import UnreadIndicator from "./UnreadIndicator.vue";

interface Props {
  conversation: Conversation;
}

const props = defineProps<Props>();
const messageRoute = computed(() => `/messages/${props.conversation.id}`);
const displayName = computed(() => {
  return props.conversation.client.name || formatPhoneNumber(props.conversation.client.phoneNumber);
});
</script>

<style lang="scss" scoped>
.empty-messages {
  font-style: italic;
}
</style>
