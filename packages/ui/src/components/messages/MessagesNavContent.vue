<template>
  <MessagesAutocomplete :search-parameters="searchParameters" @search="onSearch" />
</template>

<script setup lang="ts">
import type { MessageRef } from "../../types/messaging";
import MessagesAutocomplete from "./MessagesAutocomplete.vue";
import { useRouter } from "vue-router";
import { useSearchParameters } from "../../composables/search";

interface QueryParameters {
  q?: string;
  [key: string]: string | undefined;
}

const router = useRouter();
const searchParameters = useSearchParameters();

const onSearch = (value: string | MessageRef | undefined) => {
  if (!value || typeof value === "string") {
    const query: QueryParameters = {};

    if (value) {
      query.q = value;
    }

    router.push({
      name: "Messages",
      query,
    });
  } else {
    router.push({
      name: "Conversation",
      params: {
        id: value.conversationId,
      },
      query: {
        messageId: value.messageId,
      },
    });
  }
};
</script>

<style lang="scss" scoped>
.v-text-field {
  max-width: 500px;
  margin-left: 56px;
}
</style>
