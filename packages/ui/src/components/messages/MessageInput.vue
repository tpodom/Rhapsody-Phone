<template>
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
    :counter="MAX_MESSAGE_LENGTH"
    v-model="messageToSend"
  >
    <template #append-inner>
      <v-menu :close-on-content-click="false" location="top" v-model="emojiPickerMenu">
        <template #activator="{ props }">
          <v-icon icon="mdi-emoticon-outline" v-bind="props" />
        </template>
        <VuemojiPicker :is-dark="theme.global.current.value.dark" @emojiClick="onSelectEmoji" />
      </v-menu> </template
  ></v-textarea>
  <v-btn icon="mdi-send" :disabled="!messageValid" :loading="sending" @click="sendMessage" />
</template>

<script lang="ts" setup>
import type { Conversation, Message } from "../../types/messaging";
import { useMessagingStore } from "../../stores/messaging";
import { computed, ref, toRefs } from "vue";
import { useTheme } from "vuetify";
import { VuemojiPicker, EmojiClickEventDetail } from "vuemoji-picker";

const MAX_MESSAGE_LENGTH = 1000;

interface Props {
  conversation: Conversation | null | undefined;
}

interface Emits {
  (eventName: "message-sent", message: Message): void;
}

const emit = defineEmits<Emits>();
const props = defineProps<Props>();
const { conversation } = toRefs(props);

const theme = useTheme();
const messagingStore = useMessagingStore();

const messageToSend = ref("");
const emojiPickerMenu = ref(false);
const sending = ref(false);

const messageValid = computed(
  () => messageToSend.value?.length > 0 && messageToSend.value?.length < MAX_MESSAGE_LENGTH,
);

const onSelectEmoji = (emoji: EmojiClickEventDetail) => {
  messageToSend.value += emoji.unicode;
  emojiPickerMenu.value = false;
};

const sendMessage = async () => {
  try {
    sending.value = true;

    if (conversation.value) {
      const result = await messagingStore.sendMessage(
        conversation.value.id,
        messageToSend.value,
        [],
      );

      emit("message-sent", result);
    }

    messageToSend.value = "";
  } catch (error) {
    // TODO display error
  } finally {
    sending.value = false;
  }
};
</script>
