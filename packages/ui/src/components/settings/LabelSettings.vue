<template>
  <v-card class="mt-3">
    <v-card-title>Labels</v-card-title>
    <v-card-text>
      <template v-if="labelsStore.loading">
        <v-progress-circular indeterminate color="primary" /> Loading...
      </template>

      <div v-else>
        <p>
          Labels can be assigned to messages to categorize and filter on relevant conversations.
        </p>
        <v-list>
          <div v-if="!labelsStore.labels?.length">No labels have been created yet.</div>
          <LabelItem v-else v-for="label of labelsStore.labels" :key="label.id" :label="label" />
          <v-list-item>
            <template #append>
              <v-list-item-action>
                <v-spacer />
                <NewLabelDialog />
              </v-list-item-action>
              <v-list-item-title class="flex-grow-1"></v-list-item-title>
            </template>
          </v-list-item>
        </v-list>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { useLabelsStore } from "../../stores/labels";
import LabelItem from "./LabelItem.vue";
import NewLabelDialog from "./NewLabelDialog.vue";

const labelsStore = useLabelsStore();
</script>
