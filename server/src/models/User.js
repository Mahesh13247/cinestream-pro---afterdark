import bcrypt from 'bcryptjs';
import { query } from '../config/postgres.js';

const SALT_ROUNDS = 12;

export const UserModel = {
    // Create a new user
    create: async (username, password, role = 'user') => {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await query(
            `INSERT INTO users (username, password, role, is_blocked, created_at, updated_at)
             VALUES ($1, $2, $3, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING id, username, role, is_blocked, created_at, updated_at, last_login`,
            [username, hashedPassword, role]
        );

        return result.rows[0];
    },

    // Find user by username
    findByUsername: async (username) => {
        const result = await query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        return result.rows[0];
    },

    // Find user by ID
    findById: async (id) => {
        const result = await query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0];
    },

    // Get all users (exclude password)
    findAll: async (limit = 100, offset = 0) => {
        const result = await query(
            `SELECT id, username, role, is_blocked, created_at, updated_at, last_login
             FROM users
             ORDER BY id ASC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        return result.rows;
    },

    // Update user
    update: async (id, updates) => {
        const allowedFields = ['username', 'role', 'is_blocked'];
        const filteredUpdates = {};

        Object.keys(updates).forEach(key => {
            // Convert camelCase to snake_case for database
            const dbKey = key === 'isBlocked' ? 'is_blocked' : key;
            if (allowedFields.includes(dbKey)) {
                filteredUpdates[dbKey] = updates[key];
            }
        });

        if (Object.keys(filteredUpdates).length === 0) return false;

        // Build dynamic UPDATE query
        const setClause = Object.keys(filteredUpdates)
            .map((key, index) => `${key} = $${index + 2}`)
            .join(', ');

        const values = [id, ...Object.values(filteredUpdates)];

        const result = await query(
            `UPDATE users 
             SET ${setClause}, updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING id`,
            values
        );

        return result.rowCount > 0;
    },

    // Update password
    updatePassword: async (id, newPassword) => {
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

        const result = await query(
            `UPDATE users 
             SET password = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING id`,
            [hashedPassword, id]
        );

        return result.rowCount > 0;
    },

    // Delete user
    delete: async (id) => {
        const result = await query(
            'DELETE FROM users WHERE id = $1',
            [id]
        );

        return result.rowCount > 0;
    },

    // Block user
    block: async (id) => {
        const result = await query(
            `UPDATE users 
             SET is_blocked = 1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING id`,
            [id]
        );

        return result.rowCount > 0;
    },

    // Unblock user
    unblock: async (id) => {
        const result = await query(
            `UPDATE users 
             SET is_blocked = 0, updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING id`,
            [id]
        );

        return result.rowCount > 0;
    },

    // Update last login
    updateLastLogin: async (id) => {
        await query(
            `UPDATE users 
             SET last_login = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [id]
        );
    },

    // Compare password
    comparePassword: async (plainPassword, hashedPassword) => {
        return await bcrypt.compare(plainPassword, hashedPassword);
    },

    // Sanitize user object (remove password)
    sanitize: (user) => {
        if (!user) return null;
        const { password, ...sanitizedUser } = user;
        // Convert snake_case to camelCase for API response
        return {
            ...sanitizedUser,
            isBlocked: sanitizedUser.is_blocked,
            createdAt: sanitizedUser.created_at,
            updatedAt: sanitizedUser.updated_at,
            lastLogin: sanitizedUser.last_login
        };
    },

    // Count total users
    count: async () => {
        const result = await query('SELECT COUNT(*) FROM users');
        return parseInt(result.rows[0].count);
    }
};
