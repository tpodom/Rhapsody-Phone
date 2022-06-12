import { firebaseApp } from "./app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

export const firestore = getFirestore(firebaseApp);

if (!!import.meta.env.VITE_FIREBASE_EMULATOR) {
  connectFirestoreEmulator(firestore, "localhost", 8080);
}
