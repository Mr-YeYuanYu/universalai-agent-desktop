// API definition and execution types

export interface APIParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  example?: string;
  defaultValue?: any;
}

export interface APIResponse {
  statusCode: number;
  description: string;
  example?: any;
}

export interface APIMetadata {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  category: string;
  parameters: APIParameter[];
  responses: Record<string, APIResponse>;
  embedding_text?: string;
  score?: number; // Similarity score from vector search
}

export interface APIExecutionRequest {
  apiId: string;
  parameters: Record<string, any>;
}

export interface APIExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  statusCode?: number;
}
