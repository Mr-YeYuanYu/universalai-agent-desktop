import { createStore } from 'solid-js/store';
import type { AppConfig, ConnectionConfig, ServerConfig, UserPreferences } from '@universalai-agent/shared';

// 检测是否在 Tauri 环境中运行
const isTauri = () => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

// 动态导入 invoke，仅在 Tauri 环境中使用
let invokeCommand: ((cmd: string, args?: Record<string, unknown>) => Promise<unknown>) | null = null;
if (isTauri()) {
  import('@tauri-apps/api/core').then(mod => {
    invokeCommand = mod.invoke;
  }).catch(err => {
    console.warn('Failed to load Tauri API:', err);
  });
}

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'failed';

export class ConfigStore {
  private config: AppConfig;
  private setConfigFn: (fn: (state: AppConfig) => AppConfig | void) => void;

  private loading: { value: boolean };
  private setLoadingFn: (fn: (state: { value: boolean }) => { value: boolean } | void) => void;

  private error: { value: string | null };
  private setErrorFn: (fn: (state: { value: string | null }) => { value: string | null } | void) => void;

  private connectionStatus: { value: ConnectionState };
  private setConnectionStatusFn: (fn: (state: { value: ConnectionState }) => { value: ConnectionState } | void) => void;

  constructor() {
    // Initialize config store
    const [configState, setConfig] = createStore<AppConfig>({
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
    });
    this.config = configState;
    this.setConfigFn = setConfig;

    // Initialize loading store
    const [loadingState, setLoading] = createStore({ value: false });
    this.loading = loadingState;
    this.setLoadingFn = setLoading;

    // Initialize error store
    const [errorState, setError] = createStore({ value: null as string | null });
    this.error = errorState;
    this.setErrorFn = setError;

    // Initialize connection status store
    const [connectionStatusState, setConnectionStatus] = createStore({ value: 'idle' as ConnectionState });
    this.connectionStatus = connectionStatusState;
    this.setConnectionStatusFn = setConnectionStatus;

    this.loadLocalConfig();
  }

  // Getters
  get currentConfig() {
    return this.config;
  }

  get isLoading() {
    return this.loading.value;
  }

  get currentError() {
    return this.error.value;
  }

  get connectionState() {
    return this.connectionStatus.value;
  }

  get isConnected() {
    return this.connectionStatus.value === 'connected' && this.config.serverConfig !== null;
  }

  /**
   * 加载本地存储的配置
   */
  private async loadLocalConfig(): Promise<void> {
    this.setLoadingFn(() => ({ value: true }));
    this.setErrorFn(() => ({ value: null }));

    try {
      if (isTauri() && invokeCommand) {
        const hasConfig = await invokeCommand<boolean>('has_config');

        if (hasConfig) {
          const savedConfig = await invokeCommand<AppConfig>('load_encrypted_config');
          this.setConfigFn(() => savedConfig);
          console.log('✅ 配置已从密钥环加载');
        } else {
          console.log('ℹ️ 使用默认配置');
        }
      } else {
        const saved = localStorage.getItem('app_config');
        if (saved) {
          const parsedConfig = JSON.parse(saved) as AppConfig;
          this.setConfigFn(() => parsedConfig);
          console.log('✅ 配置已从 localStorage 加载');

          // 如果有保存的连接配置，尝试验证连接
          if (parsedConfig.connection.host && parsedConfig.connection.token) {
            this.verifyConnection();
          }
        } else {
          console.log('ℹ️ 无保存的配置，使用默认值');
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.setErrorFn(() => ({ value: errorMsg }));
      console.error('❌ 加载配置失败:', errorMsg);
    } finally {
      this.setLoadingFn(() => ({ value: false }));
    }
  }

  /**
   * 更新连接配置
   */
  updateConnection(connection: Partial<ConnectionConfig>): void {
    this.setConfigFn((state) => ({
      ...state,
      connection: { ...state.connection, ...connection }
    }));
  }

  /**
   * 更新用户偏好
   */
  updatePreferences(preferences: Partial<UserPreferences>): void {
    this.setConfigFn((state) => ({
      ...state,
      preferences: { ...state.preferences, ...preferences }
    }));
  }

  /**
   * 验证服务器连接并获取完整配置
   */
  async verifyConnection(): Promise<boolean> {
    const { host, port, token } = this.config.connection;

    if (!host || !token) {
      this.setErrorFn(() => ({ value: '请填写服务器地址和Token' }));
      return false;
    }

    this.setConnectionStatusFn(() => ({ value: 'connecting' }));
    this.setErrorFn(() => ({ value: null }));

    try {
      // 构建请求 URL
      const protocol = port === 443 ? 'https' : 'http';
      const baseUrl = `${protocol}://${host}:${port}`;

      // 请求服务器获取完整配置
      const response = await fetch(`${baseUrl}/api/config`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token 无效或已过期');
        } else if (response.status === 403) {
          throw new Error('没有权限访问此服务器');
        } else {
          throw new Error(`服务器返回错误: ${response.status}`);
        }
      }

      const serverConfig = await response.json() as ServerConfig;

      // 更新服务器配置
      this.setConfigFn((state) => ({
        ...state,
        serverConfig
      }));

      this.setConnectionStatusFn(() => ({ value: 'connected' }));
      console.log('✅ 已连接到服务器，配置已同步');
      console.log('服务器配置:', serverConfig);

      // 保存配置到本地
      await this.saveConfig();

      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.setErrorFn(() => ({ value: errorMsg }));
      this.setConnectionStatusFn(() => ({ value: 'failed' }));
      console.error('❌ 连接失败:', errorMsg);
      return false;
    }
  }

  /**
   * 保存配置到本地存储
   */
  async saveConfig(): Promise<void> {
    try {
      if (isTauri() && invokeCommand) {
        await invokeCommand('save_encrypted_config', { config: this.config });
        console.log('✅ 配置已保存到密钥环');
      } else {
        localStorage.setItem('app_config', JSON.stringify(this.config));
        console.log('✅ 配置已保存到 localStorage');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.setErrorFn(() => ({ value: errorMsg }));
      console.error('❌ 保存配置失败:', errorMsg);
      throw err;
    }
  }

  /**
   * 断开连接并清除服务器配置
   */
  async disconnect(): Promise<void> {
    this.setConfigFn((state) => ({
      ...state,
      serverConfig: null
    }));
    this.setConnectionStatusFn(() => ({ value: 'idle' }));
    console.log('🔌 已断开服务器连接');
  }

  /**
   * 清除所有配置
   */
  async clearConfig(): Promise<void> {
    try {
      if (isTauri() && invokeCommand) {
        await invokeCommand('delete_encrypted_config');
      } else {
        localStorage.removeItem('app_config');
      }

      // 重置为默认配置
      this.setConfigFn(() => ({
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
      }));

      this.setConnectionStatusFn(() => ({ value: 'idle' }));
      console.log('✅ 配置已清除');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.setErrorFn(() => ({ value: errorMsg }));
      console.error('❌ 清除配置失败:', errorMsg);
      throw err;
    }
  }

  clearError(): void {
    this.setErrorFn(() => ({ value: null }));
  }
}

// Export singleton instance
export const configStore = new ConfigStore();
