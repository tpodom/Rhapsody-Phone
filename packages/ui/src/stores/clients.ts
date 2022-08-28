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
import {
  useFirestore,
  FirestoreDocRefListener,
  FirestoreQueryListener,
} from "../composables/firestore";
import type { Ref } from "vue";
import { ref } from "vue";
import LRU from "lru-cache";
import type { SearchResult } from "../types/search";
import * as search from "../lib/search";
import type { Appointment, Client, ClientSearchRecord, Pet } from "../types/clients";

enum SortDirection {
  DESC = "desc",
  ASC = "asc",
}

function recentAppointmentQuery(
  cache: LRU<string, FirestoreQueryListener<Appointment>>,
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

    const listener = useFirestore<Appointment>(appointmentQuery, undefined, { autoDispose: false });
    cache.set(clientId, listener);
  }

  return cache.get(clientId)?.snapshot ?? ref<Appointment[] | null | undefined>();
}

export const useClientsStore = defineStore("clients", () => {
  const lruOptions = {
    max: 100,
    ttl: 10 * 60000,
  };

  const clientCache = new LRU<string, FirestoreDocRefListener<Client>>({
    ...lruOptions,
    dispose(value: FirestoreDocRefListener<Client>) {
      value.stop();
    },
  });

  const petCache = new LRU<string, FirestoreQueryListener<Pet>>({
    ...lruOptions,
    dispose(value: FirestoreQueryListener<Pet>) {
      value.stop();
    },
  });

  const lastAppointmentCache = new LRU<string, FirestoreQueryListener<Appointment>>({
    ...lruOptions,
    dispose(value: FirestoreQueryListener<Appointment>) {
      value.stop();
    },
  });

  const nextAppointmentCache = new LRU<string, FirestoreQueryListener<Appointment>>({
    ...lruOptions,
    dispose(value: FirestoreQueryListener<Appointment>) {
      value.stop();
    },
  });

  const getClient = (id: string): Ref<Client | null | undefined> => {
    if (!clientCache.has(id)) {
      const docRef = doc(firestore, "clients", id) as DocumentReference<Client>;
      const listener = useFirestore<Client>(docRef, undefined, { autoDispose: false });
      clientCache.set(id, listener);
    }

    return clientCache.get(id)?.snapshot ?? ref<Client | null | undefined>();
  };

  const getPets = (clientId: string): Ref<Pet[] | null | undefined> => {
    if (!petCache.has(clientId)) {
      const petsRef = collection(
        doc(firestore, "clients", clientId),
        "pets",
      ) as CollectionReference<Pet>;

      const listener = useFirestore<Pet>(petsRef, undefined, { autoDispose: false });

      petCache.set(clientId, listener);
    }
    return petCache.get(clientId)?.snapshot ?? ref<Pet[] | null | undefined>();
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
