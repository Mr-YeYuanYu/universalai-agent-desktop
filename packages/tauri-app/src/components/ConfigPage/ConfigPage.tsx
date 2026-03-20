import { createSignal, Show, createEffect } from 'solid-js';
import { configStore } from '../../modules/config/ConfigStore';

export function ConfigPage() {
  const [showToken, setShowToken] = createSignal(false);
  const [isConnecting, setIsConnecting] = createSignal(false);

  // 本地表单状态
  const [host, setHost] = createSignal('');
  const [port, setPort] = createSignal(443);
  const [token, setToken] = createSignal('');

  // 初始化时从 store 加载值
  createEffect(() => {
    const conn = configStore.currentConfig.connection;
    setHost(conn.host);
    setPort(conn.port);
    setToken(conn.token);
  });

  // 处理连接
  const handleConnect = async () => {
    // 先更新本地 store
    configStore.updateConnection({
      host: host(),
      port: port(),
      token: token()
    });

    setIsConnecting(true);
    try {
      const success = await configStore.verifyConnection();
      if (success) {
        console.log('✅ 连接成功');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // 处理断开连接
  const handleDisconnect = async () => {
    await configStore.disconnect();
  };

  // 处理清除配置
  const handleClear = async () => {
    if (confirm('确定要清除所有配置吗？')) {
      await configStore.clearConfig();
      setHost('');
      setPort(443);
      setToken('');
    }
  };

  // 获取连接状态样式
  const getStatusColor = () => {
    const status = configStore.connectionState;
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  // 获取连接状态文本
  const getStatusText = () => {
    const status = configStore.connectionState;
    switch (status) {
      case 'connected': return '已连接';
      case 'connecting': return '连接中...';
      case 'failed': return '连接失败';
      default: return '未连接';
    }
  };

  return (
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div class="mb-8 text-center">
          <div class="text-6xl mb-4">🤖</div>
          <h1 class="text-3xl font-bold text-gray-900">UniversalAI Agent</h1>
          <p class="mt-2 text-sm text-gray-600">
            配置服务器连接以开始使用
          </p>
        </div>

        {/* Error Message */}
        <Show when={configStore.currentError}>
          <div class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div class="flex items-center">
              <span class="text-xl mr-2">❌</span>
              <span>{configStore.currentError}</span>
            </div>
          </div>
        </Show>

        {/* Connection Status */}
        <Show when={configStore.connectionState === 'connected'}>
          <div class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="text-xl mr-2">✅</span>
                <span>已连接到 {configStore.currentConfig.connection.host}:{configStore.currentConfig.connection.port}</span>
              </div>
              <button
                type="button"
                class="text-sm text-green-700 hover:text-green-800 underline"
                onClick={handleDisconnect}
              >
                断开连接
              </button>
            </div>
          </div>
        </Show>

        {/* Connection Form */}
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">服务器配置</h2>
          </div>

          <div class="p-6 space-y-5">
            {/* Host */}
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                服务器地址
              </label>
              <input
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例如: api.example.com 或 192.168.1.100"
                value={host()}
                onInput={(e) => setHost(e.currentTarget.value.trim())}
                disabled={isConnecting()}
              />
              <p class="mt-1 text-xs text-gray-500">输入服务器域名或 IP 地址</p>
            </div>

            {/* Port */}
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                端口
              </label>
              <input
                type="number"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="443"
                value={port()}
                onInput={(e) => setPort(parseInt(e.currentTarget.value) || 443)}
                disabled={isConnecting()}
              />
              <p class="mt-1 text-xs text-gray-500">默认 443 (HTTPS)，本地测试可使用 8080 等</p>
            </div>

            {/* Token */}
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                访问令牌 (Token)
              </label>
              <div class="flex space-x-2">
                <input
                  type={showToken() ? 'text' : 'password'}
                  class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder="输入您的访问令牌"
                  value={token()}
                  onInput={(e) => setToken(e.currentTarget.value.trim())}
                  disabled={isConnecting()}
                />
                <button
                  type="button"
                  class="px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  onClick={() => setShowToken(!showToken())}
                >
                  {showToken() ? '🙈' : '👁️'}
                </button>
              </div>
              <p class="mt-1 text-xs text-gray-500">从管理员处获取您的访问令牌</p>
            </div>

            {/* Connect Button */}
            <div class="pt-4">
              <button
                type="button"
                class={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                  isConnecting() || !host() || !token()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                onClick={handleConnect}
                disabled={isConnecting() || !host() || !token()}
              >
                {isConnecting() ? (
                  <span class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    连接中...
                  </span>
                ) : (
                  <span class="flex items-center justify-center">
                    <span class="mr-2">🔗</span>
                    连接服务器
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Server Info (when connected) */}
        <Show when={configStore.connectionState === 'connected' && configStore.currentConfig.serverConfig}>
          <div class="mt-6 bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">服务器信息</h2>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 gap-4 text-sm">
                <div class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-gray-500">API 端点</span>
                  <span class="font-mono text-gray-900">{configStore.currentConfig.serverConfig?.apiEndpoint}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-gray-500">LLM 端点</span>
                  <span class="font-mono text-gray-900">{configStore.currentConfig.serverConfig?.llmEndpoint}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-gray-500">Milvus 地址</span>
                  <span class="font-mono text-gray-900">
                    {configStore.currentConfig.serverConfig?.milvusConfig.host}:{configStore.currentConfig.serverConfig?.milvusConfig.port}
                  </span>
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-gray-500">Milvus 集合</span>
                  <span class="font-mono text-gray-900">{configStore.currentConfig.serverConfig?.milvusConfig.collection}</span>
                </div>
              </div>
            </div>
          </div>
        </Show>

        {/* Clear Config Button */}
        <div class="mt-6 text-center">
          <button
            type="button"
            class="text-sm text-gray-500 hover:text-gray-700 underline"
            onClick={handleClear}
          >
            清除所有配置
          </button>
        </div>

        {/* Security Note */}
        <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <span class="text-2xl">🔒</span>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-blue-800">安全说明</h3>
              <p class="mt-1 text-sm text-blue-700">
                您的配置信息将使用系统密钥环加密存储，Token 不会明文保存在本地。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
