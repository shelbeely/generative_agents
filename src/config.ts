/**
 * Configuration module for Generative Agents
 * Loads environment variables and provides typed configuration
 */

import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenvConfig();

export interface Config {
  // OpenRouter API Configuration
  openrouter: {
    apiKey: string;
    baseUrl: string;
    defaultModel: string;
    fastModel: string;
    advancedModel: string;
    visionModel: string;
  };

  // Application Configuration
  app: {
    keyOwner: string;
    debug: boolean;
  };

  // Server Configuration
  server: {
    backendPort: number;
    frontendPort: number;
  };

  // File Paths
  paths: {
    mazeAssetsLoc: string;
    envMatrix: string;
    envVisuals: string;
    fsStorage: string;
    fsTempStorage: string;
  };

  // Game Configuration
  game: {
    collisionBlockId: string;
    secPerStep: number;
  };
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

function getEnvVarAsNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return parsed;
}

function getEnvVarAsBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true';
}

export const config: Config = {
  openrouter: {
    apiKey: getEnvVar('OPENROUTER_API_KEY'),
    baseUrl: getEnvVar('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
    defaultModel: getEnvVar('DEFAULT_MODEL', 'google/gemini-3-flash'),
    fastModel: getEnvVar('FAST_MODEL', 'google/gemini-3-flash'),
    advancedModel: getEnvVar('ADVANCED_MODEL', 'google/gemini-3-pro'),
    visionModel: getEnvVar('VISION_MODEL', 'google/gemini-3-flash'),
  },

  app: {
    keyOwner: getEnvVar('KEY_OWNER', 'Unknown'),
    debug: getEnvVarAsBoolean('DEBUG', false),
  },

  server: {
    backendPort: getEnvVarAsNumber('BACKEND_PORT', 3000),
    frontendPort: getEnvVarAsNumber('FRONTEND_PORT', 8000),
  },

  paths: {
    mazeAssetsLoc: getEnvVar(
      'MAZE_ASSETS_LOC',
      'environment/frontend_server/static_dirs/assets'
    ),
    envMatrix: getEnvVar(
      'ENV_MATRIX',
      'environment/frontend_server/static_dirs/assets/the_ville/matrix'
    ),
    envVisuals: getEnvVar(
      'ENV_VISUALS',
      'environment/frontend_server/static_dirs/assets/the_ville/visuals'
    ),
    fsStorage: getEnvVar('FS_STORAGE', 'environment/frontend_server/storage'),
    fsTempStorage: getEnvVar('FS_TEMP_STORAGE', 'environment/frontend_server/temp_storage'),
  },

  game: {
    collisionBlockId: getEnvVar('COLLISION_BLOCK_ID', '32125'),
    secPerStep: getEnvVarAsNumber('SEC_PER_STEP', 10),
  },
};

// Resolve paths relative to project root
const projectRoot = resolve(process.cwd());

export const resolvedPaths = {
  mazeAssetsLoc: resolve(projectRoot, config.paths.mazeAssetsLoc),
  envMatrix: resolve(projectRoot, config.paths.envMatrix),
  envVisuals: resolve(projectRoot, config.paths.envVisuals),
  fsStorage: resolve(projectRoot, config.paths.fsStorage),
  fsTempStorage: resolve(projectRoot, config.paths.fsTempStorage),
};
