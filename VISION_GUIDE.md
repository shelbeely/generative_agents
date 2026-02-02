# Vision-LLM Integration Guide

## 🎨 Overview

This project now includes **vision-capable LLM support**, allowing agents to "see" and understand the game world visually. This enhancement enables more sophisticated agent behaviors based on visual perception.

## 🌟 Supported Vision Models

### Via OpenRouter

| Provider | Model | Strengths | Use Case |
|----------|-------|-----------|----------|
| **OpenAI** | `gpt-4-vision-preview` | Balanced performance | General purpose |
| **OpenAI** | `gpt-4o` | Latest, multimodal | Best quality |
| **Anthropic** | `claude-3-opus` | Detailed analysis | Complex scenes |
| **Anthropic** | `claude-3-sonnet` | Fast + capable | Real-time analysis |
| **Google** | `gemini-pro-vision` | Cost-effective | High-volume tasks |
| **Google** | `gemini-1.5-pro` | Long context | Scene history |

## 🚀 Quick Start

### 1. Configure Vision Model

Edit your `.env` file:

```bash
# Choose your preferred vision model
VISION_MODEL=openai/gpt-4-vision-preview

# Or use Claude 3 Opus for detailed analysis
VISION_MODEL=anthropic/claude-3-opus

# Or use Gemini for cost-effectiveness
VISION_MODEL=google/gemini-pro-vision
```

### 2. Basic Usage

```typescript
import { openRouterClient } from './openrouter.js';
import { analyzeGameScene } from './utils/visionHelpers.js';

// Analyze a game scene
const analysis = await analyzeGameScene('./path/to/scene.png');
console.log(analysis.description);
console.log('Visible agents:', analysis.entities);
console.log('Activities:', analysis.activities);

// Or use the client directly
const response = await openRouterClient.visionCompletion(
  'What do you see in this game scene?',
  ['https://example.com/game-screenshot.png']
);
```

## 📚 API Reference

### OpenRouter Client - Vision Methods

#### `visionCompletion()`

Make a vision-enabled completion request with images.

```typescript
async visionCompletion(
  prompt: string,
  images: string[],
  options?: {
    model?: string;
    detail?: 'auto' | 'low' | 'high';
    temperature?: number;
    max_tokens?: number;
  }
): Promise<string>
```

**Parameters:**
- `prompt` - Text prompt/question about the image(s)
- `images` - Array of image URLs or base64 data URLs
- `options.detail` - Image detail level (affects cost and speed)
  - `low`: Faster, cheaper, less detail (512x512)
  - `high`: Slower, more expensive, full detail
  - `auto`: Automatic selection (default)

**Example:**
```typescript
const response = await openRouterClient.visionCompletion(
  'Describe what you see in this game scene',
  ['https://example.com/scene.png'],
  { 
    model: 'openai/gpt-4-vision-preview',
    detail: 'high' 
  }
);
```

#### `analyzeGameScene()`

Analyze a specific game scene screenshot.

```typescript
async analyzeGameScene(
  imageUrl: string,
  query: string,
  options?: Partial<OpenRouterCompletionRequest>
): Promise<string>
```

**Example:**
```typescript
const analysis = await openRouterClient.analyzeGameScene(
  'data:image/png;base64,iVBORw0KG...',
  'Where is Isabella and what is she doing?'
);
```

#### `compareGameScenes()`

Compare two scenes to detect changes.

```typescript
async compareGameScenes(
  beforeImageUrl: string,
  afterImageUrl: string,
  options?: Partial<OpenRouterCompletionRequest>
): Promise<string>
```

**Example:**
```typescript
const changes = await openRouterClient.compareGameScenes(
  'https://example.com/scene-before.png',
  'https://example.com/scene-after.png'
);
console.log(changes); // "Isabella moved from kitchen to living room..."
```

### Vision Helper Functions

#### `analyzeGameScene()`

Extract structured information from a game scene.

```typescript
interface VisionAnalysisResult {
  description: string;
  entities: string[];
  activities: string[];
  emotions?: string[];
  spatial_info?: Record<string, unknown>;
}

async function analyzeGameScene(
  imagePathOrUrl: string,
  focusAreas?: string[]
): Promise<VisionAnalysisResult>
```

**Example:**
```typescript
const analysis = await analyzeGameScene(
  './screenshots/scene-001.png',
  ['Isabella', 'kitchen']
);

console.log(analysis.description);
// "Isabella is cooking in the kitchen while Maria reads nearby"

console.log(analysis.entities);
// ["Isabella Rodriguez", "Maria Lopez"]

console.log(analysis.activities);
// ["cooking at the stove", "reading a book"]
```

#### `detectAgentPositions()`

Detect where specific agents are and what they're doing.

```typescript
async function detectAgentPositions(
  imagePathOrUrl: string,
  agentNames: string[]
): Promise<Map<string, { activity: string; position: string }>>
```

**Example:**
```typescript
const positions = await detectAgentPositions(
  'screenshot.png',
  ['Isabella Rodriguez', 'Maria Lopez', 'Klaus Mueller']
);

for (const [name, info] of positions) {
  console.log(`${name}: ${info.activity} at ${info.position}`);
}
// Isabella Rodriguez: cooking at kitchen
// Maria Lopez: reading at living room sofa
```

#### `detectSceneChanges()`

Compare two scenes to understand what changed.

```typescript
async function detectSceneChanges(
  beforeImageUrl: string,
  afterImageUrl: string
): Promise<{
  movements: string[];
  interactions: string[];
  environmentalChanges: string[];
}>
```

**Example:**
```typescript
const changes = await detectSceneChanges(
  'scene-t0.png',
  'scene-t1.png'
);

console.log('Movements:', changes.movements);
// ["Isabella moved from kitchen to dining room"]

console.log('Interactions:', changes.interactions);
// ["Isabella and Maria started conversing"]

console.log('Environmental:', changes.environmentalChanges);
// ["Kitchen light turned off"]
```

#### `enhancePerceptionWithVision()`

Let an agent "think" about what they see.

```typescript
async function enhancePerceptionWithVision(
  agentName: string,
  sceneImageUrl: string,
  currentContext: string
): Promise<string>
```

**Example:**
```typescript
const perception = await enhancePerceptionWithVision(
  'Isabella Rodriguez',
  'scene.png',
  'Isabella is planning to cook dinner'
);

console.log(perception);
// "I see Maria is already in the kitchen, and the ingredients I need 
// are on the counter. I should ask her if she wants to help."
```

### Visual Memory Store

Store and retrieve visual observations:

```typescript
import { VisualMemoryStore } from './utils/visionHelpers.js';

const visualMemory = new VisualMemoryStore();

// Add a visual memory
const memory = await visualMemory.addVisualMemory(
  'screenshot.png',
  'Isabella Rodriguez',
  'Looking for someone to talk to'
);

// Get recent visual memories
const recent = visualMemory.getRecentMemories(5);

// Get memories from a time range
const memories = visualMemory.getMemoriesByTimeRange(
  new Date('2024-01-01'),
  new Date('2024-01-02')
);
```

## 🎯 Use Cases

### 1. Enhanced Perception

Allow agents to perceive their environment visually:

```typescript
// Agent sees the game world
const analysis = await analyzeGameScene(currentSceneUrl);

// Agent makes decisions based on what they see
if (analysis.entities.includes('Maria Lopez')) {
  // Found Maria, approach her
  agent.setGoal('approach', 'Maria Lopez');
}
```

### 2. Situational Awareness

Agents understand complex social situations:

```typescript
const scene = await openRouterClient.analyzeGameScene(
  sceneUrl,
  'Is this a good time for Isabella to interrupt? What is the mood?'
);

// "Maria and Klaus are having an intense discussion. 
// The mood seems serious. This might not be a good time to interrupt."
```

### 3. Object Recognition

Find specific objects or locations:

```typescript
const response = await openRouterClient.visionCompletion(
  'Where is the coffee maker in this scene? Is it currently in use?',
  [kitchenSceneUrl]
);
```

### 4. Emotion Detection

Understand agent emotional states:

```typescript
const analysis = await analyzeGameScene(sceneUrl, ['emotions']);

if (analysis.emotions?.includes('sad')) {
  // Agent notices someone looks sad, might approach to comfort
}
```

### 5. Historical Scene Comparison

Track changes over time:

```typescript
const changes = await detectSceneChanges(
  scene5MinutesAgo,
  currentScene
);

// Understand what happened in the last 5 minutes
console.log('What happened:', changes.movements);
```

## 💡 Integration with Cognitive Modules

### Perceive Module

Enhance perception with visual input:

```typescript
class PerceiveModule {
  async perceive(agent: Agent, maze: Maze) {
    // Traditional tile-based perception
    const nearbyEvents = this.detectNearbyEvents(agent, maze);
    
    // NEW: Vision-enhanced perception
    const sceneUrl = await captureAgentView(agent, maze);
    const visualContext = await enhancePerceptionWithVision(
      agent.name,
      sceneUrl,
      agent.currentContext
    );
    
    // Combine both
    return {
      events: nearbyEvents,
      visualObservation: visualContext
    };
  }
}
```

### Retrieve Module

Store visual memories:

```typescript
class RetrieveModule {
  private visualMemory = new VisualMemoryStore();
  
  async remember(agent: Agent, currentScene: string) {
    // Add visual memory
    await this.visualMemory.addVisualMemory(
      currentScene,
      agent.name,
      agent.currentContext
    );
    
    // Retrieve related memories
    const recentVisuals = this.visualMemory.getRecentMemories(3);
    return recentVisuals;
  }
}
```

## 🎛️ Configuration & Tuning

### Detail Levels

Control cost and quality:

```typescript
// Low detail (512x512) - Fast and cheap
await openRouterClient.visionCompletion(prompt, [image], { detail: 'low' });

// High detail (2048x2048) - Slow and expensive but detailed
await openRouterClient.visionCompletion(prompt, [image], { detail: 'high' });

// Auto - Let the model decide (recommended)
await openRouterClient.visionCompletion(prompt, [image], { detail: 'auto' });
```

### Model Selection

Choose based on your needs:

```typescript
// Fast analysis (real-time)
VISION_MODEL=google/gemini-pro-vision

// Detailed analysis (important decisions)
VISION_MODEL=anthropic/claude-3-opus

// Balanced (most cases)
VISION_MODEL=openai/gpt-4-vision-preview
```

## 💰 Cost Considerations

| Model | Input (per 1K tokens) | Output (per 1K tokens) | Image (high detail) |
|-------|----------------------|------------------------|---------------------|
| GPT-4 Vision | $0.01 | $0.03 | ~$0.01 per image |
| Claude 3 Opus | $0.015 | $0.075 | Included in tokens |
| Gemini Pro Vision | $0.00025 | $0.0005 | Very low cost |

**Optimization tips:**
- Use `detail: 'low'` for non-critical scenes
- Cache scene analyses when possible
- Use faster models for frequent checks
- Use advanced models for important decisions

## 🐛 Troubleshooting

### "Model does not support vision"

**Solution:** Ensure you're using a vision-capable model:

```typescript
import { isVisionModel } from './utils/visionHelpers.js';

if (isVisionModel(config.openrouter.visionModel)) {
  // Proceed with vision request
} else {
  // Fallback to text-only
}
```

### "Image too large"

**Solution:** Compress images before sending:

```typescript
// Resize image to max 2048x2048
// Use detail: 'low' for smaller images
```

### "Rate limit exceeded"

**Solution:** Implement rate limiting:

```typescript
// Add delay between vision requests
await sleep(1000);

// Or use a rate limiter library
```

## 📈 Future Enhancements

- [ ] Real-time scene streaming
- [ ] Agent "eye tracking" (what they focus on)
- [ ] Visual memory retrieval based on similarity
- [ ] Automatic screenshot capture during simulation
- [ ] Multi-agent visual attention (what everyone sees)
- [ ] Scene generation (text → image for planning)

## 📚 Examples

See `examples/vision-demo.ts` for complete working examples.

---

**Note:** Vision features require OpenRouter API key and a vision-capable model. Costs apply per image analyzed.
