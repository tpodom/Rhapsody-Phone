<template>
  <v-dialog persistent scrollable v-model="dialogOpen">
    <template #activator="{ props }">
      <v-btn color="primary" v-bind="props">Add Label</v-btn>
    </template>
    <v-card>
      <v-card-title>Add New Label</v-card-title>
      <v-divider />
      <v-card-text style="height: 400px">
        <p class="mb-3">Choose a name and color for your new label.</p>
        <p class="mb-3 error-message" v-if="errorMessage">{{ errorMessage }}</p>

        <v-form v-model="valid">
          <v-text-field
            label="Name"
            :rules="nameValidationRules"
            hide-details="auto"
            v-model="name"
          />

          <h3 class="mt-3">Icon</h3>
          <IconPicker v-model="icon" />

          <h3 class="mt-3">Color</h3>
          <v-color-picker v-model="color" mode="rgb" show-swatches label="Color" />
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" :disabled="!valid" :loading="saving" @click="onSave">Save</v-btn>
        <v-btn @click="dialogOpen = false">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { nameValidationRules } from "../../lib/labelValidation";
import { useLabelsStore } from "../../stores/labels";
import IconPicker from "./IconPicker.vue";

const labelsStore = useLabelsStore();

const dialogOpen = ref(false);
const valid = ref(false);
const name = ref("");
const color = ref("#000000");
const icon = ref("mdi-circle");
const saving = ref(false);
const errorMessage = ref("");

const onSave = async () => {
  try {
    saving.value = true;
    await labelsStore.addLabel({
      color: color.value,
      name: name.value,
      icon: icon.value,
    });
    dialogOpen.value = false;
  } catch (error) {
    errorMessage.value = (error as Error).message;
  } finally {
    saving.value = false;
  }
};

watch(dialogOpen, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    name.value = "";
    color.value = "#000000";
    icon.value = "mdi-circle";
  }
});
</script>

<style lang="scss" scoped>
.error-message {
  color: rgb(var(--v-theme-error));
}
</style>
