import { createSignal, For, Show, onMount, ref } from 'solid-js';
import { chatStore } from '../../modules/chat/ChatStore';
import { MessageItem } from './MessageItem';
import { ChatInput } from './ChatInput';
import { ConversationList } from './ConversationList';

export function ChatInterface() {
  let messagesEndRef: HTMLDivElement | undefined;
  const [inputValue, setInputValue] = createSignal('');

  const state = () => chatStore.getState();
  const activeConversation = () => chatStore.getActiveConversation();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef) {
      messagesEndRef.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll when messages change
  onMount(() => {
    const interval = setInterval(scrollToBottom, 100);
    return () => clearInterval(interval);
  });

  const handleSend = async () => {
    const message = inputValue().trim();
    if (!message || state().isStreaming) return;

    setInputValue('');
    await chatStore.sendMessage(message);
    setTimeout(scrollToBottom, 100);
  };

  const handleCancel = () => {
    chatStore.cancelStream();
  };

  const handleNewConversation = () => {
    chatStore.createConversation();
  };

  return (
    <div class="flex h-screen bg-gray-50">
      {/* Left Sidebar - Conversations */}
      <div class="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <button
            onClick={handleNewConversation}
            class="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 flex items-center justify-center space-x-2"
          >
            <span>+</span>
            <span>新对话</span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto">
          <ConversationList
            conversations={state().conversations}
            activeId={state().activeConversationId}
            onSelect={(id) => chatStore.setActiveConversation(id)}
            onDelete={(id) => chatStore.deleteConversation(id)}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div class="flex-1 flex flex-col">
        {/* Header */}
        <div class="bg-white border-b border-gray-200 px-6 py-4">
          <h2 class="text-lg font-semibold text-gray-900">
            {activeConversation()?.title || '新对话'}
          </h2>
          <Show when={state().isSearchingAPIs}>
            <p class="text-sm text-blue-600 mt-1">
              🔍 正在搜索相关 API...
            </p>
          </Show>
        </div>

        {/* Messages */}
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <Show
            when={activeConversation()?.messages.length}
            fallback={
              <div class="flex items-center justify-center h-full">
                <div class="text-center text-gray-500">
                  <p class="text-lg mb-2">开始新对话</p>
                  <p class="text-sm">输入你的问题，AI 会帮你找到相关的 API</p>
                </div>
              </div>
            }
          >
            <For each={activeConversation()?.messages}>
              {(message) => (
                <MessageItem
                  message={message}
                  onExecuteAPI={(apiId) => {
                    console.log('Execute API:', apiId);
                    // Will implement in next phase
                  }}
                />
              )}
            </For>

            <div ref={messagesEndRef} />
          </Show>
        </div>

        {/* Error Message */}
        <Show when={state().error}>
          <div class="px-6 py-2 bg-red-50 border-t border-red-200">
            <p class="text-sm text-red-700">
              ❌ {state().error}
              <button
                onClick={() => chatStore.clearError()}
                class="ml-2 underline hover:no-underline"
              >
                关闭
              </button>
            </p>
          </div>
        </Show>

        {/* Input Area */}
        <div class="bg-white border-t border-gray-200 px-6 py-4">
          <ChatInput
            value={inputValue()}
            onInput={setInputValue}
            onSend={handleSend}
            onCancel={handleCancel}
            isStreaming={state().isStreaming}
          />
        </div>
      </div>
    </div>
  );
}
