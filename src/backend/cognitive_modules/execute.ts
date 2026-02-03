/**
 * Execute Module
 * 
 * Handles execution of planned actions by converting action addresses
 * into concrete movement paths using pathfinding.
 * Ported from execute.py
 * 
 * Key functions:
 * - Parse action addresses (world:sector:arena:game_object)
 * - Find target tiles for actions
 * - Use pathfinding to generate movement paths
 * - Handle special cases (persona interaction, waiting, random locations)
 */

import { Scratch } from '../memory/scratch.js';
import { Maze } from '../maze.js';
import { pathFinder } from '../pathfinder.js';

const COLLISION_BLOCK_CHAR = '1';

/**
 * Interface for other personas in the world
 */
export interface PersonaState {
  scratch: Scratch;
  name: string;
}

/**
 * Execute a planned action by finding path to target location
 * 
 * This function takes an action address (e.g., "double studio:bedroom:bed")
 * and converts it into a concrete path of tile coordinates for the persona to follow.
 * 
 * @param scratch - Persona's scratch memory
 * @param maze - The world maze
 * @param personas - Map of all personas in the world
 * @param plan - Action address string (world:sector:arena:game_object)
 * @returns Next tile coordinate to move to
 */
export function execute(
  scratch: Scratch,
  maze: Maze,
  personas: Map<string, PersonaState>,
  plan: string
): [number, number] {
  // Handle random actions - reset path if contains <random> and no planned path
  if (plan.includes('<random>') && scratch.actPath.length === 0) {
    // Path needs to be recalculated
  }

  // Check if we need to set a new path
  const needNewPath = scratch.actPath.length === 0;

  if (needNewPath) {
    let targetTiles: [number, number][] = [];

    // Handle persona interaction: move near target persona
    if (plan.includes('<persona>')) {
      const targetPersonaName = plan.split('<persona>').pop()?.trim();
      if (targetPersonaName) {
        const targetPersona = personas.get(targetPersonaName);
        if (targetPersona) {
          const targetTile = targetPersona.scratch.currTile;
          const potentialPath = pathFinder(
            maze.collisionMaze,
            scratch.currTile,
            targetTile,
            COLLISION_BLOCK_CHAR
          );

          if (potentialPath.length <= 2) {
            // Already adjacent
            targetTiles = [potentialPath[0]!];
          } else {
            // Move to midpoint of path
            const midIdx = Math.floor(potentialPath.length / 2);
            const potential1 = pathFinder(
              maze.collisionMaze,
              scratch.currTile,
              potentialPath[midIdx]!,
              COLLISION_BLOCK_CHAR
            );
            const potential2 = pathFinder(
              maze.collisionMaze,
              scratch.currTile,
              potentialPath[midIdx + 1]!,
              COLLISION_BLOCK_CHAR
            );

            if (potential1.length <= potential2.length) {
              targetTiles = [potentialPath[midIdx]!];
            } else {
              targetTiles = [potentialPath[midIdx + 1]!];
            }
          }
        }
      }
    }
    // Handle waiting: move to specific coordinate
    else if (plan.includes('<waiting>')) {
      const parts = plan.split(' ');
      if (parts.length >= 3) {
        const x = parseInt(parts[1]!);
        const y = parseInt(parts[2]!);
        targetTiles = [[x, y]];
      }
    }
    // Handle random location within an area
    else if (plan.includes('<random>')) {
      const basePlan = plan.split(':').slice(0, -1).join(':');
      const tilesSet = maze.getTilesForAddress(basePlan);
      if (tilesSet.size > 0) {
        const tilesArray = Array.from(tilesSet);
        // Pick a random tile
        const randomTile = tilesArray[Math.floor(Math.random() * tilesArray.length)];
        if (randomTile) {
          targetTiles = [randomTile];
        }
      }
    }
    // Default: navigate to the action address
    else {
      const tilesSet = maze.getTilesForAddress(plan);
      if (tilesSet.size > 0) {
        targetTiles = Array.from(tilesSet);
      } else {
        // Fallback if address not found - stay at current location
        console.warn(`Address not found: ${plan}`);
        targetTiles = [scratch.currTile];
      }
    }

    // Sample a few target tiles if there are many
    if (targetTiles.length > 4) {
      // Randomly sample 4 tiles
      const sampled: [number, number][] = [];
      const indices = new Set<number>();
      while (indices.size < 4 && indices.size < targetTiles.length) {
        indices.add(Math.floor(Math.random() * targetTiles.length));
      }
      for (const idx of indices) {
        sampled.push(targetTiles[idx]!);
      }
      targetTiles = sampled;
    }

    // Try to avoid tiles where other personas are heading
    const personaNames = new Set(personas.keys());
    const newTargetTiles: [number, number][] = [];
    
    for (const tile of targetTiles) {
      const tileDetails = maze.accessTile(tile);
      if (!tileDetails) continue;

      let occupied = false;
      for (const event of tileDetails.events) {
        const eventSubject = event[0];
        if (typeof eventSubject === 'string' && personaNames.has(eventSubject)) {
          occupied = true;
          break;
        }
      }

      if (!occupied) {
        newTargetTiles.push(tile);
      }
    }

    // If all tiles are occupied, use original targets
    if (newTargetTiles.length === 0) {
      targetTiles = targetTiles;
    } else {
      targetTiles = newTargetTiles;
    }

    // Find shortest path to one of the target tiles
    let closestTargetTile: [number, number] | null = null;
    let shortestPath: [number, number][] = [];

    for (const targetTile of targetTiles) {
      const path = pathFinder(
        maze.collisionMaze,
        scratch.currTile,
        targetTile,
        COLLISION_BLOCK_CHAR
      );

      if (!closestTargetTile || path.length < shortestPath.length) {
        closestTargetTile = targetTile;
        shortestPath = path;
      }
    }

    // Set the path (excluding current tile)
    if (shortestPath.length > 0) {
      scratch.actPath = shortestPath.slice(1);
    } else {
      scratch.actPath = [];
    }
  }

  // Get next tile from planned path
  let nextTile = scratch.currTile;
  if (scratch.actPath.length > 0) {
    nextTile = scratch.actPath[0]!;
    scratch.actPath = scratch.actPath.slice(1);
  }

  return nextTile;
}

/**
 * Parse action address into components
 * Address format: "world:sector:arena:game_object"
 * 
 * @param address - Action address string
 * @returns Parsed components
 */
export function parseActionAddress(address: string): {
  world?: string;
  sector?: string;
  arena?: string;
  gameObject?: string;
} {
  const parts = address.split(':');
  
  return {
    world: parts[0],
    sector: parts[1],
    arena: parts[2],
    gameObject: parts[3],
  };
}

/**
 * Check if address is valid in the maze
 * 
 * @param maze - The world maze
 * @param address - Action address string
 * @returns True if address exists in maze
 */
export function isValidAddress(maze: Maze, address: string): boolean {
  return maze.getTilesForAddress(address).size > 0;
}
