<template>
  <v-app-bar elevation="1" app>
    <v-toolbar-title class="flex-grow-1">
      <span v-if="state.conversation?.client.name">
        {{ state.conversation?.client.name }} &mdash;
      </span>
      <span>{{ formattedClientNumber }}</span>
    </v-toolbar-title>

    <ClientInfoButton
      v-if="state.conversation?.client.id"
      :client-id="state.conversation.client.id"
    />

    <ConversationDownloadButton
      v-if="state.conversation"
      :conversation="state.conversation"
      :messages="state.messages"
    />

    <ConversationLabelButton v-if="state.conversation" :conversation="state.conversation" />
  </v-app-bar>

  <v-main>
    <div :style="mainStyles">
      <v-container class="d-flex flex-column justify-center align-center" ref="messageContainer">
        <div v-if="conversationNotFound">
          The selected conversation was not found, perhaps it was deleted?
        </div>

        <div v-else-if="messagesLoading">
          <v-progress-circular indeterminate color="primary" /> Loading...
        </div>

        <div v-else class="d-flex flex-column flex-grow-1 align-self-stretch messages-container">
          <template v-for="(message, i) in state.messages">
            <div
              v-if="message.id === firstUnreadMessage?.id"
              class="new-messages-indicator"
              data-html2canvas-ignore
            >
              New Messages
            </div>

            <Message :id="'message-' + message.id" :conversation-id="id" :message="message" />
          </template>
        </div>
        <div class="bottom" v-intersect="onBottomIntersect" />
      </v-container>
    </div>
  </v-main>

  <v-footer app elevation="1" location="bottom">
    <MessageInput :conversation="state.conversation" @messageSent="onMessageSent" />
  </v-footer>
</template>

<script setup lang="ts">
import Message from "./Message.vue";
import { Message as MessageType, Direction } from "../../types/messaging";
import { useMessagingStore } from "../../stores/messaging";
import { formatPhoneNumber } from "../../lib/formatters";
import {
  computed,
  reactive,
  ref,
  toRefs,
  watch,
  Ref,
  ComponentPublicInstance,
  nextTick,
  CSSProperties,
} from "vue";
import { useLayout } from "vuetify";
import MessageInput from "./MessageInput.vue";
import ConversationDownloadButton from "./ConversationDownloadButton.vue";
import ClientInfoButton from "./ClientInfoButton.vue";
import ConversationLabelButton from "./ConversationLabelButton.vue";

interface Props {
  id: string;
  messageId?: string;
}

const props = defineProps<Props>();
const { id } = toRefs(props);

const messagingStore = useMessagingStore();
const layout = useLayout();

const mainStyles: Ref<CSSProperties> = computed(() => ({
  height: `calc(100vh - ${layout.mainStyles.value.paddingTop} - ${layout.mainStyles.value.paddingBottom})`,
  overflowY: "auto",
}));

const initialLoad = ref(true);
const bottomVisible = ref(false);
const messageContainer = ref<ComponentPublicInstance | null>(null);
const firstUnreadMessage = ref<MessageType | null>(null);

const state = reactive({
  conversation: messagingStore.getConversation(id.value),
  messages: messagingStore.getMessages(id.value),
});

const messagesLoading = computed(() => state.messages === undefined);

const conversationNotFound = computed(() => state.conversation === null);

const formattedClientNumber = computed(() =>
  formatPhoneNumber(state.conversation?.client?.phoneNumber ?? ""),
);

const lastMessage = computed(() => {
  if (state.messages?.length) {
    return state.messages[state.messages?.length - 1];
  }
  return null;
});

const findFirstUnreadMessage = () => {
  let firstUnread: MessageType | null = null;

  if (state.messages) {
    for (let i = state.messages.length - 1; i >= 0; i--) {
      const message = state.messages[i];

      if (message.direction === Direction.OUT) {
        continue;
      } else if (message.read) {
        break;
      }

      firstUnread = message;
    }
  }

  return firstUnread;
};

const scrollTo = (selector: string) => {
  nextTick(() => {
    const queryResult = messageContainer.value?.$el.querySelector(selector);
    if (queryResult) {
      queryResult.scrollIntoView(true);
    }
  });
};

const scrollToFirstUnreadMessage = () => scrollTo(".new-messages-indicator");

const scrollToBottom = () => scrollTo(".bottom");

const onMessageSent = scrollToBottom;

const onBottomIntersect = (isIntersecting: boolean) => (bottomVisible.value = isIntersecting);

watch(id, () => {
  // @ts-ignore
  state.conversation = messagingStore.getConversation(id.value);
  // @ts-ignore
  state.messages = messagingStore.getMessages(id.value);
  initialLoad.value = true;
});

watch(
  () => state.messages,
  (newValue) => {
    if (newValue && initialLoad.value) {
      firstUnreadMessage.value = findFirstUnreadMessage();
      initialLoad.value = false;

      if (props.messageId) {
        scrollTo(`#message-${props.messageId}`);
      } else if (firstUnreadMessage.value) {
        scrollToFirstUnreadMessage();
      } else {
        scrollToBottom();
      }
    } else if (bottomVisible.value) {
      scrollToBottom();
    }
  },
);
</script>

<style lang="scss" scoped>
.v-container {
  min-height: 100%;
}

.new-messages-indicator {
  display: flex;
  flex-direction: row;

  &:before,
  &:after {
    content: "";
    flex: 1 1;
    border-bottom: 1px solid;
    margin: auto;
  }
  &:before {
    margin-right: 10px;
  }
  &:after {
    margin-left: 10px;
  }
}
</style>
