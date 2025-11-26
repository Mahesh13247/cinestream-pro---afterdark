import jwt from 'jsonwebtoken';
import { readDB, writeDB } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Generate access token
export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

// Generate refresh token
export const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            username: user.username
        },
        JWT_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );
};

// Verify token
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

// Decode token without verification (for blacklist check)
export const decodeToken = (token) => {
    return jwt.decode(token);
};

// Add token to blacklist
export const blacklistToken = async (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) return false;

        const db = await readDB();
        const expiresAt = new Date(decoded.exp * 1000).toISOString();

        // Check if token already blacklisted
        if (!db.tokenBlacklist.find(t => t.token === token)) {
            db.tokenBlacklist.push({ token, expiresAt, createdAt: new Date().toISOString() });
            await writeDB(db);
        }

        return true;
    } catch (error) {
        console.error('Error blacklisting token:', error);
        return false;
    }
};

// Check if token is blacklisted
export const isTokenBlacklisted = async (token) => {
    const db = await readDB();
    return !!db.tokenBlacklist.find(t => t.token === token);
};

// Clean expired tokens from blacklist (run periodically)
export const cleanExpiredTokens = async () => {
    const db = await readDB();
    const now = new Date();
    const initialLength = db.tokenBlacklist.length;

    db.tokenBlacklist = db.tokenBlacklist.filter(t => {
        return new Date(t.expiresAt) > now;
    });

    const removed = initialLength - db.tokenBlacklist.length;
    if (removed > 0) {
        await writeDB(db);
    }

    return removed;
};
