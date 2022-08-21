import { defineStore } from "pinia";
import { firestore } from "../lib/firebase/firestore";
import { collection, query, orderBy, limit, where, CollectionReference } from "firebase/firestore";
import { computed, ref, Ref } from "vue";
import { useFirestore } from "../composables/firestore";
import { functions, httpsCallable } from "../lib/firebase/functions";
import { watchOnce } from "@vueuse/core";

import type { Label } from "../types/labels";

interface LabelValues {
  color: string;
  icon: string;
  name: string;
}

interface LabelRequest extends LabelValues {
  labelId?: string;
  deleted: boolean;
}

export const useLabelsStore = defineStore("labels", () => {
  const labelsRef = collection(firestore, "labels") as CollectionReference<Label>;
  const labelsQuery = query(
    labelsRef,
    where("deleted", "==", false),
    orderBy("name", "asc"),
    limit(20),
  );
  const { snapshot: labels } = useFirestore<Label>(labelsQuery);

  // The doc will start out as undefined initially and will resolve as null or an object
  const loading = computed(() => labels.value === undefined);

  const getLabel = (labelId: string): Ref<Label | undefined> => {
    const labelRef: Ref<Label | undefined> = ref(undefined);

    const findLabelId = () => (labels.value ?? []).find((label) => label.id === labelId);

    if (loading.value) {
      watchOnce(loading, () => {
        labelRef.value = findLabelId();
      });
    } else {
      labelRef.value = findLabelId();
    }

    return labelRef;
  };

  const findLabels = (inputs: string[], filter: (label: Label, input: string) => boolean) => {
    const labelsRef = ref<(Label | undefined)[]>([]);

    const findLabel = (input: string) => (labels.value ?? []).find((label) => filter(label, input));

    if (loading.value) {
      watchOnce(loading, () => {
        labelsRef.value = inputs.flatMap(findLabel);
      });
    } else {
      labelsRef.value = inputs.flatMap(findLabel);
    }

    return labelsRef;
  };

  const getLabels = (labelIds: string[]): Ref<(Label | undefined)[]> => {
    return findLabels(labelIds, (label: Label, input: string) => label.id === input);
  };

  const getLabelsByName = (labelNames: string[]): Ref<(Label | undefined)[]> => {
    return findLabels(labelNames, (label: Label, input: string) => label.name === input);
  };

  const upsertLabel = async (labelRequest: LabelRequest): Promise<Label> => {
    const { data } = await httpsCallable<LabelRequest, Label>(
      functions,
      "upsertLabel",
    )(labelRequest);

    return data;
  };

  const addLabel = async (labelValues: LabelValues): Promise<Label> => {
    return upsertLabel({ ...labelValues, deleted: false });
  };

  const updateLabel = async (labelId: string, labelValues: LabelValues): Promise<Label> => {
    return upsertLabel({ ...labelValues, labelId, deleted: false });
  };

  const deleteLabel = async (labelId: string): Promise<Label> => {
    interface DeleteLabelRequest {
      labelId: string;
    }

    const { data } = await httpsCallable<DeleteLabelRequest, Label>(
      functions,
      "deleteLabel",
    )({ labelId });

    return data;
  };

  return {
    labels,
    loading,
    addLabel,
    getLabel,
    getLabels,
    getLabelsByName,
    updateLabel,
    deleteLabel,
  };
});
