// Application configuration types

/**
 * 基础连接配置（用户需要输入的）
 */
export interface ConnectionConfig {
  host: string;      // 服务器域名或IP
  port: number;      // 服务器端口
  token: string;     // 访问令牌
}

/**
 * 从服务器获取的完整配置
 */
export interface ServerConfig {
  apiEndpoint: string;      // API 服务端点
  llmEndpoint: string;      // LLM 服务端点
  milvusConfig: MilvusConfig;  // Milvus 配置
}

/**
 * Milvus 向量数据库配置
 */
export interface MilvusConfig {
  host: string;
  port: number;
  collection: string;
  username?: string;
  password?: string;
}

/**
 * 用户偏好设置
 */
export interface UserPreferences {
  theme: 'light' | 'dark';
  autoConfirmAPI: boolean;
  maxTokens: number;
  language: 'en' | 'zh-CN';
}

/**
 * 完整的应用配置
 */
export interface AppConfig {
  // 用户输入的连接配置
  connection: ConnectionConfig;

  // 从服务器获取的配置
  serverConfig: ServerConfig | null;

  // 用户偏好（本地存储）
  preferences: UserPreferences;
}

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: AppConfig = {
  connection: {
    host: '',
    port: 443,
    token: ''
  },
  serverConfig: null,
  preferences: {
    theme: 'light',
    autoConfirmAPI: false,
    maxTokens: 2000,
    language: 'zh-CN'
  }
};
