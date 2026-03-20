import { createStore, produce } from 'solid-js/store';
import type { Conversation, ChatMessage } from '../../../../shared/types/chat';
import { llmClient } from '../llm-client';
import { milvusClient } from '../milvus-client';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isStreaming: boolean;
  isSearchingAPIs: boolean;
  error: string | null;
}

export class ChatStore {
  private state: ChatState;
  private setStateFn: (fn: (state: ChatState) => ChatState | void) => void;

  constructor() {
    // Initialize store in constructor
    const [stateStore, setState] = createStore<ChatState>({
      conversations: [],
      activeConversationId: null,
      isStreaming: false,
      isSearchingAPIs: false,
      error: null
    });

    this.state = stateStore;
    this.setStateFn = setState;

    this.loadConversations();
  }

  // Getters
  get currentState() {
    return this.state;
  }

  get conversations() {
    return this.state.conversations;
  }

  get activeConversation() {
    const id = this.state.activeConversationId;
    return id ? this.state.conversations.find(c => c.id === id) : null;
  }

  get isStreaming() {
    return this.state.isStreaming;
  }

  get isSearchingAPIs() {
    return this.state.isSearchingAPIs;
  }

  get error() {
    return this.state.error;
  }

  /**
   * Load conversations from local storage
   */
  private loadConversations(): void {
    try {
      const saved = localStorage.getItem('conversations');
      if (saved) {
        const conversations: Conversation[] = JSON.parse(saved);
        this.setStateFn((state) => ({ ...state, conversations }));
        if (conversations.length > 0) {
          this.setStateFn((state) => ({ ...state, activeConversationId: conversations[0].id }));
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }

  /**
   * Save conversations to local storage
   */
  private saveConversations(): void {
    try {
      localStorage.setItem('conversations', JSON.stringify(this.state.conversations));
    } catch (error) {
      console.error('Failed to save conversations:', error);
    }
  }

  /**
   * Create a new conversation
   */
  createConversation(title?: string): Conversation {
    const conversation: Conversation = {
      id: Date.now().toString(),
      title: title || `对话 ${this.state.conversations.length + 1}`,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.setStateFn((state) => ({
      ...state,
      conversations: [...state.conversations, conversation],
      activeConversationId: conversation.id
    }));

    this.saveConversations();
    return conversation;
  }

  /**
   * Select a conversation
   */
  selectConversation(id: string): void {
    this.setStateFn((state) => ({ ...state, activeConversationId: id }));
  }

  /**
   * Delete a conversation
   */
  deleteConversation(id: string): void {
    this.setStateFn((state) => {
      const conversations = state.conversations.filter(c => c.id !== id);
      let activeConversationId = state.activeConversationId;

      if (activeConversationId === id) {
        activeConversationId = conversations.length > 0 ? conversations[0].id : null;
      }

      return { ...state, conversations, activeConversationId };
    });

    this.saveConversations();
  }

  /**
   * Add a message to the active conversation
   */
  addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): void {
    const activeId = this.state.activeConversationId;
    if (!activeId) return;

    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };

    this.setStateFn((state) => ({
      ...state,
      conversations: state.conversations.map(conv => {
        if (conv.id === activeId) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
            updatedAt: new Date().toISOString()
          };
        }
        return conv;
      })
    }));

    this.saveConversations();
  }

  /**
   * Update the last assistant message
   */
  updateLastAssistantMessage(content: string): void {
    const activeId = this.state.activeConversationId;
    if (!activeId) return;

    this.setStateFn((state) => ({
      ...state,
      conversations: state.conversations.map(conv => {
        if (conv.id === activeId) {
          const messages = [...conv.messages];
          const lastMessage = messages[messages.length - 1];

          if (lastMessage && lastMessage.role === 'assistant') {
            messages[messages.length - 1] = {
              ...lastMessage,
              content
            };
          }

          return { ...conv, messages, updatedAt: new Date().toISOString() };
        }
        return conv;
      })
    }));
  }

  /**
   * Set matched APIs for a message
   */
  setMatchedAPIs(messageId: string, apis: any[]): void {
    const activeId = this.state.activeConversationId;
    if (!activeId) return;

    this.setStateFn((state) => ({
      ...state,
      conversations: state.conversations.map(conv => {
        if (conv.id === activeId) {
          return {
            ...conv,
            messages: conv.messages.map(msg => {
              if (msg.id === messageId) {
                return { ...msg, matchedAPIs: apis };
              }
              return msg;
            })
          };
        }
        return conv;
      })
    }));
  }

  /**
   * Set streaming state
   */
  setStreaming(isStreaming: boolean): void {
    this.setStateFn((state) => ({ ...state, isStreaming }));
  }

  /**
   * Set searching APIs state
   */
  setSearchingAPIs(isSearchingAPIs: boolean): void {
    this.setStateFn((state) => ({ ...state, isSearchingAPIs }));
  }

  /**
   * Set error
   */
  setError(error: string | null): void {
    this.setStateFn((state) => ({ ...state, error }));
  }

  /**
   * Clear all conversations
   */
  clearAllConversations(): void {
    this.setStateFn((state) => ({
      ...state,
      conversations: [],
      activeConversationId: null
    }));
    localStorage.removeItem('conversations');
  }
}

// Export singleton instance
export const chatStore = new ChatStore();
