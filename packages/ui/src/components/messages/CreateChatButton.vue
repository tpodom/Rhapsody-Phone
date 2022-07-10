<template>
  <v-dialog persistent v-model="dialogOpen" max-width="600">
    <template v-slot:activator="{ props }">
      <v-btn
        rounded
        class="mt-3 ml-3 mr-3 mb-1 align-self-start"
        color="primary"
        v-bind="props"
      >
        <v-icon icon="mdi-message-outline" /> New Chat
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="text-h5">Start Conversation</span>
      </v-card-title>
      <v-card-text>
        <p class="mb-3">
          Start a new conversation by entering the phone number of the client you want to message.
        </p>

        <p v-if="errorMessage" class="mb-3 error">
          <div>There was an error creating the new conversation:</div>
          <ul class="ml-8">
            <li>{{ errorMessage }}</li>
          </ul>
        </p>

        <v-form v-model="valid">
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
import { ref, watch } from "vue";
import { useMessagingStore } from "../../stores/messaging";
import { useRouter } from "vue-router";

const REGEX_FORMATTING_CHARS = /[\(\)\-\.\s]/g;

const messagingStore = useMessagingStore();
const router = useRouter();

const dialogOpen = ref(false);
const valid = ref(false);
const creating = ref(false);
const errorMessage = ref("");
const phoneNumber = ref("");

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
    const conversation = await messagingStore.createConversation(null, phoneNumber.value);
    await router.push(`/messages/${conversation.id}`);
    dialogOpen.value = false;
  } catch (err) {
    errorMessage.value = (err as Error).message;
  } finally {
    creating.value = false;
  }
};

watch(dialogOpen, (newVal) => {
  if (!newVal) {
    phoneNumber.value = "";
    errorMessage.value = "";
    creating.value = false;
    valid.value = false;
  }
});
</script>

<style lang="scss" scoped>
.error {
    color: rgb(var(--v-theme-error));
}
</style>