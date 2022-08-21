<template>
  <v-tooltip location="bottom">
    <template #activator="{ props }">
      <v-btn
        :disabled="!messages?.length"
        icon="mdi-download"
        v-bind="props"
        @click="onDownloadPDF"
      />
    </template>

    <span>Download PDF</span>
  </v-tooltip>

  <div v-if="render && conversation && messages" class="renderer" ref="renderer">
    <ConversationPDF :conversation="conversation" :messages="messages" />
  </div>
</template>

<script lang="ts" setup>
import type { Conversation, Message as MessageType } from "../../types/messaging";
import { computed, nextTick, ref, toRefs, Ref } from "vue";
import jsPDF from "jspdf";
import ConversationPDF from "./ConversationPDF.vue";
import { useSnackbarStore } from "../../stores/snackbar";
import filenamify from "filenamify";
import { formatFilenameDate } from "../../lib/formatters";

interface Props {
  conversation?: Conversation | null;
  messages?: MessageType[];
}

const props = defineProps<Props>();
const { conversation, messages } = toRefs(props);

const snackbarStore = useSnackbarStore();

const loading = ref(false);
const render = ref(false);
const renderer: Ref<HTMLElement | null> = ref(null);
const startDate = computed(() => {
  return messages?.value?.length ? messages.value[0].timestamp : undefined;
});

const onDownloadPDF = () => {
  loading.value = true;
  render.value = true;

  nextTick(() => {
    if (!renderer.value || !conversation?.value) {
      snackbarStore.showError("An error occurred creating the PDF.");
      return;
    }

    const doc = new jsPDF({ orientation: "portrait", format: "letter", unit: "pt" });

    doc.html(renderer.value.querySelector(".conversation-pdf") as HTMLElement, {
      autoPaging: "text",
      callback: () => {
        const clientName = conversation?.value?.client.name
          ? conversation?.value?.client.name + "-"
          : "";

        const phoneNumber = conversation?.value?.client.phoneNumber.replace("+", "");
        let filename = `${clientName}${phoneNumber}`;

        if (startDate.value) {
          const formattedDate = formatFilenameDate(startDate.value.toDate());
          filename = `${filename}-${formattedDate}`;
        }

        doc.save(filenamify(`${filename}.pdf`));
      },
    });
  });
};
</script>

<style lang="scss" scoped>
.renderer {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -9999px;
  overflow: auto;
  width: 632px;
  height: 792px;
}
</style>
