/**
 * Modern LLM Enhancements for Generative Agents
 * 
 * This module adds cutting-edge 2026 LLM capabilities:
 * - Function calling with structured outputs
 * - Streaming responses with real-time generation
 * - Chain-of-thought reasoning with trace tracking
 * - Tool use and external function execution
 * - Advanced prompt engineering
 * 
 * @module modernLLM
 */

import { z } from 'zod';
import { OpenRouterClient, OpenRouterMessage } from './openrouter.js';

// ============================================================================
// Structured Outputs with Zod Schemas
// ============================================================================

/**
 * Schema for daily planning response
 */
export const DailyPlanSchema = z.object({
  wakeUpHour: z.number().min(0).max(23),
  activities: z.array(
    z.object({
      time: z.string(),
      activity: z.string(),
      location: z.string().optional(),
      duration: z.number().optional(),
    })
  ),
  goals: z.array(z.string()),
  reasoning: z.string().optional(),
});

/**
 * Schema for agent reaction decision
 */
export const ReactionDecisionSchema = z.object({
  shouldReact: z.boolean(),
  action: z.enum(['continue', 'interrupt', 'approach', 'avoid', 'talk']),
  reasoning: z.string(),
  priority: z.number().min(1).max(10),
});

/**
 * Schema for conversation utterance
 */
export const ConversationSchema = z.object({
  utterance: z.string(),
  emotion: z.enum(['neutral', 'happy', 'sad', 'angry', 'surprised', 'confused']),
  intent: z.enum(['greet', 'question', 'statement', 'request', 'farewell']),
  reasoning: z.string().optional(),
});

/**
 * Schema for importance/poignancy scoring
 */
export const ImportanceSchema = z.object({
  score: z.number().min(1).max(10),
  reasoning: z.string(),
  factors: z.array(z.string()).optional(),
});

// ============================================================================
// Streaming Response Handler
// ============================================================================

export interface StreamingOptions {
  onToken?: (token: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Enhanced OpenRouter client with streaming support
 */
export class StreamingLLMClient extends OpenRouterClient {
  /**
   * Stream a chat completion with token-by-token generation
   */
  async streamChatCompletion(
    messages: OpenRouterMessage[],
    options: StreamingOptions & { model?: string; temperature?: number } = {}
  ): Promise<string> {
    const { onToken, onComplete, onError, model, temperature } = options;

    let fullResponse = '';

    try {
      const response = await fetch(`${this['baseUrl']}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this['apiKey']}`,
          'HTTP-Referer': 'https://github.com/shelbeely/generative_agents',
          'X-Title': 'Generative Agents',
        },
        body: JSON.stringify({
          model: model ?? this['defaultModel'],
          messages,
          temperature: temperature ?? 0.7,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const token = parsed.choices?.[0]?.delta?.content;
              
              if (token) {
                fullResponse += token;
                onToken?.(token);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      onComplete?.(fullResponse);
      return fullResponse;
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  }
}

// ============================================================================
// Function Calling Support
// ============================================================================

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
}

export interface FunctionCall {
  name: string;
  arguments: Record<string, unknown>;
}

/**
 * Tools/functions that agents can use
 */
export const agentTools: FunctionDefinition[] = [
  {
    name: 'calculate',
    description: 'Perform mathematical calculations',
    parameters: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'Mathematical expression to evaluate (e.g., "2 + 2" or "sqrt(16)")',
        },
      },
      required: ['expression'],
    },
  },
  {
    name: 'get_current_time',
    description: 'Get the current time in the simulation',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'recall_memory',
    description: 'Search memories for relevant information',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for memories',
        },
        limit: {
          type: 'string',
          description: 'Maximum number of memories to recall',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_location_info',
    description: 'Get information about a location in the world',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'Location address (e.g., "home:kitchen")',
        },
      },
      required: ['location'],
    },
  },
];

/**
 * Execute a function call from the LLM
 */
export async function executeFunctionCall(call: FunctionCall): Promise<unknown> {
  switch (call.name) {
    case 'calculate': {
      const expr = String(call.arguments.expression);
      try {
        // Basic math evaluation (safe subset)
        const result = eval(expr.replace(/[^0-9+\-*/().\s]/g, ''));
        return { result };
      } catch {
        return { error: 'Invalid expression' };
      }
    }

    case 'get_current_time':
      return { time: new Date().toISOString() };

    case 'recall_memory':
      // Would integrate with actual memory system
      return {
        memories: [`Memory related to: ${call.arguments.query}`],
      };

    case 'get_location_info':
      // Would integrate with maze system
      return {
        location: call.arguments.location,
        description: 'A location in the world',
      };

    default:
      return { error: 'Unknown function' };
  }
}

// ============================================================================
// Chain-of-Thought Reasoning
// ============================================================================

export interface ReasoningStep {
  step: number;
  thought: string;
  observation?: string;
  action?: string;
}

export interface ChainOfThought {
  steps: ReasoningStep[];
  finalAnswer: string;
  reasoning: string;
}

/**
 * Generate a response with explicit chain-of-thought reasoning
 */
export async function generateWithCoT(
  client: OpenRouterClient,
  prompt: string,
  context?: string
): Promise<ChainOfThought> {
  const cotPrompt = `${context ? `Context: ${context}\n\n` : ''}${prompt}

Please think through this step by step:
1. Break down the problem
2. Consider relevant information
3. Reason through each part
4. Arrive at a conclusion

Format your response as:
STEP 1: [thought]
STEP 2: [thought]
...
FINAL ANSWER: [answer]`;

  const response = await client.singleCompletion(cotPrompt);

  // Parse the chain of thought
  const steps: ReasoningStep[] = [];
  const lines = response.split('\n');
  let finalAnswer = '';

  for (const line of lines) {
    const stepMatch = line.match(/STEP (\d+):\s*(.+)/);
    if (stepMatch) {
      steps.push({
        step: parseInt(stepMatch[1]!),
        thought: stepMatch[2]!.trim(),
      });
    }

    const finalMatch = line.match(/FINAL ANSWER:\s*(.+)/);
    if (finalMatch) {
      finalAnswer = finalMatch[1]!.trim();
    }
  }

  return {
    steps,
    finalAnswer: finalAnswer || response,
    reasoning: response,
  };
}

// ============================================================================
// Structured Output Generation
// ============================================================================

/**
 * Generate structured output conforming to a Zod schema
 */
export async function generateStructured<T>(
  client: OpenRouterClient,
  prompt: string,
  schema: z.ZodSchema<T>,
  options: {
    systemPrompt?: string;
    temperature?: number;
    retries?: number;
  } = {}
): Promise<T> {
  const { systemPrompt, temperature = 0.3, retries = 3 } = options;

  const messages: OpenRouterMessage[] = [];
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  messages.push({
    role: 'user',
    content: `${prompt}\n\nRespond ONLY with valid JSON matching this structure. Do not include any other text.`,
  });

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await client.chatCompletion(messages, { temperature });
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const validated = schema.parse(parsed);
      
      return validated;
    } catch (error) {
      if (attempt === retries - 1) {
        console.error('Failed to generate structured output after retries:', error);
        throw error;
      }
      // Retry with slightly different temperature
      messages.push({
        role: 'user',
        content: 'Please provide a valid JSON response matching the required structure.',
      });
    }
  }

  throw new Error('Failed to generate structured output');
}

// ============================================================================
// Multi-Agent Communication
// ============================================================================

export interface AgentMessage {
  from: string;
  to: string;
  content: string;
  intent: 'inform' | 'request' | 'propose' | 'agree' | 'disagree';
  timestamp: Date;
}

export class AgentCommunicationHub {
  private messages: Map<string, AgentMessage[]> = new Map();

  /**
   * Send a message from one agent to another
   */
  sendMessage(message: AgentMessage): void {
    const key = `${message.from}-${message.to}`;
    
    if (!this.messages.has(key)) {
      this.messages.set(key, []);
    }
    
    this.messages.get(key)!.push(message);
  }

  /**
   * Get messages for an agent
   */
  getMessages(agentName: string, _unreadOnly: boolean = true): AgentMessage[] {
    const allMessages: AgentMessage[] = [];
    
    for (const [key, msgs] of this.messages.entries()) {
      if (key.endsWith(`-${agentName}`)) {
        allMessages.push(...msgs);
      }
    }
    
    return allMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Clear messages for an agent
   */
  clearMessages(agentName: string): void {
    for (const key of this.messages.keys()) {
      if (key.endsWith(`-${agentName}`)) {
        this.messages.delete(key);
      }
    }
  }
}

// ============================================================================
// Memory Summarization
// ============================================================================

export interface MemorySummary {
  summary: string;
  keyPoints: string[];
  emotionalTone: string;
  importantEntities: string[];
}

/**
 * Summarize a collection of memories for long-context optimization
 */
export async function summarizeMemories(
  client: OpenRouterClient,
  memories: string[],
  maxLength: number = 500
): Promise<MemorySummary> {
  const prompt = `Summarize these memories concisely (max ${maxLength} words):

${memories.join('\n')}

Provide:
1. A brief summary
2. Key points (3-5 bullet points)
3. Overall emotional tone
4. Important people, places, or things mentioned

Respond in JSON format.`;

  const response = await generateStructured(
    client,
    prompt,
    z.object({
      summary: z.string(),
      keyPoints: z.array(z.string()),
      emotionalTone: z.string(),
      importantEntities: z.array(z.string()),
    })
  );

  return response;
}

// ============================================================================
// Confidence Scoring & Uncertainty
// ============================================================================

export interface ConfidenceScore {
  score: number; // 0-1
  reasoning: string;
  uncertaintyFactors: string[];
}

/**
 * Ask the model to assess its confidence in a response
 */
export async function assessConfidence(
  client: OpenRouterClient,
  question: string,
  answer: string
): Promise<ConfidenceScore> {
  const prompt = `Given this question and answer, assess how confident you are:

Question: ${question}
Answer: ${answer}

Rate your confidence from 0 (not confident) to 1 (very confident).
Explain your reasoning and any uncertainty factors.

Respond in JSON format.`;

  const response = await generateStructured(
    client,
    prompt,
    z.object({
      score: z.number().min(0).max(1),
      reasoning: z.string(),
      uncertaintyFactors: z.array(z.string()),
    })
  );

  return response;
}

// ============================================================================
// Exports
// ============================================================================

export const modernLLM = {
  StreamingLLMClient,
  generateWithCoT,
  generateStructured,
  AgentCommunicationHub,
  summarizeMemories,
  assessConfidence,
  executeFunctionCall,
};

export default modernLLM;
