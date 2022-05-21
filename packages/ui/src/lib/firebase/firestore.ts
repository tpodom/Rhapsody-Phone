import { firebaseApp } from "./app";
import { getFirestore } from "firebase/firestore";

export const firestore = getFirestore(firebaseApp);
