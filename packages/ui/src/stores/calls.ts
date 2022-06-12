import { defineStore } from "pinia";
import { firestore } from "../lib/firebase/firestore";
import {
  collection,
  query,
  orderBy,
  limit,
  CollectionReference,
  Timestamp,
} from "firebase/firestore";
import { computed, Ref } from "vue";
import { useFirestore } from "../composables/firestore";

export interface Call {
  id: string;
  state: string;
  startTime: Timestamp;
  endTime: Timestamp | null;
  caller: {
    phoneNumber: string;
    name: string;
  };
  rhapsodyClientId: string | undefined;
}

export const useCallsStore = defineStore("calls", () => {
  const callQueueRef = collection(firestore, "call_queue") as CollectionReference<Call>;
  const callsQuery = query(callQueueRef, orderBy("startTime", "desc"), limit(20));
  const calls = useFirestore<Call>(callsQuery);

  // The doc will start out as undefined initially and will resolve as null or an object
  const loading = computed(() => calls.value === undefined);

  return { calls, loading };
});
