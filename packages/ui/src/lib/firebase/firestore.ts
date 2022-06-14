import { firebaseApp } from "./app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import yn from "yn";

export const firestore = getFirestore(firebaseApp);

if (yn(import.meta.env.VITE_FIREBASE_EMULATOR)) {
  connectFirestoreEmulator(firestore, "localhost", 8080);
}
