import { createSignal, Show, createEffect } from 'solid-js';
import { ConfigPage } from './components/ConfigPage';
import { configStore } from './modules/config';

function App() {
  const [currentView, setCurrentView] = createSignal<'config' | 'chat'>('config');

  // 根据连接状态自动切换视图
  createEffect(() => {
    if (configStore.isConnected) {
      // 连接成功后可以切换到对话视图
    }
  });

  return (
    <div class="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-bold text-gray-900">
                🤖 UniversalAI Agent
              </h1>
            </div>

            {/* Connection Status Indicator */}
            <Show when={configStore.isConnected}>
              <div class="flex items-center">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span class="w-1.5 h-1.5 mr-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  已连接
                </span>
              </div>
            </Show>

            <div class="flex items-center space-x-4">
              <button
                class={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentView() === 'config'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setCurrentView('config')}
              >
                ⚙️ 配置
              </button>

              <button
                class={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentView() === 'chat'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                } ${!configStore.isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => configStore.isConnected && setCurrentView('chat')}
                disabled={!configStore.isConnected}
              >
                💬 对话
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Show when={currentView() === 'config'}>
          <ConfigPage />
        </Show>

        <Show when={currentView() === 'chat'}>
          <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="px-4 py-6 sm:px-0">
              <div class="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                <div class="text-center">
                  <h2 class="text-2xl font-semibold text-gray-700 mb-4">
                    💬 对话界面
                  </h2>
                  <p class="text-gray-600">
                    聊天功能即将推出...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Show>
      </main>
    </div>
  )
}

export default App
