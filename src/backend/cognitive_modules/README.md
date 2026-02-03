# Cognitive Modules

This directory contains the core cognitive architecture for generative agents, ported from the original Python implementation.

## Overview

The cognitive modules implement the agent's mental processes:

1. **Perceive** - Sense events and update spatial memory
2. **Retrieve** - Find relevant memories using recency, importance, and relevance
3. **Execute** - Convert plans to concrete actions and movements
4. **Plan** - Generate plans at multiple time scales (daily, hourly, minute-by-minute)
5. **Reflect** - Generate higher-level insights from memories
6. **Converse** - Handle multi-agent dialogue and conversations

## Module Details

### 1. Perceive (`perceive.ts`)

**Purpose**: Agent perception system that processes sensory information from the environment.

**Key Functions**:
- `perceive()` - Main perception function
  - Perceives nearby spatial locations (world/sector/arena/objects)
  - Perceives events within vision radius
  - Filters by attention bandwidth
  - Stores new events in memory
- `generatePoignancyScore()` - Calculates emotional importance of events

**Process Flow**:
1. Get tiles within vision radius
2. Update spatial memory with visible locations
3. Collect events from nearby tiles in same arena
4. Sort by distance and take top N (attention bandwidth)
5. Check if events are new (not in recent memory)
6. Calculate poignancy and create memory nodes

**Status**: ✅ Core logic complete. TODO: GPT-based poignancy scoring.

---

### 2. Retrieve (`retrieve.ts`)

**Purpose**: Memory retrieval system that finds relevant memories for decision-making.

**Key Functions**:
- `retrieve()` - Main retrieval function using combined scoring
- `cosineSimilarity()` - Calculate vector similarity
- `extractRecency()` - Score based on how recent memories are
- `extractImportance()` - Score based on poignancy values
- `extractRelevance()` - Score based on semantic similarity to query
- `simpleRetrieve()` - Simple keyword-based retrieval

**Retrieval Algorithm**:
```
score = w_recency * recency * 0.5 + 
        w_relevance * relevance * 2 + 
        w_importance * importance * 3
```

Where:
- Recency uses exponential decay (0.995^n)
- Importance is the poignancy score (1-10)
- Relevance is cosine similarity of embeddings

**Status**: ✅ Complete. TODO: Actual embeddings (currently using mock vectors).

---

### 3. Execute (`execute.ts`)

**Purpose**: Action execution system that converts plans into movements.

**Key Functions**:
- `execute()` - Main execution function
  - Parses action addresses (world:sector:arena:object)
  - Finds target tiles for actions
  - Uses pathfinding to generate movement paths
  - Handles special cases (persona interaction, waiting, random locations)
- `parseActionAddress()` - Parse location strings
- `isValidAddress()` - Validate addresses

**Special Cases**:
- `<persona>PersonaName` - Move near target persona
- `<waiting> x y` - Wait at specific coordinates
- `<random>` - Random location within area

**Status**: ✅ Complete. Integrates with pathfinding system.

---

### 4. Plan (`plan.ts`)

**Purpose**: Multi-scale planning system for agent activities.

**Key Functions**:
- `generateWakeUpHour()` - Determine wake time
- `generateFirstDailyPlan()` - Create daily schedule
- `generateHourlySchedule()` - Decompose day into hourly tasks
- `taskDecomposition()` - Break tasks into minute-level actions
- `planReaction()` - Plan reactions to perceived events
- `shouldInitiateChat()` - Decide whether to start conversation
- `createConversationStarter()` - Generate conversation opener

**Planning Hierarchy**:
```
Daily Plan (24 hours)
  ↓
Hourly Schedule (60 minutes each)
  ↓
Task Decomposition (5-15 minute actions)
  ↓
Action Execution (step-by-step)
```

**Status**: ⚠️ Simplified. Currently returns default plans. TODO: GPT-based planning.

---

### 5. Reflect (`reflect.ts`)

**Purpose**: Higher-order thinking that generates insights from memories.

**Key Functions**:
- `shouldReflect()` - Check if reflection threshold met
- `generateReflectionQuestions()` - Create questions for reflection
- `generateInsights()` - Synthesize new thoughts from memories
- `reflect()` - Main reflection process

**Reflection Process**:
1. Accumulate importance from events
2. When threshold reached, generate reflection questions
3. Retrieve relevant memories for each question
4. Synthesize insights using GPT
5. Store insights as "thought" nodes

**Status**: ⚠️ Simplified. Currently creates basic reflections. TODO: GPT-based insight generation.

---

### 6. Converse (`converse.ts`)

**Purpose**: Multi-agent conversation system.

**Key Functions**:
- `initConversation()` - Start conversation between personas
- `generateUtterance()` - Generate what persona says
- `shouldContinueConversation()` - Decide when to end conversation
- `addMessage()` - Add message to conversation history
- `summarizeConversation()` - Create conversation summary
- `storeConversation()` - Save conversation to memory
- `conductConversation()` - Orchestrate full conversation

**Conversation Flow**:
```
Init → Generate Utterance → Add Message → Check Continue
  ↑                                            ↓
  └──────────── Loop (3-5 exchanges) ─────────┘
                        ↓
              Summarize & Store in Memory
```

**Status**: ⚠️ Simplified. Uses simple response patterns. TODO: GPT-based dialogue.

---

## Implementation Status

### ✅ Complete
- **Perceive**: Core perception logic, spatial memory updates, event filtering
- **Retrieve**: Multi-factor retrieval with recency/importance/relevance
- **Execute**: Action execution with pathfinding integration

### ⚠️ Simplified (Functional but needs GPT integration)
- **Plan**: Returns default/simple plans
- **Reflect**: Basic reflection without deep insights
- **Converse**: Pattern-based dialogue

### 🔧 TODO
1. **Embedding Generation**: Replace mock embeddings with actual vectors
   - Options: OpenAI embeddings API, local Sentence Transformers, etc.
2. **GPT Integration**: Implement GPT calls for:
   - Poignancy scoring (perceive)
   - Daily planning (plan)
   - Task decomposition (plan)
   - Reflection questions and insights (reflect)
   - Conversation generation (converse)
3. **Memory Consolidation**: Add logic to merge/prune old memories
4. **Relationship Tracking**: Track persona relationships for social interactions

---

## Usage Example

```typescript
import {
  perceive,
  retrieve,
  execute,
  generateFirstDailyPlan,
  reflect,
  conductConversation
} from './cognitive_modules/index.js';

// Perceive environment
const perceivedEvents = await perceive(
  scratch,
  spatialMemory,
  associativeMemory,
  maze,
  personaName,
  embeddings
);

// Retrieve relevant memories
const retrieved = await retrieve(
  scratch,
  associativeMemory,
  ['What should I do today?'],
  embeddings,
  30
);

// Execute action
const nextTile = execute(
  scratch,
  maze,
  personas,
  'world:sector:arena:object'
);

// Reflect periodically
if (shouldReflect(scratch, associativeMemory)) {
  const insights = await reflect(scratch, associativeMemory, embeddings);
}

// Converse with another persona
const conversation = await conductConversation(
  scratch1,
  aMem1,
  scratch2,
  aMem2,
  embeddings
);
```

---

## Architecture Notes

### Memory Types
- **Spatial Memory**: Hierarchical tree of world locations (S_mem)
- **Associative Memory**: Long-term episodic memory with keyword indexing (A_mem)
- **Scratch Memory**: Short-term working memory and current state

### Event Types
- **Event**: Observed actions in the world
- **Thought**: Generated insights and reflections
- **Chat**: Conversation exchanges

### Coordinate Systems
- Tiles: `[x, y]` coordinates in the maze grid
- Addresses: `"world:sector:arena:game_object"` hierarchical locations
- Paths: Arrays of tile coordinates forming a route

---

## Design Principles

1. **Modularity**: Each cognitive function is isolated and composable
2. **Async-First**: All operations use async/await for future API integration
3. **Type Safety**: Full TypeScript types for compile-time validation
4. **Testability**: Pure functions where possible, with clear inputs/outputs
5. **Extensibility**: Easy to add new cognitive modules or modify existing ones

---

## References

- Original Paper: "Generative Agents: Interactive Simulacra of Human Behavior"
- Python Implementation: `reverie/backend_server/persona/cognitive_modules/`
- Related Modules: `memory/`, `maze.ts`, `pathfinder.ts`
