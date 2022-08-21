<template>
  <v-card>
    <v-card-title>GoTo Connect</v-card-title>
    <v-card-text>
      <template v-if="settingsStore.loading">
        <v-progress-circular indeterminate color="primary" /> Loading...
      </template>
      <v-list v-else lines="two">
        <template v-if="settingsStore.gotoConnectSettings">
          <v-list-item>
            <template #prepend>
              <v-list-item-title>Account Number</v-list-item-title>
            </template>

            <template #default>
              <div>{{ settingsStore.gotoConnectSettings.accountKey }}</div>
              <v-list-item-subtitle
                >The GoTo Connect account number that the call queue is connected
                to.</v-list-item-subtitle
              >
            </template>

            <template #append>
              <v-list-item-action>
                <v-btn color="error" :loading="gotoConnectDisconnecting" @click="disconnectGoTo">
                  Disconnect
                </v-btn>
              </v-list-item-action>
            </template>
          </v-list-item>
          <v-list-item>
            <template #prepend>
              <v-list-item-title>Last Sync Time</v-list-item-title>
            </template>

            <template #default>
              <div v-if="settingsStore.gotoConnectSettings.lastSyncTime">
                <div>{{ formattedGoToConnectSyncTime }}</div>
                <v-list-item-subtitle
                  >The last time the sync with GoTo Connect ran.</v-list-item-subtitle
                >
              </div>
              <div v-else>
                <div>GoTo Connect sync has not been run.</div>
              </div>
            </template>

            <template #append>
              <v-list-item-action>
                <v-btn color="primary" @click="syncGoTo" :loading="gotoConnectSyncing">Sync</v-btn>
              </v-list-item-action>
            </template>
          </v-list-item>
        </template>
        <template v-else>
          <v-list-item>
            <v-list-item-title
              >GoTo Connect is not configured. Click Connect to install app with GoTo
              Connect.</v-list-item-title
            >
          </v-list-item>

          <v-list-item>
            <v-list-item-title></v-list-item-title>
            <template #append>
              <v-list-item-action>
                <v-btn color="primary" :loading="gotoConnectConnecting" @click="connectGoTo">
                  Connect
                </v-btn>
              </v-list-item-action>
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useSettingsStore } from "../../stores/settings";
import { useSnackbarStore } from "../../stores/snackbar";

const settingsStore = useSettingsStore();
const snackbarStore = useSnackbarStore();

const gotoConnectConnecting = ref(false);
const gotoConnectDisconnecting = ref(false);
const gotoConnectSyncing = ref(false);

const formattedGoToConnectSyncTime = computed(() =>
  settingsStore.gotoConnectSettings?.lastSyncTime
    ? settingsStore.gotoConnectSettings.lastSyncTime.toDate().toLocaleString()
    : "",
);

async function connectGoTo() {
  try {
    gotoConnectConnecting.value = true;
    await settingsStore.connectGoToConnect();
  } catch (err) {
    snackbarStore.showError((err as Error).message);
  } finally {
    gotoConnectConnecting.value = false;
  }
}

async function syncGoTo() {
  try {
    gotoConnectSyncing.value = true;
    await settingsStore.syncGoToConnect();
  } catch (err) {
    snackbarStore.showError((err as Error).message);
  } finally {
    gotoConnectSyncing.value = false;
  }
}

async function disconnectGoTo() {
  try {
    gotoConnectDisconnecting.value = true;
    await settingsStore.disconnectGoToConnect();
  } catch (err) {
    snackbarStore.showError((err as Error).message);
  } finally {
    gotoConnectDisconnecting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.v-list-item-title {
  min-width: 160px;
}
</style>
