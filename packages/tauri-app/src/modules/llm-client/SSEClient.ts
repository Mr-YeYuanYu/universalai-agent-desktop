import { getConfig } from '../config/ConfigStore';
import type { SSEMessage } from '../../../../shared/types/chat';

export class SSEClient {
  private abortController: AbortController | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 1000;

  /**
   * Stream completion from LLM endpoint using SSE
   */
  async streamCompletion(
    messages: Array<{ role: string; content: string }>,
    onToken: (token: string) => void,
    onComplete: () => void,
    onError: (error: string) => void
  ): Promise<void> {
    const config = getConfig();

    this.abortController = new AbortController();

    try {
      const response = await fetch(`${config.llmEndpoint}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiToken}`
        },
        body: JSON.stringify({
          messages,
          max_tokens: config.preferences.maxTokens
        }),
        signal: this.abortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              onComplete();
              this.reconnectAttempts = 0; // Reset on successful completion
              return;
            }

            try {
              const message: SSEMessage = JSON.parse(data);

              if (message.type === 'token' && message.content) {
                onToken(message.content);
              } else if (message.type === 'error') {
                onError(message.error || 'Unknown error from LLM');
                return;
              } else if (message.type === 'done') {
                onComplete();
                this.reconnectAttempts = 0;
                return;
              }
            } catch (parseError) {
              console.error('Failed to parse SSE message:', parseError, data);
            }
          }
        }
      }

      // Process any remaining buffer
      if (buffer.startsWith('data: ')) {
        const data = buffer.slice(6).trim();
        if (data === '[DONE]') {
          onComplete();
        }
      }

      onComplete();
      this.reconnectAttempts = 0;

    } catch (error) {
      // User cancelled
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Stream cancelled by user');
        return;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('LLM streaming error:', errorMessage);

      // Attempt reconnection
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

        await new Promise(resolve => setTimeout(resolve, this.reconnectDelay * this.reconnectAttempts));

        // Recursive retry
        return this.streamCompletion(messages, onToken, onComplete, onError);
      }

      onError(errorMessage);
    }
  }

  /**
   * Cancel the current stream
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Check if currently streaming
   */
  isStreaming(): boolean {
    return this.abortController !== null;
  }

  /**
   * Reset reconnection attempts
   */
  resetReconnect(): void {
    this.reconnectAttempts = 0;
  }
}

// Export singleton instance
export const sseClient = new SSEClient();
