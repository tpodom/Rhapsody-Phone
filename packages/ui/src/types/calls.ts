import type { Timestamp } from "firebase/firestore";

export interface Call {
  id: string;
  state: string;
  startTime: Timestamp;
  endTime: Timestamp | null;
  caller: {
    phoneNumber: string;
    name: string;
  };
  rhapsodyClientId: string | undefined;
}
