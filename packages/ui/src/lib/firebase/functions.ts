import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { firebaseApp } from "./app";
import yn from "yn";

export * from "firebase/functions";

export const functions = getFunctions(firebaseApp);

if (yn(import.meta.env.VITE_FIREBASE_EMULATOR)) {
  connectFunctionsEmulator(functions, "localhost", 5001);
}
