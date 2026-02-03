/**
 * LLM Provider Interface
 * 
 * Unified interface for multiple LLM backends:
 * - OpenRouter (default)
 * - GitHub Copilot SDK
 * - OpenClaw
 * - Custom providers
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: 'text' | 'image'; text?: string; image?: string }>;
}

export interface LLMCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  tools?: Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: any;
    };
  }>;
}

export interface LLMResponse {
  text: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  toolCalls?: Array<{
    name: string;
    arguments: any;
  }>;
}

export interface StreamingOptions {
  onToken?: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Base interface for all LLM providers
 */
export interface ILLMProvider {
  readonly name: string;
  readonly supportsStreaming: boolean;
  readonly supportsVision: boolean;
  readonly supportsFunctionCalling: boolean;
  
  /**
   * Initialize the provider (connect, authenticate, etc.)
   */
  initialize(): Promise<void>;
  
  /**
   * Check if provider is ready to use
   */
  isReady(): boolean;
  
  /**
   * Get list of available models
   */
  getAvailableModels(): Promise<string[]>;
  
  /**
   * Complete a chat conversation
   */
  chatCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<LLMResponse>;
  
  /**
   * Stream a chat completion
   */
  streamChatCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions & StreamingOptions
  ): Promise<LLMResponse>;
  
  /**
   * Generate embeddings for text
   */
  generateEmbedding?(text: string): Promise<number[]>;
  
  /**
   * Cleanup resources
   */
  dispose(): Promise<void>;
}

/**
 * Provider type enum
 */
export enum LLMProviderType {
  OPENROUTER = 'openrouter',
  GITHUB_COPILOT = 'github-copilot',
  OPENCLAW = 'openclaw',
  CUSTOM = 'custom'
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  type: LLMProviderType;
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  options?: Record<string, any>;
}

/**
 * Multi-provider configuration
 */
export interface MultiProviderConfig {
  default: LLMProviderType;
  providers: Record<LLMProviderType, ProviderConfig>;
  fallbackOrder?: LLMProviderType[];
}
