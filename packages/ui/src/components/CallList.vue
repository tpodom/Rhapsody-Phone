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
      <tr v-if="calls.length" v-for="item in calls" :key="item.id">
        <td>{{ item.client }}</td>
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

// reactive state
const calls = ref([]);
</script>
