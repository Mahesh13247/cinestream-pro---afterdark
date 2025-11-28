import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// PostgreSQL connection configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
    if (process.env.NODE_ENV !== 'production') {
        console.log('✓ PostgreSQL connected');
    }
});

pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL error:', err);
});

// Initialize database schema
export const initDatabase = async () => {
    const client = await pool.connect();
    try {
        // Create users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'user',
                is_blocked INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            )
        `);

        // Create token blacklist table
        await client.query(`
            CREATE TABLE IF NOT EXISTS token_blacklist (
                id SERIAL PRIMARY KEY,
                token TEXT NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create index on token for faster lookups
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_token_blacklist_token 
            ON token_blacklist(token)
        `);

        // Create index on expires_at for cleanup
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires 
            ON token_blacklist(expires_at)
        `);

        console.log('✓ Database schema initialized successfully');
    } catch (error) {
        console.error('✗ Database schema initialization failed:', error);
        throw error;
    } finally {
        client.release();
    }
};

// Query helper function
export const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        if (process.env.NODE_ENV !== 'production' && duration > 100) {
            console.log('Slow query detected:', { text, duration, rows: res.rowCount });
        }
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

// Transaction helper
export const transaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Graceful shutdown
export const closePool = async () => {
    await pool.end();
    console.log('✓ PostgreSQL pool closed');
};

export default pool;
