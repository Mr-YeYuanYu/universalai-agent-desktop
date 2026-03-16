import { createStore, produce } from 'solid-js/store';
import { invoke } from '@tauri-apps/api/tauri';
import type { AppConfig, MilvusConfig, UserPreferences } from '@universalai-agent/shared';

export class ConfigStore {
  private [config, setConfig] = createStore<AppConfig>({
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

  private [isLoading, setIsLoading] = createStore({ value: false });
  private [error, setError] = createStore<string | null>(null);

  constructor() {
    this.loadConfig();
  }

  async loadConfig(): Promise<void> {
    setIsLoading({ value: true });
    setError(null);

    try {
      // Check if config exists
      const hasConfig = await invoke<boolean>('has_config');

      if (hasConfig) {
        const savedConfig = await invoke<AppConfig>('load_encrypted_config');
        setConfig(savedConfig);
        console.log('✅ Configuration loaded from keyring');
      } else {
        // Load default config
        const defaultConfig = await invoke<AppConfig>('get_default_config');
        setConfig(defaultConfig);
        console.log('ℹ️ Using default configuration');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error('❌ Failed to load config:', errorMsg);
    } finally {
      setIsLoading({ value: false });
    }
  }

  async saveConfig(newConfig?: Partial<AppConfig>): Promise<void> {
    setIsLoading({ value: true });
    setError(null);

    try {
      if (newConfig) {
        setConfig(produce(state => {
          Object.assign(state, newConfig);
        }));
      }

      await invoke('save_encrypted_config', { config: this.config });
      console.log('✅ Configuration saved to keyring');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error('❌ Failed to save config:', errorMsg);
      throw err;
    } finally {
      setIsLoading({ value: false });
    }
  }

  async deleteConfig(): Promise<void> {
    setIsLoading({ value: true });
    setError(null);

    try {
      await invoke('delete_encrypted_config');
      const defaultConfig = await invoke<AppConfig>('get_default_config');
      setConfig(defaultConfig);
      console.log('✅ Configuration deleted');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error('❌ Failed to delete config:', errorMsg);
      throw err;
    } finally {
      setIsLoading({ value: false });
    }
  }

  updateServerDomain(domain: string): void {
    setConfig('serverDomain', domain);
  }

  updateApiToken(token: string): void {
    setConfig('apiToken', token);
  }

  updateLLMEndpoint(endpoint: string): void {
    setConfig('llmEndpoint', endpoint);
  }

  updateMilvusConfig(config: Partial<MilvusConfig>): void {
    setConfig('milvusConfig', produce(state => {
      Object.assign(state, config);
    }));
  }

  updatePreferences(prefs: Partial<UserPreferences>): void {
    setConfig('preferences', produce(state => {
      Object.assign(state, prefs);
    }));
  }

  // Convenience methods for form bindings
  updateServerDomain(domain: string): void {
    setConfig('serverDomain', domain);
  }

  updateApiToken(token: string): void {
    setConfig('apiToken', token);
  }

  updateLLMEndpoint(endpoint: string): void {
    setConfig('llmEndpoint', endpoint);
  }

  updateMilvusConfig(config: Partial<MilvusConfig>): void {
    setConfig('milvusConfig', produce(state => {
      Object.assign(state, config);
    }));
  }

  getConfig(): AppConfig {
    return this.config;
  }

  isLoading(): boolean {
    return this.isLoading.value;
  }

  getError(): string | null {
    return this.error;
  }

  clearError(): void {
    setError(null);
  }
}

// Export singleton instance
export const configStore = new ConfigStore();
