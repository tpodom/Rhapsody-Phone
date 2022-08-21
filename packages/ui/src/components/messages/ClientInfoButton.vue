<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn icon="mdi-information-outline" v-bind="props" />
    </template>

    <v-card min-width="300">
      <v-list>
        <v-list-item>
          <v-list-item-title>
            <a :href="clientLink" target="_blank">{{ clientName }}</a>
          </v-list-item-title>

          <v-spacer />

          <v-list-item-action>
            <a :href="balanceLink" target="_blank">{{ balance }}</a>
          </v-list-item-action>
        </v-list-item>

        <v-divider />

        <v-list-item class="label">Pets</v-list-item>

        <v-list-item v-for="pet in pets" class="ml-4">
          <PetName :pet="pet" :client-id="clientId" />
        </v-list-item>

        <v-list-item v-if="petCount > pets.length">{{ petCount - pets.length }} more</v-list-item>

        <v-divider />

        <v-list-item class="label">Appointments</v-list-item>
        <v-list-item class="ml-4">
          <span class="label">Previous:</span>
          <span v-if="appointments.last">{{ appointments.last }}</span>
          <span v-else>None</span>
        </v-list-item>
        <v-list-item class="ml-4">
          <span class="label">Next:</span>
          <span v-if="appointments.next">{{ appointments.next }}</span>
          <span v-else>None</span>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script lang="ts" setup>
import { toRefs } from "vue";
import { useClientDetails } from "../../composables/clientDetails";
import PetName from "../PetName.vue";

interface Props {
  clientId: string;
}

const props = defineProps<Props>();
const clientDetails = useClientDetails(props.clientId);

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
