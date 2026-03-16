import { getConfig } from '../config/ConfigStore';
import type { APIMetadata } from '../../../../shared/types/api';

export class MilvusClient {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes

  /**
   * Search for APIs using vector similarity
   */
  async searchAPIs(query: string, topK: number = 5): Promise<APIMetadata[]> {
    const config = getConfig();

    // Check cache
    const cacheKey = `${query}:${topK}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      console.log('📦 Using cached API search results');
      return cached.data;
    }

    try {
      // First, get embedding for the query
      const embedding = await this.getEmbedding(query);

      // Then search Milvus
      const response = await fetch(
        `http://${config.milvusConfig.host}:${config.milvusConfig.port}/v2/vectordb/entities/search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiToken}`
          },
          body: JSON.stringify({
            collectionName: config.milvusConfig.collection,
            vector: embedding,
            limit: topK,
            outputFields: [
              'id',
              'name',
              'description',
              'endpoint',
              'method',
              'category',
              'parameters_json',
              'responses_json'
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Milvus search failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.code !== 0) {
        throw new Error(result.message || 'Milvus search failed');
      }

      // Parse the results
      const apis: APIMetadata[] = result.data.map((match: any) => ({
        id: match.id,
        name: match.name,
        description: match.description,
        endpoint: match.endpoint,
        method: match.method,
        category: match.category,
        parameters: JSON.parse(match.parameters_json || '[]'),
        responses: JSON.parse(match.responses_json || '{}'),
        score: 1 - match.distance // Convert distance to similarity score
      }));

      // Cache the results
      this.cache.set(cacheKey, {
        data: apis,
        timestamp: Date.now()
      });

      console.log(`✅ Found ${apis.length} matching APIs`);
      return apis;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('❌ Milvus search error:', errorMsg);
      throw new Error(`向量检索失败: ${errorMsg}`);
    }
  }

  /**
   * Get embedding for a text query
   * This assumes the LLM endpoint also provides embedding service
   */
  private async getEmbedding(text: string): Promise<number[]> {
    const config = getConfig();

    try {
      const response = await fetch(`${config.llmEndpoint}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiToken}`
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-ada-002'
        })
      });

      if (!response.ok) {
        throw new Error(`Embedding generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data[0].embedding;

    } catch (error) {
      console.error('❌ Failed to get embedding:', error);
      throw error;
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Milvus cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Test connection to Milvus
   */
  async testConnection(): Promise<boolean> {
    const config = getConfig();

    try {
      const response = await fetch(
        `http://${config.milvusConfig.host}:${config.milvusConfig.port}/v2/vectordb/collections/describe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            collectionName: config.milvusConfig.collection
          })
        }
      );

      const result = await response.json();
      return result.code === 0;

    } catch (error) {
      console.error('❌ Milvus connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const milvusClient = new MilvusClient();
