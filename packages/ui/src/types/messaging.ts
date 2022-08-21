import type { Timestamp } from "firebase/firestore";

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
  errorCount: number;
  unreadCount: number;
  latestMessage?: Message;
  timestamp: Timestamp;
  labels: string[] | undefined;
  client: {
    phoneNumber: string;
    name: string;
    id?: string;
  };
}

export interface MessageSearchRecord {
  id: string;
  conversationId: string;
  body: string;
  labels: string[];
  timestamp: number;
  "client.name": string;
  "client.phone_number": string[];
}

export type MessageRef = {
  messageId: string;
  conversationId: string;
};
