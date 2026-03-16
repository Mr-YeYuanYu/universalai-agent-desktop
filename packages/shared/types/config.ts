// Application configuration types

export interface AppConfig {
  serverDomain: string;
  apiToken: string;
  llmEndpoint: string;
  milvusConfig: MilvusConfig;
  preferences: UserPreferences;
}

export interface MilvusConfig {
  host: string;
  port: number;
  collection: string;
  username?: string;
  password?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  autoConfirmAPI: boolean;
  maxTokens: number;
  language: string;
}
  preferences: UserPreferences;
}

export interface MilvusConfig {
  host: string;
  port: number;
  collection: string;
  username?: string;
  password?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  autoConfirmAPI: boolean;
  maxTokens: number;
  language: 'en' | 'zh-CN';
}

export const DEFAULT_CONFIG: AppConfig = {
  serverDomain: '',
  apiToken: '',
  llmEndpoint: '',
  milvusConfig: {
    host: 'localhost',
    port: 19530,
    collection: 'api_definitions'
  },
  preferences: {
    theme: 'light',
    autoConfirmAPI: false,
    maxTokens: 2000,
    language: 'zh-CN'
  }
};
