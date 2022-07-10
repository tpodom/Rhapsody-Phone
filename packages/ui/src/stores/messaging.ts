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
import { functions, httpsCallable } from "../lib/firebase/functions";
import LRU from "lru-cache";

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
  timestamp: Timestamp;
  tags: string[];
  client: {
    phoneNumber: string;
    name: string;
  };
}

export const useMessagingStore = defineStore("messaging", () => {
  const lruOptions = {
    max: 10,
    ttl: 10 * 60000,
  };

  const conversationCache = new LRU<string, Ref<Conversation | null | undefined>>(lruOptions);
  const messagesCache = new LRU<string, Ref<Message[] | null | undefined>>(lruOptions);

  const conversationsQueueRef = collection(
    firestore,
    "conversations",
  ) as CollectionReference<Conversation>;

  const conversationsQuery = query(conversationsQueueRef, orderBy("timestamp", "desc"), limit(50));

  const conversations = useFirestore<Conversation>(conversationsQuery);

  // The doc will start out as undefined initially and will resolve as null or an object
  const loading = computed(() => conversations.value === undefined);

  const createConversation = async (
    clientId: string | null,
    phoneNumber: string | null,
  ): Promise<Conversation> => {
    interface CreateConversationRequest {
      clientId: string | null;
      phoneNumber: string | null;
    }

    const { data } = await httpsCallable<CreateConversationRequest, Conversation>(
      functions,
      "createConversation",
    )({ clientId, phoneNumber });

    return data;
  };

  const getConversation = (id: string): Ref<Conversation | null | undefined> => {
    if (!conversationCache.has(id)) {
      const conversationFromList = conversations.value?.find(
        (conversation) => conversation.id === id,
      );

      let conversationRef: Ref<Conversation | null | undefined> = ref(conversationFromList);

      if (!conversationRef.value) {
        const docRef = doc(firestore, "conversations", id) as DocumentReference<Conversation>;
        conversationRef = useFirestore<Conversation>(docRef);
      }

      conversationCache.set(id, conversationRef);
    }

    return conversationCache.get(id)!;
  };

  const getMessages = (conversationId: string): Ref<Message[] | undefined> => {
    if (!messagesCache.has(conversationId)) {
      const collectionRef = collection(
        doc(firestore, "conversations", conversationId),
        "messages",
      ) as CollectionReference<Message>;

      const messagesRef = useFirestore<Message>(query(collectionRef, orderBy("timestamp", "asc")));

      messagesCache.set(conversationId, messagesRef);
    }

    return messagesCache.get(conversationId)!;
  };

  const sendMessage = async (
    conversationId: string,
    body: string,
    files: Media[],
  ): Promise<Message> => {
    interface SendMessageRequest {
      conversationId: string;
      body: string;
      files: Media[];
    }

    const { data } = await httpsCallable<SendMessageRequest, Message>(
      functions,
      "sendMessage",
    )({ conversationId, body, files });

    return data;
  };

  const resendMessage = async (conversationId: string, messageId: string): Promise<Message> => {
    interface ResendMessageRequest {
      conversationId: string;
      messageId: string;
    }

    const { data } = await httpsCallable<ResendMessageRequest, Message>(
      functions,
      "resendMessage",
    )({ conversationId, messageId });

    return data;
  };

  const markMessageRead = async (conversationId: string, messageId: string): Promise<Message> => {
    interface MarkReadRequest {
      conversationId: string;
      messageId: string;
    }

    const { data } = await httpsCallable<MarkReadRequest, Message>(
      functions,
      "markMessageRead",
    )({ conversationId, messageId });

    return data;
  };

  return {
    conversations,
    loading,
    createConversation,
    getConversation,
    getMessages,
    markMessageRead,
    sendMessage,
    resendMessage,
  };
});
