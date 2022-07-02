<template>
  <v-list-item lines="two" :to="messageRoute">
    <v-list-item-header class="mr-3">
      <v-list-item-title>{{ props.conversation.client.name }}</v-list-item-title>
      <v-list-item-subtitle>{{ props.conversation.latestMessage?.body }}</v-list-item-subtitle>
    </v-list-item-header>
    <v-list-item-avatar end>
      <div v-if="props.conversation.unreadCount" class="unread-indicator"></div>
    </v-list-item-avatar>
  </v-list-item>
</template>

<script lang="ts" setup>
import { Conversation } from "../../stores/messaging";
import { computed } from "vue";

interface Props {
  conversation: Conversation;
}

const props = defineProps<Props>();
const messageRoute = computed(() => `/messages/${props.conversation.id}`);
</script>

<style lang="scss" scoped>
.unread-indicator {
  background-color: orange;
  border-radius: 50%;
  width: 12px;
  height: 12px;
}
</style>
