<template>
  <v-dialog persistent v-model="dialogOpen" max-width="600">
    <template v-slot:activator="{ props }">
      <v-btn rounded class="mt-3 ml-3 mr-3 mb-1 align-self-start" color="primary" v-bind="props">
        <v-icon icon="mdi-message-outline" /> New Chat
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="text-h5">Start Conversation</span>
      </v-card-title>
      <v-divider />
      <v-card-text>
        <p class="mb-3">
          Start a new conversation by selecting a client and entering the phone number you want to
          message.
        </p>

        <div v-if="errorMessage" class="mb-3 error">
          <div>There was an error creating the new conversation:</div>
          <ul class="ml-8">
            <li>{{ errorMessage }}</li>
          </ul>
        </div>

        <v-form v-model="valid">
          <ClientsAutocomplete @selected="selectedClient = $event" />

          <v-text-field
            v-model="phoneNumber"
            type="tel"
            label="Phone Number"
            :rules="phoneNumberRules"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn :disabled="creating" @click="dialogOpen = false">Cancel</v-btn>
        <v-btn :disabled="!valid" :loading="creating" color="primary" @click="onCreate"
          >Create</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, Ref } from "vue";
import { useRouter } from "vue-router";
import { useMessagingStore } from "../../stores/messaging";
import type { ClientSearchRecord } from "../../types/clients";
import { formatPhoneNumber } from "../../lib/formatters";
import ClientsAutocomplete from "../ClientsAutocomplete.vue";

const REGEX_FORMATTING_CHARS = /[\(\)\-\.\s]/g;

const messagingStore = useMessagingStore();
const router = useRouter();

const dialogOpen = ref(false);
const valid = ref(false);
const creating = ref(false);
const errorMessage = ref("");
const phoneNumber = ref("");
const selectedClient: Ref<ClientSearchRecord | undefined> = ref();

const phoneNumberRules = [
  (input: any): string | true => !!input || "Phone number is required",
  (input: any): string | true => !!input?.match(/^[\(\)\-\.\s\d]/) || "Invalid characters",
  (input: any): string | true =>
    !!sanitizedPhoneNumber(input).match(/\d{10,}/) || "Must contain at least 10 digits",
];

const sanitizedPhoneNumber = (input: any): string =>
  (input || "").replaceAll(REGEX_FORMATTING_CHARS, "");

const onCreate = async () => {
  try {
    creating.value = true;
    errorMessage.value = "";

    const conversation = await messagingStore.createConversation(
      selectedClient.value?.id ?? null,
      phoneNumber.value,
    );

    await router.push(`/messages/${conversation.id}`);
    dialogOpen.value = false;
  } catch (err) {
    errorMessage.value = (err as Error).message;
  } finally {
    creating.value = false;
  }
};

watch(selectedClient, (newVal) => {
  if (newVal?.mobile_phone_number) {
    phoneNumber.value = formatPhoneNumber(newVal?.mobile_phone_number);
  }
});

watch(dialogOpen, (newVal) => {
  if (!newVal) {
    selectedClient.value = undefined;
    phoneNumber.value = "";
    errorMessage.value = "";
    creating.value = false;
    valid.value = false;
  } else {
  }
});
</script>

<style lang="scss" scoped>
.error {
  color: rgb(var(--v-theme-error));
}

.autocomplete-segment {
  white-space: pre;
}
</style>
