<template>
  <v-field ref="dropZoneRef" class="container flex-grow-1 mr-3 mb-1 px-2" variant="outlined">
    <v-overlay :model-value="isOverDropZone" contained class="align-center justify-center">
      <span>Drop files to add to message.</span>
    </v-overlay>

    <div class="d-flex flex-column flex-grow-1">
      <v-textarea
        auto-grow
        class="flex-grow-1"
        rows="1"
        :rules="messageRules"
        placeholder="Type a message to send here..."
        label=""
        :disabled="!conversation"
        density="compact"
        :counter="MAX_MESSAGE_LENGTH"
        v-model="messageToSend"
        variant="plain"
        :error-messages="attachmentsError"
      >
        <template #append-inner>
          <div class="message-actions d-flex">
            <v-menu :close-on-content-click="false" location="top" v-model="emojiPickerMenu">
              <template #activator="{ props }">
                <v-icon icon="mdi-emoticon-outline" v-bind="props" />
              </template>
              <VuemojiPicker
                :is-dark="theme.global.current.value.dark"
                @emojiClick="onSelectEmoji"
              />
            </v-menu>
            <v-file-input multiple hide-details @update:model-value="onFilesSelected" />
          </div>
        </template>
      </v-textarea>

      <div class="d-flex flex-row flex-wrap my-2">
        <Preview
          v-for="attachment in attachments"
          :width="125"
          :attachment="attachment"
          :deletable="true"
          @remove="onRemoveAttachment"
        />
      </div>
    </div>
  </v-field>
  <v-btn
    class="mb-1"
    icon="mdi-send"
    :disabled="!messageValid"
    :loading="sending"
    color="primary"
    @click="sendMessage"
  />
</template>

<script lang="ts" setup>
import type { Conversation, Message } from "../../types/messaging";
import { useMessagingStore } from "../../stores/messaging";
import { computed, ref, toRefs } from "vue";
import { useTheme } from "vuetify";
import { VuemojiPicker, EmojiClickEventDetail } from "vuemoji-picker";
import { useDropZone } from "@vueuse/core";
import Preview from "./attachments/Preview.vue";

const MAX_MESSAGE_LENGTH = 1024;
const MAX_ATTACHMENTS_TOTAL_SIZE = 2 * 1024 * 1024;
const MAX_ATTACHMENT_SIZE = 1024 * 1024;

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
const attachments = ref<File[]>([]);
const dropZoneRef = ref<HTMLDivElement>();

const messageRules = [
  (v: string) => v.length <= MAX_MESSAGE_LENGTH || `Max ${MAX_MESSAGE_LENGTH} characters`,
];

const { isOverDropZone } = useDropZone(dropZoneRef, onDrop);

const messageTextIsValid = computed(
  () => messageToSend.value?.length > 0 && messageToSend.value?.length < MAX_MESSAGE_LENGTH,
);

const attachmentsTotalSize = computed(() =>
  attachments.value.reduce((value, file) => value + file.size, 0),
);

const attachmentsError = computed(() => {
  if (attachmentsTotalSize.value >= MAX_ATTACHMENTS_TOTAL_SIZE) {
    return "The attachments exceed the maximum limit of 2 MB. Try removing some attachments or reducing their size.";
  }

  for (const attachment of attachments.value) {
    if (attachment.size > MAX_ATTACHMENT_SIZE) {
      return `${attachment.name} exceeds the maximum limit of 1 MB. Try removing the attachment or reducing its size.`;
    }
  }
  return undefined;
});

const messageValid = computed(() => messageTextIsValid.value && !attachmentsError.value);

function onSelectEmoji(emoji: EmojiClickEventDetail) {
  messageToSend.value += emoji.unicode;
  emojiPickerMenu.value = false;
}

async function sendMessage() {
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
}

function onFilesSelected(selectedFiles: File[]) {
  attachments.value = [...attachments.value, ...selectedFiles];
}

function onDrop(files: File[] | null) {
  const filteredFiles = (files ?? []).filter(
    (file) => !attachments.value.some((attachment) => attachment.name === file.name),
  );

  attachments.value = [...attachments.value, ...filteredFiles];
}

function onRemoveAttachment(attachment: File) {
  attachments.value = attachments.value.filter((entry) => entry !== attachment);
}
</script>

<style lang="scss" scoped>
.v-file-input {
  & :deep(.v-input__control) {
    display: none;
  }

  & :deep(.v-input__prepend) {
    padding-top: 0;
    margin-inline-end: 0;
  }
}

.message-actions {
  padding-top: calc(var(--v-field-padding-top, 10px));
}
</style>
