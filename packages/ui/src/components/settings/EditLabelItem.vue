<template>
  <v-form v-model="valid" :lazy-validation="false" ref="form">
    <v-list-item>
      <template #prepend>
        <v-input hide-details :model-value="originalColorIcon" :validation-value="editColorIcon">
          <LabelStyleDialog
            v-model:color="editLabel.color"
            v-model:icon="editLabel.icon"
            @close="onStyleClose"
          />
        </v-input>
      </template>

      <template #default>
        <v-list-item-title class="ml-3 flex-grow-1">
          <v-text-field
            v-model="editLabel.name"
            variant="outlined"
            hide-details="auto"
            density="compact"
            :rules="nameValidationRules"
          />
        </v-list-item-title>
      </template>

      <template #append>
        <v-list-item-action class="d-flex flex-row">
          <v-btn color="primary" @click="onSave" :loading="saving" :disabled="!valid">Save</v-btn>
          <v-btn class="ml-3" @click="onCancel">Cancel</v-btn>
        </v-list-item-action>
      </template>
    </v-list-item>
  </v-form>
</template>

<script lang="ts" setup>
import { Label } from "../../types/labels";
import { computed, reactive, ref, toRefs } from "vue";
import LabelStyleDialog from "./LabelStyleDialog.vue";
import { useLabelsStore } from "../../stores/labels";
import { useSnackbarStore } from "../../stores/snackbar";
import { nameValidationRules } from "../../lib/labelValidation";
import type { VForm } from "vuetify/components";

interface Props {
  label: Label;
}

interface Emits {
  (eventName: "close"): void;
}

const labelsStore = useLabelsStore();
const snackbarStore = useSnackbarStore();

const emit = defineEmits<Emits>();
const props = defineProps<Props>();
const { label } = toRefs(props);

const editLabel = reactive({ ...label.value });
const saving = ref(false);
const valid = ref(false);
const form = ref<InstanceType<typeof VForm> | null>(null);

const originalColorIcon = computed(() => `${label.value.color}.${label.value.icon}`);
const editColorIcon = computed(() => `${editLabel.color}.${editLabel.icon}`);

const onCancel = () => {
  Object.assign(editLabel, label.value);
  emit("close");
};

const onSave = async () => {
  saving.value = true;

  try {
    await labelsStore.updateLabel(editLabel.id, editLabel);
    emit("close");
  } catch (error) {
    snackbarStore.showError(`Error saving label: ${error}`);
  } finally {
    saving.value = false;
  }
};

const onStyleClose = (val: boolean) => {
  if (val) {
    form.value?.validate();
  }
};
</script>
