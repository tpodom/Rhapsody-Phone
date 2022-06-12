import { ref } from "vue";

export function usePopupWindow() {
  const isOpen = ref(false);
  let windowReference: Window | null = null;
  let previousUrl: string | undefined;

  function popupClosed() {
    isOpen.value = false;
  }

  function open(url: string, name: string, width: number = 600, height: number = 700) {
    const windowFeatures = `toolbar=no, menubar=no, width=${width}, height=${height}, top=100, left=100`;

    if (!windowReference || windowReference.closed) {
      windowReference = window.open(url, name, windowFeatures);
      if (windowReference) {
        windowReference.onunload = popupClosed;
      }
    } else if (previousUrl !== url) {
      windowReference = window.open(url, name, windowFeatures);

      if (windowReference) {
        windowReference.onunload = popupClosed;
        windowReference.focus();
      }
    } else {
      windowReference.focus();
    }

    isOpen.value = true;
  }

  return { isOpen, open };
}
