import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import * as pgAdapter from './pg-adapter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const DB_PATH = path.join(__dirname, '../../data/database.json');
const DATA_DIR = path.join(__dirname, '../../data');

// Check if we should use PostgreSQL
export const isPostgres = !!process.env.DATABASE_URL;

// Initialize database structure
const initDB = {
  users: [],
  tokenBlacklist: [],
  lastUserId: 0
};

// Ensure data directory exists
const ensureDataDir = async () => {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
};

// Read database
export const readDB = async () => {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, create it with initial structure
    await writeDB(initDB);
    return initDB;
  }
};

// Write database
export const writeDB = async (data) => {
  await ensureDataDir();
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
};

// Initialize database
export const initDatabase = async () => {
  try {
    if (isPostgres) {
      // Initialize PostgreSQL
      console.log('🔄 Initializing PostgreSQL database...');
      pgAdapter.initPool();
      const connected = await pgAdapter.testConnection();

      if (!connected) {
        console.error('⚠️  PostgreSQL connection failed, falling back to JSON storage');
        // Fall back to JSON
        await ensureDataDir();
        const db = await readDB();
        console.log('✓ Using JSON file storage (fallback)');
        return db;
      }

      await pgAdapter.initializeTables();
      console.log('✓ PostgreSQL database ready');
      return null; // No JSON DB needed
    } else {
      // Use JSON file storage
      await ensureDataDir();
      const db = await readDB();
      console.log('✓ Using JSON file storage (no DATABASE_URL found)');
      return db;
    }
  } catch (error) {
    console.error('✗ Database initialization failed:', error);
    throw error;
  }
};

export default { readDB, writeDB, initDatabase, isPostgres };
