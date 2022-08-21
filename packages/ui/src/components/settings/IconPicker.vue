<template>
  <v-chip-group class="icon-picker" mandatory v-model="selection">
    <v-chip v-for="icon in icons" :key="icon" :value="icon" variant="outlined" class="pr-0">
      <v-icon start :icon="icon" />
    </v-chip>
  </v-chip-group>
</template>

<script lang="ts" setup>
import { ref, toRefs, watch, Ref } from "vue";

interface Emits {
  (eventName: "update:modelValue", value: string | undefined): void;
}

interface Props {
  modelValue?: string;
}

const icons = [
  "mdi-alert-circle",
  "mdi-alarm",
  "mdi-exclamation-thick",
  "mdi-help-circle-outline",
  "mdi-information-outline",
  "mdi-beaker-question-outline",
  "mdi-brightness-5",
  "mdi-calendar-clock",
  "mdi-clipboard-text-outline",
  "mdi-eyedropper",
  "mdi-prescription",
  "mdi-stethoscope",
  "mdi-needle",
  "mdi-pulse",
  "mdi-flask-empty-outline",
  "mdi-food",
  "mdi-folder-account-outline",
  "mdi-credit-card-outline",
  "mdi-file-document-outline",
  "mdi-comment-outline",
  "mdi-email-outline",
  "mdi-phone",
  "mdi-phone-alert",
  "mdi-directions-fork",
  "mdi-emoticon-angry-outline",
  "mdi-emoticon-confused-outline",
  "mdi-cup",
  "mdi-cat",
  "mdi-asterisk",
  "mdi-circle",
  "mdi-check",
  "mdi-diamond-outline",
  "mdi-heart",
  "mdi-hexagon",
  "mdi-octagon",
  "mdi-star",
  "mdi-square",
  "mdi-triangle",
];

const emit = defineEmits<Emits>();
const props = defineProps<Props>();
const { modelValue } = toRefs(props);

const selection: Ref<string | undefined> = ref(modelValue?.value);

watch(selection, (newVal: string | undefined) => {
  emit("update:modelValue", newVal);
});
</script>

<style lang="scss" scoped>
.icon-picker {
  display: grid;
  grid-auto-columns: min-content;
  grid-template-columns: repeat(auto-fill, 44px);
  grid-auto-rows: min-content;
}
</style>
