import { defineStore } from "pinia";
import { firestore } from "../lib/firebase/firestore";
import { functions, httpsCallable } from "../lib/firebase/functions";
import { doc } from "firebase/firestore";
import { computed, ref, Ref } from "vue";
import { useRouter } from "vue-router";
import { usePopupWindow } from "../composables/popup";
import { watchOnce } from "@vueuse/core";
import { useFirestore } from "../composables/firestore";

type GoToAuthUrlResponseData = {
  url: string;
};

export const useSettingsStore = defineStore("settings", () => {
  const router = useRouter();
  const popupWindow = usePopupWindow();

  const gotoConnectSettings = useFirestore(doc(firestore, "settings", "gotoConnect"));
  const rhapsodySettings = useFirestore(doc(firestore, "settings", "rhapsody"));

  // The doc will start out as undefined initially and will resolve as null or an object
  const gotoConnectLoading = computed(() => gotoConnectSettings.value === undefined);
  const rhapsodyLoading = computed(() => rhapsodySettings.value === undefined);
  const loading = computed(() => gotoConnectLoading.value || rhapsodyLoading.value);

  async function connectGoToConnect() {
    try {
      const {
        data: { url },
      } = await httpsCallable<void, GoToAuthUrlResponseData>(functions, "getGoToAuthURL")();

      popupWindow.open(url, "Connect GoTo Connect");

      return new Promise((resolve) => {
        watchOnce(popupWindow.isOpen, resolve);
      });
    } catch (err) {
      console.error(err);
      throw new Error("Unable to get the GoTo authentication URL.");
    }
  }

  async function disconnectGoToConnect() {
    return httpsCallable<void, void>(functions, "disconnectGoTo")();
  }

  async function syncGoToConnect() {
    return httpsCallable<void, void>(functions, "updateGotoWebhooks")();
  }

  async function syncRhapsody() {
    return httpsCallable<void, void>(functions, "syncRhapsody")();
  }

  return {
    gotoConnectSettings,
    rhapsodySettings,
    loading,
    connectGoToConnect,
    disconnectGoToConnect,
    syncGoToConnect,
    syncRhapsody,
  };
});
