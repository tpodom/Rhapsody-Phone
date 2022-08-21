<template>
  <v-autocomplete
    v-if="searchEnabled"
    :model-value="value"
    v-model:search="searchText"
    v-model:menu="menu"
    :loading="loading"
    :items="messages"
    cache-items
    no-filter
    hide-details
    placeholder="Search messages..."
    density="compact"
    clearable
    hide-no-data
    menu-icon=""
    no-data-text="No results"
    variant="outlined"
    @keydown="keydown"
    @update:model-value="triggerSearch"
  >
    <template #prepend-inner>
      <v-btn
        icon="mdi-magnify"
        :style="{ width: '40px', height: '40px' }"
        :disabled="searchText === (value ?? '')"
        @click="triggerSearch(searchText)"
      />
    </template>
    <template #append-inner>
      <v-menu :close-on-content-click="false">
        <template #activator="{ props }">
          <v-btn icon="mdi-tune" :style="{ width: '40px', height: '40px' }" v-bind="props" />
        </template>
        <v-list>
          <v-list-subheader title="Labels" />
          <LabelSelectionList
            :selected-labels="searchParameters.labels"
            @label-changed="updateSearchLabels"
          />
        </v-list>
      </v-menu>
    </template>
    <template #item="{ props: { title, ...rest }, item }">
      <v-list-item v-if="!item.raw?.bodySegments" v-bind="rest"></v-list-item>
      <v-list-item v-else v-bind="rest" lines="two" class="flex-grow-1">
        <div class="flex-grow-1">
          <v-list-item-title>
            <SegmentHighlight :segments="item.raw.bodySegments" />
          </v-list-item-title>
          <v-list-item-subtitle class="d-flex flex-row flex-grow-1">
            <SegmentHighlight
              v-if="item.raw.document['client.name']"
              :segments="item.raw.clientNameSegments"
              class="mr-2"
            />
            <SegmentHighlight :segments="item.raw.clientPhoneNumberSegments" />
            <v-spacer />
            <span>{{ item.raw.formattedTimestamp }}</span>
          </v-list-item-subtitle>
        </div>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script lang="ts" setup>
import { ref, watch, toRefs } from "vue";
import { useThrottleFn } from "@vueuse/core";
import type { SearchHit, SearchSegment } from "../../types/search";
import { isConfigured } from "../../lib/search";
import type { MessageSearchRecord, MessageRef } from "../../types/messaging";
import { useMessagingStore } from "../../stores/messaging";
import { formatPhoneNumber } from "../../lib/formatters";
import SegmentHighlight from "../SegmentHighlight.vue";
import LabelSelectionList from "./LabelSelectionList.vue";
import { Label } from "../../types/labels";
import { SearchParameters } from "../../composables/search";

interface SearchResult {
  value: string;
  title: string;
  bodySegments: SearchSegment[];
  clientNameSegments: SearchSegment[];
  clientPhoneNumberSegments: SearchSegment[];
  document: MessageSearchRecord;
  formattedTimestamp: string;
}

interface Props {
  searchParameters: SearchParameters;
}

interface Emits {
  (eventName: "search", message: string | MessageRef): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { searchParameters } = toRefs(props);

const messagingStore = useMessagingStore();

const searchEnabled = ref(isConfigured());
const searchText = ref("");
const loading = ref(false);
const menu = ref(false);
const messages = ref<SearchResult[] | undefined>(undefined);

const value = ref<string | undefined>(searchParameters.value.query);

function createSegments(
  searchHit: SearchHit<MessageSearchRecord>,
  fieldName: string,
  fullText: string,
): SearchSegment[] {
  const highlights = searchHit.highlights.find((highlight) => highlight.field === fieldName);
  return highlights?.segments ?? [{ match: false, text: fullText }];
}

const messagesAutocompleteSearch = async (newVal: string) => {
  if (!newVal) {
    messages.value = [];
    return;
  }

  try {
    loading.value = true;

    const results = await messagingStore.typeaheadSearch(newVal);

    messages.value = results.hits.map((hit) => {
      return {
        value: JSON.stringify({
          messageId: hit.document.id,
          conversationId: hit.document.conversationId,
        }),
        title: hit.document.body,
        document: hit.document,
        formattedTimestamp: new Date(hit.document.timestamp * 1000).toLocaleString(),
        bodySegments: createSegments(hit, "body", hit.document.body),
        clientNameSegments: createSegments(hit, "client.name", hit.document["client.name"]),
        clientPhoneNumberSegments: createSegments(
          hit,
          "client.phone_number",
          formatPhoneNumber(hit.document["client.phone_number"][0]),
        ),
      };
    });
  } catch (err) {
    // we don't want to display an error since this is part of autocomplete
    console.log(err);
  } finally {
    loading.value = false;
  }
};

const throttledClientAutocompleteSearch = useThrottleFn(
  messagesAutocompleteSearch,
  150,
  true,
  true,
);

const keydown = (event: KeyboardEvent) => {
  if (event.code === "Enter") {
    triggerSearch(searchText.value);
  }
};

const triggerSearch = (searchValue: string | undefined) => {
  let search: any = searchValue;

  try {
    search = JSON.parse(searchValue ?? "");
  } catch (error) {
    // ignore
  }

  emit("search", search ?? "");
  menu.value = false;

  if (typeof search === "object") {
    value.value = undefined;
    searchText.value = "";
  } else {
    value.value = searchValue;
  }
};

const updateSearchLabels = (label: Label, selected: boolean, callback: () => void) => {
  const labels = props.searchParameters.labels.filter(
    (searchLabel) => searchLabel.name !== label.name,
  );

  if (selected) {
    labels.push(label);
  }

  const search = (
    labels.map((label) => `label:"${label.name}"`).join(" ") +
    " " +
    searchParameters.value.searchString
  ).trim();

  triggerSearch(search);
  callback();
};

watch(searchText, throttledClientAutocompleteSearch);
</script>

<style lang="scss" scoped>
:deep(.v-icon) {
  transform: none !important;
}

:deep(.v-field__prepend-inner),
:deep(.v-field__append-inner) {
  padding-top: 0;
}
</style>
