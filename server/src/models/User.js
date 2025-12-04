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
            last_login: null,
            // Adult content security fields
            adult_pin_hash: null,
            adult_content_enabled: true,
            adult_access_token: null,
            adult_token_expiry: null,
            date_of_birth: null,
            last_adult_access: null,
            adult_failed_attempts: 0,
            adult_lockout_until: null
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

    // Sanitize user object (remove password and sensitive data)
    sanitize: (user) => {
        if (!user) return null;
        const { password, adult_pin_hash, adult_access_token, ...sanitizedUser } = user;
        // Convert snake_case to camelCase for API response
        return {
            ...sanitizedUser,
            isBlocked: sanitizedUser.is_blocked,
            createdAt: sanitizedUser.created_at,
            updatedAt: sanitizedUser.updated_at,
            lastLogin: sanitizedUser.last_login,
            adultContentEnabled: sanitizedUser.adult_content_enabled,
            adultTokenExpiry: sanitizedUser.adult_token_expiry,
            dateOfBirth: sanitizedUser.date_of_birth,
            lastAdultAccess: sanitizedUser.last_adult_access,
            hasAdultPin: !!sanitizedUser.adult_pin_hash
        };
    },

    // Count total users
    count: async () => {
        const db = await readDB();
        return db.users.length;
    },

    // Adult content security methods
    setAdultPin: async (id, pin) => {
        const db = await readDB();
        const user = db.users.find(u => u.id === parseInt(id));

        if (user) {
            // Allow null to remove PIN
            if (pin === null) {
                user.adult_pin_hash = null;
            } else {
                user.adult_pin_hash = await bcrypt.hash(pin, SALT_ROUNDS);
            }
            user.updated_at = new Date().toISOString();
            await writeDB(db);
            return true;
        }
        return false;
    },

    verifyAdultPin: async (id, pin) => {
        const db = await readDB();
        const user = db.users.find(u => u.id === parseInt(id));

        if (!user || !user.adult_pin_hash) {
            return false;
        }

        return await bcrypt.compare(pin, user.adult_pin_hash);
    },

    setAdultAccessToken: async (id, token, expiryMinutes = 30) => {
        const db = await readDB();
        const user = db.users.find(u => u.id === parseInt(id));

        if (user) {
            user.adult_access_token = token;
            user.adult_token_expiry = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();
            user.last_adult_access = new Date().toISOString();
            user.adult_failed_attempts = 0;
            user.adult_lockout_until = null;
            await writeDB(db);
            return true;
        }
        return false;
    },

    clearAdultAccessToken: async (id) => {
        const db = await readDB();
        const user = db.users.find(u => u.id === parseInt(id));

        if (user) {
            user.adult_access_token = null;
            user.adult_token_expiry = null;
            await writeDB(db);
            return true;
        }
        return false;
    },

    incrementAdultFailedAttempts: async (id) => {
        const db = await readDB();
        const user = db.users.find(u => u.id === parseInt(id));

        if (user) {
            user.adult_failed_attempts = (user.adult_failed_attempts || 0) + 1;

            // Lock out after 3 failed attempts for 5 minutes
            if (user.adult_failed_attempts >= 3) {
                user.adult_lockout_until = new Date(Date.now() + 5 * 60 * 1000).toISOString();
            }

            await writeDB(db);
            return user.adult_failed_attempts;
        }
        return 0;
    },

    isAdultLockedOut: async (id) => {
        const db = await readDB();
        const user = db.users.find(u => u.id === parseInt(id));

        if (!user || !user.adult_lockout_until) {
            return false;
        }

        const lockoutTime = new Date(user.adult_lockout_until);
        const now = new Date();

        if (now < lockoutTime) {
            return true;
        }

        // Clear lockout if expired
        user.adult_lockout_until = null;
        user.adult_failed_attempts = 0;
        await writeDB(db);
        return false;
    },

    setAdultContentEnabled: async (id, enabled) => {
        const db = await readDB();
        const user = db.users.find(u => u.id === parseInt(id));

        if (user) {
            user.adult_content_enabled = enabled;
            user.updated_at = new Date().toISOString();
            await writeDB(db);
            return true;
        }
        return false;
    }
};
