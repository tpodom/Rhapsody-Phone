import { defineStore } from "pinia";
import { firestore } from "../lib/firebase/firestore";
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  CollectionReference,
  DocumentReference,
  Timestamp,
} from "firebase/firestore";
import { useFirestore } from "../composables/firestore";
import type { Ref } from "vue";
import LRU from "lru-cache";
import type { SearchResult } from "../types/search";
import * as search from "../lib/search";
import type { Appointment, Client, ClientSearchRecord, Pet } from "../types/clients";

enum SortDirection {
  DESC = "desc",
  ASC = "asc",
}

function recentAppointmentQuery(
  cache: LRU<string, Ref<Appointment[] | null | undefined>>,
  clientId: string,
  sortDirection: SortDirection,
): Ref<Appointment[] | null | undefined> {
  if (!cache.has(clientId)) {
    const appointmentsCollectionRef = collection(
      doc(firestore, "clients", clientId),
      "appointments",
    ) as CollectionReference<Appointment>;

    const appointmentQuery = query(
      appointmentsCollectionRef,
      where(
        "scheduledStartDatetime",
        sortDirection === SortDirection.DESC ? "<" : ">=",
        Timestamp.fromDate(new Date()),
      ),
      orderBy("scheduledStartDatetime", sortDirection),
      limit(1),
    );

    const { snapshot } = useFirestore<Appointment>(appointmentQuery);
    cache.set(clientId, snapshot);
  }
  return cache.get(clientId)!;
}

export const useClientsStore = defineStore("clients", () => {
  const lruOptions = {
    max: 100,
    ttl: 10 * 60000,
  };
  const clientCache = new LRU<string, Ref<Client | null | undefined>>(lruOptions);
  const petCache = new LRU<string, Ref<Pet[] | null | undefined>>(lruOptions);
  const lastAppointmentCache = new LRU<string, Ref<Appointment[] | null | undefined>>(lruOptions);
  const nextAppointmentCache = new LRU<string, Ref<Appointment[] | null | undefined>>(lruOptions);

  const getClient = (id: string): Ref<Client | null | undefined> => {
    if (!clientCache.has(id)) {
      const docRef = doc(firestore, "clients", id) as DocumentReference<Client>;
      const { snapshot } = useFirestore<Client>(docRef);
      clientCache.set(id, snapshot);
    }
    return clientCache.get(id)!;
  };

  const getPets = (clientId: string): Ref<Pet[] | null | undefined> => {
    if (!petCache.has(clientId)) {
      const petsRef = collection(
        doc(firestore, "clients", clientId),
        "pets",
      ) as CollectionReference<Pet>;
      const { snapshot } = useFirestore<Pet>(petsRef);
      petCache.set(clientId, snapshot);
    }
    return petCache.get(clientId)!;
  };

  const findLastAppointment = (clientId: string): Ref<Appointment[] | null | undefined> => {
    return recentAppointmentQuery(lastAppointmentCache, clientId, SortDirection.DESC);
  };

  const findNextAppointment = (clientId: string): Ref<Appointment[] | null | undefined> => {
    return recentAppointmentQuery(nextAppointmentCache, clientId, SortDirection.ASC);
  };

  const typeaheadSearch = (queryString: string): Promise<SearchResult<ClientSearchRecord>> => {
    if (!search.isConfigured()) {
      throw new Error("Search is not enabled.");
    }

    const searchParameters = {
      q: queryString,
      query_by: "name",
      sort_by: "timestamp:desc",
    };

    return search.query("clients", searchParameters);
  };

  return {
    getClient,
    getPets,
    findLastAppointment,
    findNextAppointment,
    typeaheadSearch,
  };
});
