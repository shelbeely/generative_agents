/**
 * Maze System
 * 
 * Represents the simulated world as a 2D tile-based grid.
 * Ported from maze.py
 * 
 * The maze loads from CSV/JSON files and provides:
 * - Tile-based world representation
 * - Collision detection
 * - World/Sector/Arena/GameObject hierarchy
 * - Address-to-coordinate mapping
 * - Event tracking per tile
 */

import { readFileToList } from '../utils/globalMethods.js';
import { resolvedPaths } from '../config.js';
import { readFile } from 'fs/promises';
import { join } from 'path';

export interface TileDetails {
  world: string;
  sector: string;
  arena: string;
  game_object: string;
  spawning_location: string;
  collision: boolean;
  events: Set<TileEvent>;
}

export type TileEvent = [string, unknown, unknown, unknown];

export interface MazeMetaInfo {
  world_name: string;
  maze_width: number;
  maze_height: number;
  sq_tile_size: number;
  special_constraint: string;
}

export class Maze {
  mazeName: string;
  mazeWidth: number;
  mazeHeight: number;
  sqTileSize: number;
  specialConstraint: string;

  // 2D array of tile details [row][col]
  tiles: TileDetails[][] = [];

  // Collision maze (for display/debug)
  collisionMaze: string[][] = [];

  // Address to tile coordinates mapping
  // e.g., 'double studio:recreation:pool table' => Set of (x, y) coordinates
  addressTiles: Map<string, Set<[number, number]>> = new Map();

  constructor(mazeName: string) {
    this.mazeName = mazeName;
    this.mazeWidth = 0;
    this.mazeHeight = 0;
    this.sqTileSize = 32;
    this.specialConstraint = '';
  }

  /**
   * Load maze data from files
   * This is async because we need to read files
   */
  async load(): Promise<void> {
    const envMatrix = resolvedPaths.envMatrix;

    // Read meta info
    const metaInfoPath = join(envMatrix, 'maze_meta_info.json');
    const metaInfoContent = await readFile(metaInfoPath, 'utf-8');
    const metaInfo: MazeMetaInfo = JSON.parse(metaInfoContent);

    this.mazeWidth = metaInfo.maze_width;
    this.mazeHeight = metaInfo.maze_height;
    this.sqTileSize = metaInfo.sq_tile_size;
    this.specialConstraint = metaInfo.special_constraint;

    // Read special blocks
    const blocksFolder = join(envMatrix, 'special_blocks');

    // World blocks
    const wbPath = join(blocksFolder, 'world_blocks.csv');
    const wbRows = await readFileToList(wbPath, { header: false });
    const wbRowsArray = wbRows as string[][];
    const wb = wbRowsArray[0]?.[wbRowsArray[0].length - 1] ?? '';

    // Sector blocks
    const sbPath = join(blocksFolder, 'sector_blocks.csv');
    const sbRows = await readFileToList(sbPath, { header: false });
    const sbDict = new Map<string, string>();
    for (const row of sbRows as string[][]) {
      sbDict.set(row[0]!, row[row.length - 1]!);
    }

    // Arena blocks
    const abPath = join(blocksFolder, 'arena_blocks.csv');
    const abRows = await readFileToList(abPath, { header: false });
    const abDict = new Map<string, string>();
    for (const row of abRows as string[][]) {
      abDict.set(row[0]!, row[row.length - 1]!);
    }

    // Game object blocks
    const gobPath = join(blocksFolder, 'game_object_blocks.csv');
    const gobRows = await readFileToList(gobPath, { header: false });
    const gobDict = new Map<string, string>();
    for (const row of gobRows as string[][]) {
      gobDict.set(row[0]!, row[row.length - 1]!);
    }

    // Spawning location blocks
    const slbPath = join(blocksFolder, 'spawning_location_blocks.csv');
    const slbRows = await readFileToList(slbPath, { header: false });
    const slbDict = new Map<string, string>();
    for (const row of slbRows as string[][]) {
      slbDict.set(row[0]!, row[row.length - 1]!);
    }

    // Read maze matrices
    const mazeFolder = join(envMatrix, 'maze');

    const cmPath = join(mazeFolder, 'collision_maze.csv');
    const collisionMazeRaw = ((await readFileToList(cmPath, { header: false })) as string[][])[0]!;

    const smPath = join(mazeFolder, 'sector_maze.csv');
    const sectorMazeRaw = ((await readFileToList(smPath, { header: false })) as string[][])[0]!;

    const amPath = join(mazeFolder, 'arena_maze.csv');
    const arenaMazeRaw = ((await readFileToList(amPath, { header: false })) as string[][])[0]!;

    const gomPath = join(mazeFolder, 'game_object_maze.csv');
    const gameObjectMazeRaw = ((await readFileToList(gomPath, {
      header: false,
    })) as string[][])[0]!;

    const slmPath = join(mazeFolder, 'spawning_location_maze.csv');
    const spawningLocationMazeRaw = ((await readFileToList(slmPath, {
      header: false,
    })) as string[][])[0]!;

    // Convert 1D arrays to 2D matrices
    this.collisionMaze = [];
    const sectorMaze: string[][] = [];
    const arenaMaze: string[][] = [];
    const gameObjectMaze: string[][] = [];
    const spawningLocationMaze: string[][] = [];

    for (let i = 0; i < collisionMazeRaw.length; i += this.mazeWidth) {
      const tw = this.mazeWidth;
      this.collisionMaze.push(collisionMazeRaw.slice(i, i + tw));
      sectorMaze.push(sectorMazeRaw.slice(i, i + tw));
      arenaMaze.push(arenaMazeRaw.slice(i, i + tw));
      gameObjectMaze.push(gameObjectMazeRaw.slice(i, i + tw));
      spawningLocationMaze.push(spawningLocationMazeRaw.slice(i, i + tw));
    }

    // Build tiles array
    this.tiles = [];
    for (let i = 0; i < this.mazeHeight; i++) {
      const row: TileDetails[] = [];
      for (let j = 0; j < this.mazeWidth; j++) {
        const tileDetails: TileDetails = {
          world: wb,
          sector: sbDict.get(sectorMaze[i]![j]!) ?? '',
          arena: abDict.get(arenaMaze[i]![j]!) ?? '',
          game_object: gobDict.get(gameObjectMaze[i]![j]!) ?? '',
          spawning_location: slbDict.get(spawningLocationMaze[i]![j]!) ?? '',
          collision: this.collisionMaze[i]![j] !== '0',
          events: new Set(),
        };
        row.push(tileDetails);
      }
      this.tiles.push(row);
    }

    // Add game object events to tiles
    for (let i = 0; i < this.mazeHeight; i++) {
      for (let j = 0; j < this.mazeWidth; j++) {
        const tile = this.tiles[i]![j]!;
        if (tile.game_object) {
          const objectName = [tile.world, tile.sector, tile.arena, tile.game_object].join(':');
          const goEvent: TileEvent = [objectName, null, null, null];
          tile.events.add(goEvent);
        }
      }
    }

    // Build address_tiles reverse mapping
    this.addressTiles = new Map();
    for (let i = 0; i < this.mazeHeight; i++) {
      for (let j = 0; j < this.mazeWidth; j++) {
        const tile = this.tiles[i]![j]!;
        const addresses: string[] = [];

        if (tile.sector) {
          addresses.push(`${tile.world}:${tile.sector}`);
        }
        if (tile.arena) {
          addresses.push(`${tile.world}:${tile.sector}:${tile.arena}`);
        }
        if (tile.game_object) {
          addresses.push(`${tile.world}:${tile.sector}:${tile.arena}:${tile.game_object}`);
        }
        if (tile.spawning_location) {
          addresses.push(`<spawn_loc>${tile.spawning_location}`);
        }

        for (const address of addresses) {
          if (!this.addressTiles.has(address)) {
            this.addressTiles.set(address, new Set());
          }
          this.addressTiles.get(address)!.add([j, i]); // Note: x=j, y=i
        }
      }
    }
  }

  /**
   * Turn pixel coordinate to tile coordinate
   */
  turnCoordinateToTile(pxCoordinate: [number, number]): [number, number] {
    const x = Math.ceil(pxCoordinate[0] / this.sqTileSize);
    const y = Math.ceil(pxCoordinate[1] / this.sqTileSize);
    return [x, y];
  }

  /**
   * Access tile details at given coordinate
   * @param tile [x, y] coordinate
   */
  accessTile(tile: [number, number]): TileDetails | undefined {
    const [x, y] = tile;
    if (y < 0 || y >= this.mazeHeight || x < 0 || x >= this.mazeWidth) {
      return undefined;
    }
    return this.tiles[y]?.[x];
  }

  /**
   * Get tile path string address
   * @param tile [x, y] coordinate
   * @param level world, sector, arena, or game_object
   */
  getTilePath(tile: [number, number], level: 'world' | 'sector' | 'arena' | 'game_object'): string {
    const tileDetails = this.accessTile(tile);
    if (!tileDetails) return '';

    let path = tileDetails.world;
    if (level === 'world') return path;

    path += `:${tileDetails.sector}`;
    if (level === 'sector') return path;

    path += `:${tileDetails.arena}`;
    if (level === 'arena') return path;

    path += `:${tileDetails.game_object}`;
    return path;
  }

  /**
   * Get nearby tiles within vision radius (square boundary)
   */
  getNearbyTiles(tile: [number, number], visionR: number): [number, number][] {
    const [x, y] = tile;
    const nearbyTiles: [number, number][] = [];

    for (let i = y - visionR; i <= y + visionR; i++) {
      for (let j = x - visionR; j <= x + visionR; j++) {
        if (i >= 0 && i < this.mazeHeight && j >= 0 && j < this.mazeWidth) {
          nearbyTiles.push([j, i]);
        }
      }
    }

    return nearbyTiles;
  }

  /**
   * Get tiles for a given address
   */
  getTilesForAddress(address: string): Set<[number, number]> {
    return this.addressTiles.get(address) ?? new Set();
  }

  /**
   * Check if tile is collision
   */
  isCollision(tile: [number, number]): boolean {
    const tileDetails = this.accessTile(tile);
    return tileDetails?.collision ?? true; // Default to collision if out of bounds
  }

  /**
   * Add an event to a tile
   */
  addEvent(tile: [number, number], event: TileEvent): void {
    const tileDetails = this.accessTile(tile);
    if (tileDetails) {
      tileDetails.events.add(event);
    }
  }

  /**
   * Remove an event from a tile
   */
  removeEvent(tile: [number, number], event: TileEvent): void {
    const tileDetails = this.accessTile(tile);
    if (tileDetails) {
      tileDetails.events.delete(event);
    }
  }

  /**
   * Get all events at a tile
   */
  getEvents(tile: [number, number]): Set<TileEvent> {
    const tileDetails = this.accessTile(tile);
    return tileDetails?.events ?? new Set();
  }

  /**
   * Check if coordinates are within maze bounds
   */
  isInBounds(tile: [number, number]): boolean {
    const [x, y] = tile;
    return x >= 0 && x < this.mazeWidth && y >= 0 && y < this.mazeHeight;
  }
}

/**
 * Factory function to create and load a maze
 */
export async function createMaze(mazeName: string): Promise<Maze> {
  const maze = new Maze(mazeName);
  await maze.load();
  return maze;
}
