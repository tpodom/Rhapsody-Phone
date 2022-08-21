export interface SearchSegment {
  match: boolean;
  text: string;
}

export interface SearchHighlights<T> {
  field: keyof T;
  segments: SearchSegment[];
}

export interface SearchHit<T> {
  highlights: SearchHighlights<T>[];
  document: T;
}

export interface SearchResult<T> {
  hits: SearchHit<T>[];
}
