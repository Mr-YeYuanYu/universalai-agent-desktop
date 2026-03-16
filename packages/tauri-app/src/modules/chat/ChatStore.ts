import { createStore, produce } from 'solid-js/store';
import type { Conversation, ChatMessage } from '../../../../shared/types/chat';
import { llmClient } from '../llm-client';
import { milvusClient } from '../milvus-client';

export class ChatStore {
  private stateStore: ReturnType<typeof createStore<{
    conversations: Conversation[];
    activeConversationId: string | null;
    isStreaming: boolean;
    isSearchingAPIs: boolean;
    error: string | null;
  }>>;

  constructor() {
    // Initialize store in constructor
    this.stateStore = createStore({
      conversations: [],
      activeConversationId: null,
      isStreaming: false,
      isSearchingAPIs: false,
      error: null
    });

    this.loadConversations();
  }

  // Getters
  get state() {
    return this.stateStore[0];
  }

  // Private setter
  private setState = this.stateStore[1];

  /**
   * Load conversations from local storage
   */
  private loadConversations(): void {
    try {
      const saved = localStorage.getItem('conversations');
      if (saved) {
        const conversations: Conversation[] = JSON.parse(saved);
        this.setState('conversations', conversations);
        if (conversations.length > 0) {
          this.setState('activeConversationId', conversations[0].id);
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
  createConversation(title?: string): string {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: title || `对话 ${this.state.conversations.length + 1}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.setState(produce(state => {
      state.conversations.unshift(newConversation);
      state.activeConversationId = newConversation.id;
    }));

    this.saveConversations();
    return newConversation.id;
  }

  /**
   * Delete a conversation
   */
  deleteConversation(id: string): void {
    this.setState(produce(state => {
      const index = state.conversations.findIndex(c => c.id === id);
      if (index !== -1) {
        state.conversations.splice(index, 1);

        // If deleted conversation was active, switch to another
        if (state.activeConversationId === id) {
          state.activeConversationId = state.conversations[0]?.id || null;
        }
      }
    }));

    this.saveConversations();
  }

  /**
   * Set active conversation
   */
  setActiveConversation(id: string): void {
    this.setState('activeConversationId', id);
  }

  /**
   * Get active conversation
   */
  getActiveConversation(): Conversation | undefined {
    return this.state.conversations.find(c => c.id === this.state.activeConversationId);
  }

  /**
   * Send a message
   */
  async sendMessage(content: string): Promise<void> {
    let conversationId = this.state.activeConversationId;

    // Create new conversation if none exists
    if (!conversationId) {
      conversationId = this.createConversation();
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now(),
      status: 'success'
    };

    this.setState(produce(state => {
      const conv = state.conversations.find(c => c.id === conversationId);
      if (conv) {
        conv.messages.push(userMessage);
        conv.updatedAt = Date.now();

        // Update title if it's the first message
        if (conv.messages.length === 1) {
          conv.title = content.slice(0, 30) + (content.length > 30 ? '...' : '');
        }
      }
    }));

    this.saveConversations();

    // Prepare messages for LLM
    const conversation = this.state.conversations.find(c => c.id === conversationId);
    if (!conversation) return;

    const messages = conversation.messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    // Create placeholder for assistant response
    const assistantMessageId = crypto.randomUUID();
    this.setState(produce(state => {
      const conv = state.conversations.find(c => c.id === conversationId);
      if (conv) {
        conv.messages.push({
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          status: 'sending'
        });
      }
    }));

    this.setState('isStreaming', true);
    this.setState('error', null);

    try {
      // Stream LLM response
      await llmClient.chat(
        messages,
        // On token
        (token: string) => {
          this.setState(produce(state => {
            const conv = state.conversations.find(c => c.id === conversationId);
            if (conv) {
              const msg = conv.messages.find(m => m.id === assistantMessageId);
              if (msg) {
                msg.content += token;
              }
            }
          }));
        },
        // On complete
        async () => {
          // Mark message as success
          this.setState(produce(state => {
            const conv = state.conversations.find(c => c.id === conversationId);
            if (conv) {
              const msg = conv.messages.find(m => m.id === assistantMessageId);
              if (msg) {
                msg.status = 'success';
              }
              conv.updatedAt = Date.now();
            }
          }));

          this.setState('isStreaming', false);
          this.saveConversations();

          // Search for matching APIs
          await this.searchAPIs(content, conversationId!);
        },
        // On error
        (error: string) => {
          this.setState(produce(state => {
            const conv = state.conversations.find(c => c.id === conversationId);
            if (conv) {
              const msg = conv.messages.find(m => m.id === assistantMessageId);
              if (msg) {
                msg.content = `❌ 错误: ${error}`;
                msg.status = 'error';
              }
            }
          }));

          this.setState('isStreaming', false);
          this.setState('error', error);
        }
      );

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.setState('error', errorMsg);
      this.setState('isStreaming', false);
    }
  }

  /**
   * Search for matching APIs
   */
  private async searchAPIs(query: string, conversationId: string): Promise<void> {
    this.setState('isSearchingAPIs', true);

    try {
      const apis = await milvusClient.searchAPIs(query, 5);

      // Add APIs to the last assistant message
      this.setState(produce(state => {
        const conv = state.conversations.find(c => c.id === conversationId);
        if (conv && conv.messages.length > 0) {
          const lastMsg = conv.messages[conv.messages.length - 1];
          if (lastMsg.role === 'assistant') {
            lastMsg.matchedAPIs = apis.map(api => api.id);
          }
        }
      }));

      // Store API metadata separately for easy access
      // We'll retrieve full API details when user wants to execute

      this.saveConversations();

    } catch (error) {
      console.error('API search failed:', error);
      // Don't show error to user, as this is a background operation
    } finally {
      this.setState('isSearchingAPIs', false);
    }
  }

  /**
   * Cancel current stream
   */
  cancelStream(): void {
    llmClient.cancel();
    this.setState('isStreaming', false);
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.setState('error', null);
  }

  /**
   * Get state
   */
  getState() {
    return this.state;
  }
}

// Export singleton instance
export const chatStore = new ChatStore();
