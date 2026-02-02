/**
 * OpenRouter API Client
 * 
 * A modern TypeScript client for interacting with OpenRouter API
 * Supports multiple LLM providers through a unified interface
 */

import { config } from './config.js';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterCompletionRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
}

export interface OpenRouterCompletionResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor(
    apiKey: string = config.openrouter.apiKey,
    baseUrl: string = config.openrouter.baseUrl,
    defaultModel: string = config.openrouter.defaultModel
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
  }

  /**
   * Sleep for a specified number of milliseconds
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Make a chat completion request to OpenRouter
   */
  async chatCompletion(
    messages: OpenRouterMessage[],
    options: Partial<OpenRouterCompletionRequest> = {}
  ): Promise<string> {
    // Rate limiting
    await this.sleep(100);

    const request: OpenRouterCompletionRequest = {
      model: options.model ?? this.defaultModel,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens,
      top_p: options.top_p ?? 1,
      frequency_penalty: options.frequency_penalty ?? 0,
      presence_penalty: options.presence_penalty ?? 0,
      stop: options.stop,
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://github.com/shelbeely/generative_agents',
          'X-Title': 'Generative Agents',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
      }

      const data = (await response.json()) as OpenRouterCompletionResponse;
      return data.choices[0]?.message?.content ?? '';
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      throw error;
    }
  }

  /**
   * Make a single-message completion request
   */
  async singleCompletion(prompt: string, model?: string): Promise<string> {
    return this.chatCompletion([{ role: 'user', content: prompt }], { model });
  }

  /**
   * Safe generation with retry logic and validation
   */
  async safeGenerate<T>(
    prompt: string,
    options: {
      exampleOutput: string;
      specialInstruction: string;
      model?: string;
      repeat?: number;
      validate?: (response: string) => boolean;
      cleanup?: (response: string) => T;
    }
  ): Promise<T | false> {
    const { exampleOutput, specialInstruction, model, repeat = 3, validate, cleanup } = options;

    // Format prompt with JSON structure requirement
    const formattedPrompt = `"""
${prompt}
"""
Output the response to the prompt above in json. ${specialInstruction}
Example output json:
{"output": "${exampleOutput}"}`;

    for (let i = 0; i < repeat; i++) {
      try {
        const response = await this.singleCompletion(formattedPrompt, model);
        
        // Extract JSON from response
        const endIndex = response.lastIndexOf('}') + 1;
        const jsonStr = response.substring(0, endIndex);
        const parsed = JSON.parse(jsonStr);
        const output = parsed.output;

        // Validate response if validator provided
        if (validate && !validate(output)) {
          if (config.app.debug) {
            console.log(`Validation failed on attempt ${i + 1}:`, output);
          }
          continue;
        }

        // Cleanup response if cleanup function provided
        if (cleanup) {
          return cleanup(output);
        }

        return output as T;
      } catch (error) {
        if (config.app.debug) {
          console.error(`Attempt ${i + 1} failed:`, error);
        }
        continue;
      }
    }

    return false;
  }

  /**
   * Legacy GPT-style completion for backward compatibility
   */
  async legacyCompletion(
    prompt: string,
    parameters: {
      engine?: string;
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
      stop?: string[];
    }
  ): Promise<string> {
    return this.chatCompletion([{ role: 'user', content: prompt }], {
      model: parameters.engine ?? this.defaultModel,
      max_tokens: parameters.max_tokens,
      temperature: parameters.temperature,
      top_p: parameters.top_p,
      frequency_penalty: parameters.frequency_penalty,
      presence_penalty: parameters.presence_penalty,
      stop: parameters.stop,
    });
  }

  /**
   * Get text embeddings (Note: OpenRouter may not support all embedding models)
   */
  async getEmbedding(text: string, model: string = 'openai/text-embedding-ada-002'): Promise<number[]> {
    const cleanText = text.replace(/\n/g, ' ') || 'this is blank';

    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          input: [cleanText],
        }),
      });

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('Embedding API Error:', error);
      throw error;
    }
  }
}

// Export a default instance
export const openRouterClient = new OpenRouterClient();
