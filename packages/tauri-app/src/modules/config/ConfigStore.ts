import { createStore, produce } from 'solid-js/store';
import { invoke } from '@tauri-apps/api/core';
import type { AppConfig, MilvusConfig, UserPreferences } from '@universalai-agent/shared';

export class ConfigStore {
  private configState: ReturnType<typeof createStore<AppConfig>>;
  private loadingState: ReturnType<typeof createStore<{ value: boolean }>>;
  private errorState: ReturnType<typeof createStore<{ value: string | null }>>;

  constructor() {
    // Initialize stores in constructor
    this.configState = createStore<AppConfig>({
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

    this.loadingState = createStore({ value: false });
    this.errorState = createStore({ value: null });

    this.loadConfig();
  }

  // Getters
  get config() {
    return this.configState[0];
  }

  get isLoading() {
    return this.loadingState[0]().value;
  }

  get error() {
    return this.errorState[0]().value;
  }

  // Private setters
  private setConfig = this.configState[1];
  private setIsLoading = this.loadingState[1];
  private setError = this.errorState[1];

  async loadConfig(): Promise<void> {
    this.setIsLoading({ value: true });
    this.setError({ value: null });

    try {
      // Check if config exists
      const hasConfig = await invoke<boolean>('has_config');

      if (hasConfig) {
        const savedConfig = await invoke<AppConfig>('load_encrypted_config');
        this.setConfig(savedConfig);
        console.log('✅ Configuration loaded from keyring');
      } else {
        // Load default config
        const defaultConfig = await invoke<AppConfig>('get_default_config');
        this.setConfig(defaultConfig);
        console.log('ℹ️ Using default configuration');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.setError({ value: errorMsg });
      console.error('❌ Failed to load config:', errorMsg);
    } finally {
      this.setIsLoading({ value: false });
    }
  }

  async saveConfig(newConfig?: Partial<AppConfig>): Promise<void> {
    this.setIsLoading({ value: true });
    this.setError({ value: null });

    try {
      if (newConfig) {
        this.setConfig(produce(state => {
          Object.assign(state, newConfig);
        }));
      }

      await invoke('save_encrypted_config', { config: this.config });
      console.log('✅ Configuration saved to keyring');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.setError({ value: errorMsg });
      console.error('❌ Failed to save config:', errorMsg);
      throw err;
    } finally {
      this.setIsLoading({ value: false });
    }
  }

  async deleteConfig(): Promise<void> {
    this.setIsLoading({ value: true });
    this.setError({ value: null });

    try {
      await invoke('delete_encrypted_config');
      const defaultConfig = await invoke<AppConfig>('get_default_config');
      this.setConfig(defaultConfig);
      console.log('✅ Configuration deleted');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.setError({ value: errorMsg });
      console.error('❌ Failed to delete config:', errorMsg);
      throw err;
    } finally {
      this.setIsLoading({ value: false });
    }
  }

  // Update methods
  updateServerDomain(domain: string): void {
    this.setConfig('serverDomain', domain);
  }

  updateApiToken(token: string): void {
    this.setConfig('apiToken', token);
  }

  updateLLMEndpoint(endpoint: string): void {
    this.setConfig('llmEndpoint', endpoint);
  }

  updateMilvusConfig(config: Partial<MilvusConfig>): void {
    this.setConfig('milvusConfig', produce(state => {
      Object.assign(state, config);
    }));
  }

  updatePreferences(prefs: Partial<UserPreferences>): void {
    this.setConfig('preferences', produce(state => {
      Object.assign(state, prefs);
    }));
  }

  getConfig(): AppConfig {
    return this.config;
  }

  getIsLoading(): boolean {
    return this.isLoading;
  }

  getError(): string | null {
    return this.error;
  }

  clearError(): void {
    this.setError({ value: null });
  }
}

// Export singleton instance
export const configStore = new ConfigStore();
