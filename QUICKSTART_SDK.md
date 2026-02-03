# Official OpenRouter SDK - Quick Start

## What Changed

The project now uses the **official OpenRouter TypeScript SDK** in addition to the custom implementation.

## Quick Start

### Install Dependencies

```bash
npm install
```

### Use the Official SDK

```typescript
import { openRouterSDKClient } from './src/openrouter.js';

// Basic chat
const response = await openRouterSDKClient.chatCompletion([
  { role: 'user', content: 'Hello!' }
]);

// Streaming
await openRouterSDKClient.streamChatCompletion([
  { role: 'user', content: 'Tell me a story' }
], {
  onToken: (token) => process.stdout.write(token)
});

// Structured output with Zod
import { z } from 'zod';

const schema = z.object({
  name: z.string(),
  age: z.number()
});

const result = await openRouterSDKClient.generateStructured([
  { role: 'user', content: 'Tell me about a person' }
], schema);
```

### Run the Demo

```bash
npm run demo:official-sdk
```

## Why Use the Official SDK?

### ✅ Benefits

1. **Streaming** - Real-time token generation
2. **Structured Outputs** - Guaranteed JSON parsing with Zod
3. **Auto Retry** - Exponential backoff built-in  
4. **Type Safety** - Full TypeScript support
5. **Official Support** - Regular updates from OpenRouter team

### 📊 Comparison

| Feature | Custom | Official SDK |
|---------|--------|--------------|
| Basic Chat | ✅ | ✅ |
| Vision | ✅ | ✅ |
| Streaming | ❌ | ✅ |
| Structured Output | ❌ | ✅ |
| Auto Retry | Manual | ✅ Automatic |
| Type Safety | Partial | ✅ Full |

## Backward Compatibility

Your existing code continues to work:

```typescript
import { openRouterClient } from './src/openrouter.js';
// All existing code works unchanged
```

## Documentation

- **OFFICIAL_SDK_INTEGRATION.md** - Complete integration guide
- **examples/official-sdk-demo.ts** - Working examples
- **NPM**: https://www.npmjs.com/package/@openrouter/ai-sdk-provider
- **Docs**: https://ai-sdk.dev/providers/community-providers/openrouter

## Recommendation

**For new code**: Use `openRouterSDKClient` (official SDK)  
**For existing code**: Keep using `openRouterClient` (or migrate gradually)

Both implementations work side-by-side!
