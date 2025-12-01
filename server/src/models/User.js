import bcrypt from 'bcryptjs';
import { readDB, writeDB } from '../config/database.js';

const SALT_ROUNDS = 12;

export const UserModel = {
    // Create a new user
    create: async (username, password, role = 'user') => {
        const db = await readDB();
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = {
            id: ++db.lastUserId,
            username,
            password: hashedPassword,
            role,
            is_blocked: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_login: null
        };

        db.users.push(newUser);
        await writeDB(db);

        return newUser;
    },

    // Find user by username
    findByUsername: async (username) => {
        const db = await readDB();
        return db.users.find(u => u.username === username);
    },

    // Find user by ID
    findById: async (id) => {
        const db = await readDB();
        return db.users.find(u => u.id === parseInt(id));
    },

    // Get all users (exclude password)
    findAll: async (limit = 100, offset = 0) => {
        const db = await readDB();
        // Simple pagination for JSON array
        return db.users.slice(offset, offset + limit);
    },

    // Update user
    update: async (id, updates) => {
        const db = await readDB();
        const index = db.users.findIndex(u => u.id === parseInt(id));

        if (index === -1) return false;

        const allowedFields = ['username', 'role', 'is_blocked'];
        let hasUpdates = false;

        allowedFields.forEach(field => {
            // Handle camelCase to snake_case conversion for isBlocked
            const updateKey = field === 'is_blocked' ? 'isBlocked' : field;

            if (updates[updateKey] !== undefined) {
                db.users[index][field] = updates[updateKey];
                hasUpdates = true;
            }
        });

        if (hasUpdates) {
            db.users[index].updated_at = new Date().toISOString();
            await writeDB(db);
        }

        return hasUpdates;
    },

    // Update password
    updatePassword: async (id, newPassword) => {
        const db = await readDB();
        const index = db.users.findIndex(u => u.id === parseInt(id));

        if (index === -1) return false;

        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        db.users[index].password = hashedPassword;
        db.users[index].updated_at = new Date().toISOString();

        await writeDB(db);
        return true;
    },

    // Delete user
    delete: async (id) => {
        const db = await readDB();
        const initialLength = db.users.length;
        db.users = db.users.filter(u => u.id !== parseInt(id));

        if (db.users.length !== initialLength) {
            await writeDB(db);
            return true;
        }
        return false;
    },

    // Block user
    block: async (id) => {
        const db = await readDB();
        const user = db.users.find(u => u.id === parseInt(id));

        if (user) {
            user.is_blocked = 1;
            user.updated_at = new Date().toISOString();
            await writeDB(db);
            return true;
        }
        return false;
    },

    // Unblock user
    unblock: async (id) => {
        const db = await readDB();
        const user = db.users.find(u => u.id === parseInt(id));

        if (user) {
            user.is_blocked = 0;
            user.updated_at = new Date().toISOString();
            await writeDB(db);
            return true;
        }
        return false;
    },

    // Update last login
    updateLastLogin: async (id) => {
        const db = await readDB();
        const user = db.users.find(u => u.id === parseInt(id));

        if (user) {
            user.last_login = new Date().toISOString();
            await writeDB(db);
        }
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
        const db = await readDB();
        return db.users.length;
    }
};
