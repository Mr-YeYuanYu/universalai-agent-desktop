import { createSignal, Show } from 'solid-js';
import { configStore } from '../../modules/config/ConfigStore';
import type { AppConfig, MilvusConfig, UserPreferences } from '@universalai-agent/shared';

export function ConfigPage() {
  const [showToken, setShowToken] = createSignal(false);
  const [saveStatus, setSaveStatus] = createSignal<'idle' | 'saving' | 'success' | 'error'>('idle');

  const config = () => configStore.currentConfig;
  const isLoading = () => configStore.isLoading;
  const error = () => configStore.currentError;

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await configStore.saveConfig();
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
      console.error('Failed to save config:', err);
    }
  };

  const handleTestConnection = async () => {
    // TODO: Implement connection testing
    console.log('Testing connection...');
  };

  return (
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">应用配置</h1>
          <p class="mt-2 text-sm text-gray-600">
            配置 UniversalAI Agent 的服务器连接和偏好设置
          </p>
        </div>

        {/* Status Messages */}
        <Show when={saveStatus() === 'success'}>
          <div class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            ✅ 配置已成功保存
          </div>
        </Show>

        <Show when={saveStatus() === 'error'}>
          <div class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            ❌ 保存失败，请检查配置
          </div>
        </Show>

        <Show when={error()}>
          <div class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error()}
          </div>
        </Show>

        {/* Server Configuration */}
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">服务器配置</h2>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                API 域名
              </label>
              <input
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://api.example.com"
                value={config().serverDomain}
                onInput={(e) => configStore.updateServerDomain(e.currentTarget.value)}
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                API Token
              </label>
              <div class="flex space-x-2">
                <input
                  type={showToken() ? 'text' : 'password'}
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入你的 API Token"
                  value={config().apiToken}
                  onInput={(e) => configStore.updateApiToken(e.currentTarget.value)}
                />
                <button
                  type="button"
                  class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setShowToken(!showToken())}
                >
                  {showToken() ? '隐藏' : '显示'}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                LLM 端点
              </label>
              <input
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://llm.example.com/api"
                value={config().llmEndpoint}
                onInput={(e) => configStore.updateLLMEndpoint(e.currentTarget.value)}
              />
            </div>
          </div>
        </div>

        {/* Milvus Configuration */}
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Milvus 向量数据库配置</h2>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  主机地址
                </label>
                <input
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="localhost"
                  value={config().milvusConfig.host}
                  onInput={(e) => configStore.updateMilvusConfig({ host: e.currentTarget.value })}
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  端口
                </label>
                <input
                  type="number"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="19530"
                  value={config().milvusConfig.port}
                  onInput={(e) => configStore.updateMilvusConfig({ port: parseInt(e.currentTarget.value) || 19530 })}
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                集合名称
              </label>
              <input
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="api_definitions"
                value={config().milvusConfig.collection}
                onInput={(e) => configStore.updateMilvusConfig({ collection: e.currentTarget.value })}
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  用户名（可选）
                </label>
                <input
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={config().milvusConfig.username || ''}
                  onInput={(e) => configStore.updateMilvusConfig({ username: e.currentTarget.value })}
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  密码（可选）
                </label>
                <input
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={config().milvusConfig.password || ''}
                  onInput={(e) => configStore.updateMilvusConfig({ password: e.currentTarget.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">偏好设置</h2>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">主题</label>
                <p class="text-sm text-gray-500">选择应用主题</p>
              </div>
              <select
                class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={config().preferences.theme}
                onChange={(e) => configStore.updatePreferences({ theme: e.currentTarget.value })}
              >
                <option value="light">浅色</option>
                <option value="dark">深色</option>
              </select>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">自动确认 API 调用</label>
                <p class="text-sm text-gray-500">跳过 API 调用确认步骤</p>
              </div>
              <input
                type="checkbox"
                class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={config().preferences.autoConfirmAPI}
                onChange={(e) => configStore.updatePreferences({ autoConfirmAPI: e.currentTarget.checked })}
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                最大 Token 数
              </label>
              <input
                type="number"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={config().preferences.maxTokens}
                onInput={(e) => configStore.updatePreferences({ maxTokens: parseInt(e.currentTarget.value) || 2000 })}
              />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">语言</label>
                <p class="text-sm text-gray-500">应用显示语言</p>
              </div>
              <select
                class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={config().preferences.language}
                onChange={(e) => configStore.updatePreferences({ language: e.currentTarget.value })}
              >
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div class="flex space-x-4">
          <button
            type="button"
            class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSave}
            disabled={isLoading() || saveStatus() === 'saving'}
          >
            {saveStatus() === 'saving' ? '保存中...' : '保存配置'}
          </button>

          <button
            type="button"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            onClick={handleTestConnection}
          >
            测试连接
          </button>
        </div>

        {/* Security Note */}
        <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <span class="text-2xl">🔒</span>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-blue-800">安全提示</h3>
              <p class="mt-1 text-sm text-blue-700">
                你的配置信息将使用系统密钥环加密存储，确保敏感信息安全。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
