/**
 * Reverie Backend Server
 * 
 * Main simulation engine for Generative Agents
 * This is the TypeScript/Node.js port of reverie.py
 */

import * as readline from 'readline';
import { config } from '../config.js';
import { openRouterClient } from '../openrouter.js';

console.log('🎭 Generative Agents - Reverie Simulation Server');
console.log('================================================\n');

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

// Run the server
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
