<template>
  <v-chip :color="color" label variant="outlined" :size="size" class="pr-0">
    <v-icon start :icon="icon"></v-icon>
  </v-chip>
</template>

<script lang="ts" setup>
import type { Label } from "../types/labels";
import { computed, toRefs } from "vue";

interface Props {
  color: string;
  icon: string;
  size?: string;
}

const props = defineProps<Props>();
const { color, icon } = toRefs(props);
const size = computed(() => props.size ?? "small");
</script>
