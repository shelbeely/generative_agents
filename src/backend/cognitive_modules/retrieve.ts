/**
 * Retrieve Module
 * 
 * Handles retrieval of relevant memories based on recency, importance, and relevance.
 * Ported from retrieve.py
 * 
 * Key functions:
 * - Retrieve relevant events and thoughts
 * - Calculate recency, importance, and relevance scores
 * - Combine scores to rank memories
 */

import { ConceptNodeImpl, AssociativeMemory } from '../memory/memoryStructures.js';
import { Scratch } from '../memory/scratch.js';

/**
 * Calculate cosine similarity between two vectors
 * 
 * @param a - First vector
 * @param b - Second vector
 * @returns Cosine similarity score (0-1)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Normalize dictionary values to target range
 * 
 * @param dict - Dictionary of node ID to score
 * @param targetMin - Minimum value in target range
 * @param targetMax - Maximum value in target range
 * @returns Normalized dictionary
 */
export function normalizeDictFloats(
  dict: Map<number, number>,
  targetMin: number,
  targetMax: number
): Map<number, number> {
  const values = Array.from(dict.values());
  if (values.length === 0) {
    return new Map();
  }

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const rangeVal = maxVal - minVal;

  const normalized = new Map<number, number>();

  if (rangeVal === 0) {
    // All values are the same, set to midpoint
    const midpoint = (targetMax + targetMin) / 2;
    for (const [key] of dict) {
      normalized.set(key, midpoint);
    }
  } else {
    // Normalize to target range
    for (const [key, val] of dict) {
      normalized.set(
        key,
        ((val - minVal) * (targetMax - targetMin)) / rangeVal + targetMin
      );
    }
  }

  return normalized;
}

/**
 * Get top N highest values from dictionary
 * 
 * @param dict - Dictionary of node ID to score
 * @param n - Number of top values to return
 * @returns Dictionary with top N entries
 */
export function topHighestXValues(
  dict: Map<number, number>,
  n: number
): Map<number, number> {
  const sorted = Array.from(dict.entries()).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, n);
  return new Map(top);
}

/**
 * Extract recency scores for nodes
 * More recent nodes get higher scores using exponential decay
 * 
 * @param _scratch - Persona's scratch memory (unused for now)
 * @param nodes - List of nodes in chronological order (oldest first)
 * @returns Map of node ID to recency score
 */
export function extractRecency(
  _scratch: Scratch,
  nodes: ConceptNodeImpl[]
): Map<number, number> {
  const recencyDecay = 0.995; // Default decay factor (from scratch if available)
  const recencyScores = new Map<number, number>();

  // Calculate recency values: more recent = higher score
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!;
    const recencyVal = Math.pow(recencyDecay, nodes.length - i);
    recencyScores.set(node.nodeCount, recencyVal);
  }

  return recencyScores;
}

/**
 * Extract importance scores for nodes
 * Uses the poignancy value stored in each node
 * 
 * @param nodes - List of nodes
 * @returns Map of node ID to importance score
 */
export function extractImportance(nodes: ConceptNodeImpl[]): Map<number, number> {
  const importanceScores = new Map<number, number>();

  for (const node of nodes) {
    importanceScores.set(node.nodeCount, node.poignancy);
  }

  return importanceScores;
}

/**
 * Extract relevance scores for nodes
 * Uses cosine similarity between node embeddings and focal point embedding
 * 
 * @param _aMem - Associative memory (unused for now)
 * @param nodes - List of nodes
 * @param focalPoint - Query string to calculate relevance against
 * @param embeddings - Cache of embeddings
 * @returns Map of node ID to relevance score
 */
export async function extractRelevance(
  _aMem: AssociativeMemory,
  nodes: ConceptNodeImpl[],
  focalPoint: string,
  embeddings: Map<string, number[]>
): Promise<Map<number, number>> {
  // Get embedding for focal point
  let focalEmbedding: number[];
  if (embeddings.has(focalPoint)) {
    focalEmbedding = embeddings.get(focalPoint)!;
  } else {
    focalEmbedding = await getEmbedding(focalPoint);
    embeddings.set(focalPoint, focalEmbedding);
  }

  const relevanceScores = new Map<number, number>();

  for (const node of nodes) {
    const nodeEmbedding = embeddings.get(node.embeddingKey);
    if (nodeEmbedding) {
      const similarity = cosineSimilarity(nodeEmbedding, focalEmbedding);
      relevanceScores.set(node.nodeCount, similarity);
    } else {
      relevanceScores.set(node.nodeCount, 0);
    }
  }

  return relevanceScores;
}

/**
 * Get embedding vector for text
 * TODO: Implement actual embedding generation
 * 
 * @param _text - Text to embed
 * @returns Embedding vector
 */
async function getEmbedding(_text: string): Promise<number[]> {
  // TODO: Implement embedding generation
  return new Array(1536).fill(0).map(() => Math.random());
}

/**
 * Retrieve relevant memories for given focal points
 * 
 * This is the main retrieval function that combines recency, importance, and relevance
 * to retrieve the most relevant memories for planning and reasoning.
 * 
 * @param scratch - Persona's scratch memory
 * @param aMem - Associative memory
 * @param focalPoints - List of query strings to retrieve memories for
 * @param embeddings - Cache of embeddings
 * @param nCount - Number of memories to retrieve per focal point
 * @returns Map of focal point to list of retrieved nodes
 */
export async function retrieve(
  scratch: Scratch,
  aMem: AssociativeMemory,
  focalPoints: string[],
  embeddings: Map<string, number[]>,
  nCount: number = 30
): Promise<Map<string, ConceptNodeImpl[]>> {
  const retrieved = new Map<string, ConceptNodeImpl[]>();

  for (const focalPt of focalPoints) {
    // Get all events and thoughts, excluding idle events
    const allNodes = [
      ...aMem.getNodesByType('event'),
      ...aMem.getNodesByType('thought'),
    ].filter((node) => !node.embeddingKey.includes('idle'));

    // Sort by last accessed time
    const sortedNodes = allNodes.sort(
      (a, b) => a.lastAccessed.getTime() - b.lastAccessed.getTime()
    );

    if (sortedNodes.length === 0) {
      retrieved.set(focalPt, []);
      continue;
    }

    // Calculate component scores
    const recencyOut = extractRecency(scratch, sortedNodes);
    const recencyNorm = normalizeDictFloats(recencyOut, 0, 1);

    const importanceOut = extractImportance(sortedNodes);
    const importanceNorm = normalizeDictFloats(importanceOut, 0, 1);

    const relevanceOut = await extractRelevance(aMem, sortedNodes, focalPt, embeddings);
    const relevanceNorm = normalizeDictFloats(relevanceOut, 0, 1);

    // Combine scores with weights
    // Weights: [recency, relevance, importance] = [0.5, 2, 3]
    const recencyW = 1;
    const relevanceW = 1;
    const importanceW = 1;
    const gw = [0.5, 2, 3]; // Global weights

    const masterScores = new Map<number, number>();
    for (const [nodeId] of recencyNorm) {
      const recency = recencyNorm.get(nodeId) ?? 0;
      const relevance = relevanceNorm.get(nodeId) ?? 0;
      const importance = importanceNorm.get(nodeId) ?? 0;

      const score =
        recencyW * recency * (gw[0] ?? 1) +
        relevanceW * relevance * (gw[1] ?? 1) +
        importanceW * importance * (gw[2] ?? 1);

      masterScores.set(nodeId, score);
    }

    // Get top N nodes
    const topScores = topHighestXValues(masterScores, nCount);
    const masterNodes = Array.from(topScores.keys())
      .map((id) => aMem.getNode(id))
      .filter((node): node is ConceptNodeImpl => node !== undefined);

    // Update last accessed time
    for (const node of masterNodes) {
      node.lastAccessed = scratch.currTime;
    }

    retrieved.set(focalPt, masterNodes);
  }

  return retrieved;
}

/**
 * Simple retrieve function for perceived events
 * Retrieves relevant events and thoughts based on SPO triple
 * 
 * @param aMem - Associative memory
 * @param subject - Subject of the event
 * @param _predicate - Predicate of the event (unused for now)
 * @param object - Object of the event
 * @returns Object with relevant events and thoughts
 */
export function simpleRetrieve(
  aMem: AssociativeMemory,
  subject: string,
  _predicate: string,
  object: string
): {
  events: ConceptNodeImpl[];
  thoughts: ConceptNodeImpl[];
} {
  // Extract keywords from SPO
  const keywords: string[] = [];
  
  if (subject.includes(':')) {
    keywords.push(subject.split(':').pop()!);
  } else {
    keywords.push(subject);
  }
  
  if (object.includes(':')) {
    keywords.push(object.split(':').pop()!);
  } else {
    keywords.push(object);
  }

  // Retrieve events and thoughts by keywords
  const relevantEvents = aMem.retrieveByKeywords(keywords, 'event');
  const relevantThoughts = aMem.retrieveByKeywords(keywords, 'thought');

  return {
    events: relevantEvents,
    thoughts: relevantThoughts,
  };
}
