import { createStore, produce } from 'solid-js/store';
import type { AppConfig, MilvusConfig, UserPreferences } from '@universalai-agent/shared';

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

export class ConfigStore {
  private config: AppConfig;
  private setConfigFn: (fn: (state: AppConfig) => AppConfig | void) => void;

  private loading: { value: boolean };
  private setLoadingFn: (fn: (state: { value: boolean }) => { value: boolean } | void) => void;

  private error: { value: string | null };
  private setErrorFn: (fn: (state: { value: string | null }) => { value: string | null } | void) => void;

  constructor() {
    // Initialize config store
    const [configState, setConfig] = createStore<AppConfig>({
      serverDomain: '',
      apiToken: '',
      llmEndpoint: '',
      milvusConfig: {
        host: 'localhost',
        port: 19530,
        collection: 'api_definitions',
        username: undefined,
        password: undefined
      },
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
    const [errorState, setError] = createStore({ value: null });
    this.error = errorState;
    this.setErrorFn = setError;

    this.loadConfig();
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

  async loadConfig(): Promise<void> {
    this.setLoadingFn(() => ({ value: true }));
    this.setErrorFn(() => ({ value: null }));

    try {
      if (isTauri() && invokeCommand) {
        // Tauri 环境：使用加密存储
        const hasConfig = await invokeCommand<boolean>('has_config');

        if (hasConfig) {
          const savedConfig = await invokeCommand<AppConfig>('load_encrypted_config');
          this.setConfigFn(() => savedConfig);
          console.log('✅ Configuration loaded from keyring');
        } else {
          const defaultConfig = await invokeCommand<AppConfig>('get_default_config');
          this.setConfigFn(() => defaultConfig);
          console.log('ℹ️ Using default configuration');
        }
      } else {
        // 非 Tauri 环境：使用 localStorage
        const saved = localStorage.getItem('app_config');
        if (saved) {
          const parsedConfig = JSON.parse(saved) as AppConfig;
          this.setConfigFn(() => parsedConfig);
          console.log('✅ Configuration loaded from localStorage');
        } else {
          console.log('ℹ️ No saved configuration, using defaults');
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.setErrorFn(() => ({ value: errorMsg }));
      console.error('❌ Failed to load config:', errorMsg);
    } finally {
      this.setLoadingFn(() => ({ value: false }));
    }
  }

  async saveConfig(newConfig?: Partial<AppConfig>): Promise<void> {
    this.setLoadingFn(() => ({ value: true }));
    this.setErrorFn(() => ({ value: null }));

    try {
      if (newConfig) {
        this.setConfigFn((state) => ({ ...state, ...newConfig }));
      }

      if (isTauri() && invokeCommand) {
        // Tauri 环境：使用加密存储
        await invokeCommand('save_encrypted_config', { config: this.config });
        console.log('✅ Configuration saved to keyring');
      } else {
        // 非 Tauri 环境：使用 localStorage
        localStorage.setItem('app_config', JSON.stringify(this.config));
        console.log('✅ Configuration saved to localStorage');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.setErrorFn(() => ({ value: errorMsg }));
      console.error('❌ Failed to save config:', errorMsg);
      throw err;
    } finally {
      this.setLoadingFn(() => ({ value: false }));
    }
  }

  async deleteConfig(): Promise<void> {
    this.setLoadingFn(() => ({ value: true }));
    this.setErrorFn(() => ({ value: null }));

    try {
      if (isTauri() && invokeCommand) {
        // Tauri 环境：删除加密配置
        await invokeCommand('delete_encrypted_config');
        console.log('✅ Configuration deleted from keyring');
      } else {
        // 非 Tauri 环境：删除 localStorage
        localStorage.removeItem('app_config');
        console.log('✅ Configuration deleted from localStorage');
      }

      // 重置为默认配置
      this.setConfigFn(() => ({
        serverDomain: '',
        apiToken: '',
        llmEndpoint: '',
        milvusConfig: {
          host: 'localhost',
          port: 19530,
          collection: 'api_definitions',
          username: undefined,
          password: undefined
        },
        preferences: {
          theme: 'light',
          autoConfirmAPI: false,
          maxTokens: 2000,
          language: 'zh-CN'
        }
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.setErrorFn(() => ({ value: errorMsg }));
      console.error('❌ Failed to delete config:', errorMsg);
      throw err;
    } finally {
      this.setLoadingFn(() => ({ value: false }));
    }
  }

  // Update methods
  updateServerDomain(domain: string): void {
    this.setConfigFn((state) => ({ ...state, serverDomain: domain }));
  }

  updateApiToken(token: string): void {
    this.setConfigFn((state) => ({ ...state, apiToken: token }));
  }

  updateLLMEndpoint(endpoint: string): void {
    this.setConfigFn((state) => ({ ...state, llmEndpoint: endpoint }));
  }

  updateMilvusConfig(config: Partial<MilvusConfig>): void {
    this.setConfigFn((state) => ({
      ...state,
      milvusConfig: { ...state.milvusConfig, ...config }
    }));
  }

  updatePreferences(prefs: Partial<UserPreferences>): void {
    this.setConfigFn((state) => ({
      ...state,
      preferences: { ...state.preferences, ...prefs }
    }));
  }

  getConfig(): AppConfig {
    return this.config;
  }

  getIsLoading(): boolean {
    return this.loading.value;
  }

  getError(): string | null {
    return this.error.value;
  }

  clearError(): void {
    this.setErrorFn(() => ({ value: null }));
  }
}

// Export singleton instance
export const configStore = new ConfigStore();
