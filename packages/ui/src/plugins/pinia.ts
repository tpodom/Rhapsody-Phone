import { PiniaFirestoreSync } from "pinia-plugin-firestore-sync";
import { createPinia } from "pinia";

export const pinia = createPinia().use(PiniaFirestoreSync);
