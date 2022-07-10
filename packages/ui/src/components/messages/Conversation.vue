<template>
  <v-app-bar elevation="1" app>
    <v-toolbar-title>{{ state.conversation?.client.name }}</v-toolbar-title>
    <v-spacer />
    <v-menu location="bottom center">
      <template #activator="{ props }">
        <v-btn v-bind="props" icon="mdi-dots-vertical" :disabled="!state.conversation" />
      </template>
      <v-list>
        <v-list-item>Download PDF</v-list-item>
      </v-list>
    </v-menu>
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
        <div v-else class="d-flex flex-column flex-grow-1 align-self-stretch">
          <template v-for="(message, i) in state.messages">
            <div v-if="message.id === firstUnreadMessage?.id" class="new-messages-indicator">
              New Messages
            </div>
            <Message :conversation-id="id" :message="message" />
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
import { useMessagingStore, Message as MessageType, Direction } from "../../stores/messaging";
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

interface Props {
  id: string;
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
const messageContainer: Ref<ComponentPublicInstance | null> = ref(null);
const firstUnreadMessage: Ref<MessageType | null> = ref(null);

const state = reactive({
  conversation: messagingStore.getConversation(id.value),
  messages: messagingStore.getMessages(id.value),
});

const messagesLoading = computed(() => state.messages === undefined);

const conversationNotFound = computed(() => state.conversation === null);

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

      if (firstUnreadMessage.value) {
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
