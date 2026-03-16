import { For, Show } from 'solid-js';
import type { Conversation } from '../../../../shared/types/chat';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationList(props: ConversationListProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays} 天前`;

    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div class="p-2 space-y-1">
      <Show
        when={props.conversations.length > 0}
        fallback={
          <div class="text-center text-gray-500 text-sm py-8">
            暂无对话
          </div>
        }
      >
        <For each={props.conversations}>
          {(conv) => (
            <div
              class={`group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
                props.activeId === conv.id
                  ? 'bg-blue-100 text-blue-900'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              onClick={() => props.onSelect(conv.id)}
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">
                  {conv.title}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  {formatDate(conv.updatedAt)}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  props.onDelete(conv.id);
                }}
                class="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity"
                title="删除对话"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </For>
      </Show>
    </div>
  );
}
