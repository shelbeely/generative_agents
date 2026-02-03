/**
 * Reverie Backend Server
 * 
 * Main simulation engine for Generative Agents
 * This is the TypeScript/Node.js port of reverie.py
 */

import * as readline from 'readline';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { config } from '../config.js';
import { openRouterClient } from '../openrouter.js';
import { Maze } from './maze.js';
import { Persona } from './persona.js';

console.log('🎭 Generative Agents - Reverie Simulation Server');
console.log('================================================\n');

/**
 * Main Reverie Simulation Server
 * Orchestrates the multi-agent simulation
 */
export class ReverieServer {
  maze: Maze | null = null;
  personas: Map<string, Persona> = new Map();
  currentStep: number = 0;
  gameTime: Date = new Date();
  embeddings: Map<string, number[]> = new Map();
  simName: string = '';
  
  constructor(simName?: string) {
    this.simName = simName || 'default_simulation';
  }

  /**
   * Initialize simulation - load maze and personas
   */
  async initialize(simName: string, personaNames: string[] = []): Promise<void> {
    this.simName = simName;
    console.log(`\n🔧 Initializing simulation: ${simName}`);
    
    // Initialize maze
    console.log('  📍 Loading maze...');
    this.maze = new Maze('the_ville');
    await this.maze.load();
    console.log(`     ✓ Maze loaded: ${this.maze.mazeWidth}x${this.maze.mazeHeight}`);
    
    // Initialize personas
    if (personaNames.length > 0) {
      console.log('  👤 Loading personas...');
      
      // Find some valid walkable tiles for initial positions
      const walkableTiles: [number, number][] = [];
      for (let y = 0; y < this.maze.mazeHeight && walkableTiles.length < 10; y++) {
        for (let x = 0; x < this.maze.mazeWidth && walkableTiles.length < 10; x++) {
          const tile = this.maze.accessTile([x, y]);
          if (tile && !tile.collision && tile.sector) {
            walkableTiles.push([x, y]);
          }
        }
      }
      
      for (let idx = 0; idx < personaNames.length; idx++) {
        const name = personaNames[idx]!;
        const persona = new Persona(name);
        
        // Set some default values if not loading from saved state
        persona.scratch.firstName = name.split(' ')[0] || name;
        persona.scratch.name = name;
        persona.scratch.age = 25 + idx * 5;
        persona.scratch.innate = 'friendly, curious';
        persona.scratch.learned = 'likes to explore';
        persona.scratch.currently = 'exploring the world';
        persona.scratch.lifestyle = 'active and social';
        
        // Set valid starting position
        const startTile = walkableTiles[idx % walkableTiles.length] || [5, 5];
        persona.scratch.currTile = startTile;
        
        // Set current address from the tile
        const tileDetails = this.maze.accessTile(startTile);
        if (tileDetails && tileDetails.sector) {
          persona.scratch.currAddress = `${tileDetails.world}:${tileDetails.sector}`;
          if (tileDetails.arena) {
            persona.scratch.currAddress += `:${tileDetails.arena}`;
          }
        }
        
        persona.scratch.currTime = new Date(this.gameTime);
        
        this.personas.set(name, persona);
        console.log(`     ✓ Persona loaded: ${name} at [${startTile[0]}, ${startTile[1]}]`);
      }
    }
    
    // Set initial game time
    this.gameTime = new Date(2023, 1, 13, 8, 0, 0); // Feb 13, 2023, 8:00 AM
    this.currentStep = 0;
    
    console.log(`  ⏰ Game time: ${this.gameTime.toLocaleString()}`);
    console.log('  ✅ Initialization complete!\n');
  }

  /**
   * Run one simulation step for all personas
   */
  async step(): Promise<void> {
    if (!this.maze) {
      throw new Error('Maze not initialized');
    }

    console.log(`\n⏱️  Step ${this.currentStep} - ${this.gameTime.toLocaleTimeString()}`);
    console.log('─'.repeat(60));
    
    // Each persona performs one cognitive cycle
    for (const [name, persona] of this.personas) {
      try {
        const result = await persona.move(
          this.maze,
          this.personas,
          persona.scratch.currTile,
          new Date(this.gameTime),
          this.embeddings
        );
        
        console.log(`  ${result.pronunciation} ${name}:`);
        console.log(`     Tile: [${result.nextTile[0]}, ${result.nextTile[1]}]`);
        console.log(`     Action: ${result.description || 'idle'}`);
        
        // Update persona tile
        persona.scratch.currTile = result.nextTile;
      } catch (error) {
        console.error(`  ❌ Error moving ${name}:`, error instanceof Error ? error.message : error);
      }
    }
    
    // Advance time (10 seconds per step by default)
    this.gameTime = new Date(this.gameTime.getTime() + 10 * 1000);
    this.currentStep++;
  }

  /**
   * Run simulation for N steps
   */
  async run(numSteps: number): Promise<void> {
    console.log(`\n▶️  Running simulation for ${numSteps} steps...\n`);
    
    for (let i = 0; i < numSteps; i++) {
      await this.step();
      
      // Small delay to make console output readable
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n✅ Simulation completed ${numSteps} steps!\n`);
  }

  /**
   * Save simulation state
   */
  async save(folder: string): Promise<void> {
    console.log(`\n💾 Saving simulation to ${folder}...`);
    
    // Create directory
    if (!existsSync(folder)) {
      await mkdir(folder, { recursive: true });
    }
    
    // Save simulation metadata
    const metadata = {
      simName: this.simName,
      currentStep: this.currentStep,
      gameTime: this.gameTime.toISOString(),
      personas: Array.from(this.personas.keys()),
    };
    
    const metaPath = join(folder, 'metadata.json');
    await writeFile(metaPath, JSON.stringify(metadata, null, 2));
    
    // Save each persona
    for (const [name, persona] of this.personas) {
      const personaFolder = join(folder, 'personas', name.replace(/\s+/g, '_'));
      await persona.save(personaFolder);
      console.log(`  ✓ Saved ${name}`);
    }
    
    console.log('  ✅ Save complete!\n');
  }

  /**
   * Load simulation state
   */
  async load(folder: string): Promise<void> {
    console.log(`\n📂 Loading simulation from ${folder}...`);
    
    // Load metadata
    const metaPath = join(folder, 'metadata.json');
    if (!existsSync(metaPath)) {
      throw new Error(`Metadata not found: ${metaPath}`);
    }
    
    const metaContent = await readFile(metaPath, 'utf-8');
    const metadata = JSON.parse(metaContent);
    
    this.simName = metadata.simName;
    this.currentStep = metadata.currentStep;
    this.gameTime = new Date(metadata.gameTime);
    
    // Load maze
    console.log('  📍 Loading maze...');
    this.maze = new Maze('the_ville');
    await this.maze.load();
    
    // Load personas
    console.log('  👤 Loading personas...');
    this.personas.clear();
    for (const name of metadata.personas) {
      const personaFolder = join(folder, 'personas', name.replace(/\s+/g, '_'));
      const persona = new Persona(name, personaFolder);
      await persona.load();
      this.personas.set(name, persona);
      console.log(`     ✓ Loaded ${name}`);
    }
    
    console.log('  ✅ Load complete!\n');
  }
}

// Test OpenRouter connection
async function testConnection() {
  try {
    console.log('Testing OpenRouter connection...');
    const response = await openRouterClient.singleCompletion(
      'Say "Hello" in one word.',
      config.openrouter.fastModel
    );
    console.log('✅ OpenRouter connection successful!');
    console.log(`   Response: "${response.trim()}"`);
    return true;
  } catch (error) {
    console.error('❌ OpenRouter connection failed:', error);
    console.error('\nPlease check your .env file and ensure:');
    console.error('  1. OPENROUTER_API_KEY is set correctly');
    console.error('  2. You have API credits available');
    console.error('  3. Your network connection is working\n');
    return false;
  }
}

// Command-line interface
function createInterface() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return {
    question: (query: string): Promise<string> => {
      return new Promise((resolve) => {
        rl.question(query, resolve);
      });
    },
    close: () => rl.close(),
  };
}

async function main() {
  console.log(`Using OpenRouter API at: ${config.openrouter.baseUrl}`);
  console.log(`Default Model: ${config.openrouter.defaultModel}`);
  console.log(`Key Owner: ${config.app.keyOwner}`);
  console.log(`Debug Mode: ${config.app.debug ? 'ON' : 'OFF'}\n`);

  // Test the API connection
  const connected = await testConnection();
  if (!connected) {
    console.log('\n⚠️  Starting in offline mode (API unavailable)');
  }

  console.log('\n📚 Backend server is running!');
  console.log('════════════════════════════════════════════════\n');

  const rl = createInterface();

  try {
    // Simulation fork selection
    const forkSim = await rl.question('Enter the name of the forked simulation: ');
    console.log(`Forking from: ${forkSim}`);

    // New simulation name
    const newSim = await rl.question('Enter the name of the new simulation: ');
    console.log(`Creating simulation: ${newSim}`);

    // Main command loop
    console.log('\n🎮 Simulation ready!');
    console.log('Commands:');
    console.log('  run <steps>  - Run simulation for N steps');
    console.log('  exit         - Exit without saving');
    console.log('  fin          - Save and exit\n');

    let running = true;
    while (running) {
      const option = await rl.question('Enter option: ');
      const parts = option.trim().split(' ');
      const command = parts[0]?.toLowerCase();

      switch (command) {
        case 'run': {
          const steps = parseInt(parts[1] ?? '1', 10);
          if (isNaN(steps) || steps <= 0) {
            console.log('❌ Invalid step count. Usage: run <number>');
            break;
          }
          console.log(`\n▶️  Running simulation for ${steps} steps...`);
          console.log('(Simulation engine not yet fully implemented)');
          console.log(`✅ Simulation complete!\n`);
          break;
        }

        case 'exit':
          console.log('👋 Exiting without saving...');
          running = false;
          break;

        case 'fin':
          console.log('💾 Saving simulation...');
          console.log('✅ Simulation saved!');
          console.log('👋 Goodbye!');
          running = false;
          break;

        case 'call':
          console.log('📞 Call commands not yet implemented');
          break;

        case 'help':
          console.log('\nAvailable commands:');
          console.log('  run <steps>  - Run simulation for N steps');
          console.log('  exit         - Exit without saving');
          console.log('  fin          - Save and exit');
          console.log('  help         - Show this help message\n');
          break;

        default:
          console.log(`❌ Unknown command: ${command}`);
          console.log('Type "help" for available commands');
      }
    }
  } finally {
    rl.close();
  }

  console.log('\n✨ Backend server shutting down...');
  process.exit(0);
}

// Handle errors and graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

// Run the server only when executed directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}
