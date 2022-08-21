<template>
  <div v-if="labels" v-for="label in labels" :key="label.id">
    <v-tooltip>
      <template #activator="{ props }">
        <LabelIcon :color="label.color" :icon="label.icon" size="x-small" v-bind="props" />
      </template>
      {{ label.name }}
    </v-tooltip>
  </div>
</template>

<script lang="ts" setup>
import { toRefs } from "vue";
import { useLabelFilter } from "../../composables/labelFilter";
import { Conversation } from "../../types/messaging";
import LabelIcon from "../LabelIcon.vue";

interface Props {
  conversation: Conversation;
  size?: number;
  showName?: boolean;
}

const props = defineProps<Props>();
const { conversation } = toRefs(props);

const labels = useLabelFilter(conversation);
</script>
