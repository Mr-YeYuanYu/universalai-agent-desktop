import { Show, For } from 'solid-js';
import type { ChatMessage } from '../../../../shared/types/chat';
import type { APIMetadata } from '../../../../shared/types/api';
import { APICard } from '../APIConfirmModal/APICard';

interface MessageItemProps {
  message: ChatMessage;
  onExecuteAPI: (apiId: string, params: any) => void;
}

export function MessageItem(props: MessageItemProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAPIMetadata = async (apiId: string): Promise<APIMetadata | null> => {
    // TODO: Implement API metadata retrieval
    return null;
  };

  return (
    <div class={`flex ${props.message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div class={`max-w-2xl ${props.message.role === 'user' ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        <div class="flex items-start space-x-3">
          <Show when={props.message.role === 'assistant'}>
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
              🤖
            </div>
          </Show>

          <div class={`flex-1 ${props.message.role === 'user' ? 'text-right' : ''}`}>
            {/* Message Content */}
            <div
              class={`inline-block px-4 py-3 rounded-lg ${
                props.message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              <p class="whitespace-pre-wrap">{props.message.content}</p>

              {/* Loading indicator */}
              <Show when={props.message.status === 'sending'}>
                <div class="flex items-center space-x-1 mt-2">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
              </Show>

              {/* Error */}
              <Show when={props.message.status === 'error'}>
                <p class="text-sm text-red-600 mt-2">
                  ⚠️ 消息发送失败
                </p>
              </Show>
            </div>

            {/* Timestamp */}
            <p class={`text-xs text-gray-500 mt-1 ${props.message.role === 'user' ? 'mr-2' : 'ml-2'}`}>
              {formatTime(props.message.timestamp)}
            </p>

            {/* Matched APIs */}
            <Show when={props.message.matchedAPIs && props.message.matchedAPIs.length > 0}>
              <div class="mt-4 space-y-2">
                <h4 class="text-sm font-medium text-gray-700 flex items-center">
                  <span class="mr-2">🔧</span>
                  找到 {props.message.matchedAPIs.length} 个相关 API
                </h4>

                <For each={props.message.matchedAPIs}>
                  {(apiId) => (
                    <div class="bg-white border border-gray-200 rounded-lg p-3">
                      <APICard
                        apiId={apiId}
                        onExecute={(params) => props.onExecuteAPI(apiId, params)}
                      />
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>

          <Show when={props.message.role === 'user'}>
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm">
              👤
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}
