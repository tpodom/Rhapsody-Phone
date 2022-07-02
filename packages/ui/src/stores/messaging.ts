import { defineStore } from "pinia";
import {
  collection,
  doc,
  query,
  orderBy,
  limit,
  CollectionReference,
  DocumentReference,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../lib/firebase/firestore";
import { useFirestore } from "../composables/firestore";
import { computed, ref, Ref } from "vue";

export enum Direction {
  OUT = "OUT",
  IN = "IN",
}

export enum SentStatus {
  SENDING = "SENDING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export interface Media {
  contentType: string;
  filename: string;
  size: number;
  url: string;
}

export interface Message {
  id: string;
  timestamp: Timestamp;
  body: string;
  direction: Direction;
  media?: Media[];
  sentStatus?: SentStatus;
  read: boolean;
}

export interface Conversation {
  id: string;
  unreadCount: number;
  latestMessage?: Message;
  tags: string[];
  client: {
    phoneNumber: string;
    name: string;
  };
}

export const useMessagingStore = defineStore("messaging", () => {
  const conversationsQueueRef = collection(
    firestore,
    "conversations",
  ) as CollectionReference<Conversation>;

  const conversationsQuery = query(
    conversationsQueueRef,
    orderBy("latestMessage.timestamp", "desc"),
    limit(20),
  );

  const conversations = useFirestore<Conversation>(conversationsQuery);

  // The doc will start out as undefined initially and will resolve as null or an object
  const loading = computed(() => conversations.value === undefined);

  const loadConversation = (id: string): Ref<Conversation | null | undefined> => {
    const cachedConversation = conversations.value?.find((conversation) => conversation.id === id);
    if (cachedConversation) {
      return ref(cachedConversation);
    }
    const docRef = doc(firestore, "conversations", id) as DocumentReference<Conversation>;
    return useFirestore<Conversation>(docRef);
  };

  const loadMessages = (conversationId: string): Ref<Message[] | undefined> => {
    const collectionRef = collection(
      doc(firestore, "conversations", conversationId),
      "messages",
    ) as CollectionReference<Message>;
    return useFirestore<Message>(collectionRef);
  };

  return { conversations, loading, loadConversation, loadMessages };
});
