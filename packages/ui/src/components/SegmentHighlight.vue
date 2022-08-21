<template>
  <span class="highlight">
    <span v-for="segment in props.segments">
      <em v-if="segment.match">{{ segment.text }}</em>
      <span v-else>{{ segment.text }}</span>
    </span>
  </span>
</template>
<script lang="ts" setup>
import type { SearchSegment } from "../types/search";

interface Props {
  segments: SearchSegment[];
}

const props = defineProps<Props>();
</script>

<style lang="scss" scoped>
em {
  font-weight: bold;
  font-style: normal;
}
.highlight {
  display: inline;
}
</style>
