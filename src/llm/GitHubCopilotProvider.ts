/**
 * GitHub Copilot SDK Provider Implementation
 * 
 * Integrates GitHub Copilot SDK for agentic workflows
 * Requires: @github/copilot-sdk package and GitHub Copilot subscription
 */

import {
  ILLMProvider,
  LLMMessage,
  LLMCompletionOptions,
  LLMResponse,
  StreamingOptions
} from './ILLMProvider.js';

export class GitHubCopilotProvider implements ILLMProvider {
  readonly name = 'GitHub Copilot';
  readonly supportsStreaming = true;
  readonly supportsVision = false; // Copilot SDK focuses on code/text
  readonly supportsFunctionCalling = true;

  private client: any; // CopilotClient from @github/copilot-sdk
  private session: any;
  private ready = false;
  private defaultModel: string;

  constructor(defaultModel = 'gpt-4') {
    this.defaultModel = defaultModel;
  }

  async initialize(): Promise<void> {
    try {
      // Dynamic import to avoid dependency requirement
      const { CopilotClient } = await import('@github/copilot-sdk');
      
      this.client = new CopilotClient();
      await this.client.start();
      
      // Create a persistent session
      this.session = await this.client.createSession({
        model: this.defaultModel
      });
      
      this.ready = true;
      console.log('✅ GitHub Copilot SDK initialized');
    } catch (error) {
      console.warn('⚠️  GitHub Copilot SDK not available:', error);
      console.warn('   Install with: npm install @github/copilot-sdk');
      console.warn('   Requires GitHub Copilot subscription');
      throw new Error('GitHub Copilot SDK initialization failed');
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  async getAvailableModels(): Promise<string[]> {
    // GitHub Copilot SDK supports various models
    return [
      'gpt-4',
      'gpt-4-turbo',
      'gpt-3.5-turbo',
      'claude-3-opus',
      'claude-3-sonnet'
    ];
  }

  async chatCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<LLMResponse> {
    if (!this.isReady()) {
      throw new Error('GitHub Copilot provider not initialized');
    }

    try {
      // Create session with specific model if provided
      const session = options?.model && options.model !== this.defaultModel
        ? await this.client.createSession({ model: options.model })
        : this.session;

      // Convert messages to Copilot format
      let fullResponse = '';
      
      for (const message of messages) {
        if (message.role === 'user') {
          const content = typeof message.content === 'string' 
            ? message.content 
            : message.content.map(c => c.text || '').join(' ');
          
          const response = await session.send({ prompt: content });
          
          // Copilot SDK returns streaming responses
          for await (const chunk of response) {
            fullResponse += chunk.content || '';
          }
        }
      }

      return {
        text: fullResponse,
        model: options?.model || this.defaultModel,
        usage: {
          promptTokens: this.estimateTokens(messages),
          completionTokens: this.estimateTokens([{ role: 'assistant', content: fullResponse }]),
          totalTokens: this.estimateTokens(messages) + this.estimateTokens([{ role: 'assistant', content: fullResponse }])
        }
      };
    } catch (error) {
      console.error('GitHub Copilot error:', error);
      throw error;
    }
  }

  async streamChatCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions & StreamingOptions
  ): Promise<LLMResponse> {
    if (!this.isReady()) {
      throw new Error('GitHub Copilot provider not initialized');
    }

    try {
      const session = options?.model && options.model !== this.defaultModel
        ? await this.client.createSession({ model: options.model })
        : this.session;

      let fullResponse = '';
      
      for (const message of messages) {
        if (message.role === 'user') {
          const content = typeof message.content === 'string' 
            ? message.content 
            : message.content.map(c => c.text || '').join(' ');
          
          const response = await session.send({ prompt: content });
          
          for await (const chunk of response) {
            const token = chunk.content || '';
            fullResponse += token;
            
            if (options?.onToken) {
              options.onToken(token);
            }
          }
        }
      }

      if (options?.onComplete) {
        options.onComplete(fullResponse);
      }

      return {
        text: fullResponse,
        model: options?.model || this.defaultModel,
        usage: {
          promptTokens: this.estimateTokens(messages),
          completionTokens: this.estimateTokens([{ role: 'assistant', content: fullResponse }]),
          totalTokens: this.estimateTokens(messages) + this.estimateTokens([{ role: 'assistant', content: fullResponse }])
        }
      };
    } catch (error) {
      if (options?.onError) {
        options.onError(error as Error);
      }
      throw error;
    }
  }

  async dispose(): Promise<void> {
    if (this.session) {
      await this.session.close?.();
    }
    if (this.client) {
      await this.client.stop?.();
    }
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
