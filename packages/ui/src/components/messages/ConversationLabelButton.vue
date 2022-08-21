<template>
  <v-menu :close-on-content-click="false">
    <template #activator="{ props }">
      <v-btn :icon="buttonIcon" v-bind="props" :disabled="!conversation" />
    </template>

    <LabelSelectionList :selected-labels="activeLabels" @labelChanged="onLabelChange" />
  </v-menu>
</template>

<script lang="ts" setup>
import type { Label } from "../../types/labels";
import type { Conversation } from "../../types/messaging";
import { useSnackbarStore } from "../../stores/snackbar";
import { useMessagingStore } from "../../stores/messaging";
import { computed, toRefs } from "vue";
import { useLabelFilter } from "../../composables/labelFilter";
import LabelSelectionList from "./LabelSelectionList.vue";

interface Props {
  conversation: Conversation;
}

const props = defineProps<Props>();
const { conversation } = toRefs(props);

const snackbarStore = useSnackbarStore();
const messagingStore = useMessagingStore();

const activeLabels = useLabelFilter(conversation);

const buttonIcon = computed(() => {
  return activeLabels.value?.length ? "mdi-label" : "mdi-label-outline";
});

const onLabelChange = async (label: Label, value: any, callback: () => void) => {
  if (!conversation?.value) {
    return;
  }

  try {
    const conversationLabels = (conversation.value.labels ?? []).filter(
      (labelId) => labelId !== label.id,
    );

    if (!!value) {
      conversationLabels.push(label.id);
    }

    await messagingStore.updateConversationLabels(conversation.value.id, conversationLabels);
  } catch (error) {
    snackbarStore.showError(`Error updating the labels ${error}`);
  } finally {
    callback();
  }
};
</script>
