<template>
  <div class="message-wrapper mb-2 d-flex flex-column" :class="classes">
    <div class="message pa-3">{{ props.message.body }}</div>
    <div class="timestamp">{{ messageTimestamp }}</div>
  </div>
</template>

<script lang="ts" setup>
import { Message } from "../../stores/messaging";
import { computed } from "vue";

interface Props {
  message: Message;
}

const props = defineProps<Props>();

const classes = computed(() => ({
  [`direction-${props.message.direction.toLowerCase()}`]: true,
}));

const messageTimestamp = computed(() => props.message.timestamp.toDate().toLocaleString());
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
      background-color: rgb(var(--v-theme-primary));
    }
  }
}
</style>
