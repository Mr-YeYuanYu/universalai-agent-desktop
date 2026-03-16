import { SSEClient } from './SSEClient';
import type { ChatMessage } from '../../../../shared/types/chat';

export interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class LLMClient {
  private sseClient: SSEClient;

  constructor() {
    this.sseClient = new SSEClient();
  }

  /**
   * Send a message and receive streaming response
   */
  async chat(
    messages: ChatMessage[],
    onToken: (token: string) => void,
    onComplete: (response?: LLMResponse) => void,
    onError: (error: string) => void
  ): Promise<void> {
    // Convert ChatMessage to simple format for LLM API
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    await this.sseClient.streamCompletion(
      formattedMessages,
      onToken,
      () => {
        // On complete, we could calculate token usage here
        // For now, just call onComplete without additional data
        onComplete();
      },
      onError
    );
  }

  /**
   * Cancel the current chat stream
   */
  cancel(): void {
    this.sseClient.cancel();
  }

  /**
   * Check if currently streaming
   */
  isStreaming(): boolean {
    return this.sseClient.isStreaming();
  }
}

// Export singleton instance
export const llmClient = new LLMClient();
