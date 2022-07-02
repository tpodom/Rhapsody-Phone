<template>
  <v-app-bar elevation="1" app>
    <v-toolbar-title>{{ conversation?.client.name }}</v-toolbar-title>
    <v-spacer />
    <v-menu>
      <template #activator="{ props }">
        <v-btn v-bind="props" icon="mdi-dots-vertical" :disabled="!conversation" />
      </template>
      <v-list>
        <v-list-item>Download PDF</v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>

  <v-main class="d-flex flex-grow-1">
    <v-container class="d-flex flex-grow-1 flex-column justify-center align-center">
      <div v-if="conversationNotFound">
        The selected conversation was not found, perhaps it was deleted?
      </div>
      <div v-else-if="messagesLoading">
        <v-progress-circular indeterminate color="primary" /> Loading...
      </div>
      <div v-else class="d-flex flex-column flex-grow-1 align-self-stretch">
        <Message v-for="message in messages" :message="message" />
      </div>
    </v-container>
  </v-main>

  <v-footer app elevation="1">
    <v-textarea
      auto-grow
      class="flex-grow-1 mr-3"
      rows="1"
      hide-details
      placeholder="Type a message to send here..."
      label=""
      :disabled="!conversation"
      density="compact"
      variant="outlined"
    >
      <template #appendInner>
        <v-menu
          :close-on-content-click="false"
          location="start"
          offset="-800"
          v-model="emojiPickerMenu"
        >
          <template #activator="{ props }">
            <v-icon icon="mdi-emoticon-outline" v-bind="props" />
          </template>
          <EmojiPicker />
        </v-menu> </template
    ></v-textarea>
    <v-btn icon="mdi-send" :disabled="!messageValid" />
  </v-footer>
</template>

<script setup lang="ts">
import Message from "./Message.vue";
import { useMessagingStore, Message as MessageType } from "../../stores/messaging";
import { computed, ref, watchEffect, Ref } from "vue";
import EmojiPicker from "vue3-emoji-picker";
import "../../../../../node_modules/vue3-emoji-picker/dist/style.css";

interface Props {
  id: string;
}

const props = defineProps<Props>();

const messagingStore = useMessagingStore();
const messageValid = ref(false);
const conversation = messagingStore.loadConversation(props.id);
const emojiPickerMenu = ref(false);
const messages: Ref<MessageType[] | undefined> = ref([]);
const messagesLoading = ref(true);
let messagesRef: Ref<MessageType[] | undefined> | undefined = undefined;

const conversationNotFound = computed(() => conversation.value === null);

watchEffect(() => {
  if (conversation.value?.id) {
    messagesRef = messagesRef || messagingStore.loadMessages(conversation.value.id);
    messages.value = messagesRef.value;
    messagesLoading.value = messagesRef.value === undefined;
  } else {
    messages.value = [];
  }
});
</script>

<style lang="scss" scoped>
.v-main {
  min-height: 100vh;
}

.v-container {
  height: 100%;
}
</style>
