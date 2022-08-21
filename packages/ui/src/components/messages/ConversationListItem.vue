<template>
  <v-list-item
    :lines="hasLabels ? 'three' : 'two'"
    :to="messageRoute"
    :class="{ read: props.conversation.unreadCount === 0 }"
  >
    <template #default>
      <v-list-item-title class="mr-3">{{ displayName }}</v-list-item-title>
      <v-list-item-subtitle v-if="hasLabels" class="labels my-1">
        <LabelList :conversation="props.conversation" />
      </v-list-item-subtitle>
      <v-list-item-subtitle class="d-flex d-row align-center">
        <v-tooltip v-if="props.conversation?.unreadCount">
          <template #activator="{ props }">
            <UnreadIndicator class="mr-1" v-bind="props" />
          </template>

          This conversation has {{ props.conversation?.unreadCount }} new
          {{ props.conversation?.unreadCount === 1 ? "message" : "messages" }}.
        </v-tooltip>

        <span v-if="props.conversation.latestMessage">
          {{ props.conversation.latestMessage?.body }}
        </span>
        <span v-else class="empty-messages">No messages</span>
      </v-list-item-subtitle>
    </template>
  </v-list-item>
</template>

<script lang="ts" setup>
import type { Conversation } from "../../types/messaging";
import { computed, toRefs } from "vue";
import { formatPhoneNumber } from "../../lib/formatters";
import UnreadIndicator from "./UnreadIndicator.vue";
import LabelList from "./LabelList.vue";
import { useLabelFilter } from "../../composables/labelFilter";
import { useRoute } from "vue-router";

interface Props {
  conversation: Conversation;
}

const props = defineProps<Props>();
const { conversation } = toRefs(props);

const route = useRoute();
const labels = useLabelFilter(conversation);

const messageRoute = computed(() => ({
  name: "Conversation",
  params: {
    id: props.conversation.id,
  },
  query: route.query,
}));

const displayName = computed(() => {
  return props.conversation.client.name || formatPhoneNumber(props.conversation.client.phoneNumber);
});
const hasLabels = computed(() => Number(labels.value?.length) > 0);
</script>

<style lang="scss" scoped>
.empty-messages {
  font-style: italic;
}

:deep(.v-list-item__append) {
  height: 100%;
}

.read {
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.labels {
  display: grid;
  grid-gap: 6px;
  grid-auto-columns: min-content;
  grid-template-columns: repeat(auto-fill, 24px);
  grid-auto-rows: min-content;
}
</style>
