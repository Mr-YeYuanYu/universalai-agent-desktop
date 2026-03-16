import { createSignal, Show, onMount } from 'solid-js';
import type { APIMetadata } from '../../../../shared/types/api';
import { milvusClient } from '../../modules/milvus-client';

interface APICardProps {
  apiId: string;
  onExecute: (params: Record<string, any>) => void;
}

export function APICard(props: APICardProps) {
  const [api, setApi] = createSignal<APIMetadata | null>(null);
  const [showDetails, setShowDetails] = createSignal(false);
  const [params, setParams] = createSignal<Record<string, any>>({});
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    try {
      // Fetch API metadata from Milvus
      const metadata = await milvusClient.getAPIById(props.apiId);
      setApi(metadata);
    } catch (error) {
      console.error('Failed to load API metadata:', error);
    } finally {
      setLoading(false);
    }
  });

  const handleParamChange = (paramName: string, value: any) => {
    setParams(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const getMethodColor = (method: string) => {
    const colors = {
      GET: 'bg-green-100 text-green-800',
      POST: 'bg-blue-100 text-blue-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      PATCH: 'bg-purple-100 text-purple-800'
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Show when={!loading()} fallback={<div class="animate-pulse bg-gray-200 h-24 rounded-lg" />}>
      <Show when={api()}>
        <div class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          {/* API Header */}
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-1">
                <span class={`px-2 py-1 text-xs font-bold rounded ${getMethodColor(api()!.method)}`}>
                  {api()!.method}
                </span>
                <h4 class="text-sm font-semibold text-gray-900">
                  {api()!.name}
                </h4>
              </div>

              <code class="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                {api()!.endpoint}
              </code>
            </div>

            <Show when={api()!.score}>
              <div class="text-right">
                <span class="text-xs text-gray-500">相似度</span>
                <div class="text-sm font-semibold text-blue-600">
                  {(api()!.score! * 100).toFixed(1)}%
                </div>
              </div>
            </Show>
          </div>

          {/* Description */}
          <p class="text-sm text-gray-600 mb-3">
            {api()!.description}
          </p>

          {/* Actions */}
          <div class="flex items-center space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails())}
              class="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              {showDetails() ? '隐藏详情' : '查看详情'}
            </button>

            <button
              onClick={() => {
                // Validate required params
                const requiredParams = api()!.parameters.filter(p => p.required);
                const hasAllRequired = requiredParams.every(p => params()[p.name]);

                if (!hasAllRequired) {
                  alert('请填写所有必填参数');
                  return;
                }

                props.onExecute(params());
              }}
              class="px-4 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              执行
            </button>
          </div>

          {/* Details Section */}
          <Show when={showDetails()}>
            <div class="mt-4 pt-4 border-t border-gray-200">
              <h5 class="text-sm font-medium text-gray-700 mb-2">参数</h5>

              <div class="space-y-3">
                <For each={api()!.parameters}>
                  {(param) => (
                    <div>
                      <label class="block text-xs font-medium text-gray-600 mb-1">
                        {param.name}
                        <Show when={param.required}>
                          <span class="text-red-500 ml-1">*</span>
                        </Show>
                        <span class="text-gray-400 ml-2">({param.type})</span>
                      </label>

                      <Show
                        when={param.type === 'boolean'}
                        fallback={
                          <input
                            type={param.type === 'number' ? 'number' : 'text'}
                            value={params()[param.name] || ''}
                            onInput={(e) => handleParamChange(param.name, e.currentTarget.value)}
                            placeholder={param.description}
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        }
                      >
                        <select
                          value={params()[param.name] || ''}
                          onChange={(e) => handleParamChange(param.name, e.currentTarget.value)}
                          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">选择...</option>
                          <option value="true">true</option>
                          <option value="false">false</option>
                        </select>
                      </Show>

                      <Show when={param.example}>
                        <p class="text-xs text-gray-500 mt-1">
                          示例: {param.example}
                        </p>
                      </Show>
                    </div>
                  )}
                </For>
              </div>

              <Show when={api()!.responses}>
                <div class="mt-4">
                  <h5 class="text-sm font-medium text-gray-700 mb-2">响应示例</h5>
                  <pre class="text-xs bg-gray-50 p-3 rounded-md overflow-x-auto">
                    {JSON.stringify(api()!.responses, null, 2)}
                  </pre>
                </div>
              </Show>
            </div>
          </Show>
        </div>
      </Show>
    </Show>
  );
}
