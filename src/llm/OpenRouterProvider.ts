/**
 * OpenRouter Provider Implementation
 * Adapter for existing OpenRouterSDKClient
 */

import { OpenRouterSDKClient } from '../openrouterSDK.js';
import { config } from '../config.js';
import {
  ILLMProvider,
  LLMMessage,
  LLMCompletionOptions,
  LLMResponse,
  StreamingOptions
} from './ILLMProvider.js';

export class OpenRouterProvider implements ILLMProvider {
  readonly name = 'OpenRouter';
  readonly supportsStreaming = true;
  readonly supportsVision = true;
  readonly supportsFunctionCalling = true;

  private client: OpenRouterSDKClient;
  private ready = false;

  constructor(apiKey?: string, baseUrl?: string, defaultModel?: string) {
    this.client = new OpenRouterSDKClient(apiKey, baseUrl, defaultModel);
  }

  async initialize(): Promise<void> {
    // OpenRouter client doesn't need async initialization
    this.ready = true;
  }

  isReady(): boolean {
    return this.ready;
  }

  async getAvailableModels(): Promise<string[]> {
    // Return common OpenRouter models
    // In production, this could fetch from OpenRouter API
    return [
      'deepseek/deepseek-chat',
      'google/gemini-3-pro',
      'google/gemini-3-flash',
      'openai/gpt-4-turbo',
      'openai/gpt-3.5-turbo',
      'anthropic/claude-3.5-sonnet',
      'meta-llama/llama-3.2-90b-vision',
      'xai/grok-2-vision'
    ];
  }

  async chatCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<LLMResponse> {
    const openRouterMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const text = await this.client.chatCompletion(openRouterMessages as any, {
      model: options?.model,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
      topP: options?.topP,
      frequencyPenalty: options?.frequencyPenalty,
      presencePenalty: options?.presencePenalty,
      stop: options?.stop
    });

    return {
      text,
      model: options?.model || config.openrouter.defaultModel,
      usage: {
        promptTokens: this.estimateTokens(messages),
        completionTokens: this.estimateTokens([{ role: 'assistant', content: text }]),
        totalTokens: this.estimateTokens(messages) + this.estimateTokens([{ role: 'assistant', content: text }])
      }
    };
  }

  async streamChatCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions & StreamingOptions
  ): Promise<LLMResponse> {
    const openRouterMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const text = await this.client.streamChatCompletion(openRouterMessages as any, {
      model: options?.model,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
      topP: options?.topP,
      frequencyPenalty: options?.frequencyPenalty,
      presencePenalty: options?.presencePenalty,
      onToken: options?.onToken,
      onComplete: options?.onComplete
    });

    return {
      text,
      model: options?.model || config.openrouter.defaultModel,
      usage: {
        promptTokens: this.estimateTokens(messages),
        completionTokens: this.estimateTokens([{ role: 'assistant', content: text }]),
        totalTokens: this.estimateTokens(messages) + this.estimateTokens([{ role: 'assistant', content: text }])
      }
    };
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return await this.client.getEmbedding(text);
  }

  async dispose(): Promise<void> {
    // No cleanup needed for OpenRouter
    this.ready = false;
  }

  private estimateTokens(messages: LLMMessage[]): number {
    const text = messages.map(m => {
      if (typeof m.content === 'string') return m.content;
      return m.content.map(c => c.text || '').join(' ');
    }).join(' ');
    return Math.ceil(text.length / 4);
  }
}
