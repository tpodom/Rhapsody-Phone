<template>
  <v-card class="mt-3">
    <v-card-title>Rhapsody</v-card-title>
    <v-card-text>
      <template v-if="settingsStore.loading">
        <v-progress-circular indeterminate color="primary" /> Loading...
      </template>
      <v-list v-else lines="two">
        <template v-if="settingsStore.rhapsodySettings && settingsStore.rhapsodySettings.business">
          <v-list-item>
            <template #prepend>
              <v-list-item-title>Business ID</v-list-item-title>
            </template>

            <template #default>
              <div>{{ settingsStore.rhapsodySettings.business.id }}</div>
              <v-list-item-subtitle>The Rhapsody business ID</v-list-item-subtitle>
            </template>
          </v-list-item>
          <v-list-item>
            <template #prepend>
              <v-list-item-title>Business Name</v-list-item-title>
            </template>

            <template #default>
              <div>{{ settingsStore.rhapsodySettings.business.name }}</div>
              <v-list-item-subtitle>The Rhapsody business name</v-list-item-subtitle>
            </template>
          </v-list-item>
          <v-list-item>
            <template #prepend>
              <v-list-item-title>Last Sync Time</v-list-item-title>
            </template>

            <template #default>
              <div v-if="settingsStore.rhapsodySettings.lastSyncTime">
                <div>{{ formattedSyncTime }}</div>
                <v-list-item-subtitle
                  >The last time the sync with Rhapsody ran.</v-list-item-subtitle
                >
              </div>
              <div v-else>
                <div>Rhapsody sync has not been run.</div>
              </div>
            </template>

            <template #append>
              <v-list-item-action>
                <v-btn color="primary" :loading="rhapsodySyncing" @click="rhapsodySync">Sync</v-btn>
              </v-list-item-action>
            </template>
          </v-list-item>
        </template>
        <template v-else>
          <v-list-item>
            <v-list-item-title>Rhapsody is not connected.</v-list-item-title>
          </v-list-item>

          <v-list-item>
            <template #append>
              <v-list-item-action>
                <v-spacer />
                <v-btn color="primary" :loading="rhapsodySyncing" @click="rhapsodySync"
                  >Connect</v-btn
                >
              </v-list-item-action>
            </template>
            <v-list-item-title></v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { useSettingsStore } from "../../stores/settings";
import { useSnackbarStore } from "../../stores/snackbar";
import { ref, computed } from "vue";

const settingsStore = useSettingsStore();
const snackbarStore = useSnackbarStore();
const rhapsodySyncing = ref(false);

const formattedSyncTime = computed(() =>
  settingsStore.rhapsodySettings?.lastSyncTime
    ? settingsStore.rhapsodySettings.lastSyncTime.toDate().toLocaleString()
    : "",
);

async function rhapsodySync() {
  try {
    rhapsodySyncing.value = true;
    await settingsStore.syncRhapsody();
  } catch (err) {
    snackbarStore.showError((err as Error).message);
  } finally {
    rhapsodySyncing.value = false;
  }
}
</script>

<style lang="scss" scoped>
.v-list-item-title {
  min-width: 160px;
  width: 200px;
}
</style>
