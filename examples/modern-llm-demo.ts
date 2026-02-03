/**
 * Modern LLM Features Demo
 * 
 * Demonstrates cutting-edge 2026 LLM capabilities:
 * - Structured outputs with Zod schemas
 * - Streaming responses
 * - Chain-of-thought reasoning
 * - Function calling and tool use
 * - Multi-agent communication
 * - Memory summarization
 * - Confidence scoring
 */

import { config } from '../src/config.js';
import { OpenRouterClient } from '../src/openrouter.js';
import {
  StreamingLLMClient,
  generateWithCoT,
  generateStructured,
  DailyPlanSchema,
  ReactionDecisionSchema,
  ConversationSchema,
  AgentCommunicationHub,
  summarizeMemories,
  assessConfidence,
  executeFunctionCall,
  agentTools,
} from '../src/modernLLM.js';

// ============================================================================
// Demo Configuration
// ============================================================================

const DEMO_MODEL = config.openrouter.defaultModel;
const ENABLE_API_CALLS = !!config.openrouter.apiKey && config.openrouter.apiKey !== 'your-api-key-here';

console.log('🎭 Modern LLM Features Demo');
console.log('═══════════════════════════════════════\n');
console.log(`Model: ${DEMO_MODEL}`);
console.log(`API Key: ${ENABLE_API_CALLS ? '✓ Configured' : '✗ Not configured (using mock responses)'}\n`);

// ============================================================================
// Helper Functions
// ============================================================================

function printSection(title: string) {
  console.log('\n' + '═'.repeat(60));
  console.log(`  ${title}`);
  console.log('═'.repeat(60) + '\n');
}

function printSubsection(title: string) {
  console.log('\n' + '─'.repeat(60));
  console.log(`  ${title}`);
  console.log('─'.repeat(60) + '\n');
}

// Mock responses when API key not configured
function getMockResponse(type: string): unknown {
  switch (type) {
    case 'daily_plan':
      return {
        wakeUpHour: 7,
        activities: [
          { time: '7:00 AM', activity: 'morning routine', duration: 30 },
          { time: '8:00 AM', activity: 'breakfast', duration: 30 },
          { time: '9:00 AM', activity: 'work on project', duration: 240 },
        ],
        goals: ['Complete project tasks', 'Stay healthy'],
      };
    case 'reaction':
      return {
        shouldReact: true,
        action: 'approach' as const,
        reasoning: 'The person seems friendly and it would be good to socialize',
        priority: 7,
      };
    case 'conversation':
      return {
        utterance: 'Hello! How are you doing today?',
        emotion: 'happy' as const,
        intent: 'greet' as const,
      };
    default:
      return {};
  }
}

// ============================================================================
// Demo 1: Structured Outputs with Zod Schemas
// ============================================================================

async function demoStructuredOutputs() {
  printSection('Demo 1: Structured Outputs');
  
  const client = new OpenRouterClient();

  console.log('💡 Structured outputs ensure type-safe, validated responses\n');

  // Daily Plan Generation
  printSubsection('Daily Plan Generation');
  console.log('Generating daily plan with schema validation...\n');

  if (ENABLE_API_CALLS) {
    try {
      const plan = await generateStructured(
        client,
        'Create a daily plan for a software engineer who wakes up at 7 AM',
        DailyPlanSchema,
        {
          systemPrompt: 'You are a helpful assistant creating daily schedules',
          temperature: 0.7,
        }
      );

      console.log('✓ Generated plan:');
      console.log(`  Wake up: ${plan.wakeUpHour}:00`);
      console.log(`  Activities: ${plan.activities.length} scheduled`);
      plan.activities.slice(0, 3).forEach(act => {
        console.log(`    - ${act.time}: ${act.activity}`);
      });
      console.log(`  Goals: ${plan.goals.join(', ')}`);
    } catch (error) {
      console.log('✗ Error:', error);
    }
  } else {
    const plan = getMockResponse('daily_plan');
    console.log('📝 Mock response (API key not configured):');
    console.log(JSON.stringify(plan, null, 2));
  }

  // Reaction Decision
  printSubsection('Reaction Decision');
  console.log('Agent deciding how to react to an event...\n');

  if (ENABLE_API_CALLS) {
    try {
      const reaction = await generateStructured(
        client,
        'A friendly person is approaching you at a park. Should you react?',
        ReactionDecisionSchema,
        {
          systemPrompt: 'You are an AI agent in a simulation',
        }
      );

      console.log('✓ Decision:');
      console.log(`  Should React: ${reaction.shouldReact}`);
      console.log(`  Action: ${reaction.action}`);
      console.log(`  Priority: ${reaction.priority}/10`);
      console.log(`  Reasoning: ${reaction.reasoning}`);
    } catch (error) {
      console.log('✗ Error:', error);
    }
  } else {
    const reaction = getMockResponse('reaction');
    console.log('📝 Mock response:');
    console.log(JSON.stringify(reaction, null, 2));
  }
}

// ============================================================================
// Demo 2: Streaming Responses
// ============================================================================

async function demoStreaming() {
  printSection('Demo 2: Streaming Responses');

  console.log('💡 Stream responses token-by-token for real-time feedback\n');

  if (ENABLE_API_CALLS) {
    const client = new StreamingLLMClient();

    printSubsection('Agent Internal Monologue');
    console.log('Streaming agent thoughts in real-time...\n');

    process.stdout.write('Agent: ');

    try {
      await client.streamChatCompletion(
        [
          {
            role: 'system',
            content: 'You are an AI agent named Alice in a life simulation. Think about your day.',
          },
          {
            role: 'user',
            content: "It's morning. What are you thinking about?",
          },
        ],
        {
          onToken: (token) => {
            process.stdout.write(token);
          },
          onComplete: (response) => {
            console.log('\n\n✓ Stream completed');
            console.log(`Total length: ${response.length} characters`);
          },
          model: DEMO_MODEL,
        }
      );
    } catch (error) {
      console.log('\n✗ Error:', error);
    }
  } else {
    console.log('📝 Streaming requires API key');
    console.log('Example output:');
    console.log('Agent: Good morning! I should start my day with...');
    const mockThought = 'Good morning! I should start my day with breakfast and then work on my project. I feel energized today.';
    for (let i = 0; i < mockThought.length; i++) {
      process.stdout.write(mockThought[i]!);
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    console.log('\n');
  }
}

// ============================================================================
// Demo 3: Chain-of-Thought Reasoning
// ============================================================================

async function demoChainOfThought() {
  printSection('Demo 3: Chain-of-Thought Reasoning');

  console.log('💡 Explicit reasoning steps for transparent decision-making\n');

  const client = new OpenRouterClient();

  printSubsection('Problem: Should Isabella attend the party?');
  console.log('Context: Isabella is introverted and has a presentation tomorrow\n');

  if (ENABLE_API_CALLS) {
    try {
      const result = await generateWithCoT(
        client,
        'Should Isabella attend the party tonight?',
        'Isabella is an introvert who has a big presentation tomorrow morning at 9 AM'
      );

      console.log('Reasoning Steps:');
      result.steps.forEach(step => {
        console.log(`  ${step.step}. ${step.thought}`);
      });
      console.log(`\n✓ Final Answer: ${result.finalAnswer}`);
    } catch (error) {
      console.log('✗ Error:', error);
    }
  } else {
    console.log('📝 Mock reasoning chain:');
    console.log('  1. Isabella is introverted and may find parties draining');
    console.log('  2. She has an important presentation tomorrow that requires rest');
    console.log('  3. Social obligations vs. professional performance trade-off');
    console.log('  4. Long-term career success outweighs short-term social engagement');
    console.log('\n✓ Final Answer: Isabella should politely decline and prepare for her presentation');
  }
}

// ============================================================================
// Demo 4: Function Calling & Tool Use
// ============================================================================

async function demoFunctionCalling() {
  printSection('Demo 4: Function Calling & Tool Use');

  console.log('💡 Agents can use tools to enhance their capabilities\n');

  printSubsection('Available Tools');
  console.log('Tools agents can call:');
  agentTools.forEach(tool => {
    console.log(`  - ${tool.name}: ${tool.description}`);
  });

  printSubsection('Tool Execution Examples');
  
  // Calculate
  console.log('\n1. Calculator Tool:');
  const calcResult = await executeFunctionCall({
    name: 'calculate',
    arguments: { expression: '(10 + 5) * 2' },
  });
  console.log(`  Input: (10 + 5) * 2`);
  console.log(`  Result: ${JSON.stringify(calcResult)}`);

  // Get time
  console.log('\n2. Time Tool:');
  const timeResult = await executeFunctionCall({
    name: 'get_current_time',
    arguments: {},
  });
  console.log(`  Result: ${JSON.stringify(timeResult)}`);

  // Recall memory
  console.log('\n3. Memory Recall Tool:');
  const memoryResult = await executeFunctionCall({
    name: 'recall_memory',
    arguments: { query: 'breakfast this morning', limit: '5' },
  });
  console.log(`  Query: "breakfast this morning"`);
  console.log(`  Result: ${JSON.stringify(memoryResult)}`);

  console.log('\n✓ Tools enable grounded, factual agent responses');
}

// ============================================================================
// Demo 5: Multi-Agent Communication
// ============================================================================

async function demoMultiAgentComm() {
  printSection('Demo 5: Multi-Agent Communication');

  console.log('💡 Structured message passing between agents\n');

  const hub = new AgentCommunicationHub();

  printSubsection('Agent Conversation');

  // Alice proposes to Bob
  console.log('Alice → Bob: Proposing collaboration');
  hub.sendMessage({
    from: 'Alice',
    to: 'Bob',
    content: 'Hey Bob, want to work on the garden project together?',
    intent: 'propose',
    timestamp: new Date(),
  });

  // Bob agrees
  console.log('Bob → Alice: Agreeing to proposal');
  hub.sendMessage({
    from: 'Bob',
    to: 'Alice',
    content: 'Sure Alice, that sounds great! When should we start?',
    intent: 'agree',
    timestamp: new Date(),
  });

  // Alice informs
  console.log('Alice → Bob: Providing information');
  hub.sendMessage({
    from: 'Alice',
    to: 'Bob',
    content: 'How about tomorrow morning at 9 AM?',
    intent: 'inform',
    timestamp: new Date(),
  });

  printSubsection('Message History');
  const aliceMessages = hub.getMessages('Alice');
  const bobMessages = hub.getMessages('Bob');

  console.log(`\nAlice's inbox (${aliceMessages.length} messages):`);
  aliceMessages.forEach(msg => {
    console.log(`  [${msg.intent}] ${msg.from}: ${msg.content}`);
  });

  console.log(`\nBob's inbox (${bobMessages.length} messages):`);
  bobMessages.forEach(msg => {
    console.log(`  [${msg.intent}] ${msg.from}: ${msg.content}`);
  });

  console.log('\n✓ Multi-agent coordination enabled');
}

// ============================================================================
// Demo 6: Memory Summarization
// ============================================================================

async function demoMemorySummarization() {
  printSection('Demo 6: Memory Summarization');

  console.log('💡 Compress long memory sequences for efficient context\n');

  const memories = [
    'Woke up at 7:00 AM feeling refreshed',
    'Had breakfast - scrambled eggs and coffee',
    'Met Sarah at the coffee shop at 9:00 AM',
    'Discussed the upcoming project deadline with Sarah',
    'Sarah mentioned she was worried about the timeline',
    'Reassured Sarah that the team would support her',
    'Worked on coding from 10:00 AM to 12:00 PM',
    'Fixed three bugs in the authentication system',
    'Had lunch with the team at the new Italian restaurant',
    'The pasta was delicious, everyone enjoyed it',
    'Afternoon meeting about Q2 goals',
    'Manager praised the team\'s recent performance',
    'Continued coding until 5:00 PM',
    'Committed code changes and created pull request',
    'Evening walk in the park',
    'Saw a beautiful sunset',
    'Cooked dinner - stir fry with vegetables',
    'Watched a documentary about space exploration',
    'Read a book before bed',
    'Fell asleep around 11:00 PM',
  ];

  printSubsection('Original Memories');
  console.log(`Total memories: ${memories.length}`);
  console.log('Sample memories:');
  memories.slice(0, 5).forEach(mem => {
    console.log(`  - ${mem}`);
  });
  console.log('  ...');

  if (ENABLE_API_CALLS) {
    const client = new OpenRouterClient();

    printSubsection('Summarized Version');
    try {
      const summary = await summarizeMemories(client, memories, 150);

      console.log('\n✓ Summary:');
      console.log(`  ${summary.summary}`);
      console.log('\n  Key Points:');
      summary.keyPoints.forEach(point => {
        console.log(`    • ${point}`);
      });
      console.log(`\n  Emotional Tone: ${summary.emotionalTone}`);
      console.log(`  Important Entities: ${summary.importantEntities.join(', ')}`);
      
      const compression = ((memories.join(' ').length - summary.summary.length) / memories.join(' ').length * 100).toFixed(1);
      console.log(`\n  Compression: ${compression}% reduction in text length`);
    } catch (error) {
      console.log('✗ Error:', error);
    }
  } else {
    console.log('\n📝 Mock summary:');
    console.log('  A productive day starting with breakfast and meetings with Sarah about project concerns.');
    console.log('  Spent afternoon coding and fixing bugs. Evening relaxation with dinner, documentary, and reading.');
    console.log('\n  Key Points:');
    console.log('    • Collaborated with Sarah on project');
    console.log('    • Fixed authentication bugs');
    console.log('    • Positive team meeting');
    console.log('    • Balanced work and relaxation');
    console.log('\n  Emotional Tone: Productive and content');
    console.log('  Important Entities: Sarah, team, project, Italian restaurant');
  }
}

// ============================================================================
// Demo 7: Confidence Scoring
// ============================================================================

async function demoConfidenceScoring() {
  printSection('Demo 7: Confidence Scoring');

  console.log('💡 LLMs assess their own confidence for reliability\n');

  if (ENABLE_API_CALLS) {
    const client = new OpenRouterClient();

    const testCases = [
      {
        question: "What is 2 + 2?",
        answer: "4",
      },
      {
        question: "What will the stock market do tomorrow?",
        answer: "The market will go up by 3%",
      },
    ];

    for (const testCase of testCases) {
      printSubsection(`Question: ${testCase.question}`);
      console.log(`Answer: ${testCase.answer}\n`);

      try {
        const confidence = await assessConfidence(
          client,
          testCase.question,
          testCase.answer
        );

        const percent = (confidence.score * 100).toFixed(0);
        console.log(`✓ Confidence: ${percent}%`);
        console.log(`  Reasoning: ${confidence.reasoning}`);
        if (confidence.uncertaintyFactors.length > 0) {
          console.log(`  Uncertainty Factors:`);
          confidence.uncertaintyFactors.forEach(factor => {
            console.log(`    - ${factor}`);
          });
        }
      } catch (error) {
        console.log('✗ Error:', error);
      }
    }
  } else {
    console.log('📝 Mock confidence scores:\n');
    console.log('Q: What is 2 + 2?');
    console.log('A: 4');
    console.log('✓ Confidence: 100%');
    console.log('  Reasoning: This is basic arithmetic with a definite answer\n');
    
    console.log('Q: What will the stock market do tomorrow?');
    console.log('A: The market will go up by 3%');
    console.log('✓ Confidence: 15%');
    console.log('  Reasoning: Stock market prediction is inherently uncertain');
    console.log('  Uncertainty Factors:');
    console.log('    - Market volatility');
    console.log('    - Unpredictable events');
    console.log('    - Multiple influencing factors');
  }
}

// ============================================================================
// Main Demo Runner
// ============================================================================

async function main() {
  try {
    await demoStructuredOutputs();
    await demoStreaming();
    await demoChainOfThought();
    await demoFunctionCalling();
    await demoMultiAgentComm();
    await demoMemorySummarization();
    await demoConfidenceScoring();

    printSection('Demo Complete');
    console.log('✓ All modern LLM features demonstrated\n');
    console.log('Key Takeaways:');
    console.log('  1. Structured outputs ensure reliability');
    console.log('  2. Streaming enables real-time UX');
    console.log('  3. Chain-of-thought provides transparency');
    console.log('  4. Tools ground agents in reality');
    console.log('  5. Multi-agent communication enables coordination');
    console.log('  6. Memory summarization optimizes context');
    console.log('  7. Confidence scoring improves safety');
    console.log('\nNext Steps:');
    console.log('  • Review MODERN_LLM_ENHANCEMENTS.md for details');
    console.log('  • Integrate features into your agents');
    console.log('  • Experiment with different models');
    console.log('  • Build amazing simulations! 🚀\n');

  } catch (error) {
    console.error('Demo error:', error);
    process.exit(1);
  }
}

// Run the demo
main();
