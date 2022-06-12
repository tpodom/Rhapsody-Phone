<template>
  <tr>
    <td><v-icon v-if="props.callIcon" :icon="props.callIcon" /></td>
    <td>
      <a :href="rhapsodyLink" target="_blank">{{ clientName }}</a>
    </td>
    <td>
      <PetName v-for="pet in pets" :pet="pet" :rhapsody-client-id="rhapsodyClientId" />
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
        <span class="label">Balance:</span
        ><a :href="balanceRhapsodyLink" target="_blank">{{ balance }}</a>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { VIcon } from "vuetify/components";
import { computed, ref, watchEffect, Ref } from "vue";
import { useClientsStore, Pet } from "../stores/clients";
import { formatRelativeAppointmentTime } from "../lib/formatters";
import PetName from "./PetName.vue";

interface Props {
  rhapsodyClientId: string;
  callIcon: string;
  phoneNumber: string;
}

const clientsStore = useClientsStore();

const props = defineProps<Props>();
const clientName = ref("");
const balance = ref("");
const petCount = ref(0);
const pets: Ref<Pet[]> = ref([]);
const appointments: Ref<{ last: string | undefined; next: string | undefined }> = ref({
  last: undefined,
  next: undefined,
});

const rhapsodyLink = computed(() => `https://portal.rhapsody.vet/client/${props.rhapsodyClientId}`);
const balanceRhapsodyLink = computed(
  () => `https://portal.rhapsody.vet/balance/${props.rhapsodyClientId}/`,
);

watchEffect(() => {
  const clientRef = clientsStore.getClient(props.rhapsodyClientId);
  const petsRef = clientsStore.getPets(props.rhapsodyClientId);
  const lastAppointment = clientsStore.findLastAppointment(props.rhapsodyClientId);
  const nextAppointment = clientsStore.findNextAppointment(props.rhapsodyClientId);

  if (clientRef.value) {
    clientName.value = `${clientRef.value.firstName} ${clientRef.value.lastName}`;
    balance.value = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
      clientRef.value.balance,
    );

    petCount.value = petsRef.value?.length ?? 0;
    pets.value = (petsRef.value || [])
      .filter((p) => !p.deleted)
      .sort((a, b) => {
        if (a.deceased && !b.deceased) {
          return -1;
        } else if (b.deceased) {
          return 1;
        }
        return a.name.localeCompare(b.name);
      })
      .slice(0, 3);

    appointments.value.last = lastAppointment.value?.length
      ? formatRelativeAppointmentTime(lastAppointment.value[0].scheduledStartDatetime.toDate())
      : undefined;
    appointments.value.next = nextAppointment.value?.length
      ? formatRelativeAppointmentTime(nextAppointment.value[0].scheduledStartDatetime.toDate())
      : undefined;
  }
});
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
