<template>
  <div class="conversation-pdf ma-3">
    <div class="d-flex flex-row">
      <span v-if="conversation.client.name" class="mr-2">
        {{ conversation.client.name }} &mdash;
      </span>
      <span>{{ formattedClientNumber }}</span>
    </div>

    <v-divider />

    <div class="mt-2">
      <Message v-for="message in messages" :conversationId="conversation.id" :message="message" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from "vue";
import type { Conversation, Message as MessageType } from "../../types/messaging";
import Message from "./Message.vue";
import { formatPhoneNumber } from "../../lib/formatters";

interface Props {
  conversation: Conversation;
  messages: MessageType[];
}

const props = defineProps<Props>();
const { conversation, messages } = toRefs(props);

const formattedClientNumber = computed(() =>
  formatPhoneNumber(conversation.value.client.phoneNumber),
);
</script>

<style lang="scss" scoped></style>
