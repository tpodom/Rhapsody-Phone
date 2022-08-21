<template>
  <EditLabelItem v-if="editMode" :label="label" @close="onEditClose" />
  <v-list-item v-else>
    <template #prepend>
      <LabelIcon :color="label.color" :icon="label.icon" />
    </template>

    <template #default>
      <v-list-item-title class="ml-3">
        <span>{{ label.name }}</span>
      </v-list-item-title>
    </template>

    <template #append>
      <v-list-item-action class="d-flex flex-row">
        <v-btn variant="text" icon="mdi-pencil" @click="onEdit" />
        <v-btn variant="text" icon="mdi-delete" :loading="deleting" @click="onDelete" />
      </v-list-item-action>
    </template>
  </v-list-item>
</template>

<script lang="ts" setup>
import { Label } from "../../types/labels";
import { ref, toRefs } from "vue";
import { useSnackbarStore } from "../../stores/snackbar";
import { useLabelsStore } from "../../stores/labels";
import EditLabelItem from "./EditLabelItem.vue";
import LabelIcon from "../LabelIcon.vue";

interface Props {
  label: Label;
}

const snackbarStore = useSnackbarStore();
const labelsStore = useLabelsStore();

const props = defineProps<Props>();
const { label } = toRefs(props);

const editMode = ref(false);
const deleting = ref(false);

const onEdit = () => {
  editMode.value = true;
};

const onDelete = async () => {
  deleting.value = true;

  try {
    await labelsStore.deleteLabel(label.value.id);
  } catch (error) {
    snackbarStore.showError(`There was an error deleting the label: ${error}`);
  } finally {
    deleting.value = false;
  }
};
const onEditClose = () => {
  editMode.value = false;
};
</script>
