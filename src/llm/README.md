# LLM Provider Architecture

This directory contains the multi-provider LLM architecture that allows the Generative Agents project to work with multiple LLM backends.

## Structure

```
src/llm/
├── ILLMProvider.ts          # Core interface for all providers
├── OpenRouterProvider.ts    # OpenRouter implementation (default)
├── GitHubCopilotProvider.ts # GitHub Copilot SDK implementation
└── README.md                # This file
```

## Providers

### OpenRouter (Default)
- **Status**: ✅ Fully Implemented
- **File**: `OpenRouterProvider.ts`
- **Description**: Adapter for existing OpenRouterSDKClient
- **Requirements**: OpenRouter API key
- **Models**: 100+ models available

### GitHub Copilot SDK
- **Status**: ⚠️ Implementation Ready (requires optional package)
- **File**: `GitHubCopilotProvider.ts`
- **Description**: Integration with GitHub's agentic runtime
- **Requirements**: 
  - GitHub Copilot subscription
  - `@github/copilot-sdk` package
  - Copilot CLI installed
- **Models**: GPT-4, GPT-3.5, Claude 3, etc.

### OpenClaw
- **Status**: 📋 Planned
- **Description**: Open-source AI automation framework
- **Requirements**: OpenClaw CLI installed locally
- **Models**: Supports various models via plugins

## Usage

### Basic Usage (OpenRouter)

```typescript
import { OpenRouterProvider } from './src/llm/OpenRouterProvider.js';

const provider = new OpenRouterProvider();
await provider.initialize();

const response = await provider.chatCompletion([
  { role: 'user', content: 'Hello!' }
]);

console.log(response.text);
```

### Using GitHub Copilot

```typescript
import { GitHubCopilotProvider } from './src/llm/GitHubCopilotProvider.js';

const provider = new GitHubCopilotProvider('gpt-4');

try {
  await provider.initialize();
  
  const response = await provider.chatCompletion([
    { role: 'user', content: 'Help me write code' }
  ]);
  
  console.log(response.text);
} catch (error) {
  console.error('GitHub Copilot not available:', error);
  // Fallback to OpenRouter
}
```

## Interface

All providers implement the `ILLMProvider` interface:

```typescript
interface ILLMProvider {
  // Metadata
  readonly name: string;
  readonly supportsStreaming: boolean;
  readonly supportsVision: boolean;
  readonly supportsFunctionCalling: boolean;
  
  // Lifecycle
  initialize(): Promise<void>;
  isReady(): boolean;
  dispose(): Promise<void>;
  
  // Core functionality
  getAvailableModels(): Promise<string[]>;
  chatCompletion(messages, options?): Promise<LLMResponse>;
  streamChatCompletion(messages, options?): Promise<LLMResponse>;
  
  // Optional
  generateEmbedding?(text: string): Promise<number[]>;
}
```

## Adding a New Provider

1. Create a new file: `src/llm/MyProvider.ts`
2. Implement the `ILLMProvider` interface
3. Add provider type to `LLMProviderType` enum
4. Register provider in `ProviderManager` (when implemented)

Example:

```typescript
import { ILLMProvider, LLMMessage, LLMResponse } from './ILLMProvider.js';

export class MyProvider implements ILLMProvider {
  readonly name = 'My Provider';
  readonly supportsStreaming = true;
  readonly supportsVision = false;
  readonly supportsFunctionCalling = true;
  
  async initialize(): Promise<void> {
    // Setup connection, authenticate, etc.
  }
  
  isReady(): boolean {
    return this.ready;
  }
  
  async chatCompletion(
    messages: LLMMessage[],
    options?
  ): Promise<LLMResponse> {
    // Implement your provider's logic
  }
  
  // ... implement other required methods
}
```

## Documentation

For complete documentation, see:
- **MULTI_PROVIDER_GUIDE.md** - Full guide for using multiple providers
- **MODEL_SELECTION_GUIDE.md** - How to select and compare models
- **MODERN_MODELS_2026.md** - Model comparison and recommendations

## Status

- ✅ **Interface Defined**: Core `ILLMProvider` interface complete
- ✅ **OpenRouter**: Fully implemented and tested
- ⚠️ **GitHub Copilot**: Implementation ready (requires optional dependency)
- 📋 **OpenClaw**: Planned for future implementation
- 📋 **ProviderManager**: Multi-provider management (planned)

## Next Steps

1. ✅ Document multi-provider architecture
2. 📋 Implement `ProviderManager` for easy provider switching
3. 📋 Create demo showing all providers
4. 📋 Add automatic fallback between providers
5. 📋 Implement OpenClaw provider
6. 📋 Add provider comparison utilities

---

**Last Updated**: February 2026  
**Current Default**: OpenRouter  
**Optional Providers**: GitHub Copilot SDK (ready), OpenClaw (planned)
