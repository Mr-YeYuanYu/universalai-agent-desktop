import { createStore, produce } from 'solid-js/store';
import { invoke } from '@tauri-apps/api/core';
import type { AppConfig, MilvusConfig, UserPreferences } from '@universalai-agent/shared';

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
      // Check if config exists
      const hasConfig = await invoke<boolean>('has_config');

      if (hasConfig) {
        const savedConfig = await invoke<AppConfig>('load_encrypted_config');
        this.setConfigFn(() => savedConfig);
        console.log('✅ Configuration loaded from keyring');
      } else {
        // Load default config
        const defaultConfig = await invoke<AppConfig>('get_default_config');
        this.setConfigFn(() => defaultConfig);
        console.log('ℹ️ Using default configuration');
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

      await invoke('save_encrypted_config', { config: this.config });
      console.log('✅ Configuration saved to keyring');
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
      await invoke('delete_encrypted_config');
      const defaultConfig = await invoke<AppConfig>('get_default_config');
      this.setConfigFn(() => defaultConfig);
      console.log('✅ Configuration deleted');
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
