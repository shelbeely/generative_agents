/**
 * Persona Class - The main Generative Agent
 * 
 * This class represents a generative agent (persona) in the simulation.
 * It integrates all cognitive modules and memory systems to create
 * an autonomous agent that can perceive, plan, act, and converse.
 * 
 * Ported from persona.py
 * 
 * Architecture:
 * - Memory: Spatial, Associative, and Scratch (working memory)
 * - Cognitive Modules: Perceive, Retrieve, Plan, Execute, Reflect, Converse
 * - Main Loop: move() orchestrates the full cognitive cycle
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Memory structures
import { 
  AssociativeMemory, 
  SpatialMemory, 
  ConceptNodeImpl 
} from './memory/memoryStructures.js';
import { Scratch } from './memory/scratch.js';

// Cognitive modules
import { perceive } from './cognitive_modules/perceive.js';
import { retrieve } from './cognitive_modules/retrieve.js';
import { execute } from './cognitive_modules/execute.js';
import { reflect, shouldReflect } from './cognitive_modules/reflect.js';
import { 
  initConversation, 
  generateUtterance, 
  Conversation 
} from './cognitive_modules/converse.js';
import { 
  generateWakeUpHour,
  generateFirstDailyPlan,
  generateHourlySchedule
} from './cognitive_modules/plan.js';

// Maze
import { Maze } from './maze.js';

/**
 * Execution result from the move cycle
 */
export interface ExecutionResult {
  nextTile: [number, number];
  pronunciatio: string;
  description: string;
}

/**
 * Main Persona class
 * Represents a single generative agent with memory and cognitive capabilities
 */
export class Persona {
  // Identity
  name: string;

  // Memory systems
  sMem: SpatialMemory;
  aMem: AssociativeMemory;
  scratch: Scratch;

  // Folder path where memory is saved
  private memoryFolder: string | null = null;

  /**
   * Create a new Persona
   * 
   * @param name - Full name of the persona (unique identifier)
   * @param folderMemSaved - Optional folder containing saved memory state
   */
  constructor(name: string, folderMemSaved?: string) {
    this.name = name;
    
    // Initialize memory systems
    this.sMem = new SpatialMemory();
    this.aMem = new AssociativeMemory();
    this.scratch = new Scratch({ name });

    // If folder provided, we'll load from it
    if (folderMemSaved) {
      this.memoryFolder = folderMemSaved;
    }
  }

  /**
   * Load persona memory from saved files
   * Must be called after construction if loading from folder
   */
  async load(): Promise<void> {
    if (!this.memoryFolder) {
      throw new Error('No memory folder specified for loading');
    }

    const memoryPath = join(this.memoryFolder, 'bootstrap_memory');

    try {
      // Load spatial memory
      const spatialPath = join(memoryPath, 'spatial_memory.json');
      if (existsSync(spatialPath)) {
        const spatialData = await readFile(spatialPath, 'utf-8');
        const spatialJSON = JSON.parse(spatialData);
        this.sMem = SpatialMemory.fromJSON(spatialJSON);
      }

      // Load associative memory
      const assocPath = join(memoryPath, 'associative_memory.json');
      if (existsSync(assocPath)) {
        const assocData = await readFile(assocPath, 'utf-8');
        const assocJSON = JSON.parse(assocData);
        this.aMem = AssociativeMemory.fromJSON(assocJSON);
      }

      // Load scratch
      const scratchPath = join(memoryPath, 'scratch.json');
      if (existsSync(scratchPath)) {
        const scratchData = await readFile(scratchPath, 'utf-8');
        const scratchJSON = JSON.parse(scratchData);
        this.scratch = Scratch.fromJSON(scratchJSON);
      }
    } catch (error) {
      console.error(`Error loading persona memory from ${this.memoryFolder}:`, error);
      throw error;
    }
  }

  /**
   * Save persona memory to folder
   * 
   * @param saveFolder - Folder path where memory will be saved
   */
  async save(saveFolder: string): Promise<void> {
    try {
      // Create directory if it doesn't exist
      if (!existsSync(saveFolder)) {
        await mkdir(saveFolder, { recursive: true });
      }

      // Save spatial memory
      const spatialPath = join(saveFolder, 'spatial_memory.json');
      const spatialJSON = JSON.stringify(this.sMem.toJSON(), null, 2);
      await writeFile(spatialPath, spatialJSON, 'utf-8');

      // Save associative memory
      const assocPath = join(saveFolder, 'associative_memory.json');
      const assocJSON = JSON.stringify(this.aMem.toJSON(), null, 2);
      await writeFile(assocPath, assocJSON, 'utf-8');

      // Save scratch
      const scratchPath = join(saveFolder, 'scratch.json');
      const scratchJSON = JSON.stringify(this.scratch.toJSON(), null, 2);
      await writeFile(scratchPath, scratchJSON, 'utf-8');
    } catch (error) {
      console.error(`Error saving persona memory to ${saveFolder}:`, error);
      throw error;
    }
  }

  /**
   * Perceive events and surroundings in the world
   * 
   * This function takes the current maze and returns events that are
   * happening around the persona, guided by attention bandwidth and retention.
   * 
   * @param maze - Current Maze instance of the world
   * @param embeddings - Cache of embeddings for event descriptions
   * @returns List of perceived ConceptNodes (events)
   */
  async perceive(
    maze: Maze,
    embeddings: Map<string, number[]>
  ): Promise<ConceptNodeImpl[]> {
    return perceive(
      this.scratch,
      this.sMem,
      this.aMem,
      maze,
      this.name,
      embeddings
    );
  }

  /**
   * Retrieve relevant memories based on perceived events
   * 
   * Takes events that are perceived by the persona and returns a set of
   * related events and thoughts for each focal point.
   * 
   * @param perceived - List of perceived ConceptNodes
   * @param embeddings - Cache of embeddings
   * @returns Map of focal points to retrieved nodes
   */
  async retrieve(
    perceived: ConceptNodeImpl[],
    embeddings: Map<string, number[]>
  ): Promise<Map<string, ConceptNodeImpl[]>> {
    // Extract focal points from perceived events (their descriptions)
    const focalPoints = perceived.map((node) => node.description);
    
    return retrieve(
      this.scratch,
      this.aMem,
      focalPoints,
      embeddings,
      30 // default nCount
    );
  }

  /**
   * Plan actions based on retrieved memories and current state
   * 
   * Main cognitive function that takes retrieved memory and perception,
   * as well as the maze and persona states to conduct both long-term
   * and short-term planning.
   * 
   * @param maze - Current Maze instance
   * @param personas - Map of all personas in the world
   * @param newDay - 'First day', 'New day', or false
   * @param retrieved - Retrieved context from memories
   * @returns Target action address (e.g., 'double studio:bedroom:bed')
   */
  async plan(
    _maze: Maze,
    _personas: Map<string, Persona>,
    newDay: 'First day' | 'New day' | false,
    _retrieved: Map<string, ConceptNodeImpl[]>
  ): Promise<string> {
    // Handle new day planning
    if (newDay) {
      const wakeUpHour = await generateWakeUpHour(this.scratch);
      const dailyPlan = await generateFirstDailyPlan(
        this.scratch,
        this.aMem,
        wakeUpHour
      );
      this.scratch.dailyPlan = dailyPlan;
      
      // Generate hourly schedule
      await generateHourlySchedule(this.scratch, dailyPlan);
    }

    // Check if current action is finished (simplified version)
    // In full implementation, would check if actEvent duration expired
    
    // For now, return current address or a default action
    if (this.scratch.currAddress) {
      return this.scratch.currAddress;
    }
    
    // Default idle action
    return 'world:sector:arena';
  }

  /**
   * Execute planned action
   * 
   * Takes the agent's current plan and outputs a concrete execution
   * (what object to use, and what tile to travel to).
   * 
   * @param maze - Current Maze instance
   * @param personas - Map of all personas in the world
   * @param planAddress - Target action address from plan
   * @returns Execution result with next tile, emoji, and description
   */
  async execute(
    maze: Maze,
    personas: Map<string, Persona>,
    planAddress: string
  ): Promise<ExecutionResult> {
    // Convert personas Map to the format execute expects
    const personasMap = new Map<string, { scratch: Scratch; name: string }>();
    for (const [name, persona] of personas.entries()) {
      personasMap.set(name, { scratch: persona.scratch, name: persona.name });
    }

    const nextTile = execute(this.scratch, maze, personasMap, planAddress);

    // Create execution result
    return {
      nextTile,
      pronunciatio: '💭', // Default emoji, can be enhanced
      description: this.scratch.actDescription,
    };
  }

  /**
   * Reflect on recent memories
   * 
   * Reviews the persona's memory and creates new thoughts based on it.
   * Reflection is triggered when accumulated importance exceeds threshold.
   * 
   * @param embeddings - Cache of embeddings
   */
  async reflect(embeddings: Map<string, number[]>): Promise<void> {
    if (shouldReflect(this.scratch, this.aMem)) {
      await reflect(this.scratch, this.aMem, embeddings);
      this.scratch.lastReflection = new Date();
    }
  }

  /**
   * Main move cycle - orchestrates the full cognitive sequence
   * 
   * This is the main cognitive function where our main sequence is called:
   * 1. Update current state (tile, time)
   * 2. Check if new day (triggers long-term planning)
   * 3. Perceive environment
   * 4. Retrieve relevant memories
   * 5. Plan actions
   * 6. Reflect if needed
   * 7. Execute plan
   * 
   * @param maze - Current Maze instance
   * @param personas - Map of all personas in the world
   * @param currTile - Current tile location [row, col]
   * @param currTime - Current simulation time
   * @param embeddings - Cache of embeddings for event descriptions
   * @returns Execution result with next tile, emoji, and description
   */
  async move(
    maze: Maze,
    personas: Map<string, Persona>,
    currTile: [number, number],
    currTime: Date,
    embeddings: Map<string, number[]>
  ): Promise<ExecutionResult> {
    // Update persona's scratch memory with current tile
    this.scratch.currTile = currTile;

    // Determine if it's a new day
    let newDay: 'First day' | 'New day' | false = false;
    if (!this.scratch.currTime) {
      newDay = 'First day';
    } else {
      const oldDate = this.scratch.currTime.toDateString();
      const newDate = currTime.toDateString();
      if (oldDate !== newDate) {
        newDay = 'New day';
      }
    }
    this.scratch.currTime = currTime;

    // Main cognitive sequence
    const perceived = await this.perceive(maze, embeddings);
    const retrieved = await this.retrieve(perceived, embeddings);
    const planAddress = await this.plan(maze, personas, newDay, retrieved);
    await this.reflect(embeddings);

    // Execute the plan and return result
    return this.execute(maze, personas, planAddress);
  }

  /**
   * Start a conversation with another persona
   * 
   * @param otherPersona - The other persona to converse with
   * @param topic - Optional conversation topic
   * @returns Conversation object
   */
  startConversation(
    otherPersona: Persona,
    topic?: string
  ): Conversation {
    return initConversation(
      this.name,
      otherPersona.name,
      this.scratch.currTime,
      topic
    );
  }

  /**
   * Generate utterance in an ongoing conversation
   * 
   * @param conversation - Current conversation state
   * @param embeddings - Embedding cache
   * @returns What the persona says
   */
  async converse(
    conversation: Conversation,
    embeddings: Map<string, number[]>
  ): Promise<string> {
    return generateUtterance(
      this.scratch,
      this.aMem,
      conversation,
      embeddings
    );
  }

  /**
   * Get persona's current description
   */
  getDescription(): string {
    return this.scratch.getStrISS();
  }

  /**
   * Get persona's first name
   */
  getFirstName(): string {
    return this.scratch.getStrFirstname();
  }

  /**
   * Get persona's current address
   */
  getCurrentAddress(): string {
    return this.scratch.getCurrAddress();
  }
}
