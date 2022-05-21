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
        <td colspan="5">
          <v-progress-circular indeterminate color="primary" /> Loading...
        </td>
      </tr>
      <tr
        v-else-if="callsStore.calls.length"
        v-for="item in callsStore.calls"
        :key="item.id"
      >
        <td>{{ item.caller }}</td>
        <td></td>
        <td>{{ item.phoneNumber }}</td>
        <td></td>
        <td></td>
      </tr>
      <tr v-else>
        <td colspan="5">No calls have been received.</td>
      </tr>
    </tbody>
  </v-table>
</template>

<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useCallsStore } from "../stores/calls";

// reactive state
const callsStore = useCallsStore();
callsStore.setup();
</script>
