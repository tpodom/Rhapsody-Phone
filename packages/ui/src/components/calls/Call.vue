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
import { computed } from "vue";
import RhapsodyClientCall from "./RhapsodyClientCall.vue";
import { formatPhoneNumber } from "../../lib/formatters";
import { Call } from "../../stores/calls";

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

<style>
.mdi-phone-ring {
  color: red;
}
@-webkit-keyframes ring {
  0% {
    -webkit-transform: rotate(-15deg);
    transform: rotate(-15deg);
  }
  2% {
    -webkit-transform: rotate(15deg);
    transform: rotate(15deg);
  }
  4% {
    -webkit-transform: rotate(-18deg);
    transform: rotate(-18deg);
  }
  6% {
    -webkit-transform: rotate(18deg);
    transform: rotate(18deg);
  }
  8% {
    -webkit-transform: rotate(-22deg);
    transform: rotate(-22deg);
  }
  10% {
    -webkit-transform: rotate(22deg);
    transform: rotate(22deg);
  }
  12% {
    -webkit-transform: rotate(-18deg);
    transform: rotate(-18deg);
  }
  14% {
    -webkit-transform: rotate(18deg);
    transform: rotate(18deg);
  }
  16% {
    -webkit-transform: rotate(-12deg);
    transform: rotate(-12deg);
  }
  18% {
    -webkit-transform: rotate(12deg);
    transform: rotate(12deg);
  }
  20% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
}
@keyframes ring {
  0% {
    -webkit-transform: rotate(-15deg);
    -ms-transform: rotate(-15deg);
    transform: rotate(-15deg);
  }
  2% {
    -webkit-transform: rotate(15deg);
    -ms-transform: rotate(15deg);
    transform: rotate(15deg);
  }
  4% {
    -webkit-transform: rotate(-18deg);
    -ms-transform: rotate(-18deg);
    transform: rotate(-18deg);
  }
  6% {
    -webkit-transform: rotate(18deg);
    -ms-transform: rotate(18deg);
    transform: rotate(18deg);
  }
  8% {
    -webkit-transform: rotate(-22deg);
    -ms-transform: rotate(-22deg);
    transform: rotate(-22deg);
  }
  10% {
    -webkit-transform: rotate(22deg);
    -ms-transform: rotate(22deg);
    transform: rotate(22deg);
  }
  12% {
    -webkit-transform: rotate(-18deg);
    -ms-transform: rotate(-18deg);
    transform: rotate(-18deg);
  }
  14% {
    -webkit-transform: rotate(18deg);
    -ms-transform: rotate(18deg);
    transform: rotate(18deg);
  }
  16% {
    -webkit-transform: rotate(-12deg);
    -ms-transform: rotate(-12deg);
    transform: rotate(-12deg);
  }
  18% {
    -webkit-transform: rotate(12deg);
    -ms-transform: rotate(12deg);
    transform: rotate(12deg);
  }
  20% {
    -webkit-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    transform: rotate(0deg);
  }
}
.mdi-phone-ring {
  -webkit-animation: ring 2s ease infinite;
  animation: ring 2s ease infinite;
}
</style>
