<template>
  <v-main>
    <v-container fluid>
      <v-card>
        <v-card-title>Settings</v-card-title>
        <v-card-text>
          <template v-if="settingsStore.loading"
            ><v-progress-circular indeterminate color="primary" /> Loading...</template
          >
          <v-list v-else lines="two">
            <v-list-subheader>GoTo Connect</v-list-subheader>

            <template v-if="settingsStore.gotoConnectSettings">
              <v-list-item>
                <v-list-item-header>
                  <v-list-item-title>Account Number</v-list-item-title>
                </v-list-item-header>
                <div class="item-content">
                  <div>{{ settingsStore.gotoConnectSettings.accountKey }}</div>
                  <v-list-item-subtitle
                    >The GoTo Connect account number that the call queue is connected
                    to.</v-list-item-subtitle
                  >
                </div>

                <v-list-item-action>
                  <v-btn
                    variant="outlined"
                    color="error"
                    :loading="gotoConnectDisconnecting"
                    @click="disconnectGoTo"
                    >Disconnect</v-btn
                  >
                </v-list-item-action>
              </v-list-item>
              <v-list-item>
                <v-list-item-header>
                  <v-list-item-title>Last Sync Time</v-list-item-title>
                </v-list-item-header>
                <div v-if="settingsStore.gotoConnectSettings.lastSyncTime" class="item-content">
                  <div>{{ formattedGoToConnectSyncTime }}</div>
                  <v-list-item-subtitle
                    >The last time the sync with GoTo Connect ran.</v-list-item-subtitle
                  >
                </div>
                <div v-else class="item-content">
                  <div>GoTo Connect sync has not been run.</div>
                </div>
                <v-list-item-action>
                  <v-btn
                    variant="outlined"
                    color="primary"
                    @click="syncGoTo"
                    :loading="gotoConnectSyncing"
                    >Sync</v-btn
                  >
                </v-list-item-action>
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
                <v-list-item-title class="flex-grow-1"></v-list-item-title>
                <v-list-item-action>
                  <v-spacer />
                  <v-btn color="primary" :loading="gotoConnectConnecting" @click="connectGoTo"
                    >Connect</v-btn
                  >
                </v-list-item-action>
              </v-list-item>
            </template>

            <hr />
            <v-list-subheader>Rhapsody</v-list-subheader>
            <template
              v-if="settingsStore.rhapsodySettings && settingsStore.rhapsodySettings.business"
            >
              <v-list-item>
                <v-list-item-header>
                  <v-list-item-title>Business ID</v-list-item-title>
                </v-list-item-header>
                <div class="item-content">
                  <div>{{ settingsStore.rhapsodySettings.business.id }}</div>
                  <v-list-item-subtitle>The Rhapsody business ID</v-list-item-subtitle>
                </div>
              </v-list-item>
              <v-list-item>
                <v-list-item-header>
                  <v-list-item-title>Business Name</v-list-item-title>
                </v-list-item-header>
                <div class="item-content">
                  <div>{{ settingsStore.rhapsodySettings.business.name }}</div>
                  <v-list-item-subtitle>The Rhapsody business name</v-list-item-subtitle>
                </div>
              </v-list-item>
              <v-list-item>
                <v-list-item-header>
                  <v-list-item-title>Last Sync Time</v-list-item-title>
                </v-list-item-header>
                <div v-if="settingsStore.rhapsodySettings.lastSyncTime" class="item-content">
                  <div>{{ formattedSyncTime }}</div>
                  <v-list-item-subtitle
                    >The last time the sync with Rhapsody ran.</v-list-item-subtitle
                  >
                </div>
                <div v-else class="item-content">
                  <div>Rhapsody sync has not been run.</div>
                </div>
                <v-list-item-action>
                  <v-btn
                    variant="outlined"
                    color="primary"
                    :loading="rhapsodySyncing"
                    @click="rhapsodySync"
                    >Sync</v-btn
                  >
                </v-list-item-action>
              </v-list-item>
            </template>
            <template v-else>
              <v-list-item>
                <v-list-item-title>Rhapsody is not connected.</v-list-item-title>
              </v-list-item>

              <v-list-item>
                <v-list-item-title class="flex-grow-1"></v-list-item-title>
                <v-list-item-action>
                  <v-spacer />
                  <v-btn color="primary" :loading="rhapsodySyncing" @click="rhapsodySync"
                    >Connect</v-btn
                  >
                </v-list-item-action>
              </v-list-item>
            </template>
          </v-list>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { useSettingsStore } from "../stores/settings";
import { useSnackbarStore } from "../stores/snackbar";
import { ref, computed } from "vue";

const settingsStore = useSettingsStore();
const snackbarStore = useSnackbarStore();
const gotoConnectConnecting = ref(false);
const gotoConnectDisconnecting = ref(false);
const gotoConnectSyncing = ref(false);
const rhapsodySyncing = ref(false);

const formattedSyncTime = computed(() =>
  settingsStore.rhapsodySettings?.lastSyncTime
    ? settingsStore.rhapsodySettings.lastSyncTime.toDate().toLocaleString()
    : "",
);

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

<style lang="scss">
.v-list-item-header {
  min-width: 160px;
  width: 160px;
  margin-right: 56px;
  align-self: start;
  flex-grow: 0;
}
.item-content {
  margin-right: 56px;
  flex-grow: 1;
}
</style>
