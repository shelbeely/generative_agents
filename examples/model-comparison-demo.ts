/**
 * Model Comparison Demo
 * 
 * Demonstrates how to:
 * 1. Select any OpenRouter model
 * 2. Compare multiple models side-by-side
 * 3. Analyze performance, quality, and cost
 */

import { OpenRouterSDKClient } from '../src/openrouterSDK.js';
import { config } from '../src/config.js';
import {
  compareModels,
  formatComparisonResults,
  getRecommendedModels,
  compareConfiguredModels,
  compareCostEfficiency,
  estimateTokens
} from '../src/utils/modelComparison.js';

console.log('🔄 Model Comparison Demo\n');
console.log('This demo shows how to select and compare different OpenRouter models\n');
console.log('='.repeat(80) + '\n');

// Check if API key is configured
const hasApiKey = config.openrouter.apiKey && 
                  config.openrouter.apiKey !== 'your-openrouter-api-key' &&
                  config.openrouter.apiKey !== 'your-api-key-here' &&
                  config.openrouter.apiKey.trim().length > 10;

/**
 * Example 1: Using Any OpenRouter Model
 */
async function example1_SelectAnyModel() {
  console.log('📌 Example 1: Selecting Any OpenRouter Model\n');
  console.log('You can use ANY model available on OpenRouter by specifying its ID:\n');

  const client = new OpenRouterSDKClient();

  // Examples of different models
  const examples = [
    { model: 'deepseek/deepseek-chat', description: 'DeepSeek-V3.2 for agentic tasks' },
    { model: 'google/gemini-3-pro', description: 'Gemini 3 Pro for complex reasoning' },
    { model: 'google/gemini-3-flash', description: 'Gemini 3 Flash for speed' },
    { model: 'openai/gpt-4-turbo', description: 'GPT-4 Turbo for accuracy' },
    { model: 'openai/gpt-3.5-turbo', description: 'GPT-3.5 for cost efficiency' },
    { model: 'anthropic/claude-3.5-sonnet', description: 'Claude for reliability' },
    { model: 'meta-llama/llama-3.2-90b-vision', description: 'Llama for vision + text' },
    { model: 'xai/grok-2-vision', description: 'Grok for diverse tasks' }
  ];

  console.log('Available models you can use:\n');
  examples.forEach(({ model, description }) => {
    console.log(`  • ${model}`);
    console.log(`    ${description}\n`);
  });

  console.log('To use any model, just pass it as an option:\n');
  console.log('```typescript');
  console.log('const response = await client.chatCompletion([');
  console.log('  { role: "user", content: "Your prompt here" }');
  console.log('], {');
  console.log('  model: "deepseek/deepseek-chat"  // or any other model');
  console.log('});\n```\n');

  if (!hasApiKey) {
    console.log('⚠️  Set OPENROUTER_API_KEY in .env to test with real API calls\n');
    return;
  }

  // Test with a specific model
  console.log('🌐 Testing with DeepSeek-V3.2:\n');
  try {
    const response = await client.chatCompletion([
      { role: 'user', content: 'Explain in one sentence what makes a good AI agent.' }
    ], {
      model: 'deepseek/deepseek-chat'
    });
    console.log('✅ Response:', response);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
  }

  console.log('\n' + '─'.repeat(80) + '\n');
}

/**
 * Example 2: Comparing Multiple Models
 */
async function example2_CompareModels() {
  console.log('🔄 Example 2: Comparing Multiple Models Side-by-Side\n');
  
  if (!hasApiKey) {
    console.log('⚠️  Mock comparison (set OPENROUTER_API_KEY for real comparison)\n');
    console.log('Example output:');
    console.log(`
┌─────────────────────────────────────┬──────────┬────────────┬─────────┐
│ Model                               │ Status   │ Time (ms)  │ Tokens  │
├─────────────────────────────────────┼──────────┼────────────┼─────────┤
│ deepseek/deepseek-chat              │ ✅ OK    │     1250   │    156  │
│ google/gemini-3-flash               │ ✅ OK    │      850   │    142  │
│ google/gemini-3-pro                 │ ✅ OK    │     1800   │    168  │
└─────────────────────────────────────┴──────────┴────────────┴─────────┘
    `);
    console.log('\n' + '─'.repeat(80) + '\n');
    return;
  }

  const prompt = 'Explain the concept of generative agents in 2-3 sentences.';
  
  console.log('📝 Prompt:', prompt);
  console.log('\n🔄 Comparing across multiple models...\n');

  // Compare models
  const modelsToCompare = [
    'deepseek/deepseek-chat',
    'google/gemini-3-flash',
    'openai/gpt-3.5-turbo'
  ];

  try {
    const results = await compareModels({
      messages: [{ role: 'user', content: prompt }],
      models: modelsToCompare,
      temperature: 0.7,
      maxTokens: 200
    });

    console.log(formatComparisonResults(results, true));
  } catch (error) {
    console.error('❌ Error:', error);
  }

  console.log('\n' + '─'.repeat(80) + '\n');
}

/**
 * Example 3: Comparing Configured Models
 */
async function example3_CompareConfigured() {
  console.log('⚙️  Example 3: Comparing Your Configured Models\n');
  
  console.log('Current configuration from .env:');
  console.log(`  DEFAULT_MODEL: ${config.openrouter.defaultModel}`);
  console.log(`  FAST_MODEL: ${config.openrouter.fastModel}`);
  console.log(`  ADVANCED_MODEL: ${config.openrouter.advancedModel}`);
  console.log(`  VISION_MODEL: ${config.openrouter.visionModel}\n`);

  if (!hasApiKey) {
    console.log('⚠️  Set OPENROUTER_API_KEY to test configured models\n');
    console.log('─'.repeat(80) + '\n');
    return;
  }

  const prompt = 'What are the key components of a cognitive architecture for agents?';
  console.log('📝 Testing with prompt:', prompt, '\n');

  try {
    const results = await compareConfiguredModels(prompt);
    console.log(formatComparisonResults(results, false));
  } catch (error) {
    console.error('❌ Error:', error);
  }

  console.log('\n' + '─'.repeat(80) + '\n');
}

/**
 * Example 4: Recommended Model Categories
 */
async function example4_RecommendedCategories() {
  console.log('📂 Example 4: Recommended Model Categories\n');
  
  const categories = getRecommendedModels();
  
  categories.forEach(category => {
    console.log(`\n🏷️  ${category.category}`);
    console.log(`   ${category.description}\n`);
    
    category.models.forEach(model => {
      console.log(`   • ${model}`);
    });
  });

  console.log('\n💡 Tip: Choose models based on your specific needs:');
  console.log('   - Agentic tasks → deepseek/deepseek-chat');
  console.log('   - Speed & cost → google/gemini-3-flash');
  console.log('   - Vision tasks → google/gemini-3-pro or llama-3.2-90b-vision');
  console.log('   - Privacy → meta-llama models (can be self-hosted)');
  
  console.log('\n' + '─'.repeat(80) + '\n');
}

/**
 * Example 5: Quality vs Speed Comparison
 */
async function example5_QualityVsSpeed() {
  console.log('⚡ Example 5: Quality vs Speed Trade-offs\n');

  if (!hasApiKey) {
    console.log('⚠️  Mock comparison\n');
    console.log('Typical trade-offs:');
    console.log(`
Fast Models (100-300ms):
  • google/gemini-3-flash
  • openai/gpt-3.5-turbo
  • Good for: Real-time interactions, frequent API calls

Balanced Models (300-800ms):
  • deepseek/deepseek-chat
  • anthropic/claude-3.5-sonnet
  • Good for: Agent reasoning, tool use, most tasks

High-Quality Models (800-2000ms):
  • google/gemini-3-pro
  • openai/gpt-4-turbo
  • anthropic/claude-4.5-opus
  • Good for: Complex reasoning, critical decisions
    `);
    console.log('\n' + '─'.repeat(80) + '\n');
    return;
  }

  const prompt = 'Should an agent prioritize completing tasks quickly or ensuring high quality?';
  
  console.log('📝 Testing:', prompt, '\n');

  const modelsToCompare = [
    'google/gemini-3-flash',      // Fast
    'deepseek/deepseek-chat',     // Balanced
    'google/gemini-3-pro'         // High quality
  ];

  try {
    console.log('🔄 Running comparison...\n');
    const results = await compareModels({
      messages: [{ role: 'user', content: prompt }],
      models: modelsToCompare,
      parallel: true
    });

    console.log(formatComparisonResults(results, true));
  } catch (error) {
    console.error('❌ Error:', error);
  }

  console.log('\n' + '─'.repeat(80) + '\n');
}

/**
 * Example 6: Cost Comparison
 */
async function example6_CostComparison() {
  console.log('💰 Example 6: Cost Comparison Across Models\n');

  if (!hasApiKey) {
    console.log('⚠️  Mock cost analysis\n');
    console.log('Approximate costs per 1M tokens:\n');
    console.log('Cost-Effective:');
    console.log('  • deepseek/deepseek-chat: $0.27 input, $1.10 output');
    console.log('  • google/gemini-3-flash: $0.10 input, $0.30 output');
    console.log('  • openai/gpt-3.5-turbo: $0.50 input, $1.50 output\n');
    console.log('Premium:');
    console.log('  • google/gemini-3-pro: $1.25 input, $5.00 output');
    console.log('  • openai/gpt-4-turbo: $10.00 input, $30.00 output');
    console.log('  • anthropic/claude-3.5-sonnet: $3.00 input, $15.00 output\n');
    console.log('💡 DeepSeek offers GPT-5 class performance at 85% lower cost!\n');
    console.log('─'.repeat(80) + '\n');
    return;
  }

  const prompt = 'Explain how memory works in generative agents.';
  console.log('📝 Prompt:', prompt, '\n');

  const modelsToCompare = [
    'deepseek/deepseek-chat',
    'google/gemini-3-flash',
    'openai/gpt-3.5-turbo'
  ];

  try {
    const results = await compareModels({
      messages: [{ role: 'user', content: prompt }],
      models: modelsToCompare
    });

    // Estimate input tokens
    const inputTokens = Math.ceil(prompt.length / 4);
    
    console.log('Cost Efficiency Analysis:\n');
    const efficiency = compareCostEfficiency(results, inputTokens);
    
    efficiency.forEach((item, index) => {
      console.log(`${index + 1}. ${item.model}`);
      console.log(`   Estimated cost: $${item.cost.toFixed(6)}`);
      console.log(`   Cost per token: $${item.costPerToken.toFixed(8)}`);
      console.log(`   Speed: ${item.timePerToken.toFixed(2)}ms per token\n`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }

  console.log('─'.repeat(80) + '\n');
}

/**
 * Example 7: Switching Models in Code
 */
async function example7_SwitchingModels() {
  console.log('🔀 Example 7: Dynamic Model Switching\n');

  console.log('You can switch models dynamically based on task requirements:\n');
  
  console.log('```typescript');
  console.log('import { OpenRouterSDKClient } from "./src/openrouterSDK.js";\n');
  console.log('const client = new OpenRouterSDKClient();\n');
  console.log('// Use different models for different tasks');
  console.log('async function processTask(task) {');
  console.log('  let model;');
  console.log('  ');
  console.log('  if (task.requiresToolUse) {');
  console.log('    model = "deepseek/deepseek-chat";  // Best for agents');
  console.log('  } else if (task.needsSpeed) {');
  console.log('    model = "google/gemini-3-flash";    // Fastest');
  console.log('  } else if (task.hasImages) {');
  console.log('    model = "google/gemini-3-pro";      // Best vision');
  console.log('  } else if (task.isCritical) {');
  console.log('    model = "openai/gpt-4-turbo";       // Most accurate');
  console.log('  } else {');
  console.log('    model = "openai/gpt-3.5-turbo";     // Cost-effective');
  console.log('  }');
  console.log('  ');
  console.log('  return await client.chatCompletion(task.messages, { model });');
  console.log('}');
  console.log('```\n');

  console.log('💡 Best Practices:');
  console.log('  1. Use fast models for routine tasks');
  console.log('  2. Use agentic models (DeepSeek) for tool use');
  console.log('  3. Use vision models for image understanding');
  console.log('  4. Use premium models only for critical decisions');
  console.log('  5. Cache results to reduce API calls\n');

  console.log('─'.repeat(80) + '\n');
}

/**
 * Main function
 */
async function main() {
  console.log('🎯 Model Selection & Comparison Guide\n');
  
  if (!hasApiKey) {
    console.log('⚠️  NOTE: OPENROUTER_API_KEY not set in .env');
    console.log('   Examples will show mock data. Set your API key for real comparisons.\n');
  }

  await example1_SelectAnyModel();
  await example2_CompareModels();
  await example3_CompareConfigured();
  await example4_RecommendedCategories();
  await example5_QualityVsSpeed();
  await example6_CostComparison();
  await example7_SwitchingModels();

  console.log('='.repeat(80));
  console.log('✅ Demo Complete!\n');
  console.log('📚 Key Takeaways:');
  console.log('  1. You can use ANY model on OpenRouter - just specify the model ID');
  console.log('  2. Compare models side-by-side to find the best fit');
  console.log('  3. Choose models based on your specific needs (speed/quality/cost)');
  console.log('  4. DeepSeek-V3.2 offers excellent value for agentic tasks');
  console.log('  5. Use the model comparison utility for your own tests\n');
  console.log('📖 For full model list, visit: https://openrouter.ai/models');
  console.log('📖 See MODERN_MODELS_2026.md for detailed recommendations');
  console.log('='.repeat(80) + '\n');
}

// Run the demo
main().catch(console.error);
