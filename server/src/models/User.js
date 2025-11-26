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
            isBlocked: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: null
        };

        db.users.push(newUser);
        await writeDB(db);

        const { password: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    },

    // Find user by username
    findByUsername: async (username) => {
        const db = await readDB();
        return db.users.find(u => u.username === username);
    },

    // Find user by ID
    findById: async (id) => {
        const db = await readDB();
        return db.users.find(u => u.id === id);
    },

    // Get all users (exclude password)
    findAll: async (limit = 100, offset = 0) => {
        const db = await readDB();
        return db.users
            .slice(offset, offset + limit)
            .map(({ password, ...user }) => user);
    },

    // Update user
    update: async (id, updates) => {
        const db = await readDB();
        const userIndex = db.users.findIndex(u => u.id === id);

        if (userIndex === -1) return false;

        const allowedFields = ['username', 'role', 'isBlocked'];
        const filteredUpdates = {};

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                filteredUpdates[key] = updates[key];
            }
        });

        if (Object.keys(filteredUpdates).length === 0) return false;

        db.users[userIndex] = {
            ...db.users[userIndex],
            ...filteredUpdates,
            updatedAt: new Date().toISOString()
        };

        await writeDB(db);
        return true;
    },

    // Update password
    updatePassword: async (id, newPassword) => {
        const db = await readDB();
        const userIndex = db.users.findIndex(u => u.id === id);

        if (userIndex === -1) return false;

        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        db.users[userIndex].password = hashedPassword;
        db.users[userIndex].updatedAt = new Date().toISOString();

        await writeDB(db);
        return true;
    },

    // Delete user
    delete: async (id) => {
        const db = await readDB();
        const initialLength = db.users.length;
        db.users = db.users.filter(u => u.id !== id);

        if (db.users.length === initialLength) return false;

        await writeDB(db);
        return true;
    },

    // Block user
    block: async (id) => {
        const db = await readDB();
        const userIndex = db.users.findIndex(u => u.id === id);

        if (userIndex === -1) return false;

        db.users[userIndex].isBlocked = 1;
        db.users[userIndex].updatedAt = new Date().toISOString();

        await writeDB(db);
        return true;
    },

    // Unblock user
    unblock: async (id) => {
        const db = await readDB();
        const userIndex = db.users.findIndex(u => u.id === id);

        if (userIndex === -1) return false;

        db.users[userIndex].isBlocked = 0;
        db.users[userIndex].updatedAt = new Date().toISOString();

        await writeDB(db);
        return true;
    },

    // Update last login
    updateLastLogin: async (id) => {
        const db = await readDB();
        const userIndex = db.users.findIndex(u => u.id === id);

        if (userIndex !== -1) {
            db.users[userIndex].lastLogin = new Date().toISOString();
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
        return sanitizedUser;
    },

    // Count total users
    count: async () => {
        const db = await readDB();
        return db.users.length;
    }
};
