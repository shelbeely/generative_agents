/**
 * DeepSeek-V3.2 Demo
 * 
 * Demonstrates using DeepSeek-V3.2 for generative agent tasks.
 * Shows examples of:
 * - Agent daily planning
 * - Multi-step reasoning with tool use
 * - Social interaction generation
 * - Memory reflection and formation
 */

import { OpenRouterSDKClient } from '../src/openrouterSDK.js';
import { config } from '../src/config.js';

// Initialize the client
const client = new OpenRouterSDKClient();

console.log('🚀 DeepSeek-V3.2 Demo for Generative Agents\n');

// Example 1: Agent Daily Planning
async function example1_DailyPlanning() {
  console.log('📅 Example 1: Agent Daily Planning with DeepSeek-V3.2');
  console.log('━'.repeat(60));
  
  const response = await client.chatCompletion([
    {
      role: 'system',
      content: `You are planning the day for Isabella Rodriguez, a 35-year-old creative writer.
                
                Personality: Empathetic, introspective, creative, slightly introverted
                Goals: Complete novel manuscript, maintain friendships, personal growth
                Living situation: Small apartment near downtown`
    },
    {
      role: 'user',
      content: `Plan Isabella's day from 6 AM to 11 PM. Create a realistic schedule that includes:
                - Morning routine and creative work
                - Meals and self-care
                - Social interactions (she knows Klaus and Maria)
                - Evening activities
                
                Return as JSON array with format:
                [{ "time": "6:00 AM", "activity": "...", "location": "...", "duration_minutes": 60 }]`
    }
  ], {
    model: 'deepseek/deepseek-chat',
    temperature: 0.7,
    maxTokens: 2000
  });

  console.log('\n📝 Isabella\'s Daily Schedule:\n');
  try {
    const schedule = JSON.parse(response);
    schedule.forEach((item: any) => {
      console.log(`${item.time.padEnd(10)} - ${item.activity} (${item.location})`);
    });
  } catch (e) {
    // If not valid JSON, just show the response
    console.log(response);
  }
  
  console.log('\n' + '━'.repeat(60) + '\n');
}

// Example 2: Multi-Step Reasoning
async function example2_ComplexDecision() {
  console.log('🤔 Example 2: Complex Decision Making with Chain-of-Thought');
  console.log('━'.repeat(60));
  
  const response = await client.chatCompletion([
    {
      role: 'system',
      content: `You are Isabella Rodriguez. You need to make an important decision.
                Use step-by-step reasoning to arrive at the best choice.`
    },
    {
      role: 'user',
      content: `Situation: Klaus invited you to a party tonight at 8 PM. However, you have a manuscript 
                deadline tomorrow and you're only 80% done. The party is at his place, 20 minutes away.
                
                Think through this decision step-by-step:
                1. What are the key factors?
                2. What are the pros and cons of each option?
                3. What does your personality suggest?
                4. What's the best decision?
                
                Show your reasoning, then give your final decision.`
    }
  ], {
    model: 'deepseek/deepseek-chat',
    temperature: 0.7,
    maxTokens: 1500
  });

  console.log('\n💭 Isabella\'s Reasoning Process:\n');
  console.log(response);
  
  console.log('\n' + '━'.repeat(60) + '\n');
}

// Example 3: Tool Use Demonstration
async function example3_ToolUse() {
  console.log('🔧 Example 3: Agentic Tool Use');
  console.log('━'.repeat(60));
  
  const response = await client.chatCompletion([
    {
      role: 'system',
      content: `You are Isabella Rodriguez. Use the available tools to help make informed decisions.`
    },
    {
      role: 'user',
      content: `You're planning your week. Check your calendar and evaluate your relationships to decide 
                how to allocate your time between work and social activities.`
    }
  ], {
    model: 'deepseek/deepseek-chat',
    tools: [
      {
        type: 'function',
        function: {
          name: 'check_calendar',
          description: 'Check calendar for upcoming events and deadlines',
          parameters: {
            type: 'object',
            properties: {
              date_range: {
                type: 'string',
                description: 'Date range to check (e.g., "this week", "next 7 days")'
              }
            },
            required: ['date_range']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_relationship_status',
          description: 'Get relationship strength and recent interactions with another person',
          parameters: {
            type: 'object',
            properties: {
              person_name: {
                type: 'string',
                description: 'Name of the person to check'
              }
            },
            required: ['person_name']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'estimate_task_time',
          description: 'Estimate time needed to complete a task',
          parameters: {
            type: 'object',
            properties: {
              task: {
                type: 'string',
                description: 'Description of the task'
              },
              complexity: {
                type: 'string',
                enum: ['simple', 'medium', 'complex'],
                description: 'Task complexity level'
              }
            },
            required: ['task', 'complexity']
          }
        }
      }
    ],
    temperature: 0.7
  });

  console.log('\n🎯 Isabella\'s Tool-Assisted Planning:\n');
  console.log(response);
  
  console.log('\n' + '━'.repeat(60) + '\n');
}

// Example 4: Social Interaction Generation
async function example4_Conversation() {
  console.log('💬 Example 4: Natural Conversation Generation');
  console.log('━'.repeat(60));
  
  const response = await client.chatCompletion([
    {
      role: 'system',
      content: `Generate a realistic conversation between Isabella Rodriguez and Klaus Mueller.
                
                Isabella: Creative writer, empathetic, introspective, slightly introverted
                Klaus: Researcher, analytical, curious, socially awkward but friendly`
    },
    {
      role: 'user',
      content: `Context: Isabella and Klaus bump into each other at the local library. They're both 
                looking for the same book on cognitive psychology.
                
                Generate a natural 6-8 exchange conversation showing:
                - Their different personalities
                - A moment of connection
                - Some awkwardness (from Klaus)
                - Warmth (from Isabella)
                
                Format as JSON:
                [{ "speaker": "Isabella", "utterance": "...", "emotion": "...", "intent": "..." }]`
    }
  ], {
    model: 'deepseek/deepseek-chat',
    temperature: 0.85, // Higher for more creative dialogue
    maxTokens: 1500
  });

  console.log('\n🗣️ Library Encounter:\n');
  try {
    const conversation = JSON.parse(response);
    conversation.forEach((line: any) => {
      const emoji = line.emotion === 'happy' ? '😊' : 
                    line.emotion === 'surprised' ? '😮' : 
                    line.emotion === 'nervous' ? '😅' : '😐';
      console.log(`${emoji} ${line.speaker}: "${line.utterance}"`);
      console.log(`   [${line.emotion} - ${line.intent}]\n`);
    });
  } catch (e) {
    console.log(response);
  }
  
  console.log('\n' + '━'.repeat(60) + '\n');
}

// Example 5: Memory Reflection
async function example5_Reflection() {
  console.log('🧠 Example 5: End-of-Day Reflection and Memory Formation');
  console.log('━'.repeat(60));
  
  const dailyEvents = [
    'Woke up at 6:30 AM and wrote 2000 words on novel',
    'Had coffee with Klaus at the library (discussed cognitive psychology)',
    'Attended writing workshop in the afternoon',
    'Received encouraging feedback on latest chapter from Maria',
    'Declined party invitation to focus on manuscript deadline',
    'Finished 95% of manuscript by 10 PM'
  ];

  const response = await client.chatCompletion([
    {
      role: 'system',
      content: `You are Isabella Rodriguez reflecting on your day. Extract key insights and learnings.`
    },
    {
      role: 'user',
      content: `Today's events:
${dailyEvents.map((e, i) => `${i + 1}. ${e}`).join('\n')}

Reflect deeply on these events and provide:
1. Most important moments (rate poignancy 1-10 for each)
2. Key insights or learnings
3. How your emotional state changed throughout the day
4. Important social dynamics or relationship changes
5. Plans or goals formed for tomorrow

Format as JSON with these fields.`
    }
  ], {
    model: 'deepseek/deepseek-chat',
    temperature: 0.7,
    maxTokens: 2000
  });

  console.log('\n📖 Isabella\'s Daily Reflection:\n');
  try {
    const reflection = JSON.parse(response);
    console.log('🌟 Important Moments:');
    reflection.important_moments?.forEach((moment: any) => {
      console.log(`   [Poignancy: ${moment.poignancy}/10] ${moment.description}`);
    });
    
    console.log('\n💡 Key Insights:');
    reflection.insights?.forEach((insight: string, i: number) => {
      console.log(`   ${i + 1}. ${insight}`);
    });
    
    console.log('\n🎭 Emotional Journey:');
    console.log(`   ${reflection.emotional_journey || 'N/A'}`);
    
    console.log('\n🤝 Social Dynamics:');
    console.log(`   ${reflection.social_dynamics || 'N/A'}`);
    
    console.log('\n📅 Tomorrow\'s Plans:');
    reflection.tomorrow_plans?.forEach((plan: string, i: number) => {
      console.log(`   ${i + 1}. ${plan}`);
    });
  } catch (e) {
    console.log(response);
  }
  
  console.log('\n' + '━'.repeat(60) + '\n');
}

// Example 6: Performance Comparison
async function example6_Comparison() {
  console.log('⚡ Example 6: DeepSeek vs Other Models (Quick Test)');
  console.log('━'.repeat(60));
  
  const testPrompt = [
    {
      role: 'user',
      content: 'In 2-3 sentences, explain what makes a good generative agent.'
    }
  ];

  console.log('\n🔵 Testing DeepSeek-V3.2...');
  const startDeepSeek = Date.now();
  const deepseekResponse = await client.chatCompletion(testPrompt, {
    model: 'deepseek/deepseek-chat',
    maxTokens: 150
  });
  const deepseekTime = Date.now() - startDeepSeek;
  
  console.log(`Response (${deepseekTime}ms):`);
  console.log(deepseekResponse);
  
  console.log('\n🟢 Testing Gemini-3-Flash for comparison...');
  const startGemini = Date.now();
  const geminiResponse = await client.chatCompletion(testPrompt, {
    model: 'google/gemini-3-flash',
    maxTokens: 150
  });
  const geminiTime = Date.now() - startGemini;
  
  console.log(`Response (${geminiTime}ms):`);
  console.log(geminiResponse);
  
  console.log('\n📊 Comparison:');
  console.log(`   DeepSeek-V3.2: ${deepseekTime}ms`);
  console.log(`   Gemini-3-Flash: ${geminiTime}ms`);
  console.log(`   Difference: ${Math.abs(deepseekTime - geminiTime)}ms`);
  
  console.log('\n' + '━'.repeat(60) + '\n');
}

// Main execution
async function main() {
  console.log(`Current Configuration:`);
  console.log(`  Default Model: ${config.openrouter.defaultModel}`);
  console.log(`  Advanced Model: ${config.openrouter.advancedModel}`);
  console.log(`  Vision Model: ${config.openrouter.visionModel}\n`);
  console.log('═'.repeat(60) + '\n');

  try {
    // Run all examples
    await example1_DailyPlanning();
    await example2_ComplexDecision();
    await example3_ToolUse();
    await example4_Conversation();
    await example5_Reflection();
    await example6_Comparison();

    console.log('✅ All examples completed successfully!\n');
    console.log('💡 Tips:');
    console.log('   - DeepSeek-V3.2 excels at agentic tasks and tool use');
    console.log('   - Use temperature 0.7-0.8 for balanced creativity');
    console.log('   - Leverage chain-of-thought for complex decisions');
    console.log('   - Combine with Gemini Flash for vision tasks');
    console.log('\n📚 See DEEPSEEK_GUIDE.md for more detailed examples');
    
  } catch (error: any) {
    console.error('❌ Error running examples:', error.message);
    if (error.message?.includes('API key')) {
      console.log('\n💡 Make sure you have set OPENROUTER_API_KEY in your .env file');
    }
  }
}

// Run the demo
main().catch(console.error);
