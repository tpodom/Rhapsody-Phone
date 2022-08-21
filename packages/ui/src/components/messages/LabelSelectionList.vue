<template>
  <v-list>
    <v-list-item v-if="labelsStore.loading">
      <v-progress-circular indeterminate color="primary" /> Loading...
    </v-list-item>

    <v-list-item v-for="label in labels" :key="label.id">
      <template #prepend="{ isActive }">
        <v-list-item-action start>
          <v-progress-circular v-if="saving" />
          <v-checkbox-btn
            v-else
            v-model="label.selected"
            @update:model-value="(value: any) => onLabelChange(label, value)"
          />
        </v-list-item-action>
      </template>

      <template #default>
        <v-list-item-title class="d-flex align-center">
          <LabelIcon :icon="label.icon" :color="label.color" class="mr-3" /> {{ label.name }}
        </v-list-item-title>
      </template>
    </v-list-item>
  </v-list>
</template>

<script lang="ts" setup>
import type { Label } from "../../types/labels";
import { useLabelsStore } from "../../stores/labels";
import { ref, watchEffect } from "vue";
import LabelIcon from "../LabelIcon.vue";

interface LabelSelection extends Label {
  selected: boolean;
}

interface Props {
  selectedLabels: Label[];
}

interface Emits {
  (eventName: "labelChanged", label: Label, value: boolean, callback: () => void): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const labelsStore = useLabelsStore();

const saving = ref(false);
const labels = ref<LabelSelection[]>([]);

const onLabelChange = (label: LabelSelection, value: any): void => {
  saving.value = true;

  emit("labelChanged", label, Boolean(value), () => {
    saving.value = false;
  });
};

watchEffect(() => {
  const map = new Map<string, LabelSelection>();

  for (const label of labelsStore.labels || []) {
    map.set(label.id, {
      ...label,
      selected: !!props.selectedLabels.some((selectedLabel) => selectedLabel.id === label.id),
    });
  }

  labels.value = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
});
</script>
