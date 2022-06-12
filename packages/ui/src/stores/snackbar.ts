import { defineStore } from "pinia";
import { ref, Ref } from "vue";

export enum SnackbarLevel {
  INFO,
  WARNING,
  ERROR,
}

export const useSnackbarStore = defineStore("snackbar", () => {
  const message: Ref<string | null> = ref(null);
  const type: Ref<SnackbarLevel> = ref(SnackbarLevel.INFO);
  const showing = ref(false);

  function showMessage(text: string, level = SnackbarLevel.INFO) {
    message.value = text;
    type.value = level;
    showing.value = true;
  }

  const showInfo = (text: string) => showMessage(text);
  const showWarning = (text: string) => showMessage(text, SnackbarLevel.WARNING);
  const showError = (text: string) => showMessage(text, SnackbarLevel.ERROR);

  return { message, type, showing, showInfo, showWarning, showError };
});
