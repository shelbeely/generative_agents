/**
 * Vision LLM Utilities
 * 
 * Helper functions for working with vision-capable language models
 * Enables agents to "see" and understand the game world visually
 */

import { readFile } from 'fs/promises';
import { openRouterClient } from '../openrouter.js';
import { config } from '../config.js';

export interface VisionAnalysisResult {
  description: string;
  entities: string[];
  activities: string[];
  emotions?: string[];
  spatial_info?: Record<string, unknown>;
}

/**
 * Analyze a game scene image and extract structured information
 */
export async function analyzeGameScene(
  imagePathOrUrl: string,
  focusAreas?: string[]
): Promise<VisionAnalysisResult> {
  let imageUrl = imagePathOrUrl;

  // If it's a file path, convert to base64 data URL
  if (!imagePathOrUrl.startsWith('http') && !imagePathOrUrl.startsWith('data:')) {
    const buffer = await readFile(imagePathOrUrl);
    imageUrl = `data:image/png;base64,${buffer.toString('base64')}`;
  }

  const focusPrompt = focusAreas
    ? `\nPay special attention to: ${focusAreas.join(', ')}`
    : '';

  const prompt = `Analyze this game scene from a life simulation.
Provide a structured analysis in JSON format:

{
  "description": "brief overall scene description",
  "entities": ["list of visible agents/characters"],
  "activities": ["what each entity is doing"],
  "emotions": ["observable emotional states"],
  "spatial_info": {"key observations about positions and layout"}
}${focusPrompt}`;

  const response = await openRouterClient.visionCompletion(prompt, [imageUrl], {
    model: config.openrouter.visionModel,
    temperature: 0.3, // Lower temperature for more consistent structure
  });

  try {
    // Try to parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as VisionAnalysisResult;
    }
  } catch (e) {
    // Fallback to text-based parsing
    console.warn('Failed to parse JSON from vision response, using text fallback');
  }

  // Fallback: return basic structure
  return {
    description: response,
    entities: [],
    activities: [],
    emotions: [],
  };
}

/**
 * Detect agent positions and activities in a game scene
 */
export async function detectAgentPositions(
  imagePathOrUrl: string,
  agentNames: string[]
): Promise<Map<string, { activity: string; position: string }>> {
  let imageUrl = imagePathOrUrl;

  if (!imagePathOrUrl.startsWith('http') && !imagePathOrUrl.startsWith('data:')) {
    const buffer = await readFile(imagePathOrUrl);
    imageUrl = `data:image/png;base64,${buffer.toString('base64')}`;
  }

  const prompt = `In this game scene, identify the following agents: ${agentNames.join(', ')}

For each agent you can see, describe:
1. What they are doing
2. Where they are located (e.g., "in the kitchen", "near the door", etc.)

Format: Agent Name | Activity | Location`;

  const response = await openRouterClient.visionCompletion(prompt, [imageUrl], {
    model: config.openrouter.visionModel,
  });

  const results = new Map<string, { activity: string; position: string }>();

  // Parse response
  const lines = response.split('\n');
  for (const line of lines) {
    const parts = line.split('|').map((p) => p.trim());
    if (parts.length >= 3) {
      const [name, activity, position] = parts;
      if (name && agentNames.some((n) => name.toLowerCase().includes(n.toLowerCase()))) {
        results.set(name, { activity: activity ?? '', position: position ?? '' });
      }
    }
  }

  return results;
}

/**
 * Generate a visual description for an agent based on their appearance
 */
export async function describeAgentAppearance(
  agentImageUrl: string,
  agentName: string
): Promise<string> {
  const prompt = `Describe the appearance of this character named ${agentName}. 
Include details about their clothing, posture, and any notable features.
Keep it concise (2-3 sentences).`;

  return openRouterClient.visionCompletion(prompt, [agentImageUrl], {
    model: config.openrouter.visionModel,
  });
}

/**
 * Compare two game scenes to detect changes
 */
export async function detectSceneChanges(
  beforeImageUrl: string,
  afterImageUrl: string
): Promise<{
  movements: string[];
  interactions: string[];
  environmentalChanges: string[];
}> {
  const response = await openRouterClient.compareGameScenes(
    beforeImageUrl,
    afterImageUrl,
    {
      model: config.openrouter.visionModel,
      temperature: 0.3,
    }
  );

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as {
        movements: string[];
        interactions: string[];
        environmentalChanges: string[];
      };
    }
  } catch (e) {
    console.warn('Failed to parse scene changes, using fallback');
  }

  return {
    movements: [],
    interactions: [],
    environmentalChanges: [],
  };
}

/**
 * Enhance agent perception with visual context
 * Allows agents to make decisions based on what they "see"
 */
export async function enhancePerceptionWithVision(
  agentName: string,
  sceneImageUrl: string,
  currentContext: string
): Promise<string> {
  const prompt = `You are ${agentName}, a character in a life simulation game.

Current context: ${currentContext}

Looking at this scene, what additional observations can you make?
What do you notice about your surroundings that might influence your next action?

Respond as ${agentName} in first person, briefly (2-3 sentences).`;

  return openRouterClient.visionCompletion(prompt, [sceneImageUrl], {
    model: config.openrouter.visionModel,
  });
}

/**
 * Capture a screenshot of the current game state
 * This would integrate with the canvas rendering system
 */
export async function captureGameScreenshot(
  _canvas: unknown // Type will be proper Canvas when rendering is implemented
): Promise<string> {
  // Placeholder - will be implemented when canvas rendering is added
  // Would use canvas.toDataURL() or similar
  throw new Error('Screenshot capture not yet implemented - requires canvas rendering');
}

/**
 * Check if a model supports vision
 * Updated for 2026 models
 */
export function isVisionModel(modelId: string): boolean {
  const visionModels = [
    // Google Gemini (2026+)
    'gemini-3',
    'gemini-2',
    'gemini-1.5',
    'gemini-pro-vision',
    // OpenAI (2024+)
    'gpt-4-vision',
    'gpt-4-turbo',
    'gpt-4o',
    'gpt-5',
    // Anthropic Claude (2024+)
    'claude-3',
    'claude-4',
    // Meta Llama (2024+)
    'llama-3.2-vision',
    'llama-3.2-11b-vision',
    'llama-3.2-90b-vision',
    // xAI Grok (2024+)
    'grok-2-vision',
    // Alibaba Qwen (2024+)
    'qwen-vl',
    // Others
    'glm-4',
    'phi-3-vision',
    'pixtral',
  ];

  const lowerId = modelId.toLowerCase();
  return visionModels.some((vm) => lowerId.includes(vm));
}

/**
 * Get recommended vision model for a task (2026 updated)
 */
export function getRecommendedVisionModel(task: 'fast' | 'detailed' | 'balanced'): string {
  switch (task) {
    case 'fast':
      return 'google/gemini-3-flash'; // Fast, cost-effective, excellent quality
    case 'detailed':
      return 'google/gemini-3-pro'; // Most detailed, 1M context, multimodal
    case 'balanced':
    default:
      return 'google/gemini-3-flash'; // Best overall balance in 2026
  }
}

/**
 * Vision-enhanced memory storage
 * Store visual observations along with textual memories
 */
export interface VisualMemory {
  timestamp: Date;
  imageUrl: string;
  description: string;
  analysis: VisionAnalysisResult;
  agentPerspective: string; // What the agent "thought" about what they saw
}

export class VisualMemoryStore {
  private memories: VisualMemory[] = [];

  async addVisualMemory(
    imageUrl: string,
    agentName: string,
    context: string
  ): Promise<VisualMemory> {
    const analysis = await analyzeGameScene(imageUrl);
    const agentPerspective = await enhancePerceptionWithVision(agentName, imageUrl, context);

    const memory: VisualMemory = {
      timestamp: new Date(),
      imageUrl,
      description: analysis.description,
      analysis,
      agentPerspective,
    };

    this.memories.push(memory);
    return memory;
  }

  getRecentMemories(count: number = 10): VisualMemory[] {
    return this.memories.slice(-count);
  }

  getMemoriesByTimeRange(start: Date, end: Date): VisualMemory[] {
    return this.memories.filter((m) => m.timestamp >= start && m.timestamp <= end);
  }

  clearOldMemories(olderThan: Date): void {
    this.memories = this.memories.filter((m) => m.timestamp >= olderThan);
  }
}
