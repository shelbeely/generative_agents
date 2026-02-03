/**
 * Vision LLM Demo
 * 
 * Demonstrates how to use vision-capable language models
 * to analyze game scenes and enhance agent perception
 * 
 * Updated for 2026 with latest models (Gemini 3, GPT-5, etc.)
 */

import { openRouterClient } from '../src/openrouter.js';
import {
  analyzeGameScene,
  detectAgentPositions,
  detectSceneChanges,
  enhancePerceptionWithVision,
  VisualMemoryStore,
  isVisionModel,
  getRecommendedVisionModel,
} from '../src/utils/visionHelpers.js';
import { config } from '../src/config.js';

// Demo 1: Basic Vision Analysis
async function demoBasicVision() {
  console.log('\n🎨 Demo 1: Basic Vision Analysis (Gemini 3)\n');

  const exampleImageUrl = 'https://via.placeholder.com/800x600.png?text=Game+Scene';

  try {
    const response = await openRouterClient.visionCompletion(
      'Describe what you see in this game scene. Focus on characters and their activities.',
      [exampleImageUrl],
      {
        model: config.openrouter.visionModel, // Uses Gemini 3 Flash by default
        detail: 'auto',
      }
    );

    console.log('Vision Analysis:');
    console.log(response);
  } catch (error) {
    console.error('Error:', error);
    console.log('\n💡 Note: To run this demo, you need:');
    console.log('   1. Valid OPENROUTER_API_KEY in .env');
    console.log('   2. A vision-capable model configured (default: Gemini 3 Flash)');
    console.log('   3. Internet connection\n');
  }
}

// Demo 2: Model Capabilities Check
async function demoModelCheck() {
  console.log('\n🔍 Demo 2: Model Capabilities Check (2026)\n');

  const currentModel = config.openrouter.visionModel;
  console.log(`Configured vision model: ${currentModel}`);
  console.log(`Supports vision: ${isVisionModel(currentModel)}\n`);

  console.log('Recommended models by task (2026):');
  console.log(`  Fast analysis: ${getRecommendedVisionModel('fast')}`);
  console.log(`  Balanced: ${getRecommendedVisionModel('balanced')}`);
  console.log(`  Detailed analysis: ${getRecommendedVisionModel('detailed')}\n`);

  console.log('Top vision models in 2026:');
  console.log('  🥇 google/gemini-3-flash - Fast, excellent, cost-effective');
  console.log('  🥈 google/gemini-3-pro - Best quality, 1M context');
  console.log('  🥉 openai/gpt-5 - High accuracy, 400K context');
  console.log('  🏅 meta-llama/llama-3.2-90b-vision - Open source champion');
}

// Main demo runner
async function runAllDemos() {
  console.log('═══════════════════════════════════════════════════');
  console.log('   Vision LLM Demo - 2026 Edition');
  console.log('   Generative Agents with Modern Models');
  console.log('═══════════════════════════════════════════════════');

  if (!isVisionModel(config.openrouter.visionModel)) {
    console.log('\n⚠️  Warning: Current model may not support vision!');
    console.log(`   Configured: ${config.openrouter.visionModel}`);
    console.log('   Recommended (2026):');
    console.log('   - google/gemini-3-flash (fast & cheap)');
    console.log('   - google/gemini-3-pro (best quality)');
    console.log('   - meta-llama/llama-3.2-90b-vision (open source)\n');
  }

  await demoModelCheck();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  await demoBasicVision();

  console.log('\n═══════════════════════════════════════════════════');
  console.log('   Demo Complete!');
  console.log('   See MODERN_MODELS_2026.md for model details');
  console.log('═══════════════════════════════════════════════════\n');
}

// Run demos
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllDemos().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { demoBasicVision, demoModelCheck };
