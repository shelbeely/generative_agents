/**
 * Official OpenRouter SDK Demo
 * 
 * Demonstrates the features of the official @openrouter/ai-sdk-provider
 * Shows how to use the new SDK while maintaining compatibility
 */

import { openRouterSDKClient, createOpenRouter } from '../src/openrouterSDK.js';
import { config } from '../src/config.js';
import { z } from 'zod';

console.log('🚀 Official OpenRouter SDK Demo\n');
console.log('=' .repeat(60));

// Check if API key is configured
const hasApiKey = config.openrouter.apiKey && 
                  config.openrouter.apiKey !== 'your-openrouter-api-key' &&
                  config.openrouter.apiKey !== 'your-api-key-here' &&
                  config.openrouter.apiKey.trim().length > 10;

async function demo1_BasicChatCompletion() {
  console.log('\n📝 Demo 1: Basic Chat Completion');
  console.log('-'.repeat(60));

  console.log('⚠️  No API key configured - showing example usage');
  console.log('\nExample code:');
  console.log(`
const response = await openRouterSDKClient.chatCompletion([
  { role: 'user', content: 'What is the capital of France?' }
]);
console.log(response);
// Output: "The capital of France is Paris."
  `);
  
  if (!hasApiKey) {
    return;
  }

  console.log('\n🌐 Making real API call...');
  try {
    const response = await openRouterSDKClient.chatCompletion([
      { role: 'user', content: 'What is the capital of France? Answer in one sentence.' }
    ]);
    console.log('✅ Response:', response);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
  }
}

async function demo2_StreamingResponse() {
  console.log('\n🌊 Demo 2: Streaming Response');
  console.log('-'.repeat(60));

  console.log('⚠️  No API key configured - showing example usage');
  console.log('\nExample code:');
  console.log(`
await openRouterSDKClient.streamChatCompletion([
  { role: 'user', content: 'Tell me a short story' }
], {
  onToken: (token) => process.stdout.write(token),
  onComplete: (full) => console.log('\\n✅ Complete!')
});
  `);
  
  if (!hasApiKey) {
    return;
  }

  console.log('\n🌐 Making real streaming API call...');
  try{
    console.log('🎬 Streaming response (tokens appear in real-time):\n');
    await openRouterSDKClient.streamChatCompletion([
      { role: 'user', content: 'Tell me a very short joke about programming.' }
    ], {
      onToken: (token) => process.stdout.write(token),
      onComplete: () => console.log('\n\n✅ Stream complete!')
    });
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
  }
}

async function demo3_StructuredOutput() {
  console.log('\n📊 Demo 3: Structured Output with Zod Schema');
  console.log('-'.repeat(60));

  // Define a schema for agent daily plan
  const DailyPlanSchema = z.object({
    wake_up_hour: z.number().min(0).max(23),
    activities: z.array(z.object({
      time: z.string(),
      activity: z.string(),
      location: z.string()
    })),
    sleep_hour: z.number().min(0).max(23)
  });

  if (!hasApiKey) {
    console.log('⚠️  No API key configured - showing mock example');
    console.log('Schema:', DailyPlanSchema.shape);
    console.log('\nExample output:');
    console.log(JSON.stringify({
      wake_up_hour: 7,
      activities: [
        { time: "7:00 AM", activity: "breakfast", location: "kitchen" },
        { time: "9:00 AM", activity: "work", location: "office" },
        { time: "6:00 PM", activity: "dinner", location: "dining room" }
      ],
      sleep_hour: 22
    }, null, 2));
    return;
  }

  try {
    const result = await openRouterSDKClient.generateStructured([
      { 
        role: 'user', 
        content: 'Create a daily schedule for a software developer named Alice. Include wake up hour, 3-5 activities with times and locations, and sleep hour.' 
      }
    ], DailyPlanSchema);

    console.log('✅ Structured Output (validated with Zod):');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function demo4_VisionCapabilities() {
  console.log('\n👁️  Demo 4: Vision Capabilities');
  console.log('-'.repeat(60));

  if (!hasApiKey) {
    console.log('⚠️  No API key configured - showing mock example');
    console.log('Example usage:');
    console.log(`
const response = await openRouterSDKClient.visionCompletion(
  "What do you see in this image?",
  ["https://example.com/image.jpg"],
  { model: "google/gemini-2.0-flash-exp:free" }
);
console.log(response);
    `);
    return;
  }

  try {
    // Using a public test image
    const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/320px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg';
    
    const response = await openRouterSDKClient.visionCompletion(
      'Describe this scene in one sentence.',
      [imageUrl],
      { model: config.openrouter.visionModel }
    );
    console.log('✅ Vision Response:', response);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function demo5_Embeddings() {
  console.log('\n🔢 Demo 5: Text Embeddings');
  console.log('-'.repeat(60));

  if (!hasApiKey) {
    console.log('⚠️  No API key configured - showing mock example');
    console.log('Example usage:');
    console.log(`
const embedding = await openRouterSDKClient.getEmbedding(
  "This is a test sentence for embedding."
);
console.log('Embedding vector length:', embedding.length);
console.log('First 5 values:', embedding.slice(0, 5));
    `);
    return;
  }

  try {
    const text = 'The quick brown fox jumps over the lazy dog.';
    const embedding = await openRouterSDKClient.getEmbedding(text);
    
    console.log('✅ Text:', text);
    console.log('✅ Embedding vector length:', embedding.length);
    console.log('✅ First 5 values:', embedding.slice(0, 5));
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function demo6_CustomProvider() {
  console.log('\n⚙️  Demo 6: Custom Provider Configuration');
  console.log('-'.repeat(60));

  console.log('Creating custom provider with specific settings:');
  console.log(`
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const customProvider = createOpenRouter({
  apiKey: 'your-key',
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'X-Title': 'My Custom App'
  }
});

// Use with specific model
const model = customProvider('anthropic/claude-3.5-sonnet');
  `);
  
  console.log('✅ Custom providers allow fine-grained control over:');
  console.log('  - API endpoints');
  console.log('  - Request headers');
  console.log('  - Model selection');
  console.log('  - Retry logic');
}

async function demo7_Comparison() {
  console.log('\n📊 Demo 7: Comparison - Custom vs Official SDK');
  console.log('-'.repeat(60));

  console.log('\n🔴 Custom Implementation (openRouterClient):');
  console.log('  ✓ Simple fetch-based API');
  console.log('  ✓ Manual retry logic');
  console.log('  ✓ Basic error handling');
  console.log('  ✗ No built-in streaming');
  console.log('  ✗ No structured output validation');
  console.log('  ✗ Limited type safety');

  console.log('\n🟢 Official SDK (openRouterSDKClient):');
  console.log('  ✓ Built on Vercel AI SDK');
  console.log('  ✓ Automatic retry with backoff');
  console.log('  ✓ Advanced error handling');
  console.log('  ✓ Native streaming support');
  console.log('  ✓ Structured output with Zod validation');
  console.log('  ✓ Full TypeScript type safety');
  console.log('  ✓ Tool/function calling ready');
  console.log('  ✓ Official support and updates');

  console.log('\n💡 Recommendation:');
  console.log('  - Use openRouterSDKClient for new code');
  console.log('  - Both are available for backward compatibility');
}

// Run all demos
async function runAllDemos() {
  console.log('\n🎯 Running Official OpenRouter SDK Demos\n');
  
  if (!hasApiKey) {
    console.log('⚠️  NOTE: OPENROUTER_API_KEY not configured in .env');
    console.log('   Some demos will show examples only.\n');
  }

  await demo1_BasicChatCompletion();
  await demo2_StreamingResponse();
  await demo3_StructuredOutput();
  await demo4_VisionCapabilities();
  await demo5_Embeddings();
  await demo6_CustomProvider();
  await demo7_Comparison();

  console.log('\n' + '='.repeat(60));
  console.log('✅ All demos completed!');
  console.log('\n📚 For more information:');
  console.log('   - NPM: https://www.npmjs.com/package/@openrouter/ai-sdk-provider');
  console.log('   - GitHub: https://github.com/OpenRouterTeam/ai-sdk-provider');
  console.log('   - Docs: https://ai-sdk.dev/providers/community-providers/openrouter');
  console.log('='.repeat(60) + '\n');
}

// Run the demos
runAllDemos().catch(console.error);
