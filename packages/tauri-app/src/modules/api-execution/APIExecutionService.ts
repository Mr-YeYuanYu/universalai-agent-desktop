import { getConfig } from '../config/ConfigStore';
import type { APIMetadata, APIExecutionResult } from '../../../../shared/types/api';

export class APIExecutionService {
  /**
   * Execute an API call
   */
  async execute(
    api: APIMetadata,
    params: Record<string, any>,
    onProgress?: (status: string) => void
  ): Promise<APIExecutionResult> {
    const config = getConfig();
    const startTime = Date.now();

    try {
      onProgress?.('准备请求...');

      // Build URL with path parameters
      let url = `${config.serverDomain}${api.endpoint}`;
      const pathParams: Record<string, any> = {};
      const queryParams: Record<string, any> = {};

      // Separate path and query parameters
      for (const [key, value] of Object.entries(params)) {
        if (url.includes(`{${key}}`)) {
          pathParams[key] = value;
          url = url.replace(`{${key}}`, encodeURIComponent(value));
        } else {
          queryParams[key] = value;
        }
      }

      // Add query parameters for GET requests
      if (api.method === 'GET' && Object.keys(queryParams).length > 0) {
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(queryParams)) {
          searchParams.append(key, String(value));
        }
        url += `?${searchParams.toString()}`;
      }

      onProgress?.('调用 API...');

      const response = await fetch(url, {
        method: api.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiToken}`
        },
        body: api.method !== 'GET' ? JSON.stringify(queryParams) : undefined
      });

      onProgress?.('处理响应...');

      if (!response.ok) {
        throw new Error(`API 调用失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data,
        executionTime,
        statusCode: response.status
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Validate parameters against API definition
   */
  validateParams(api: APIMetadata, params: Record<string, any>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    for (const param of api.parameters) {
      // Check required parameters
      if (param.required && !params[param.name]) {
        errors.push(`缺少必填参数: ${param.name}`);
        continue;
      }

      // Skip validation if parameter not provided
      if (!params[param.name]) continue;

      // Type validation
      const value = params[param.name];
      switch (param.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`参数 ${param.name} 必须是字符串`);
          }
          break;
        case 'number':
          if (isNaN(Number(value))) {
            errors.push(`参数 ${param.name} 必须是数字`);
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean' && !['true', 'false'].includes(value)) {
            errors.push(`参数 ${param.name} 必须是布尔值`);
          }
          break;
        case 'array':
          if (!Array.isArray(value)) {
            errors.push(`参数 ${param.name} 必须是数组`);
          }
          break;
        case 'object':
          if (typeof value !== 'object' || Array.isArray(value)) {
            errors.push(`参数 ${param.name} 必须是对象`);
          }
          break;
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Format API response for display
   */
  formatResponse(data: any): string {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }
}

// Export singleton instance
export const apiExecutionService = new APIExecutionService();
