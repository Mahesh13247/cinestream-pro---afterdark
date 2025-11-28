import jwt from 'jsonwebtoken';
import { query } from '../config/postgres.js';

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

        const expiresAt = new Date(decoded.exp * 1000);

        await query(
            'INSERT INTO token_blacklist (token, expires_at) VALUES ($1, $2)',
            [token, expiresAt]
        );

        return true;
    } catch (error) {
        console.error('Error blacklisting token:', error);
        return false;
    }
};

// Check if token is blacklisted
export const isTokenBlacklisted = async (token) => {
    try {
        const result = await query(
            'SELECT id FROM token_blacklist WHERE token = $1',
            [token]
        );

        return result.rows.length > 0;
    } catch (error) {
        console.error('Error checking token blacklist:', error);
        return false;
    }
};

// Clean expired tokens from blacklist
export const cleanExpiredTokens = async () => {
    try {
        const result = await query(
            'DELETE FROM token_blacklist WHERE expires_at < CURRENT_TIMESTAMP'
        );

        return result.rowCount;
    } catch (error) {
        console.error('Error cleaning expired tokens:', error);
        return 0;
    }
};
