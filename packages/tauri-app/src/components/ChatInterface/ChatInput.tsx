import { Show } from 'solid-js';

interface ChatInputProps {
  value: string;
  onInput: (value: string) => void;
  onSend: () => void;
  onCancel: () => void;
  isStreaming: boolean;
}

export function ChatInput(props: ChatInputProps) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!props.isStreaming) {
        props.onSend();
      }
    }
  };

  return (
    <div class="flex items-end space-x-3">
      <div class="flex-1">
        <textarea
          value={props.value}
          onInput={(e) => props.onInput(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入你的问题... (Enter 发送, Shift+Enter 换行)"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
          disabled={props.isStreaming}
        />
      </div>

      <Show
        when={props.isStreaming}
        fallback={
          <button
            onClick={props.onSend}
            disabled={!props.value.trim()}
            class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>发送</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        }
      >
        <button
          onClick={props.onCancel}
          class="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center space-x-2"
        >
          <span>停止</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </Show>
    </div>
  );
}
