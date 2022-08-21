<template>
  <v-card class="mt-3">
    <v-card-title>Search</v-card-title>
    <v-card-text>
      <template v-if="settingsStore.loading">
        <v-progress-circular indeterminate color="primary" /> Loading...
      </template>
      <v-list v-else lines="two">
        <template v-if="configured">
          <v-list-item>
            <v-list-item-title>Search is enabled. </v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>
              Sync the search database to backfill any missed records.
            </v-list-item-title>
            <template #append>
              <v-list-item-action>
                <v-spacer />
                <v-btn color="primary" :loading="syncing" @click="sync">Sync</v-btn>
              </v-list-item-action>
            </template>
          </v-list-item>
        </template>
        <template v-else>
          <v-list-item>
            <v-list-item-title>Search is not enabled.</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { isConfigured } from "../../lib/search";
import { useSettingsStore } from "../../stores/settings";
import { useSnackbarStore } from "../../stores/snackbar";

const settingsStore = useSettingsStore();
const snackbarStore = useSnackbarStore();

const configured = ref(isConfigured());
const syncing = ref(false);

const sync = async () => {
  try {
    syncing.value = true;
    await settingsStore.syncSearch();
  } catch (err) {
    snackbarStore.showError((err as Error).message);
  } finally {
    syncing.value = false;
  }
};
</script>
