<template>
  <v-autocomplete
    v-if="searchEnabled"
    class="mb-3"
    v-model="selectedClient"
    v-model:search="searchText"
    :loading="loading"
    :items="clients"
    cache-items
    no-filter
    flat
    hide-no-data
    hide-details
    label="Client Name"
    solo-inverted
    return-object
  >
    <template v-slot:item="{ props: { title, ...rest }, item }">
      <SearchAutocompleteItem :item="item" v-bind="rest" />
    </template>
  </v-autocomplete>
</template>

<script lang="ts" setup>
import { ref, watch, Ref, onMounted } from "vue";
import { useThrottleFn } from "@vueuse/core";
import type { SearchSegment } from "../types/search";
import { isConfigured } from "../lib/search";
import SearchAutocompleteItem from "./SearchAutocompleteItem.vue";
import type { ClientSearchRecord } from "../types/clients";
import { useClientsStore } from "../stores/clients";

interface ClientSearchResult {
  value: string;
  title: string;
  segments: SearchSegment[];
  document: ClientSearchRecord;
}

interface Emits {
  (eventName: "selected", message: ClientSearchRecord | undefined): void;
}

const emit = defineEmits<Emits>();

const clientsStore = useClientsStore();

const searchEnabled = ref(isConfigured());
const searchText = ref("");
const loading = ref(false);
const clients: Ref<ClientSearchResult[] | undefined> = ref(undefined);

const selectedClient: Ref<Readonly<ClientSearchResult> | undefined> = ref(undefined);

const clientAutocompleteSearch = async (newVal: string) => {
  try {
    loading.value = true;

    const results = await clientsStore.typeaheadSearch(newVal);

    clients.value = results.hits.map((hit) => {
      const nameHighlights = hit.highlights.find((highlight) => highlight.field === "name");
      const segments = nameHighlights?.segments ?? [];

      return {
        value: hit.document.id,
        title: hit.document.name,
        document: hit.document,
        segments,
      };
    });
  } catch (err) {
    // we don't want to display an error since this is part of autocomplete
    console.log(err);
  } finally {
    loading.value = false;
  }
};

const throttledClientAutocompleteSearch = useThrottleFn(clientAutocompleteSearch, 150, true, true);

watch(searchText, throttledClientAutocompleteSearch);

watch(selectedClient, () => {
  emit("selected", selectedClient.value?.document);
});

onMounted(() => {
  // Do a default search to populate the initial list with most recent clients
  clientAutocompleteSearch("");
});
</script>
