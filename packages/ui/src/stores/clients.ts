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

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  balance: number;
}

export enum Gender {
  FEMALE = "FEMALE",
  MALE = "MALE",
}

export enum SpayedNeuteredStatus {
  SPAYED = "SPAYED",
  NEUTERED = "NEUTERED",
  INTACT = "INTACT",
}

export interface Pet {
  id: string;
  name: string;
  gender: Gender;
  spayedNeuteredStatus: SpayedNeuteredStatus;
  deleted: boolean;
  deceased: boolean;
}

export interface Appointment {
  id: string;
  type: {
    name: string;
  };
  scheduledStartDatetime: Timestamp;
  patientId: string;
  deleted: boolean;
}

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

    cache.set(clientId, useFirestore<Appointment>(appointmentQuery));
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
      clientCache.set(id, useFirestore<Client>(docRef));
    }
    return clientCache.get(id)!;
  };

  const getPets = (clientId: string): Ref<Pet[] | null | undefined> => {
    if (!petCache.has(clientId)) {
      const petsRef = collection(
        doc(firestore, "clients", clientId),
        "pets",
      ) as CollectionReference<Pet>;
      petCache.set(clientId, useFirestore<Pet>(petsRef));
    }
    return petCache.get(clientId)!;
  };

  const findLastAppointment = (clientId: string): Ref<Appointment[] | null | undefined> => {
    return recentAppointmentQuery(lastAppointmentCache, clientId, SortDirection.DESC);
  };

  const findNextAppointment = (clientId: string): Ref<Appointment[] | null | undefined> => {
    return recentAppointmentQuery(nextAppointmentCache, clientId, SortDirection.ASC);
  };

  return {
    getClient,
    getPets,
    findLastAppointment,
    findNextAppointment,
  };
});
