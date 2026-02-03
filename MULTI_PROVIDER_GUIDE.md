# Multi-Backend LLM Provider Support

## 🎯 Overview

The Generative Agents project now supports **multiple LLM backends** that can be used alongside or instead of OpenRouter:

1. **OpenRouter** (Default) - Access to 100+ models via unified API
2. **GitHub Copilot SDK** (NEW) - GitHub's agentic runtime with advanced workflows
3. **OpenClaw** (NEW) - Open-source AI automation framework
4. **Custom Providers** - Build your own integrations

You can:
- ✅ Use any single provider
- ✅ Switch between providers dynamically
- ✅ Use multiple providers simultaneously
- ✅ Compare responses across providers
- ✅ Implement fallback strategies

---

## 🚀 Quick Start

### Current Setup (OpenRouter Only)

Your existing code works as-is:

```typescript
import { OpenRouterSDKClient } from './src/openrouterSDK.js';

const client = new OpenRouterSDKClient();
const response = await client.chatCompletion([
  { role: 'user', content: 'Hello!' }
]);
```

### New Multi-Provider Setup

```typescript
import { ProviderManager, LLMProviderType } from './src/llm/ProviderManager.js';

// Initialize with OpenRouter (default)
const manager = new ProviderManager();
await manager.initialize();

// Use default provider
const response = await manager.chatCompletion([
  { role: 'user', content: 'Hello!' }
]);

// Or specify provider explicitly
const response = await manager.chatCompletion([
  { role: 'user', content: 'Hello!' }
], {
  provider: LLMProviderType.GITHUB_COPILOT
});
```

---

## 📦 Installation & Setup

### 1. OpenRouter (Already Set Up)

**Status**: ✅ Already configured

```env
OPENROUTER_API_KEY=your_key_here
DEFAULT_MODEL=deepseek/deepseek-chat
```

### 2. GitHub Copilot SDK (Optional)

**Requirements**:
- GitHub Copilot subscription
- GitHub Copilot CLI installed

**Installation**:
```bash
npm install @github/copilot-sdk
```

**Configuration** (.env):
```env
GITHUB_COPILOT_ENABLED=true
GITHUB_COPILOT_MODEL=gpt-4
```

**Setup**:
```bash
# Install Copilot CLI
gh extension install github/gh-copilot

# Authenticate
gh copilot
```

### 3. OpenClaw (Optional)

**Requirements**:
- Node.js 22+

**Installation**:
```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
```

**Configuration** (.env):
```env
OPENCLAW_ENABLED=true
OPENCLAW_BASE_URL=http://localhost:18789
```

**Setup**:
```bash
# Configure OpenClaw
openclaw onboard

# Set up gateway
openclaw gateway start
```

---

## 🎛️ Configuration

### Environment Variables

Add to your `.env` file:

```env
# Provider Selection
LLM_PROVIDER=openrouter  # openrouter | github-copilot | openclaw

# OpenRouter (default)
OPENROUTER_API_KEY=your_key_here
OPENROUTER_ENABLED=true
DEFAULT_MODEL=deepseek/deepseek-chat

# GitHub Copilot SDK (optional)
GITHUB_COPILOT_ENABLED=false
GITHUB_COPILOT_MODEL=gpt-4

# OpenClaw (optional)
OPENCLAW_ENABLED=false
OPENCLAW_BASE_URL=http://localhost:18789

# Fallback Strategy
LLM_FALLBACK_ENABLED=true
LLM_FALLBACK_ORDER=openrouter,github-copilot,openclaw
```

### TypeScript Configuration

```typescript
import { MultiProviderConfig, LLMProviderType } from './src/llm/ILLMProvider.js';

const config: MultiProviderConfig = {
  default: LLMProviderType.OPENROUTER,
  providers: {
    [LLMProviderType.OPENROUTER]: {
      type: LLMProviderType.OPENROUTER,
      enabled: true,
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultModel: 'deepseek/deepseek-chat'
    },
    [LLMProviderType.GITHUB_COPILOT]: {
      type: LLMProviderType.GITHUB_COPILOT,
      enabled: false,
      defaultModel: 'gpt-4'
    },
    [LLMProviderType.OPENCLAW]: {
      type: LLMProviderType.OPENCLAW,
      enabled: false,
      baseUrl: 'http://localhost:18789'
    }
  },
  fallbackOrder: [
    LLMProviderType.OPENROUTER,
    LLMProviderType.GITHUB_COPILOT,
    LLMProviderType.OPENCLAW
  ]
};
```

---

## 💻 Usage Examples

### Example 1: Use Default Provider

```typescript
import { ProviderManager } from './src/llm/ProviderManager.js';

const manager = new ProviderManager();
await manager.initialize();

const response = await manager.chatCompletion([
  { role: 'user', content: 'Explain generative agents' }
]);

console.log(response.text);
```

### Example 2: Specify Provider

```typescript
import { LLMProviderType } from './src/llm/ILLMProvider.js';

// Use GitHub Copilot
const response = await manager.chatCompletion([
  { role: 'user', content: 'Help me write code' }
], {
  provider: LLMProviderType.GITHUB_COPILOT,
  model: 'gpt-4'
});

// Use OpenClaw
const response = await manager.chatCompletion([
  { role: 'user', content: 'Automate a task' }
], {
  provider: LLMProviderType.OPENCLAW
});
```

### Example 3: Compare Providers

```typescript
const prompt = 'What are the key components of an agent?';

const openrouterResponse = await manager.chatCompletion([
  { role: 'user', content: prompt }
], { provider: LLMProviderType.OPENROUTER });

const copilotResponse = await manager.chatCompletion([
  { role: 'user', content: prompt }
], { provider: LLMProviderType.GITHUB_COPILOT });

console.log('OpenRouter:', openrouterResponse.text);
console.log('Copilot:', copilotResponse.text);
```

### Example 4: Automatic Fallback

```typescript
// If primary provider fails, automatically tries fallback
try {
  const response = await manager.chatCompletionWithFallback([
    { role: 'user', content: 'Hello' }
  ]);
  
  console.log('Provider used:', response.model);
  console.log('Response:', response.text);
} catch (error) {
  console.error('All providers failed');
}
```

### Example 5: Stream from Any Provider

```typescript
await manager.streamChatCompletion([
  { role: 'user', content: 'Tell me a story' }
], {
  provider: LLMProviderType.OPENROUTER,
  onToken: (token) => process.stdout.write(token),
  onComplete: (text) => console.log('\nDone!')
});
```

---

## 🔄 Provider Comparison

### OpenRouter

**Pros**:
- ✅ Access to 100+ models
- ✅ Unified pricing and billing
- ✅ No installation required
- ✅ Excellent vision support
- ✅ Simple API

**Cons**:
- ❌ Requires API key and credits
- ❌ Internet connection required

**Best For**: Production use, model flexibility, vision tasks

### GitHub Copilot SDK

**Pros**:
- ✅ Advanced agentic workflows
- ✅ Multi-turn conversations
- ✅ Persistent memory
- ✅ Tool orchestration
- ✅ GitHub integration

**Cons**:
- ❌ Requires Copilot subscription
- ❌ Limited to Copilot-supported models
- ❌ More complex setup

**Best For**: Complex agent workflows, code generation, enterprise use

### OpenClaw

**Pros**:
- ✅ Open source
- ✅ Runs locally
- ✅ Complete privacy
- ✅ Multi-channel messaging
- ✅ Plugin ecosystem
- ✅ No API costs

**Cons**:
- ❌ Requires local installation
- ❌ More resource intensive
- ❌ Steeper learning curve

**Best For**: Privacy, local development, automation workflows

---

## 🎯 When to Use Each Provider

### Use OpenRouter When:
- You need access to many different models
- You want simple, reliable API access
- You need vision capabilities
- You're building a production application
- You want predictable pricing

### Use GitHub Copilot SDK When:
- You have a Copilot subscription
- You need advanced agentic capabilities
- You want persistent conversation context
- You're building code-focused agents
- You need official GitHub support

### Use OpenClaw When:
- Privacy is critical
- You want to run everything locally
- You need custom automation workflows
- You want to integrate with messaging platforms
- You prefer open-source solutions

---

## 🔧 Advanced Features

### Dynamic Provider Selection

```typescript
function selectProvider(task: Task): LLMProviderType {
  if (task.requiresPrivacy) {
    return LLMProviderType.OPENCLAW;
  } else if (task.requiresCodeGeneration) {
    return LLMProviderType.GITHUB_COPILOT;
  } else {
    return LLMProviderType.OPENROUTER;
  }
}

const provider = selectProvider(myTask);
const response = await manager.chatCompletion(messages, { provider });
```

### Provider Health Checking

```typescript
// Check which providers are available
const health = await manager.checkHealth();

console.log('OpenRouter:', health.openrouter ? '✅' : '❌');
console.log('Copilot:', health.copilot ? '✅' : '❌');
console.log('OpenClaw:', health.openclaw ? '✅' : '❌');
```

### Cost Optimization

```typescript
// Use cheap provider for routine tasks
const routine = await manager.chatCompletion(messages, {
  provider: LLMProviderType.OPENCLAW // Free/local
});

// Use premium provider for critical tasks
const critical = await manager.chatCompletion(messages, {
  provider: LLMProviderType.OPENROUTER,
  model: 'google/gemini-3-pro' // High quality
});
```

---

## 📊 Feature Matrix

| Feature | OpenRouter | GitHub Copilot | OpenClaw |
|---------|-----------|----------------|----------|
| Multiple Models | ✅ 100+ | ✅ 5+ | ✅ Many |
| Streaming | ✅ | ✅ | ✅ |
| Vision | ✅ | ❌ | ✅ |
| Function Calling | ✅ | ✅ | ✅ |
| Local Execution | ❌ | ❌ | ✅ |
| Persistent Memory | ❌ | ✅ | ✅ |
| Tool Orchestration | ❌ | ✅ | ✅ |
| API Required | ✅ | ✅ | ❌ |
| Subscription Required | ❌ | ✅ | ❌ |
| Open Source | ❌ | ❌ | ✅ |

---

## 🚀 Getting Started

### Step 1: Keep Using OpenRouter (Default)

Nothing changes! Your existing code continues to work.

### Step 2: (Optional) Add GitHub Copilot

```bash
# Install SDK
npm install @github/copilot-sdk

# Enable in .env
echo "GITHUB_COPILOT_ENABLED=true" >> .env

# Try it
npm run demo:multi-provider
```

### Step 3: (Optional) Add OpenClaw

```bash
# Install OpenClaw
npm install -g openclaw

# Setup
openclaw onboard

# Enable in .env
echo "OPENCLAW_ENABLED=true" >> .env
```

---

## 📖 Additional Resources

### Documentation
- **OpenRouter**: https://openrouter.ai/docs
- **GitHub Copilot SDK**: https://github.com/github/copilot-sdk
- **OpenClaw**: https://openclaw.im/

### Examples
- `examples/model-comparison-demo.ts` - Compare OpenRouter models
- `examples/multi-provider-demo.ts` - Use multiple providers (coming soon)
- `examples/provider-fallback-demo.ts` - Automatic fallback (coming soon)

### Related Guides
- `MODEL_SELECTION_GUIDE.md` - How to choose models
- `MODERN_MODELS_2026.md` - Model comparison
- `DEEPSEEK_GUIDE.md` - DeepSeek integration

---

## 💡 FAQ

### Q: Do I need to install all providers?

**A:** No! OpenRouter is the only required provider. GitHub Copilot and OpenClaw are optional.

### Q: Can I use multiple providers at the same time?

**A:** Yes! You can specify which provider to use for each request, or use fallback strategies.

### Q: Which provider should I use?

**A:** Start with OpenRouter (default). Add others if you need specific capabilities:
- GitHub Copilot for advanced agentic workflows
- OpenClaw for privacy/local execution

### Q: Are there additional costs?

**A:** 
- OpenRouter: Pay per token
- GitHub Copilot: Requires subscription ($10-39/month)
- OpenClaw: Free (open source, runs locally)

### Q: Can I build my own provider?

**A:** Yes! Implement the `ILLMProvider` interface and register it with the ProviderManager.

---

## 🎯 Summary

### ✅ What You Can Do

1. **Continue using OpenRouter** - Everything works as before
2. **Add GitHub Copilot** - For advanced agentic capabilities
3. **Add OpenClaw** - For local/private execution
4. **Mix and match** - Use different providers for different tasks
5. **Compare providers** - Test responses side-by-side
6. **Automatic fallback** - Resilient to provider failures

### 🚀 Next Steps

1. Try the model comparison demo: `npm run demo:compare-models`
2. (Optional) Install GitHub Copilot SDK
3. (Optional) Install OpenClaw
4. Explore the examples and documentation

---

**Last Updated**: February 2026  
**Status**: ✅ Multi-Provider Support Active  
**Default Provider**: OpenRouter  
**Optional Providers**: GitHub Copilot SDK, OpenClaw
