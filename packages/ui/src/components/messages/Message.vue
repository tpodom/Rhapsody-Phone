<template>
  <div class="message-wrapper mb-2 d-flex flex-column" :class="classes">
    <div class="d-flex align-center">
      <div class="message pa-3">{{ props.message.body }}</div>
      <div v-if="sending" class="ml-3"><v-progress-circular indeterminate color="primary" /></div>
      <div v-else-if="error" class="ml-3">
        <v-menu location="left">
          <template #activator="{ props: menuProps }">
            <v-tooltip>
              <template #activator="{ props: tooltipProps }">
                <v-icon
                  icon="mdi-alert-circle-outline"
                  color="error"
                  v-bind="{ ...menuProps, ...tooltipProps }"
                />
              </template>
              <span>This message failed to send.</span>
            </v-tooltip>
          </template>
          <v-list>
            <v-list-item @click="resendMessage">Resend</v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>
    <div v-intersect="onIntersect" class="timestamp d-flex align-center">
      {{ messageTimestamp }} <UnreadIndicator v-if="!props.message.read" class="ml-1" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Message, SentStatus, useMessagingStore } from "../../stores/messaging";
import { computed, ref } from "vue";
import UnreadIndicator from "./UnreadIndicator.vue";

interface Props {
  conversationId: string;
  message: Message;
}

const props = defineProps<Props>();
const messagingStore = useMessagingStore();

const resending = ref(false);
const isIntersecting = ref(false);
let intersectionTimeout: NodeJS.Timeout | undefined = undefined;

const classes = computed(() => ({
  [`message-${props.message.id}`]: true,
  [`direction-${props.message.direction.toLowerCase()}`]: true,
}));

const messageTimestamp = computed(() => props.message.timestamp.toDate().toLocaleString());
const sending = computed(() => resending.value || props.message.sentStatus === SentStatus.SENDING);
const error = computed(() => props.message.sentStatus === SentStatus.ERROR);

const resendMessage = async () => {
  try {
    resending.value = true;
    await messagingStore.resendMessage(props.conversationId, props.message.id);
  } catch (err) {
    console.log(err);
  } finally {
    resending.value = false;
  }
};

const intersectionCallback = () => {
  if (isIntersecting.value) {
    messagingStore.markMessageRead(props.conversationId, props.message.id);
  }
};

const onIntersect = (entryIsIntersecting: boolean) => {
  // If the message is already read we don't care about intersection.
  if (props.message.read) {
    return;
  }

  if (isIntersecting.value && !entryIsIntersecting && intersectionTimeout) {
    clearTimeout(intersectionTimeout);
  }

  isIntersecting.value = entryIsIntersecting;
  if (isIntersecting.value) {
    intersectionTimeout = setTimeout(intersectionCallback, 2000);
  }
};
</script>

<style lang="scss" scoped>
.message-wrapper {
  .message {
    max-width: 400px;
    border-radius: 12px;
  }

  .timestamp {
    font-size: 0.85rem;
  }
  &.direction-in {
    > div {
      margin-right: 60px;
      align-self: flex-start;
    }

    .message {
      background-color: rgba(var(--v-theme-on-surface), var(--v-selected-opacity));
    }
  }

  &.direction-out {
    > div {
      margin-left: 60px;
      align-self: flex-end;
    }

    .message {
      background-color: #c0d7dd;
    }
  }
}
</style>
