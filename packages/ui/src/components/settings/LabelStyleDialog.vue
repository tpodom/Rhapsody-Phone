<template>
  <v-dialog v-model="dialogOpen" persistent scrollable>
    <template #activator="{ props }">
      <LabelIcon :color="color" :icon="icon" v-bind="props" />
    </template>

    <v-card :width="360">
      <v-card-title>Choose Label Style</v-card-title>
      <v-divider />
      <v-card-text>
        <h3>Icon</h3>
        <IconPicker v-model="iconValue" />
        <h3>Color</h3>
        <v-color-picker v-model="colorValue" mode="rgb" show-swatches />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" :disabled="!valid" @click="onSave">Save</v-btn>
        <v-btn @click="onCancel">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs, watch } from "vue";
import IconPicker from "./IconPicker.vue";
import LabelIcon from "../LabelIcon.vue";

interface Props {
  color: string;
  icon: string;
}

interface Emits {
  (eventName: "update:color", value: string): void;
  (eventName: "update:icon", value: string): void;
  (eventName: "close", value: boolean): void;
}

const emit = defineEmits<Emits>();
const props = defineProps<Props>();
const { icon, color } = toRefs(props);

const dialogOpen = ref(false);
const colorValue = ref(color.value);
const iconValue = ref(icon.value);

const valid = computed(() => {
  return (
    colorValue.value &&
    iconValue.value &&
    (colorValue.value !== color.value || iconValue.value !== icon.value)
  );
});

const onCancel = () => {
  emit("close", false);
  dialogOpen.value = false;
};

const onSave = () => {
  emit("update:color", colorValue.value);
  emit("update:icon", iconValue.value);
  emit("close", true);
  dialogOpen.value = false;
};

watch(color, (value: string) => {
  colorValue.value = value;
});

watch(icon, (value: string) => {
  iconValue.value = value;
});

watch(dialogOpen, (value: boolean) => {
  if (value) {
    colorValue.value = color.value;
    iconValue.value = icon.value;
  } else {
    colorValue.value = "#000000";
    iconValue.value = "mdi-circle";
  }
});
</script>
