/**
 * Multi-Agent Village Simulation with Different Models
 * 
 * Demonstrates how to create a village where each agent uses a different
 * LLM model based on their personality and role.
 * 
 * This example shows the core concept from the Generative Agents paper:
 * - Multiple agents in a shared environment
 * - Each agent has unique personality and capabilities
 * - Agents can use different models suited to their characteristics
 */

import { Persona } from '../src/backend/persona.js';
import { config } from '../src/config.js';

console.log('🏘️  Multi-Agent Village Simulation\n');
console.log('Creating a village where each agent uses a model suited to their personality\n');
console.log('='.repeat(80) + '\n');

/**
 * Create agents with different models based on their characteristics
 */
async function createVillageAgents() {
  console.log('👥 Creating Village Agents:\n');

  // Isabella Rodriguez - Creative writer
  // Uses GPT-4 for deep, creative responses
  const isabella = new Persona(
    'Isabella Rodriguez',
    undefined,
    'openai/gpt-4-turbo'
  );
  isabella.scratch.age = 35;
  isabella.scratch.innate = 'creative, empathetic, introspective';
  isabella.scratch.lifestyle = 'Isabella is a novelist who values deep thinking and emotional intelligence';
  isabella.scratch.currently = 'working on her novel';
  
  console.log(`✅ Isabella Rodriguez`);
  console.log(`   Role: Creative Writer`);
  console.log(`   Model: ${isabella.preferredModel}`);
  console.log(`   Why: GPT-4 excels at creative, nuanced writing\n`);

  // Klaus Mueller - Technical researcher
  // Uses DeepSeek for analytical, code-focused tasks
  const klaus = new Persona(
    'Klaus Mueller',
    undefined,
    'deepseek/deepseek-chat'
  );
  klaus.scratch.age = 42;
  klaus.scratch.innate = 'analytical, methodical, curious';
  klaus.scratch.lifestyle = 'Klaus is a computer science researcher focused on AI and algorithms';
  klaus.scratch.currently = 'researching AI architectures';
  
  console.log(`✅ Klaus Mueller`);
  console.log(`   Role: Technical Researcher`);
  console.log(`   Model: ${klaus.preferredModel}`);
  console.log(`   Why: DeepSeek excels at technical reasoning and code\n`);

  // Maria Lopez - Social coordinator
  // Uses Gemini Flash for quick, friendly responses
  const maria = new Persona(
    'Maria Lopez',
    undefined,
    'google/gemini-3-flash'
  );
  maria.scratch.age = 28;
  maria.scratch.innate = 'outgoing, organized, friendly';
  maria.scratch.lifestyle = 'Maria is a community organizer who loves bringing people together';
  maria.scratch.currently = 'planning community events';
  
  console.log(`✅ Maria Lopez`);
  console.log(`   Role: Community Organizer`);
  console.log(`   Model: ${maria.preferredModel}`);
  console.log(`   Why: Gemini Flash is fast and excellent for social interactions\n`);

  // Tom Watson - Practical shopkeeper
  // Uses GPT-3.5 for efficient, straightforward responses
  const tom = new Persona(
    'Tom Watson',
    undefined,
    'openai/gpt-3.5-turbo'
  );
  tom.scratch.age = 55;
  tom.scratch.innate = 'practical, reliable, down-to-earth';
  tom.scratch.lifestyle = 'Tom runs the local grocery store and knows everyone in town';
  tom.scratch.currently = 'managing his shop';
  
  console.log(`✅ Tom Watson`);
  console.log(`   Role: Local Shopkeeper`);
  console.log(`   Model: ${tom.preferredModel}`);
  console.log(`   Why: GPT-3.5 is cost-effective for straightforward interactions\n`);

  // Sam Moore - Tech-savvy youth
  // Uses Claude for balanced, thoughtful responses
  const sam = new Persona(
    'Sam Moore',
    undefined,
    'anthropic/claude-3.5-sonnet'
  );
  sam.scratch.age = 19;
  sam.scratch.innate = 'tech-savvy, curious, energetic';
  sam.scratch.lifestyle = 'Sam is a college student studying environmental science';
  sam.scratch.currently = 'working on a sustainability project';
  
  console.log(`✅ Sam Moore`);
  console.log(`   Role: College Student`);
  console.log(`   Model: ${sam.preferredModel}`);
  console.log(`   Why: Claude provides balanced, thoughtful responses\n`);

  return { isabella, klaus, maria, tom, sam };
}

/**
 * Example of how agents might interact in the village
 */
async function simulateVillageInteraction() {
  console.log('─'.repeat(80));
  console.log('\n🎭 Village Interaction Scenario\n');

  const agents = await createVillageAgents();

  console.log('📖 Scenario: Morning at the Village\n');
  console.log('Isabella wakes up and decides to visit the coffee shop...');
  console.log('She runs into Klaus who is heading to the library...');
  console.log('Maria is organizing a community event...');
  console.log('Tom opens his shop and greets the early morning customers...');
  console.log('Sam is working on his project at the park...\n');

  console.log('💡 Each agent processes this scenario with their own model:\n');
  
  Object.entries(agents).forEach(([name, agent]) => {
    console.log(`${agent.name}:`);
    console.log(`  - Perceives events through ${agent.preferredModel}`);
    console.log(`  - Plans actions based on ${agent.scratch.lifestyle}`);
    console.log(`  - Interacts with others using their unique perspective\n`);
  });
}

/**
 * Show configuration options
 */
function showConfiguration() {
  console.log('─'.repeat(80));
  console.log('\n⚙️  Configuration Options\n');

  console.log('Option 1: Per-Agent Models (RECOMMENDED for village simulation)');
  console.log('```typescript');
  console.log('const agent = new Persona(');
  console.log('  "Agent Name",');
  console.log('  undefined,  // No saved memory');
  console.log('  "deepseek/deepseek-chat"  // Agent-specific model');
  console.log(');');
  console.log('```\n');

  console.log('Option 2: Runtime Model Assignment');
  console.log('```typescript');
  console.log('const agent = new Persona("Agent Name");');
  console.log('agent.setModel("google/gemini-3-flash");');
  console.log('```\n');

  console.log('Option 3: Default Models (from .env)');
  console.log('```typescript');
  console.log('const agent = new Persona("Agent Name");');
  console.log('// Uses DEFAULT_MODEL from config');
  console.log('```\n');

  console.log('Option 4: Model Mapping by Role');
  console.log('```typescript');
  console.log('const modelsByRole = {');
  console.log('  "creative": "openai/gpt-4-turbo",');
  console.log('  "technical": "deepseek/deepseek-chat",');
  console.log('  "social": "google/gemini-3-flash",');
  console.log('  "practical": "openai/gpt-3.5-turbo"');
  console.log('};');
  console.log('');
  console.log('const agent = new Persona(name, undefined, modelsByRole[role]);');
  console.log('```\n');
}

/**
 * Show best practices
 */
function showBestPractices() {
  console.log('─'.repeat(80));
  console.log('\n💡 Best Practices for Multi-Agent Villages\n');

  console.log('1. Match Models to Agent Characteristics:');
  console.log('   - Creative agents → GPT-4, Claude (deep reasoning)');
  console.log('   - Technical agents → DeepSeek (code, analysis)');
  console.log('   - Social agents → Gemini Flash (fast, friendly)');
  console.log('   - Practical agents → GPT-3.5 (cost-effective)\n');

  console.log('2. Balance Cost and Quality:');
  console.log('   - Use premium models for key characters');
  console.log('   - Use efficient models for background characters');
  console.log('   - Mix models based on simulation budget\n');

  console.log('3. Consider Agent Roles:');
  console.log('   - Protagonists: Higher-quality models');
  console.log('   - Supporting characters: Balanced models');
  console.log('   - Background NPCs: Fast, efficient models\n');

  console.log('4. Test Different Combinations:');
  console.log('   - Run simulations with different model assignments');
  console.log('   - Observe which combinations create interesting dynamics');
  console.log('   - Adjust based on your simulation goals\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('🎯 Generative Agents: Multi-Agent Village Simulation\n');
  console.log('Based on: "Generative Agents: Interactive Simulacra of Human Behavior"');
  console.log('Paper: https://arxiv.org/abs/2304.03442\n');
  console.log('='.repeat(80) + '\n');

  await simulateVillageInteraction();
  showConfiguration();
  showBestPractices();

  console.log('─'.repeat(80));
  console.log('\n✨ Summary\n');
  console.log('This is a village simulator where:');
  console.log('  ✅ Each agent is unique with their own personality');
  console.log('  ✅ Each agent can use a different LLM model');
  console.log('  ✅ Models are chosen to match agent characteristics');
  console.log('  ✅ Agents interact in a shared environment');
  console.log('  ✅ The simulation creates emergent social behaviors\n');

  console.log('🚀 To run a full simulation:');
  console.log('  1. Set up your .env with OPENROUTER_API_KEY');
  console.log('  2. Create agents with appropriate models');
  console.log('  3. Run the simulation server: npm run start');
  console.log('  4. Watch agents interact in the village!\n');

  console.log('📚 See PORT_README.md for complete setup instructions');
  console.log('='.repeat(80) + '\n');
}

// Run the demo
main().catch(console.error);
