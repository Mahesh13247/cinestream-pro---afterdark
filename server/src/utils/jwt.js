import jwt from 'jsonwebtoken';
import { readDB, writeDB } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const JWT_EXPIRES_IN = '15m';
const JWT_REFRESH_EXPIRES_IN = '7d';

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
        JWT_REFRESH_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );
};

// Verify access token
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
        return null;
    }
};

// Add token to blacklist
export const blacklistToken = async (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) return false;

        const db = await readDB();
        const expiresAt = new Date(decoded.exp * 1000).toISOString();

        db.tokenBlacklist.push({
            token,
            expiresAt
        });

        await writeDB(db);
        return true;
    } catch (error) {
        console.error('Error blacklisting token:', error);
        return false;
    }
};

// Check if token is blacklisted
export const isTokenBlacklisted = async (token) => {
    try {
        const db = await readDB();
        return db.tokenBlacklist.some(t => t.token === token);
    } catch (error) {
        console.error('Error checking token blacklist:', error);
        return false;
    }
};

// Clean expired tokens from blacklist
export const cleanExpiredTokens = async () => {
    try {
        const db = await readDB();
        const now = new Date().toISOString();
        const initialLength = db.tokenBlacklist.length;

        db.tokenBlacklist = db.tokenBlacklist.filter(t => t.expiresAt > now);

        if (db.tokenBlacklist.length !== initialLength) {
            await writeDB(db);
            return initialLength - db.tokenBlacklist.length;
        }
        return 0;
    } catch (error) {
        console.error('Error cleaning expired tokens:', error);
        return 0;
    }
};
