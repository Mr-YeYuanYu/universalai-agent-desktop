// Chat and message types

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'sending' | 'success' | 'error';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  status: MessageStatus;
  matchedAPIs?: string[]; // API IDs
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface SSEMessage {
  type: 'token' | 'done' | 'error';
  content?: string;
  error?: string;
}
