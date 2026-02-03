/**
 * Perceive Module
 * 
 * Handles perception of events and spatial information around the agent.
 * Ported from perceive.py
 * 
 * Key functions:
 * - Perceive events within vision radius
 * - Update spatial memory with nearby locations
 * - Filter by attention bandwidth
 * - Calculate poignancy scores for events
 */

import { ConceptNodeImpl, AssociativeMemory, SpatialMemory } from '../memory/memoryStructures.js';
import { Scratch } from '../memory/scratch.js';
import { Maze, TileEvent } from '../maze.js';

/**
 * Generate poignancy score for an event
 * Poignancy measures the emotional importance of an event (1-10 scale)
 * 
 * @param eventType - Type of event: 'event' or 'chat'
 * @param description - Event description
 * @returns Poignancy score (1-10)
 */
export async function generatePoignancyScore(
  eventType: 'event' | 'chat',
  description: string
): Promise<number> {
  // Idle events have low poignancy
  if (description.includes('is idle')) {
    return 1;
  }

  // TODO: Implement GPT-based poignancy scoring
  // For now, return a moderate default value
  if (eventType === 'event') {
    return 5;
  } else if (eventType === 'chat') {
    return 7; // Chats are generally more important
  }
  
  return 5;
}

/**
 * Get embedding vector for text
 * TODO: Implement actual embedding generation (using OpenAI or local model)
 * 
 * @param _text - Text to embed
 * @returns Embedding vector
 */
async function getEmbedding(_text: string): Promise<number[]> {
  // TODO: Implement embedding generation
  // For now, return a mock embedding
  return new Array(1536).fill(0).map(() => Math.random());
}

/**
 * Perceive events and spatial information around the persona
 * 
 * This function:
 * 1. Perceives nearby spatial locations (world/sector/arena/objects)
 * 2. Perceives events happening within vision radius
 * 3. Filters events by attention bandwidth
 * 4. Stores new events in associative memory
 * 
 * @param scratch - Persona's scratch (working memory)
 * @param sMem - Spatial memory
 * @param aMem - Associative memory
 * @param maze - The world maze
 * @param personaName - Name of the persona
 * @param embeddings - Cache of embeddings (embeddingKey -> vector)
 * @param chat - Optional chat data if persona is chatting
 * @returns List of newly perceived event nodes
 */
export async function perceive(
  scratch: Scratch,
  sMem: SpatialMemory,
  aMem: AssociativeMemory,
  maze: Maze,
  personaName: string,
  embeddings: Map<string, number[]>,
  chat?: any
): Promise<ConceptNodeImpl[]> {
  // PERCEIVE SPACE
  // Get nearby tiles within vision radius
  const nearbyTiles = maze.getNearbyTiles(scratch.currTile, scratch.visionR);

  // Store perceived spatial locations in spatial memory tree
  for (const tile of nearbyTiles) {
    const tileDetails = maze.accessTile(tile);
    if (!tileDetails) continue;

    const { world, sector, arena, game_object } = tileDetails;

    if (world) {
      if (sector) {
        if (arena) {
          sMem.addPath(world, sector, arena, game_object || undefined);
        }
      }
    }
  }

  // PERCEIVE EVENTS
  // Get current arena path to filter events
  const currArenaPath = maze.getTilePath(scratch.currTile, 'arena');

  // Track perceived events to avoid duplicates
  const perceivedEventsSet = new Set<TileEvent>();
  const perceivedEventsList: Array<[number, TileEvent]> = [];

  // Collect events from nearby tiles
  for (const tile of nearbyTiles) {
    const tileDetails = maze.accessTile(tile);
    if (!tileDetails?.events || tileDetails.events.size === 0) continue;

    // Only perceive events in the same arena
    const tileArenaPath = maze.getTilePath(tile, 'arena');
    if (tileArenaPath !== currArenaPath) continue;

    // Calculate distance from current tile
    const dist = Math.sqrt(
      Math.pow(tile[0] - scratch.currTile[0], 2) +
      Math.pow(tile[1] - scratch.currTile[1], 2)
    );

    // Add events with distance for sorting
    for (const event of tileDetails.events) {
      if (!perceivedEventsSet.has(event)) {
        perceivedEventsList.push([dist, event]);
        perceivedEventsSet.add(event);
      }
    }
  }

  // Sort by distance and take only attBandwidth closest events
  perceivedEventsList.sort((a, b) => a[0] - b[0]);
  const perceivedEvents: TileEvent[] = perceivedEventsList
    .slice(0, scratch.attBandwidth)
    .map(([_, event]) => event);

  // STORE EVENTS IN MEMORY
  const retEvents: ConceptNodeImpl[] = [];

  for (const pEvent of perceivedEvents) {
    let [s, p, o, desc] = pEvent;

    // Default to idle if no predicate
    if (!p) {
      p = 'is';
      o = 'idle';
      desc = 'idle';
    }

    // Format description
    const subjectName = typeof s === 'string' && s.includes(':') 
      ? s.split(':').pop()! 
      : String(s);
    const fullDesc = `${subjectName} is ${desc}`;

    // Check if this is a new event (not in recent memory)
    const latestEvents = getLatestEvents(aMem, scratch.retention);
    const isNewEvent = !latestEvents.some(
      (e) => e[0] === s && e[1] === p && e[2] === o
    );

    if (isNewEvent) {
      // Extract keywords from subject and object
      const keywords = new Set<string>();
      const subj = typeof s === 'string' && s.includes(':') ? (s.split(':').pop() ?? String(s)) : String(s);
      const obj = typeof o === 'string' && o.includes(':') ? (o.split(':').pop() ?? String(o)) : String(o);
      keywords.add(subj);
      keywords.add(obj);

      // Get embedding for description
      let descEmbeddingIn = fullDesc;
      if (fullDesc.includes('(')) {
        const match = fullDesc.match(/\(([^)]+)\)/);
        if (match && match[1]) {
          descEmbeddingIn = match[1].trim();
        }
      }

      let eventEmbedding: number[];
      if (embeddings.has(descEmbeddingIn)) {
        eventEmbedding = embeddings.get(descEmbeddingIn)!;
      } else {
        eventEmbedding = await getEmbedding(descEmbeddingIn);
        embeddings.set(descEmbeddingIn, eventEmbedding);
      }

      // Calculate poignancy
      const eventPoignancy = await generatePoignancyScore('event', descEmbeddingIn);

      // Handle chat events
      if (s === personaName && p === 'chat with' && chat) {
        const chatDesc = scratch.actDescription;
        
        let chatEmbedding: number[];
        if (embeddings.has(chatDesc)) {
          chatEmbedding = embeddings.get(chatDesc)!;
        } else {
          chatEmbedding = await getEmbedding(chatDesc);
          embeddings.set(chatDesc, chatEmbedding);
        }

        const chatPoignancy = await generatePoignancyScore('chat', chatDesc);
        
        // Create chat node
        const chatNode = new ConceptNodeImpl({
          subject: String(s),
          predicate: String(p),
          object: String(o),
          description: chatDesc,
          createdAt: scratch.currTime,
          keywords,
          poignancy: chatPoignancy,
          embedding: chatEmbedding,
          embeddingKey: chatDesc,
          nodeType: 'chat',
        });

        aMem.addNode(chatNode);
      }

      // Create and store event node
      const eventNode = new ConceptNodeImpl({
        subject: String(s),
        predicate: String(p),
        object: String(o),
        description: fullDesc,
        createdAt: scratch.currTime,
        keywords,
        poignancy: eventPoignancy,
        embedding: eventEmbedding,
        embeddingKey: descEmbeddingIn,
        nodeType: 'event',
      });

      aMem.addNode(eventNode);
      retEvents.push(eventNode);
    }
  }

  return retEvents;
}

/**
 * Get latest events from memory as triples
 * Used to check if an event is new
 * 
 * @param aMem - Associative memory
 * @param count - Number of recent events to retrieve
 * @returns Array of event triples [subject, predicate, object]
 */
function getLatestEvents(
  aMem: AssociativeMemory,
  count: number
): Array<[unknown, unknown, unknown]> {
  const events = aMem.getNodesByType('event');
  const sorted = events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const latest = sorted.slice(0, count);
  return latest.map((node) => [node.subject, node.predicate, node.object]);
}
