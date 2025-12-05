import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// PostgreSQL connection pool
let pool = null;

/**
 * Initialize PostgreSQL connection pool
 */
export const initPool = () => {
    if (!process.env.DATABASE_URL) {
        return null;
    }

    if (pool) {
        return pool;
    }

    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? {
            rejectUnauthorized: false // Required for Render, Railway, etc.
        } : false,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });

    // Handle pool errors
    pool.on('error', (err) => {
        console.error('Unexpected error on idle PostgreSQL client', err);
    });

    return pool;
};

/**
 * Get database connection pool
 */
export const getPool = () => {
    if (!pool) {
        pool = initPool();
    }
    return pool;
};

/**
 * Execute a query
 */
export const query = async (text, params) => {
    const client = getPool();
    if (!client) {
        throw new Error('PostgreSQL pool not initialized');
    }
    return await client.query(text, params);
};

/**
 * Initialize database tables
 */
export const initializeTables = async () => {
    const client = getPool();
    if (!client) {
        return false;
    }

    try {
        // Create users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                is_blocked INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                
                -- Adult content security
                adult_pin_hash VARCHAR(255),
                adult_content_enabled BOOLEAN DEFAULT true,
                adult_access_token VARCHAR(255),
                adult_token_expiry TIMESTAMP,
                date_of_birth DATE,
                last_adult_access TIMESTAMP,
                adult_failed_attempts INTEGER DEFAULT 0,
                adult_lockout_until TIMESTAMP
            );
        `);

        // Create token blacklist table
        await client.query(`
            CREATE TABLE IF NOT EXISTS token_blacklist (
                id SERIAL PRIMARY KEY,
                token VARCHAR(500) UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create index on username for faster lookups
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        `);

        // Create index on token for faster blacklist checks
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_token_blacklist_token ON token_blacklist(token);
        `);

        console.log('✓ Database tables initialized successfully');
        return true;
    } catch (error) {
        console.error('✗ Failed to initialize database tables:', error);
        throw error;
    }
};

/**
 * Test database connection
 */
export const testConnection = async () => {
    const client = getPool();
    if (!client) {
        return false;
    }

    try {
        const result = await client.query('SELECT NOW()');
        console.log('✓ Connected to PostgreSQL database');
        return true;
    } catch (error) {
        console.error('✗ PostgreSQL connection failed:', error.message);
        return false;
    }
};

/**
 * Close database connection pool
 */
export const closePool = async () => {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('✓ PostgreSQL connection pool closed');
    }
};

export default {
    initPool,
    getPool,
    query,
    initializeTables,
    testConnection,
    closePool
};
