<template>
  <v-list-item v-if="!item.raw?.segments"></v-list-item>
  <v-list-item v-else>
    <v-list-item-title>
      <SegmentHighlight v-if="item.raw.segments?.length" :segments="item.raw.segments" />
      <span v-else>{{ item.title }}</span>
    </v-list-item-title>
  </v-list-item>
</template>

<script lang="ts" setup>
import { toRefs } from "vue";
import SegmentHighlight from "./SegmentHighlight.vue";

interface Props {
  item: {
    title: string;
    value: string;
    raw: any;
  };
}

const props = defineProps<Props>();
const { item } = toRefs(props);
</script>
