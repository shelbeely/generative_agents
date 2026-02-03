/**
 * Official OpenRouter SDK Wrapper
 * 
 * Uses the official @openrouter/ai-sdk-provider with Vercel AI SDK
 * Provides backward compatibility with our existing API
 */

import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, streamText, embed, generateObject } from 'ai';
import { config } from './config.js';
import { z } from 'zod';

export type MessageContent = 
  | string 
  | Array<{
      type: 'text' | 'image';
      text?: string;
      image?: string | URL;
    }>;

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: MessageContent;
}

export interface OpenRouterCompletionRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

/**
 * OpenRouter SDK Client using official SDK
 * Maintains backward compatibility with existing OpenRouterClient API
 */
export class OpenRouterSDKClient {
  private provider: ReturnType<typeof createOpenRouter>;
  private defaultModel: string;

  constructor(
    apiKey: string = config.openrouter.apiKey,
    baseUrl: string = config.openrouter.baseUrl,
    defaultModel: string = config.openrouter.defaultModel
  ) {
    this.provider = createOpenRouter({
      apiKey,
      baseURL: baseUrl,
      headers: {
        'HTTP-Referer': 'https://github.com/shelbeely/generative_agents',
        'X-Title': 'Generative Agents',
      },
    });
    this.defaultModel = defaultModel;
  }

  /**
   * Convert our message format to AI SDK format
   */
  private convertMessages(messages: OpenRouterMessage[]) {
    return messages.map(msg => {
      if (typeof msg.content === 'string') {
        return { role: msg.role, content: msg.content };
      }
      
      // Convert image_url format to image format for AI SDK
      const convertedContent = msg.content.map(part => {
        if ('image_url' in part && part.type === 'image_url') {
          // Handle old format from custom client
          return { type: 'image' as const, image: (part as any).image_url.url };
        }
        return part;
      });
      
      return { role: msg.role, content: convertedContent };
    });
  }

  /**
   * Make a chat completion request using official SDK
   */
  async chatCompletion(
    messages: OpenRouterMessage[],
    options: Partial<OpenRouterCompletionRequest> = {}
  ): Promise<string> {
    try {
      const model = this.provider(options.model ?? this.defaultModel);
      const convertedMessages = this.convertMessages(messages);

      const result = await generateText({
        model,
        messages: convertedMessages,
        temperature: options.temperature ?? 0.7,
        maxTokens: options.maxTokens,
        topP: options.topP ?? 1,
        frequencyPenalty: options.frequencyPenalty ?? 0,
        presencePenalty: options.presencePenalty ?? 0,
        maxRetries: 3,
      });

      return result.text;
    } catch (error) {
      console.error('OpenRouter SDK Error:', error);
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
   * Stream a chat completion with real-time token output
   */
  async streamChatCompletion(
    messages: OpenRouterMessage[],
    options: Partial<OpenRouterCompletionRequest> & {
      onToken?: (token: string) => void;
      onComplete?: (fullText: string) => void;
    } = {}
  ): Promise<string> {
    try {
      const model = this.provider(options.model ?? this.defaultModel);
      const convertedMessages = this.convertMessages(messages);

      const result = await streamText({
        model,
        messages: convertedMessages,
        temperature: options.temperature ?? 0.7,
        maxTokens: options.maxTokens,
        topP: options.topP ?? 1,
        frequencyPenalty: options.frequencyPenalty ?? 0,
        presencePenalty: options.presencePenalty ?? 0,
      });

      let fullText = '';
      
      for await (const chunk of result.textStream) {
        fullText += chunk;
        if (options.onToken) {
          options.onToken(chunk);
        }
      }

      if (options.onComplete) {
        options.onComplete(fullText);
      }

      return fullText;
    } catch (error) {
      console.error('OpenRouter Streaming Error:', error);
      throw error;
    }
  }

  /**
   * Generate structured output with Zod schema validation
   * Uses the AI SDK's generateObject for guaranteed JSON parsing
   */
  async generateStructured<T>(
    messages: OpenRouterMessage[],
    schema: z.ZodSchema<T>,
    options: Partial<OpenRouterCompletionRequest> = {}
  ): Promise<T> {
    try {
      const model = this.provider(options.model ?? this.defaultModel);
      const convertedMessages = this.convertMessages(messages);

      const result = await generateObject({
        model,
        messages: convertedMessages,
        schema,
        temperature: options.temperature ?? 0.7,
        maxTokens: options.maxTokens,
        maxRetries: 3,
      });

      return result.object;
    } catch (error) {
      console.error('OpenRouter Structured Generation Error:', error);
      throw error;
    }
  }

  /**
   * Make a vision-enabled completion request with image(s)
   * Supports both base64 encoded images and URLs
   */
  async visionCompletion(
    prompt: string,
    images: string[],
    options: Partial<OpenRouterCompletionRequest> = {}
  ): Promise<string> {
    // Build content array with text and images
    const content: MessageContent = [
      { type: 'text', text: prompt },
      ...images.map((imageUrl) => ({
        type: 'image' as const,
        image: imageUrl,
      })),
    ];

    return this.chatCompletion([{ role: 'user', content }], options);
  }

  /**
   * Analyze a game scene screenshot
   */
  async analyzeGameScene(
    imageUrl: string,
    query: string,
    options?: Partial<OpenRouterCompletionRequest>
  ): Promise<string> {
    const systemPrompt = `You are analyzing a scene from a life simulation game. 
Describe what you observe about the agents, their positions, activities, and the environment.
Be specific and concise.`;

    return this.chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: query },
            { type: 'image', image: imageUrl },
          ],
        },
      ],
      options
    );
  }

  /**
   * Compare two game scenes and describe changes
   */
  async compareGameScenes(
    beforeImageUrl: string,
    afterImageUrl: string,
    options?: Partial<OpenRouterCompletionRequest>
  ): Promise<string> {
    return this.visionCompletion(
      'Compare these two game scenes. What changed between the first and second image? Describe agent movements, interactions, and environmental changes.',
      [beforeImageUrl, afterImageUrl],
      options
    );
  }

  /**
   * Get text embeddings using official SDK
   */
  async getEmbedding(text: string, model: string = 'openai/text-embedding-ada-002'): Promise<number[]> {
    const cleanText = text.replace(/\n/g, ' ') || 'this is blank';

    try {
      const embeddingModel = this.provider.textEmbeddingModel(model);
      
      const result = await embed({
        model: embeddingModel,
        value: cleanText,
      });

      return result.embedding;
    } catch (error) {
      console.error('Embedding Error:', error);
      throw error;
    }
  }

  /**
   * Safe generation with retry logic and validation
   * Maintained for backward compatibility
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
      maxTokens: parameters.max_tokens,
      temperature: parameters.temperature,
      topP: parameters.top_p,
      frequencyPenalty: parameters.frequency_penalty,
      presencePenalty: parameters.presence_penalty,
      stop: parameters.stop,
    });
  }

  /**
   * Generate a base64 data URL from a file path or buffer
   */
  static imageToBase64DataUrl(imageBuffer: Buffer, mimeType: string = 'image/png'): string {
    const base64 = imageBuffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  }
}

// Export a default instance using official SDK
export const openRouterSDKClient = new OpenRouterSDKClient();

// Export the provider factory for advanced usage
export { createOpenRouter };
