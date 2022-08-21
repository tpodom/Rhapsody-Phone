<template>
  <tr>
    <td><v-icon v-if="props.callIcon" :icon="props.callIcon" /></td>
    <td>
      <a :href="clientLink" target="_blank">{{ clientName }}</a>
    </td>
    <td>
      <PetName v-for="pet in pets" :pet="pet" :client-id="clientId" />
      <div v-if="petCount > pets.length">{{ petCount - pets.length }} more</div>
    </td>
    <td>{{ props.phoneNumber }}</td>
    <td>
      <div>
        <span class="label">Previous:</span>
        <span v-if="appointments.last">{{ appointments.last }}</span
        ><span v-else>None</span>
      </div>
      <div>
        <span class="label">Next:</span>
        <span v-if="appointments.next">{{ appointments.next }}</span
        ><span v-else>None</span>
      </div>
    </td>
    <td>
      <div>
        <span class="label">Balance:</span><a :href="balanceLink" target="_blank">{{ balance }}</a>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { VIcon } from "vuetify/components";
import { toRefs } from "vue";
import { useClientDetails } from "../../composables/clientDetails";

import PetName from "../PetName.vue";

interface Props {
  clientId: string;
  callIcon: string;
  phoneNumber: string;
}

const props = defineProps<Props>();
const { clientId } = toRefs(props);

const clientDetails = useClientDetails(clientId);
const { clientName, balance, petCount, pets, appointments, clientLink, balanceLink } =
  toRefs(clientDetails);
</script>

<style lang="scss" scoped>
.label {
  font-weight: 700;
  padding-right: 0.5em;
}

a {
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
}
</style>
