import { firebaseApp } from "./app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup as firebaseSignInWithPopup,
} from "firebase/auth";

export * from "firebase/auth";

export const firebaseAuth = getAuth(firebaseApp);
export const authProvider = new GoogleAuthProvider();

export function signInWithPopup() {
  return firebaseSignInWithPopup(firebaseAuth, authProvider);
}
