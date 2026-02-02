/**
 * Pathfinding Algorithms
 * 
 * Implements various pathfinding algorithms for agent movement in the maze.
 * Ported from path_finder.py
 * 
 * Main algorithm: Breadth-First Search (BFS) for shortest path
 */

/**
 * Simple BFS pathfinding (path_finder_v2 from Python)
 * Finds shortest path from start to end avoiding collisions
 * 
 * @param maze 2D collision maze (0 = walkable, 1 = blocked)
 * @param start Start position [row, col]
 * @param end End position [row, col]
 * @returns Array of positions forming the path, or empty array if no path
 */
function pathFinderV2(
  maze: number[][],
  start: [number, number],
  end: [number, number]
): [number, number][] {
  const height = maze.length;
  const width = maze[0]?.length ?? 0;

  // Create distance matrix
  const distanceMatrix: number[][] = [];
  for (let i = 0; i < height; i++) {
    distanceMatrix.push(new Array(width).fill(0));
  }

  // Set start position
  const [startRow, startCol] = start;
  distanceMatrix[startRow]![startCol] = 1;

  // BFS to fill distance matrix
  let k = 0;
  const maxIterations = 150; // Safety limit
  let iterations = 0;

  const [endRow, endCol] = end;

  while (distanceMatrix[endRow]![endCol] === 0 && iterations < maxIterations) {
    k++;
    makeStep(maze, distanceMatrix, k);
    iterations++;
  }

  // If no path found
  if (distanceMatrix[endRow]![endCol] === 0) {
    return [];
  }

  // Backtrack to find path
  let i = endRow;
  let j = endCol;
  k = distanceMatrix[i]![j]!;
  const thePath: [number, number][] = [[i, j]];

  while (k > 1) {
    // Check all 4 directions for k-1
    if (i > 0 && distanceMatrix[i - 1]![j] === k - 1) {
      i = i - 1;
      thePath.push([i, j]);
      k--;
    } else if (j > 0 && distanceMatrix[i]![j - 1] === k - 1) {
      j = j - 1;
      thePath.push([i, j]);
      k--;
    } else if (i < height - 1 && distanceMatrix[i + 1]![j] === k - 1) {
      i = i + 1;
      thePath.push([i, j]);
      k--;
    } else if (j < width - 1 && distanceMatrix[i]![j + 1] === k - 1) {
      j = j + 1;
      thePath.push([i, j]);
      k--;
    } else {
      // Shouldn't happen, but break if stuck
      break;
    }
  }

  thePath.reverse();
  return thePath;
}

/**
 * Helper function for BFS
 * Propagates distance value to adjacent walkable cells
 */
function makeStep(collisionMaze: number[][], distanceMatrix: number[][], k: number): void {
  const height = collisionMaze.length;
  const width = collisionMaze[0]?.length ?? 0;

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (distanceMatrix[i]![j] === k) {
        // Check up
        if (i > 0 && distanceMatrix[i - 1]![j] === 0 && collisionMaze[i - 1]![j] === 0) {
          distanceMatrix[i - 1]![j] = k + 1;
        }
        // Check left
        if (j > 0 && distanceMatrix[i]![j - 1] === 0 && collisionMaze[i]![j - 1] === 0) {
          distanceMatrix[i]![j - 1] = k + 1;
        }
        // Check down
        if (i < height - 1 && distanceMatrix[i + 1]![j] === 0 && collisionMaze[i + 1]![j] === 0) {
          distanceMatrix[i + 1]![j] = k + 1;
        }
        // Check right
        if (j < width - 1 && distanceMatrix[i]![j + 1] === 0 && collisionMaze[i]![j + 1] === 0) {
          distanceMatrix[i]![j + 1] = k + 1;
        }
      }
    }
  }
}

/**
 * Main pathfinder function
 * Converts between (x,y) and (row,col) coordinates
 * 
 * @param maze 2D array where each element is checked against collisionChar
 * @param start Start position [x, y]
 * @param end End position [x, y]
 * @param collisionChar String value that represents collision
 * @returns Path as array of [x, y] coordinates
 */
export function pathFinder(
  maze: string[][],
  start: [number, number],
  end: [number, number],
  collisionChar: string
): [number, number][] {
  // Convert maze to 0/1 collision matrix
  const collisionMaze: number[][] = [];
  for (const row of maze) {
    const newRow: number[] = [];
    for (const cell of row) {
      newRow.push(cell === collisionChar ? 1 : 0);
    }
    collisionMaze.push(newRow);
  }

  // Convert (x, y) to (row, col) for algorithm
  const startRowCol: [number, number] = [start[1], start[0]];
  const endRowCol: [number, number] = [end[1], end[0]];

  // Find path in (row, col) space
  const pathRowCol = pathFinderV2(collisionMaze, startRowCol, endRowCol);

  // Convert back to (x, y)
  const pathXY: [number, number][] = [];
  for (const [row, col] of pathRowCol) {
    pathXY.push([col, row]);
  }

  return pathXY;
}

/**
 * Find closest coordinate to current position
 * 
 * @param currCoordinate Current position [x, y]
 * @param targetCoordinates Array of target positions
 * @returns Closest target coordinate
 */
export function closestCoordinate(
  currCoordinate: [number, number],
  targetCoordinates: [number, number][]
): [number, number] | null {
  if (targetCoordinates.length === 0) {
    return null;
  }

  let minDist = Infinity;
  let closestCoord: [number, number] | null = null;

  for (const target of targetCoordinates) {
    const dx = target[0] - currCoordinate[0];
    const dy = target[1] - currCoordinate[1];
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < minDist) {
      minDist = dist;
      closestCoord = target;
    }
  }

  return closestCoord;
}

/**
 * Calculate Euclidean distance between two points
 */
export function distance(a: [number, number], b: [number, number]): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate Manhattan distance between two points
 */
export function manhattanDistance(a: [number, number], b: [number, number]): number {
  return Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
}

/**
 * Check if a path is valid (no collisions)
 */
export function isPathValid(
  path: [number, number][],
  maze: string[][],
  collisionChar: string
): boolean {
  for (const [x, y] of path) {
    if (y < 0 || y >= maze.length || x < 0 || x >= (maze[0]?.length ?? 0)) {
      return false;
    }
    if (maze[y]![x] === collisionChar) {
      return false;
    }
  }
  return true;
}
