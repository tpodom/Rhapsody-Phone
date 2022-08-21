import type { Timestamp } from "firebase/firestore";

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  balance: number;
}

export enum Gender {
  FEMALE = "FEMALE",
  MALE = "MALE",
}

export enum SpayedNeuteredStatus {
  SPAYED = "SPAYED",
  NEUTERED = "NEUTERED",
  INTACT = "INTACT",
}

export interface Pet {
  id: string;
  name: string;
  gender: Gender;
  spayedNeuteredStatus: SpayedNeuteredStatus;
  deleted: boolean;
  deceased: boolean;
}

export interface Appointment {
  id: string;
  type: {
    name: string;
  };
  scheduledStartDatetime: Timestamp;
  patientId: string;
  deleted: boolean;
}

export interface ClientSearchRecord {
  id: string;
  name: string;
  phone_number: string[];
  timestamp: number;
  mobile_phone_number: string | null;
  home_phone_number: string | null;
  other_phone_number: string | null;
  work_phone_number: string | null;
}
