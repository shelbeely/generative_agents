/**
 * Simple Simulation Demo
 * 
 * Demonstrates a complete end-to-end simulation with:
 * - Maze initialization
 * - Persona creation
 * - Multi-step simulation loop
 * - Console logging of agent actions
 * 
 * This is a minimal working example showing all components integrated.
 */

import { ReverieServer } from '../src/backend/reverie.js';

console.log('═══════════════════════════════════════════════════');
console.log('   Simple Simulation Demo');
console.log('   Generative Agents - Phase 5 Complete');
console.log('═══════════════════════════════════════════════════\n');

async function runSimpleSimulation() {
  try {
    // Create simulation server
    const server = new ReverieServer('demo_simulation');
    
    // Initialize with maze and two personas
    await server.initialize('demo_simulation', [
      'Alice Johnson',
      'Bob Smith',
    ]);
    
    console.log('🎮 Simulation initialized successfully!');
    console.log(`   Personas: ${Array.from(server.personas.keys()).join(', ')}`);
    console.log(`   Maze: ${server.maze?.mazeWidth}x${server.maze?.mazeHeight} tiles`);
    
    // Run simulation for 10 steps
    const numSteps = 10;
    console.log(`\n🏃 Running ${numSteps} simulation steps...\n`);
    
    await server.run(numSteps);
    
    // Display final state
    console.log('\n📊 Final State:');
    console.log('─'.repeat(60));
    for (const [name, persona] of server.personas) {
      console.log(`\n  ${name}:`);
      console.log(`    Location: [${persona.scratch.currTile[0]}, ${persona.scratch.currTile[1]}]`);
      console.log(`    Time: ${persona.scratch.currTime.toLocaleTimeString()}`);
      console.log(`    Current: ${persona.scratch.currently}`);
      if (persona.scratch.dailyPlan) {
        console.log(`    Daily Plan: ${persona.scratch.dailyPlan.schedule.length} activities`);
      }
    }
    
    console.log('\n' + '─'.repeat(60));
    console.log('✅ Demo completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Integrate real LLM calls in gptFunctions.ts');
    console.log('   2. Add more sophisticated planning and perception');
    console.log('   3. Implement persona interactions and conversations');
    console.log('   4. Add visualization/frontend integration');
    
  } catch (error) {
    console.error('\n❌ Error running simulation:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Main entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Starting simulation demo...\n');
  
  runSimpleSimulation()
    .then(() => {
      console.log('\n👋 Demo finished. Goodbye!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error:', error);
      process.exit(1);
    });
}

export { runSimpleSimulation };
