import { ref, watchEffect, Ref } from "vue";
import type { Label } from "../types/labels";
import type { Conversation } from "../types/messaging";
import { useLabelsStore } from "../stores/labels";

function filterLabels(search: () => Ref<(Label | undefined)[]>): Ref<Label[]> {
  const labelsStore = useLabelsStore();

  const labels = ref<Label[]>([]);

  watchEffect(() => {
    const cachedLabels = search().value;
    const loadedLabels = [];

    for (const label of cachedLabels) {
      if (label) {
        loadedLabels.push(label);
      }
    }

    labels.value = loadedLabels;
  });

  return labels;
}

export function useLabelFilter(conversation: Ref<Conversation>): Ref<Label[]> {
  const labelsStore = useLabelsStore();
  return filterLabels(() => labelsStore.getLabels(conversation.value.labels ?? []));
}

export function useLabelNameFilter(names: Ref<string[]>): Ref<Label[]> {
  const labelsStore = useLabelsStore();

  return filterLabels(() => labelsStore.getLabelsByName(names.value));
}
