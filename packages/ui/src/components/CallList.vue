<template>
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
        <td colspan="5"><v-progress-circular indeterminate color="primary" /> Loading...</td>
      </tr>
      <Call
        v-else-if="callsStore.calls?.length"
        v-for="item in callsStore.calls"
        :key="item.id"
        :call="item"
      />
      <tr v-else>
        <td colspan="5">No calls have been received.</td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup lang="ts">
import Call from "./Call.vue";
import { useCallsStore } from "../stores/calls";

const callsStore = useCallsStore();
</script>
