import { firebaseAuth, signInWithPopup, User } from "../lib/firebase/auth";
import { defineStore } from "pinia";
import { ref, Ref } from "vue";

type Auth = {
  loggedIn: boolean;
  username: string;
};

export type State = {
  auth: Auth | null;
};

export const useAuthStore = defineStore("auth", () => {
  const loggedIn: Ref<boolean> = ref(false);
  const initialized: Ref<boolean> = ref(false);
  const user: Ref<User | null> = ref(null);
  const isAdmin: Ref<boolean> = ref(false);

  firebaseAuth.onAuthStateChanged(async (u) => {
    user.value = u;
    loggedIn.value = !!u;

    if (u) {
      const token = await u.getIdTokenResult();
      isAdmin.value = !!token?.claims?.admin;
    } else {
      isAdmin.value = false;
    }

    initialized.value = true;
  });

  function authenticate() {
    return signInWithPopup();
  }

  return { authenticate, loggedIn, initialized, user, isAdmin };
});
