import { defineStore } from "pinia";
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  CollectionReference,
  DocumentReference,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import { firestore } from "../lib/firebase/firestore";
import {
  FirestoreDocRefListener,
  FirestoreQueryListener,
  useFirestore,
} from "../composables/firestore";
import { computed, reactive, ref, Ref, watch } from "vue";
import { functions, httpsCallable } from "../lib/firebase/functions";
import LRU from "lru-cache";
import * as search from "../lib/search";
import type { SearchResult } from "../types/search";
import { Conversation, Message, MessageSearchRecord, Media, Direction } from "../types/messaging";
import type { Label } from "../types/labels";

interface MessagesFilter {
  searchString: string;
  labels: Label[];
}

export const useMessagingStore = defineStore("messaging", () => {
  const lruOptions = {
    max: 10,
    ttl: 10 * 60000,
  };

  const conversationCache = new LRU<string, FirestoreDocRefListener<Conversation>>({
    ...lruOptions,
    dispose(value: FirestoreDocRefListener<Conversation>) {
      value.stop();
    },
  });

  const messagesCache = new LRU<string, FirestoreQueryListener<Message>>({
    ...lruOptions,
    dispose(value: FirestoreQueryListener<Message>) {
      value.stop();
    },
  });

  const filter: MessagesFilter = reactive({
    searchString: "",
    labels: [],
  });

  const conversationsQueueRef = collection(
    firestore,
    "conversations",
  ) as CollectionReference<Conversation>;

  const conversations: Ref<Conversation[] | undefined> = ref();

  // The doc will start out as undefined initially and will resolve as null or an object
  const loading = computed(() => conversations.value === undefined);

  const buildQuery = (...queryConstraints: QueryConstraint[]) => {
    return query(
      conversationsQueueRef,
      ...queryConstraints,
      orderBy("timestamp", "desc"),
      limit(50),
    );
  };

  const defaultQuery = buildQuery();

  const { snapshot: realtimeConversations, updateQuery: updateConversationsQuery } =
    useFirestore(defaultQuery);

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
      const docRef = doc(firestore, "conversations", id) as DocumentReference<Conversation>;
      const conversationListener = useFirestore<Conversation>(docRef, undefined, {
        autoDispose: false,
      });
      conversationCache.set(id, conversationListener);
    }

    return conversationCache.get(id)?.snapshot ?? ref<Conversation | null | undefined>();
  };

  const updateConversationLabels = async (
    conversationId: string,
    labelIds: string[],
  ): Promise<Conversation> => {
    interface UpdateLabelsRequest {
      conversationId: string;
      labelIds: string[];
    }

    const { data } = await httpsCallable<UpdateLabelsRequest, Conversation>(
      functions,
      "updateConversationLabels",
    )({ conversationId, labelIds });

    return data;
  };

  const getMessages = (conversationId: string): Ref<Message[] | undefined> => {
    if (!messagesCache.has(conversationId)) {
      const collectionRef = collection(
        doc(firestore, "conversations", conversationId),
        "messages",
      ) as CollectionReference<Message>;

      const listener = useFirestore<Message>(
        query(collectionRef, orderBy("timestamp", "asc")),
        undefined,
        { autoDispose: false },
      );

      messagesCache.set(conversationId, listener);
    }

    return messagesCache.get(conversationId)?.snapshot ?? ref<Message[] | undefined>();
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

  const searchMessages = (
    queryString: string,
    labels: Label[] = [],
    limit: number = 10,
  ): Promise<SearchResult<MessageSearchRecord>> => {
    if (!search.isConfigured()) {
      throw new Error("Search is not enabled.");
    }

    const labelFilters = labels.map((label) => `labels:=${label.id}`).join(" && ");
    const searchParameters = {
      q: queryString,
      query_by: "body,client.name,client.phone_number",
      sort_by: "timestamp:desc",
      filter_by: labelFilters,
      group_by: "conversationId",
      group_limit: 1,
      limit,
    };

    return search.query("messages", searchParameters);
  };

  const updateFilter = (updated: Partial<MessagesFilter>) => {
    filter.searchString = updated.searchString ?? filter.searchString;
    filter.labels = updated.labels ?? filter.labels;
  };

  const filterConversations = (conversations: Conversation[] | undefined) => {
    // firestore doesn't have a way to filter on an array containing ALL values only ANY
    if (conversations && filter.labels.length) {
      return conversations.filter((conversation) =>
        filter.labels.every((label) =>
          conversation.labels?.some((labelId) => label.id === labelId),
        ),
      );
    }
    return conversations;
  };

  watch(realtimeConversations, () => {
    if (!filter.searchString) {
      conversations.value = filterConversations(realtimeConversations.value);
    }
  });

  watch(filter, async () => {
    conversations.value = undefined;

    if (filter.searchString) {
      const results = await searchMessages(filter.searchString, filter.labels, 50);

      conversations.value = results.hits.map((hit) => {
        const timestamp = Timestamp.fromMillis(hit.document.timestamp);
        return {
          id: hit.document.conversationId,
          timestamp,
          labels: hit.document["labels"],
          errorCount: 0,
          unreadCount: 0,
          client: {
            phoneNumber: hit.document["client.phone_number"][0],
            name: hit.document["client.name"],
          },
          latestMessage: {
            id: hit.document.id,
            timestamp,
            body: hit.document.body,
            // The following aren't indexed
            direction: Direction.IN,
            read: true,
          },
        };
      });
    } else if (filter.labels.length) {
      const newQuery = buildQuery(
        where("labels", "array-contains-any", filter.labels.map((label) => label.id).slice(0, 10)),
      );
      updateConversationsQuery(newQuery);
    } else {
      updateConversationsQuery(defaultQuery);
    }
  });

  return {
    conversations,
    loading,
    createConversation,
    getConversation,
    updateConversationLabels,
    getMessages,
    markMessageRead,
    sendMessage,
    resendMessage,
    typeaheadSearch: searchMessages,
    updateFilter,
  };
});
