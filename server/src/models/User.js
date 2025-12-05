import bcrypt from 'bcryptjs';
import { readDB, writeDB, isPostgres } from '../config/database.js';
import { query } from '../config/pg-adapter.js';

const SALT_ROUNDS = 12;

export const UserModel = {
    // Create a new user
    create: async (username, password, role = 'user') => {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        if (isPostgres) {
            // PostgreSQL implementation
            const result = await query(
                `INSERT INTO users (username, password, role, is_blocked, created_at, updated_at, 
                 adult_content_enabled, adult_failed_attempts)
                 VALUES ($1, $2, $3, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true, 0)
                 RETURNING *`,
                [username, hashedPassword, role]
            );
            return result.rows[0];
        } else {
            // JSON implementation
            const db = await readDB();
            const newUser = {
                id: ++db.lastUserId,
                username,
                password: hashedPassword,
                role,
                is_blocked: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_login: null,
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
        }
    },

    // Find user by username
    findByUsername: async (username) => {
        if (isPostgres) {
            const result = await query('SELECT * FROM users WHERE username = $1', [username]);
            return result.rows[0] || null;
        } else {
            const db = await readDB();
            return db.users.find(u => u.username === username);
        }
    },

    // Find user by ID
    findById: async (id) => {
        if (isPostgres) {
            const result = await query('SELECT * FROM users WHERE id = $1', [parseInt(id)]);
            return result.rows[0] || null;
        } else {
            const db = await readDB();
            return db.users.find(u => u.id === parseInt(id));
        }
    },

    // Get all users
    findAll: async (limit = 100, offset = 0) => {
        if (isPostgres) {
            const result = await query(
                'SELECT * FROM users ORDER BY id DESC LIMIT $1 OFFSET $2',
                [limit, offset]
            );
            return result.rows;
        } else {
            const db = await readDB();
            return db.users.slice(offset, offset + limit);
        }
    },

    // Update user
    update: async (id, updates) => {
        const allowedFields = ['username', 'role', 'is_blocked'];

        if (isPostgres) {
            const setClauses = [];
            const values = [];
            let paramIndex = 1;

            allowedFields.forEach(field => {
                const updateKey = field === 'is_blocked' ? 'isBlocked' : field;
                if (updates[updateKey] !== undefined) {
                    setClauses.push(`${field} = $${paramIndex}`);
                    values.push(updates[updateKey]);
                    paramIndex++;
                }
            });

            if (setClauses.length === 0) return false;

            setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(parseInt(id));

            const result = await query(
                `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
                values
            );
            return result.rowCount > 0;
        } else {
            const db = await readDB();
            const index = db.users.findIndex(u => u.id === parseInt(id));
            if (index === -1) return false;

            let hasUpdates = false;
            allowedFields.forEach(field => {
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
        }
    },

    // Update password
    updatePassword: async (id, newPassword) => {
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

        if (isPostgres) {
            const result = await query(
                'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [hashedPassword, parseInt(id)]
            );
            return result.rowCount > 0;
        } else {
            const db = await readDB();
            const index = db.users.findIndex(u => u.id === parseInt(id));
            if (index === -1) return false;

            db.users[index].password = hashedPassword;
            db.users[index].updated_at = new Date().toISOString();
            await writeDB(db);
            return true;
        }
    },

    // Delete user
    delete: async (id) => {
        if (isPostgres) {
            const result = await query('DELETE FROM users WHERE id = $1', [parseInt(id)]);
            return result.rowCount > 0;
        } else {
            const db = await readDB();
            const initialLength = db.users.length;
            db.users = db.users.filter(u => u.id !== parseInt(id));
            if (db.users.length !== initialLength) {
                await writeDB(db);
                return true;
            }
            return false;
        }
    },

    // Block user
    block: async (id) => {
        if (isPostgres) {
            const result = await query(
                'UPDATE users SET is_blocked = 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
                [parseInt(id)]
            );
            return result.rowCount > 0;
        } else {
            const db = await readDB();
            const user = db.users.find(u => u.id === parseInt(id));
            if (user) {
                user.is_blocked = 1;
                user.updated_at = new Date().toISOString();
                await writeDB(db);
                return true;
            }
            return false;
        }
    },

    // Unblock user
    unblock: async (id) => {
        if (isPostgres) {
            const result = await query(
                'UPDATE users SET is_blocked = 0, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
                [parseInt(id)]
            );
            return result.rowCount > 0;
        } else {
            const db = await readDB();
            const user = db.users.find(u => u.id === parseInt(id));
            if (user) {
                user.is_blocked = 0;
                user.updated_at = new Date().toISOString();
                await writeDB(db);
                return true;
            }
            return false;
        }
    },

    // Update last login
    updateLastLogin: async (id) => {
        if (isPostgres) {
            await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [parseInt(id)]);
        } else {
            const db = await readDB();
            const user = db.users.find(u => u.id === parseInt(id));
            if (user) {
                user.last_login = new Date().toISOString();
                await writeDB(db);
            }
        }
    },

    // Compare password
    comparePassword: async (plainPassword, hashedPassword) => {
        return await bcrypt.compare(plainPassword, hashedPassword);
    },

    // Sanitize user object
    sanitize: (user) => {
        if (!user) return null;
        const { password, adult_pin_hash, adult_access_token, ...sanitizedUser } = user;
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
        if (isPostgres) {
            const result = await query('SELECT COUNT(*) FROM users');
            return parseInt(result.rows[0].count);
        } else {
            const db = await readDB();
            return db.users.length;
        }
    },

    // Adult content security methods
    setAdultPin: async (id, pin) => {
        const pinHash = pin === null ? null : await bcrypt.hash(pin, SALT_ROUNDS);

        if (isPostgres) {
            const result = await query(
                'UPDATE users SET adult_pin_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [pinHash, parseInt(id)]
            );
            return result.rowCount > 0;
        } else {
            const db = await readDB();
            const user = db.users.find(u => u.id === parseInt(id));
            if (user) {
                user.adult_pin_hash = pinHash;
                user.updated_at = new Date().toISOString();
                await writeDB(db);
                return true;
            }
            return false;
        }
    },

    verifyAdultPin: async (id, pin) => {
        if (isPostgres) {
            const result = await query('SELECT adult_pin_hash FROM users WHERE id = $1', [parseInt(id)]);
            const user = result.rows[0];
            if (!user || !user.adult_pin_hash) return false;
            return await bcrypt.compare(pin, user.adult_pin_hash);
        } else {
            const db = await readDB();
            const user = db.users.find(u => u.id === parseInt(id));
            if (!user || !user.adult_pin_hash) return false;
            return await bcrypt.compare(pin, user.adult_pin_hash);
        }
    },

    setAdultAccessToken: async (id, token, expiryMinutes = 30) => {
        const expiry = new Date(Date.now() + expiryMinutes * 60 * 1000);

        if (isPostgres) {
            const result = await query(
                `UPDATE users SET 
                 adult_access_token = $1, 
                 adult_token_expiry = $2,
                 last_adult_access = CURRENT_TIMESTAMP,
                 adult_failed_attempts = 0,
                 adult_lockout_until = NULL
                 WHERE id = $3`,
                [token, expiry, parseInt(id)]
            );
            return result.rowCount > 0;
        } else {
            const db = await readDB();
            const user = db.users.find(u => u.id === parseInt(id));
            if (user) {
                user.adult_access_token = token;
                user.adult_token_expiry = expiry.toISOString();
                user.last_adult_access = new Date().toISOString();
                user.adult_failed_attempts = 0;
                user.adult_lockout_until = null;
                await writeDB(db);
                return true;
            }
            return false;
        }
    },

    clearAdultAccessToken: async (id) => {
        if (isPostgres) {
            const result = await query(
                'UPDATE users SET adult_access_token = NULL, adult_token_expiry = NULL WHERE id = $1',
                [parseInt(id)]
            );
            return result.rowCount > 0;
        } else {
            const db = await readDB();
            const user = db.users.find(u => u.id === parseInt(id));
            if (user) {
                user.adult_access_token = null;
                user.adult_token_expiry = null;
                await writeDB(db);
                return true;
            }
            return false;
        }
    },

    incrementAdultFailedAttempts: async (id) => {
        if (isPostgres) {
            const result = await query(
                `UPDATE users SET 
                 adult_failed_attempts = adult_failed_attempts + 1,
                 adult_lockout_until = CASE 
                     WHEN adult_failed_attempts + 1 >= 3 THEN CURRENT_TIMESTAMP + INTERVAL '5 minutes'
                     ELSE adult_lockout_until
                 END
                 WHERE id = $1
                 RETURNING adult_failed_attempts`,
                [parseInt(id)]
            );
            return result.rows[0]?.adult_failed_attempts || 0;
        } else {
            const db = await readDB();
            const user = db.users.find(u => u.id === parseInt(id));
            if (user) {
                user.adult_failed_attempts = (user.adult_failed_attempts || 0) + 1;
                if (user.adult_failed_attempts >= 3) {
                    user.adult_lockout_until = new Date(Date.now() + 5 * 60 * 1000).toISOString();
                }
                await writeDB(db);
                return user.adult_failed_attempts;
            }
            return 0;
        }
    },

    isAdultLockedOut: async (id) => {
        if (isPostgres) {
            const result = await query(
                'SELECT adult_lockout_until FROM users WHERE id = $1',
                [parseInt(id)]
            );
            const user = result.rows[0];
            if (!user || !user.adult_lockout_until) return false;

            const lockoutTime = new Date(user.adult_lockout_until);
            const now = new Date();

            if (now < lockoutTime) return true;

            // Clear lockout if expired
            await query(
                'UPDATE users SET adult_lockout_until = NULL, adult_failed_attempts = 0 WHERE id = $1',
                [parseInt(id)]
            );
            return false;
        } else {
            const db = await readDB();
            const user = db.users.find(u => u.id === parseInt(id));
            if (!user || !user.adult_lockout_until) return false;

            const lockoutTime = new Date(user.adult_lockout_until);
            const now = new Date();

            if (now < lockoutTime) return true;

            user.adult_lockout_until = null;
            user.adult_failed_attempts = 0;
            await writeDB(db);
            return false;
        }
    },

    setAdultContentEnabled: async (id, enabled) => {
        if (isPostgres) {
            const result = await query(
                'UPDATE users SET adult_content_enabled = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [enabled, parseInt(id)]
            );
            return result.rowCount > 0;
        } else {
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
    }
};
