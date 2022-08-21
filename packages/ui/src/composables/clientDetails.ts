import { Ref, watchEffect } from "vue";
import { ref, unref } from "vue";
import type { Pet } from "../types/clients";
import { useClientsStore } from "../stores/clients";
import { formatRelativeAppointmentTime } from "../lib/formatters";
import { getBalanceLink, getClientLink } from "../lib/rhapsody";

export function useClientDetails(clientId: string | Ref<string>) {
  const clientsStore = useClientsStore();

  const clientName = ref("");
  const balance = ref("");
  const petCount = ref(0);
  const pets: Ref<Pet[]> = ref([]);
  const appointments: Ref<{ last: string | undefined; next: string | undefined }> = ref({
    last: undefined,
    next: undefined,
  });
  const clientLink = ref("");
  const balanceLink = ref("");

  watchEffect(() => {
    const clientIdValue = unref(clientId);

    const clientRef = clientsStore.getClient(clientIdValue);
    const petsRef = clientsStore.getPets(clientIdValue);
    const lastAppointment = clientsStore.findLastAppointment(clientIdValue);
    const nextAppointment = clientsStore.findNextAppointment(clientIdValue);

    clientLink.value = getClientLink(clientIdValue);
    balanceLink.value = getBalanceLink(clientIdValue);

    if (clientRef.value) {
      clientName.value = clientRef.value.displayName;
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

  return {
    clientName,
    balance,
    petCount,
    pets,
    appointments,
    clientLink,
    balanceLink,
  };
}
