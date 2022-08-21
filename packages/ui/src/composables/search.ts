import type { Label } from "../types/labels";
import { Ref, ref, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { useLabelNameFilter } from "./labelFilter";

const LABEL_REGEX = /label\:"(.*?)"|label\:(.*?)\s|label\:(.*?)$/g;

export interface SearchParameters {
  searchString: string;
  query: string;
  labels: Label[];
}

export function useSearchParameters(): Ref<SearchParameters> {
  const route = useRoute();
  const searchParameters = ref<SearchParameters>({
    query: "",
    searchString: "",
    labels: [],
  });

  watchEffect(() => {
    const qValue = [route.query.q].flat()[0];
    const query = qValue ?? "";
    const matches = [...query.matchAll(LABEL_REGEX)];
    const searchLabels = matches.map((match) => match[1] || match[2] || match[3]);

    const activeSearchLabels = useLabelNameFilter(ref(searchLabels));
    const searchString = query.replaceAll(LABEL_REGEX, "").trim();

    if (query !== searchParameters.value.query) {
      searchParameters.value = {
        query,
        searchString,
        labels: activeSearchLabels.value,
      };
    }
  });

  return searchParameters;
}
