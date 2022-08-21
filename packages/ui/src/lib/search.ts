import { Client } from "typesense";
import type { ConfigurationOptions } from "typesense/lib/Typesense/Configuration";
import type { SearchParams, SearchResponse } from "typesense/lib/Typesense/Documents";
import type { SearchSegment, SearchResult } from "../types/search";

const searchConfig = {
  apiKey: import.meta.env.VITE_TYPESENSE_API_KEY,
  hosts: (import.meta.env.VITE_TYPESENSE_HOSTS ?? "")
    .split(",")
    .map((host: string) => host.trim())
    .filter((host: string) => host),
  port: import.meta.env.VITE_TYPESENSE_PORT ?? "443",
  protocol: import.meta.env.VITE_TYPESENSE_PROTOCOL ?? "https",
};

let client: Client | undefined;

function getConfigOptions(): ConfigurationOptions {
  return {
    nodes: searchConfig.hosts.map((h: string) => {
      return {
        host: h,
        port: searchConfig.port,
        protocol: searchConfig.protocol,
      };
    }),
    apiKey: searchConfig.apiKey,
    connectionTimeoutSeconds: 120,
    retryIntervalSeconds: 120,
  };
}

function getClient(): Client {
  if (!client) {
    client = new Client(getConfigOptions());
  }

  return client;
}

function createSegments(text: string, snippet: string | undefined): SearchSegment[] {
  const MARK_TAG = /<mark>(.*?)<\/mark>/g;

  if (!snippet) {
    return [{ match: false, text }];
  }

  const segments: SearchSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = MARK_TAG.exec(snippet)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        match: false,
        text: snippet.substring(lastIndex, match.index),
      });
    }

    segments.push({
      match: true,
      text: match[1],
    });

    lastIndex = MARK_TAG.lastIndex;
  }

  if (lastIndex < snippet.length) {
    segments.push({
      match: false,
      text: snippet.substring(lastIndex),
    });
  }

  return segments;
}

function mapResponse<T>(response: SearchResponse<T>): SearchResult<T> {
  const resultHits = response.hits || [];
  const groupHits = response.grouped_hits?.flatMap((groupHits) => groupHits.hits) || [];
  const allHits = [...resultHits, ...groupHits];
  const hits = allHits.map((hit) => ({
    document: hit.document,
    highlights: (hit.highlights || []).map((highlight) => {
      const snippet = highlight.snippets?.length ? highlight.snippets[0] : highlight.snippet;
      return {
        field: highlight.field,
        segments: createSegments(String(hit.document[highlight.field]), snippet),
      };
    }),
  }));

  return {
    hits,
  };
}

export function isConfigured() {
  return searchConfig.apiKey && searchConfig.hosts?.length;
}

export async function query<T>(
  collection: string,
  searchParameters: SearchParams,
): Promise<SearchResult<T>> {
  const typesense = getClient();
  const response = await typesense.collections<T>(collection).documents().search(searchParameters);

  return mapResponse(response);
}
