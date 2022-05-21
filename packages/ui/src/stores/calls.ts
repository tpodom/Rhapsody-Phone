import { defineStore } from "pinia";
import { firestore } from "../composables/firebase/firestore";
import { collection } from "firebase/firestore";

type Call = {
  id: string;
  phoneNumber: string;
  callerName: string;
};

export type State = {
  calls: Call[] | null;
};

export const useCallsStore = defineStore("calls", {
  state: (): State => {
    return {
      calls: null,
    };
  },
  actions: {
    async setup() {
      console.log("store setup");
      const collectionRef = collection(firestore, "CallQueue");
      this.sync("calls", collectionRef);
    },
  },
  getters: {
    loading: (state) => state.calls === null,
  },
});
