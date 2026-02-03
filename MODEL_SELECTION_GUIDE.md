# Model Selection & Comparison Guide

## 🎯 Overview

This guide answers two key questions:
1. **Can I select any OpenRouter model?** → **YES!**
2. **Can I compare multiple models?** → **YES!**

You have complete flexibility to use any model available on OpenRouter, and you can easily compare them side-by-side.

---

## ✅ Part 1: Selecting Any OpenRouter Model

### You Can Use ANY Model

OpenRouter provides access to 100+ models from various providers. You can use **any** of them by specifying the model ID.

### Method 1: Via Environment Variables (Recommended)

Edit your `.env` file:

```env
# Set your preferred models
DEFAULT_MODEL=deepseek/deepseek-chat
FAST_MODEL=google/gemini-3-flash
ADVANCED_MODEL=google/gemini-3-pro
VISION_MODEL=meta-llama/llama-3.2-90b-vision
```

**Available models include:**
- `deepseek/deepseek-chat` - DeepSeek V3.2
- `google/gemini-3-pro` - Gemini 3 Pro
- `google/gemini-3-flash` - Gemini 3 Flash
- `google/gemini-2.0-flash` - Gemini 2.0 Flash
- `openai/gpt-4-turbo` - GPT-4 Turbo
- `openai/gpt-3.5-turbo` - GPT-3.5 Turbo
- `anthropic/claude-3.5-sonnet` - Claude 3.5 Sonnet
- `anthropic/claude-4.5-opus` - Claude 4.5 Opus (when available)
- `meta-llama/llama-3.2-90b-vision` - Llama 3.2 Vision 90B
- `meta-llama/llama-3.2-11b-vision` - Llama 3.2 Vision 11B
- `xai/grok-2-vision` - Grok 2 Vision
- And 100+ more on [OpenRouter](https://openrouter.ai/models)

### Method 2: In Code

```typescript
import { OpenRouterSDKClient } from './src/openrouterSDK.js';

const client = new OpenRouterSDKClient();

// Use any model by specifying it in options
const response = await client.chatCompletion([
  { role: 'user', content: 'Your prompt here' }
], {
  model: 'deepseek/deepseek-chat'  // Or any other model
});
```

### Method 3: Dynamic Model Selection

```typescript
// Choose model based on task requirements
function selectModel(task: Task): string {
  if (task.requiresToolUse) {
    return 'deepseek/deepseek-chat';      // Best for agentic workflows
  } else if (task.needsSpeed) {
    return 'google/gemini-3-flash';        // Fastest response time
  } else if (task.hasImages) {
    return 'google/gemini-3-pro';          // Best vision capabilities
  } else if (task.isCritical) {
    return 'openai/gpt-4-turbo';           // Highest accuracy
  } else {
    return 'openai/gpt-3.5-turbo';         // Cost-effective default
  }
}

const model = selectModel(myTask);
const response = await client.chatCompletion(messages, { model });
```

---

## 🔄 Part 2: Comparing Multiple Models

### Why Compare Models?

- **Find the best model** for your specific use case
- **Balance quality vs. cost** for your budget
- **Optimize performance** (speed vs. accuracy)
- **Validate consistency** across different models
- **Make informed decisions** about model selection

### Quick Comparison (CLI)

Run the model comparison demo:

```bash
npm run demo:compare-models
```

This will compare multiple models side-by-side with the same prompt.

### Comparison in Code

#### Basic Comparison

```typescript
import { compareModels, formatComparisonResults } from './src/utils/modelComparison.js';

const results = await compareModels({
  messages: [{ 
    role: 'user', 
    content: 'Explain generative agents in one sentence.' 
  }],
  models: [
    'deepseek/deepseek-chat',
    'google/gemini-3-flash',
    'openai/gpt-3.5-turbo'
  ],
  temperature: 0.7
});

console.log(formatComparisonResults(results));
```

**Output:**
```
┌─────────────────────────────────────┬──────────┬────────────┬─────────┐
│ Model                               │ Status   │ Time (ms)  │ Tokens  │
├─────────────────────────────────────┼──────────┼────────────┼─────────┤
│ deepseek/deepseek-chat              │ ✅ OK    │     1250   │    156  │
│ google/gemini-3-flash               │ ✅ OK    │      850   │    142  │
│ openai/gpt-3.5-turbo                │ ✅ OK    │     1100   │    148  │
└─────────────────────────────────────┴──────────┴────────────┴─────────┘

DETAILED RESPONSES
────────────────────────────────────────────────────────────────
🤖 Model: deepseek/deepseek-chat
⏱️  Response Time: 1250ms
📝 Response: Generative agents are AI systems that simulate...
```

#### Compare Your Configured Models

```typescript
import { compareConfiguredModels } from './src/utils/modelComparison.js';

// Compares all models from your .env configuration
const results = await compareConfiguredModels(
  'What are the key components of an agent?'
);

console.log(formatComparisonResults(results));
```

#### Parallel vs Sequential

```typescript
// Parallel (faster, but uses more rate limit)
const resultsParallel = await compareModels({
  messages: [...],
  models: ['model1', 'model2', 'model3'],
  parallel: true  // All models run simultaneously
});

// Sequential (slower, but rate-limit friendly)
const resultsSequential = await compareModels({
  messages: [...],
  models: ['model1', 'model2', 'model3'],
  parallel: false  // Models run one after another
});
```

#### Compare Cost Efficiency

```typescript
import { compareCostEfficiency } from './src/utils/modelComparison.js';

const results = await compareModels({...});
const inputTokens = 50; // Approximate input token count

const efficiency = compareCostEfficiency(results, inputTokens);

efficiency.forEach(item => {
  console.log(`${item.model}`);
  console.log(`  Cost: $${item.cost.toFixed(6)}`);
  console.log(`  Speed: ${item.timePerToken.toFixed(2)}ms/token`);
});
```

---

## 📊 Comparison Features

### Available Metrics

The comparison utility provides:

1. **Response Time**: How long each model takes
2. **Token Count**: Number of tokens in the response
3. **Success/Failure**: Whether the API call succeeded
4. **Cost Estimate**: Approximate cost per model
5. **Quality**: Side-by-side response comparison

### Recommended Model Categories

```typescript
import { getRecommendedModels } from './src/utils/modelComparison.js';

const categories = getRecommendedModels();

// Returns organized model recommendations:
// - Top Tier (Best Overall)
// - Fast & Efficient
// - Agentic & Tool Use
// - Vision-Capable
// - Open Source
```

---

## 🎯 Model Selection Decision Guide

### Use Case → Model Mapping

| Use Case | Recommended Model | Why |
|----------|------------------|-----|
| **Agentic Tasks** | `deepseek/deepseek-chat` | Best tool-use compliance, GPT-5 class reasoning |
| **Real-time Chat** | `google/gemini-3-flash` | Fastest response time (100ms TTFT) |
| **Complex Reasoning** | `google/gemini-3-pro` | Best quality, 1M token context |
| **Cost Optimization** | `deepseek/deepseek-chat` | GPT-5 performance at 85% lower cost |
| **Vision Tasks** | `google/gemini-3-pro` | Best multimodal capabilities |
| **Privacy/Self-Host** | `meta-llama/llama-3.2-90b-vision` | Open source, can run locally |
| **Legacy Systems** | `openai/gpt-3.5-turbo` | Widely compatible, cost-effective |

### Quality vs. Speed vs. Cost

```
High Quality (Slow, Expensive)
├─ openai/gpt-4-turbo
├─ google/gemini-3-pro
└─ anthropic/claude-4.5-opus

Balanced (Medium Speed, Medium Cost)
├─ deepseek/deepseek-chat        ⭐ RECOMMENDED
├─ anthropic/claude-3.5-sonnet
└─ openai/gpt-4-turbo-preview

Fast & Efficient (Fast, Cheap)
├─ google/gemini-3-flash         ⭐ RECOMMENDED
├─ google/gemini-2.0-flash
└─ openai/gpt-3.5-turbo
```

---

## 💡 Best Practices

### 1. Start with Comparison

Before committing to a model, run comparisons:

```typescript
// Test with your actual use case
const results = await compareModels({
  messages: [{ role: 'user', content: 'Your typical prompt' }],
  models: [
    'deepseek/deepseek-chat',
    'google/gemini-3-flash',
    'openai/gpt-3.5-turbo'
  ]
});

// Choose based on results
```

### 2. Use Tiered Approach

```typescript
// Different models for different importance levels
if (task.priority === 'critical') {
  model = 'google/gemini-3-pro';         // Best quality
} else if (task.priority === 'high') {
  model = 'deepseek/deepseek-chat';      // Excellent quality, good cost
} else {
  model = 'google/gemini-3-flash';       // Fast and cheap
}
```

### 3. Monitor Performance

```typescript
// Track model performance over time
const metrics = {
  successRate: 0.98,
  avgResponseTime: 850,
  avgCost: 0.0012,
  userSatisfaction: 4.5
};

// Switch models if performance degrades
if (metrics.successRate < 0.95) {
  console.log('Consider switching to a more reliable model');
}
```

### 4. Cache Expensive Calls

```typescript
const cache = new Map();

async function cachedCompletion(prompt: string, model: string) {
  const cacheKey = `${model}:${prompt}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const response = await client.chatCompletion([
    { role: 'user', content: prompt }
  ], { model });
  
  cache.set(cacheKey, response);
  return response;
}
```

### 5. Fallback Strategy

```typescript
async function robustCompletion(messages, primaryModel, fallbackModel) {
  try {
    return await client.chatCompletion(messages, { 
      model: primaryModel 
    });
  } catch (error) {
    console.log(`Primary model failed, using fallback: ${fallbackModel}`);
    return await client.chatCompletion(messages, { 
      model: fallbackModel 
    });
  }
}
```

---

## 🚀 Quick Start Examples

### Example 1: Compare Three Models

```bash
# Run the comparison demo
npm run demo:compare-models
```

### Example 2: Custom Comparison Script

```typescript
import { compareModels, formatComparisonResults } from './src/utils/modelComparison.js';

const results = await compareModels({
  messages: [{ 
    role: 'user', 
    content: 'Your specific prompt here' 
  }],
  models: [
    'deepseek/deepseek-chat',
    'google/gemini-3-flash',
    'anthropic/claude-3.5-sonnet'
  ]
});

console.log(formatComparisonResults(results, true));
```

### Example 3: Batch Comparison

```typescript
import { batchCompareModels } from './src/utils/modelComparison.js';

const prompts = [
  'Explain agent memory',
  'How do agents plan?',
  'What is agent perception?'
];

const models = [
  'deepseek/deepseek-chat',
  'google/gemini-3-flash'
];

const results = await batchCompareModels(prompts, models);

// Analyze results across multiple prompts
results.forEach((comparison, prompt) => {
  console.log(`\nPrompt: ${prompt}`);
  console.log(formatComparisonResults(comparison, false));
});
```

---

## 📖 Additional Resources

### Finding More Models

1. **OpenRouter Models Page**: https://openrouter.ai/models
   - Browse all available models
   - See pricing and specifications
   - Filter by capabilities (vision, function calling, etc.)

2. **Model Documentation**: See `MODERN_MODELS_2026.md`
   - Detailed comparison of top models
   - Performance benchmarks
   - Use case recommendations

3. **OpenRouter API Docs**: https://openrouter.ai/docs
   - API specifications
   - Authentication
   - Rate limits

### Example Scripts

Run these demos to see model selection and comparison in action:

```bash
# Model comparison demo
npm run demo:compare-models

# DeepSeek-specific demo
npm run demo:deepseek

# General modern LLM features
npm run demo:modern-llm

# Vision capabilities
npm run demo:vision
```

---

## 🎓 FAQ

### Q: How many models can I compare at once?

**A:** As many as you want! The comparison utility supports any number of models. However, be mindful of:
- Rate limits (use `parallel: false` for many models)
- API costs (each model incurs charges)
- Time (sequential comparisons take longer)

### Q: Can I compare models with different parameters?

**A:** Yes! You can set different temperatures, token limits, etc. per model:

```typescript
// Compare different configurations
const config1 = await client.chatCompletion(messages, {
  model: 'deepseek/deepseek-chat',
  temperature: 0.3
});

const config2 = await client.chatCompletion(messages, {
  model: 'deepseek/deepseek-chat',
  temperature: 0.9
});
```

### Q: How accurate are the cost estimates?

**A:** The estimates are approximate based on published pricing. Actual costs may vary due to:
- Pricing updates
- Volume discounts
- Special promotions
- Token counting variations

Always check OpenRouter's current pricing for exact costs.

### Q: Can I use models not listed here?

**A:** Absolutely! If OpenRouter supports it, you can use it. Just specify the model ID:

```typescript
const response = await client.chatCompletion(messages, {
  model: 'any-provider/any-model-id'
});
```

### Q: How do I handle rate limits when comparing?

**A:** Use sequential comparison with delays:

```typescript
const results = await compareModels({
  messages: [...],
  models: [...],
  parallel: false  // Run one at a time
});

// Or add manual delays
for (const model of models) {
  const result = await testModel(model);
  await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
}
```

---

## 🎯 Summary

### Yes, you can select ANY OpenRouter model!

- Via environment variables in `.env`
- Directly in code with the `model` parameter
- Dynamically based on task requirements

### Yes, you can compare models!

- Use the `compareModels()` utility function
- Run the demo script: `npm run demo:compare-models`
- Compare quality, speed, and cost side-by-side

### Key Takeaways

1. **Flexibility**: Use any of 100+ models on OpenRouter
2. **Easy Comparison**: Built-in utilities for model comparison
3. **Smart Selection**: Choose models based on your specific needs
4. **Cost Optimization**: Compare costs before committing
5. **Performance Tracking**: Monitor and adjust over time

**Get Started Now:**
```bash
npm run demo:compare-models
```

---

**Last Updated**: February 2026
**Status**: ✅ Fully Documented
**Related Docs**: MODERN_MODELS_2026.md, DEEPSEEK_GUIDE.md
