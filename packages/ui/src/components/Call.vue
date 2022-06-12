<template>
  <RhapsodyClientCall
    v-if="props.call.rhapsodyClientId"
    :rhapsody-client-id="props.call.rhapsodyClientId"
    :call-icon="callIcon"
    :phone-number="formattedPhoneNumber"
  />
  <tr v-else>
    <td><v-icon v-if="callIcon" :icon="callIcon" /></td>
    <td>{{ props.call.caller.name }}</td>
    <td></td>
    <td>{{ formattedPhoneNumber }}</td>
    <td></td>
    <td></td>
  </tr>
</template>

<script setup lang="ts">
import { VIcon } from "vuetify/components";
import { computed, watch, ref } from "vue";
import RhapsodyClientCall from "./RhapsodyClientCall.vue";
import { formatPhoneNumber } from "../lib/formatters";
import { Call } from "../stores/calls";

interface Props {
  call: Call;
}

interface State {
  [key: string]: string;
}

const stateToIcon: State = {
  calling: "mdi-phone-ring",
  answered: "mdi-phone-in-talk",
  ended: "mdi-phone-hangup",
};

const props = defineProps<Props>();

const callIcon = computed(() => stateToIcon[props.call?.state]);

const formattedPhoneNumber = computed(() => {
  return props.call.caller.phoneNumber ? formatPhoneNumber(props.call.caller.phoneNumber) : "";
});
</script>
