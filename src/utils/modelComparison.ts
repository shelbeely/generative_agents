/**
 * Model Comparison Utility
 * 
 * Allows running the same prompt across multiple OpenRouter models
 * to compare responses, performance, and cost.
 */

import { OpenRouterSDKClient, OpenRouterMessage } from '../openrouterSDK.js';
import { config } from '../config.js';

export interface ModelComparisonResult {
  model: string;
  response: string;
  responseTime: number;
  error?: string;
  tokenCount?: number;
}

export interface ComparisonOptions {
  messages: OpenRouterMessage[];
  models: string[];
  temperature?: number;
  maxTokens?: number;
  parallel?: boolean;
}

/**
 * Compare responses from multiple models
 */
export async function compareModels(
  options: ComparisonOptions
): Promise<ModelComparisonResult[]> {
  const {
    messages,
    models,
    temperature = 0.7,
    maxTokens,
    parallel = true
  } = options;

  const client = new OpenRouterSDKClient();

  const runModel = async (model: string): Promise<ModelComparisonResult> => {
    const startTime = Date.now();
    
    try {
      const response = await client.chatCompletion(messages, {
        model,
        temperature,
        maxTokens
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        model,
        response,
        responseTime,
        tokenCount: estimateTokens(response)
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        model,
        response: '',
        responseTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  };

  if (parallel) {
    // Run all models in parallel for fastest comparison
    return await Promise.all(models.map(model => runModel(model)));
  } else {
    // Run models sequentially
    const results: ModelComparisonResult[] = [];
    for (const model of models) {
      results.push(await runModel(model));
    }
    return results;
  }
}

/**
 * Simple token estimation (rough approximation)
 */
function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Format comparison results for display
 */
export function formatComparisonResults(
  results: ModelComparisonResult[],
  includeResponses: boolean = true
): string {
  let output = '\n' + '='.repeat(80) + '\n';
  output += '📊 MODEL COMPARISON RESULTS\n';
  output += '='.repeat(80) + '\n\n';

  // Summary table
  output += '┌─────────────────────────────────────┬──────────┬────────────┬─────────┐\n';
  output += '│ Model                               │ Status   │ Time (ms)  │ Tokens  │\n';
  output += '├─────────────────────────────────────┼──────────┼────────────┼─────────┤\n';
  
  for (const result of results) {
    const modelName = result.model.padEnd(35).substring(0, 35);
    const status = result.error ? '❌ Error' : '✅ OK';
    const time = result.responseTime.toString().padStart(8);
    const tokens = result.tokenCount?.toString().padStart(6) || 'N/A';
    
    output += `│ ${modelName} │ ${status.padEnd(8)} │ ${time}   │ ${tokens}   │\n`;
  }
  
  output += '└─────────────────────────────────────┴──────────┴────────────┴─────────┘\n';

  // Detailed responses
  if (includeResponses) {
    output += '\n' + '─'.repeat(80) + '\n';
    output += 'DETAILED RESPONSES\n';
    output += '─'.repeat(80) + '\n';
    
    for (const result of results) {
      output += `\n🤖 Model: ${result.model}\n`;
      output += `⏱️  Response Time: ${result.responseTime}ms\n`;
      
      if (result.error) {
        output += `❌ Error: ${result.error}\n`;
      } else {
        output += `📝 Response:\n${result.response}\n`;
      }
      
      output += '\n' + '─'.repeat(80) + '\n';
    }
  }

  return output;
}

/**
 * Get recommended models for comparison
 */
export function getRecommendedModels(): {
  category: string;
  models: string[];
  description: string;
}[] {
  return [
    {
      category: 'Top Tier (Best Overall)',
      models: [
        'google/gemini-3-pro',
        'deepseek/deepseek-chat',
        'openai/gpt-5',
        'anthropic/claude-4.5-opus'
      ],
      description: 'Highest quality reasoning and capabilities'
    },
    {
      category: 'Fast & Efficient',
      models: [
        'google/gemini-3-flash',
        'deepseek/deepseek-chat',
        'google/gemini-2.0-flash'
      ],
      description: 'Best for real-time and cost-effective applications'
    },
    {
      category: 'Agentic & Tool Use',
      models: [
        'deepseek/deepseek-chat',
        'google/gemini-3-pro',
        'anthropic/claude-4.5-sonnet'
      ],
      description: 'Best for agent workflows and function calling'
    },
    {
      category: 'Vision-Capable',
      models: [
        'google/gemini-3-flash',
        'google/gemini-3-pro',
        'meta-llama/llama-3.2-90b-vision',
        'xai/grok-2-vision'
      ],
      description: 'Best for multimodal (text + image) tasks'
    },
    {
      category: 'Open Source',
      models: [
        'meta-llama/llama-3.2-90b-vision',
        'meta-llama/llama-3.2-11b-vision'
      ],
      description: 'Best for privacy and self-hosting'
    }
  ];
}

/**
 * Quick comparison of configured models
 */
export async function compareConfiguredModels(
  prompt: string
): Promise<ModelComparisonResult[]> {
  const models = [
    config.openrouter.defaultModel,
    config.openrouter.fastModel,
    config.openrouter.advancedModel,
    config.openrouter.visionModel
  ];

  // Remove duplicates
  const uniqueModels = Array.from(new Set(models));

  return await compareModels({
    messages: [{ role: 'user', content: prompt }],
    models: uniqueModels
  });
}

/**
 * Batch comparison with multiple prompts
 */
export async function batchCompareModels(
  prompts: string[],
  models: string[]
): Promise<Map<string, ModelComparisonResult[]>> {
  const results = new Map<string, ModelComparisonResult[]>();

  for (const prompt of prompts) {
    const comparison = await compareModels({
      messages: [{ role: 'user', content: prompt }],
      models,
      parallel: false // Sequential for batch to avoid rate limits
    });
    results.set(prompt, comparison);
  }

  return results;
}

/**
 * Calculate cost estimate for a model
 * Note: These are approximate costs - check OpenRouter for exact pricing
 */
export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  // Rough cost estimates per 1M tokens (in USD)
  const costPer1M: Record<string, { input: number; output: number }> = {
    'deepseek/deepseek-chat': { input: 0.27, output: 1.10 },
    'google/gemini-3-flash': { input: 0.10, output: 0.30 },
    'google/gemini-3-pro': { input: 1.25, output: 5.00 },
    'google/gemini-2.0-flash': { input: 0.10, output: 0.30 },
    'openai/gpt-4-turbo': { input: 10.00, output: 30.00 },
    'openai/gpt-3.5-turbo': { input: 0.50, output: 1.50 },
    'anthropic/claude-3.5-sonnet': { input: 3.00, output: 15.00 },
    'meta-llama/llama-3.2-90b-vision': { input: 0.20, output: 0.20 }
  };

  const costs = costPer1M[model] || { input: 1.0, output: 3.0 }; // Default estimate
  
  const inputCost = (inputTokens / 1_000_000) * costs.input;
  const outputCost = (outputTokens / 1_000_000) * costs.output;
  
  return inputCost + outputCost;
}

/**
 * Compare cost efficiency across models
 */
export function compareCostEfficiency(
  results: ModelComparisonResult[],
  inputTokens: number
): Array<{
  model: string;
  cost: number;
  costPerToken: number;
  timePerToken: number;
}> {
  return results
    .filter(r => !r.error && r.tokenCount)
    .map(r => {
      const cost = estimateCost(r.model, inputTokens, r.tokenCount || 0);
      return {
        model: r.model,
        cost,
        costPerToken: r.tokenCount ? cost / r.tokenCount : 0,
        timePerToken: r.tokenCount ? r.responseTime / r.tokenCount : 0
      };
    })
    .sort((a, b) => a.cost - b.cost);
}
