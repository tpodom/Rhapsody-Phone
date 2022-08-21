import { unref } from "vue";
import type { Ref } from "vue";

export function getClientLink(clientId: string | Ref<string>): string {
  const clientIdValue = unref(clientId);
  return `https://portal.rhapsody.vet/client/${clientIdValue}`;
}

export function getBalanceLink(clientId: string | Ref<string>): string {
  const clientIdValue = unref(clientId);
  return `https://portal.rhapsody.vet/client/${clientIdValue}`;
}

export function getPatientLink(
  clientId: string | Ref<string>,
  patientId: string | Ref<string>,
): string {
  const clientIdValue = unref(clientId);
  const patientIdValue = unref(patientId);

  return `https://portal.rhapsody.vet/client/${clientIdValue}/patient/${patientIdValue}`;
}
