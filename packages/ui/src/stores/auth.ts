import { firebaseAuth, signInWithPopup } from "../lib/firebase/auth";
import { defineStore } from "pinia";
import { ref } from "vue";

type Auth = {
  loggedIn: boolean;
  username: string;
};

export type State = {
  auth: Auth | null;
};

export const useAuthStore = defineStore("auth", () => {
  const loggedIn = ref(false);
  const initialized = ref(false);
  const user = ref(null);
  const authError = ref(null);

  firebaseAuth.onAuthStateChanged((u) => {
    user.value = u;
    loggedIn.value = !!u;
    initialized.value = true;
  });

  function authenticate() {
    return signInWithPopup();
  }

  return { authenticate, loggedIn, initialized, user };
});
