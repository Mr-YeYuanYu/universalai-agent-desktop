export interface MilvusSearchResult {
  id: string;
  distance: number;
  [key: string]: any;
}

export interface MilvusSearchParams {
  collectionName: string;
  vector: number[];
  limit: number;
  outputFields?: string[];
  filter?: string;
}

export interface MilvusSearchResponse {
  code: number;
  data: MilvusSearchResult[];
  message?: string;
}

export interface MilvusCollectionInfo {
  collectionName: string;
  description: string;
  numEntities: number;
}
