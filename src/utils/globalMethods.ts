/**
 * Global utility methods
 * Ported from Python global_methods.py
 */

import { writeFile, mkdir, readFile, access, copyFile, readdir, stat } from 'fs/promises';
import { createWriteStream } from 'fs';
import { dirname, join } from 'path';
import { constants } from 'fs';

/**
 * Creates a folder if it doesn't exist
 * Returns true if a new folder was created, false otherwise
 */
export async function createFolderIfNotThere(currPath: string): Promise<boolean> {
  const pathParts = currPath.split('/');

  // Check if path is a file or folder
  let folderPath = currPath;
  if (pathParts.length > 1 && pathParts[pathParts.length - 1]!.includes('.')) {
    // Path points to a file, get the directory
    folderPath = dirname(currPath);
  }

  try {
    await access(folderPath, constants.F_OK);
    return false; // Folder already exists
  } catch {
    await mkdir(folderPath, { recursive: true });
    return true; // New folder created
  }
}

/**
 * Write a 2D array to a CSV file
 */
export async function writeListOfListToCsv(
  currListOfList: string[][],
  outfile: string
): Promise<void> {
  await createFolderIfNotThere(outfile);

  const csvContent = currListOfList.map((row) => row.join(',')).join('\n');
  await writeFile(outfile, csvContent, 'utf-8');
}

/**
 * Append a single line to a CSV file
 */
export async function writeListToCsvLine(lineList: string[], outfile: string): Promise<void> {
  await createFolderIfNotThere(outfile);

  const csvLine = lineList.join(',') + '\n';

  // Append to file or create new file
  const stream = createWriteStream(outfile, { flags: 'a' });
  stream.write(csvLine);
  stream.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

/**
 * Read a CSV file into a 2D array
 */
export async function readFileToList(
  currFile: string,
  options: { header?: boolean; stripTrail?: boolean } = {}
): Promise<string[][] | { header: string[]; rows: string[][] }> {
  const { header = false, stripTrail = true } = options;

  const content = await readFile(currFile, 'utf-8');
  const lines = content.split('\n').filter((line) => line.trim() !== '');

  const rows = lines.map((line) => {
    let values = line.split(',');
    if (stripTrail) {
      values = values.map((v) => v.trim());
    }
    return values;
  });

  if (header && rows.length > 0) {
    const headerRow = rows[0]!;
    const dataRows = rows.slice(1);
    return { header: headerRow, rows: dataRows };
  }

  return rows;
}

/**
 * Check if a file or folder exists
 */
export async function checkIfFileExists(currFile: string): Promise<boolean> {
  try {
    await access(currFile, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Copy anything (file or directory) from source to destination
 * Similar to shutil.copytree in Python
 */
export async function copyAnything(src: string, dst: string): Promise<void> {
  const srcStat = await stat(src);

  if (srcStat.isDirectory()) {
    // Create destination directory
    await mkdir(dst, { recursive: true });

    // Read all items in source directory
    const items = await readdir(src);

    // Copy each item recursively
    for (const item of items) {
      const srcPath = join(src, item);
      const dstPath = join(dst, item);
      await copyAnything(srcPath, dstPath);
    }
  } else {
    // Create parent directory if it doesn't exist
    await createFolderIfNotThere(dst);

    // Copy file
    await copyFile(src, dst);
  }
}

/**
 * Find subdirectories in a directory
 */
export async function findFiledir(currDir: string): Promise<string[]> {
  const items = await readdir(currDir, { withFileTypes: true });
  return items.filter((item) => item.isDirectory()).map((item) => item.name);
}

/**
 * Find files in a directory (non-recursive)
 */
export async function findFilename(currDir: string, endsWith: string = ''): Promise<string[]> {
  const items = await readdir(currDir, { withFileTypes: true });
  let files = items.filter((item) => item.isFile()).map((item) => item.name);

  if (endsWith) {
    files = files.filter((file) => file.endsWith(endsWith));
  }

  return files;
}

/**
 * Get a random alphanumeric string
 */
export function getRandomAlphanumeric(minLength: number = 6, maxLength: number = 6): string {
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i]! * vecB[i]!;
    normA += vecA[i]! * vecA[i]!;
    normB += vecB[i]! * vecB[i]!;
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Normalize a vector to unit length
 */
export function normalizeVector(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));

  if (norm === 0) {
    return vec;
  }

  return vec.map((val) => val / norm);
}

/**
 * Convert datetime string to Date object
 * Supports format: "Month Day, Year, HH:MM:SS" e.g. "June 25, 2022, 00:00:00"
 */
export function parseDatetime(datetimeStr: string): Date {
  return new Date(datetimeStr);
}

/**
 * Format a Date object to datetime string
 * Format: "Month Day, Year, HH:MM:SS"
 */
export function formatDatetime(date: Date): string {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${month} ${day}, ${year}, ${hours}:${minutes}:${seconds}`;
}

/**
 * Add seconds to a Date object
 */
export function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}
