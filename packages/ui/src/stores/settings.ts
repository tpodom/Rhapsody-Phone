import { defineStore } from "pinia";
import { firestore } from "../lib/firebase/firestore";
import { functions, httpsCallable } from "../lib/firebase/functions";
import { doc } from "firebase/firestore";
import { computed, ref, Ref } from "vue";
import { useRouter } from "vue-router";
import { usePopupWindow } from "../composables/popup";
import { watchOnce } from "@vueuse/core";
import { useFirestore } from "../composables/firestore";

interface GoToAuthUrlResponseData {
  url: string;
}

interface CallbackData {
  code: string;
  state: string;
}

export const useSettingsStore = defineStore("settings", () => {
  const router = useRouter();
  const popupWindow = usePopupWindow();

  const { snapshot: gotoConnectSettings } = useFirestore(doc(firestore, "settings", "gotoConnect"));
  const { snapshot: rhapsodySettings } = useFirestore(doc(firestore, "settings", "rhapsody"));

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

  async function goToConnectAuthCallback(code: string, state: string) {
    return httpsCallable<CallbackData, void>(functions, "gotoConnectAuthCallback")({ code, state });
  }

  async function syncGoToConnect() {
    return httpsCallable<void, void>(functions, "updateGotoWebhooks")();
  }

  async function syncRhapsody() {
    return httpsCallable<void, void>(functions, "syncRhapsody")();
  }

  async function syncSearch() {
    return httpsCallable<void, void>(functions, "syncSearch")();
  }

  return {
    gotoConnectSettings,
    rhapsodySettings,
    loading,
    connectGoToConnect,
    goToConnectAuthCallback,
    disconnectGoToConnect,
    syncGoToConnect,
    syncRhapsody,
    syncSearch,
  };
});
