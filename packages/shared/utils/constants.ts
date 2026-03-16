// Application constants

export const APP_NAME = 'UniversalAI Agent';
export const APP_VERSION = '0.1.0';

// API endpoints
export const API_ENDPOINTS = {
  LLM_CHAT_STREAM: '/api/llm/chat/stream',
  VECTOR_SEARCH: '/api/vector/search',
  API_EXECUTE: '/api/execute'
} as const;

// Default configuration values
export const DEFAULT_CONFIG = {
  MAX_TOKENS: 2000,
  TEMPERATURE: 0.7,
  TOP_K_APIS: 5,
  CACHE_DURATION_MS: 5 * 60 * 1000, // 5 minutes
  MAX_RECONNECT_ATTEMPTS: 3,
  RECONNECT_DELAY_MS: 1000
} as const;

// Storage keys
export const STORAGE_KEYS = {
  CONFIG: 'universalai_config',
  CONVERSATIONS: 'universalai_conversations',
  CURRENT_CONVERSATION: 'universalai_current_conversation'
} as const;

// Themes
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
} as const;

// Languages
export const LANGUAGES = {
  ZH_CN: 'zh-CN',
  EN_US: 'en-US'
} as const;
