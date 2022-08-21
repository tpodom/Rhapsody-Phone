import type {
  Query,
  QueryDocumentSnapshot,
  DocumentData,
  DocumentSnapshot,
} from "firebase/firestore";
import { onSnapshot, DocumentReference } from "firebase/firestore";
import { reactive, ref, Ref } from "vue";
import { isDef, tryOnScopeDispose } from "@vueuse/core";
import { Unsubscribe } from "firebase/app-check";

export interface FirestoreOptions {
  errorHandler?: (err: Error) => void;
  autoDispose?: boolean;
}

export type FirebaseDocRef<T> = Query<T> | DocumentReference<T>;

export interface FirestoreListener {
  stop: () => void;
}

export interface FirestoreDocRefListener<T extends DocumentData> extends FirestoreListener {
  snapshot: Ref<T | undefined | null>;
  updateDocRef(docRef: DocumentReference<T>): void;
}

export interface FirestoreQueryListener<T extends DocumentData> extends FirestoreListener {
  snapshot: Ref<T[] | undefined>;
  updateQuery(query: Query<T>): void;
}

export type FirebaseListener<T> = FirestoreDocRefListener<T> | FirestoreQueryListener<T>;

function getData<T>(docRef: DocumentSnapshot<T> | QueryDocumentSnapshot<T>) {
  const data = docRef.data();

  if (data) {
    Object.defineProperty(data, "id", {
      value: docRef.id.toString(),
      writable: false,
    });
  }

  return data;
}

// nullable initial values
export function useFirestore<T extends DocumentData>(
  docRef: DocumentReference<T>,
  initialValue?: T | undefined,
  options?: FirestoreOptions,
): FirestoreDocRefListener<T>;

export function useFirestore<T extends DocumentData>(
  docRef: Query<T>,
  initialValue?: T[],
  options?: FirestoreOptions,
): FirestoreQueryListener<T>;

/**
 * Reactive Firestore binding. Making it straightforward to always keep your
 * local data in sync with remotes databases.
 *
 * @see https://vueuse.org/useFirestore
 * @param docRef
 * @param initialValue
 * @param options
 */
export function useFirestore<T extends DocumentData>(
  docRef: FirebaseDocRef<T>,
  initialValue: any = undefined,
  options: FirestoreOptions = {},
): FirebaseListener<T> {
  const {
    // eslint-disable-next-line no-console
    errorHandler = (err: Error) => console.error(err),
    autoDispose = true,
  } = options;

  let close: Unsubscribe | undefined;

  const stop = () => {
    if (close) {
      close();
      close = undefined;
    }
  };

  if (docRef instanceof DocumentReference) {
    const snapshotRef: Ref<T | null | undefined> = ref(initialValue);

    const updateDocRef = (newDocRef: DocumentReference<T>) => {
      stop();

      close = onSnapshot(
        newDocRef,
        (snapshot: DocumentSnapshot<T>) => {
          snapshotRef.value = getData(snapshot) || null;
        },
        errorHandler,
      );
    };

    updateDocRef(docRef);
    if (autoDispose) {
      tryOnScopeDispose(stop);
    }

    return {
      snapshot: snapshotRef,
      stop,
      updateDocRef,
    };
  } else {
    const snapshotRef: Ref<T[] | undefined> = ref(initialValue);

    const updateQuery = (newQuery: Query<T>) => {
      stop();

      close = onSnapshot(
        newQuery,
        (snapshot) => {
          snapshotRef.value = snapshot.docs.map(getData).filter(isDef);
        },
        errorHandler,
      );
    };

    updateQuery(docRef);

    if (autoDispose) {
      tryOnScopeDispose(stop);
    }

    return {
      snapshot: snapshotRef,
      stop,
      updateQuery,
    };
  }
}
