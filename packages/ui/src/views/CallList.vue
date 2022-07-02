<template>
  <v-main>
    <v-container fluid>
      <v-table class="call-list">
        <thead>
          <tr>
            <th></th>
            <th>Client</th>
            <th>Pets</th>
            <th>Phone #</th>
            <th>Appointments</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="callsStore.loading">
            <td colspan="6"><v-progress-circular indeterminate color="primary" /> Loading...</td>
          </tr>
          <Call
            v-else-if="callsStore.calls?.length"
            v-for="item in callsStore.calls"
            :key="item.id"
            :call="item"
          />
          <tr v-else>
            <td colspan="6">No calls have been received.</td>
          </tr>
        </tbody>
      </v-table>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import Call from "../components/calls/Call.vue";
import { useCallsStore } from "../stores/calls";

const callsStore = useCallsStore();
</script>
