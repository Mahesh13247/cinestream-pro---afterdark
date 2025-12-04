import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';

const ADULT_TOKEN_SECRET = process.env.ADULT_TOKEN_SECRET || 'adult-content-secret-key-change-in-production';

/**
 * Middleware to verify adult content access token
 */
export const verifyAdultAccess = async (req, res, next) => {
    try {
        const adultToken = req.headers['x-adult-token'];

        if (!adultToken) {
            return res.status(403).json({
                success: false,
                message: 'Adult content access token required'
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(adultToken, ADULT_TOKEN_SECRET);

        // Check if user exists and token is valid
        const user = await UserModel.findById(decoded.userId);

        if (!user) {
            return res.status(403).json({
                success: false,
                message: 'Invalid access token'
            });
        }

        // Check if adult content is enabled for this user
        if (!user.adult_content_enabled) {
            return res.status(403).json({
                success: false,
                message: 'Adult content access is disabled for this account'
            });
        }

        // Check if token matches stored token
        if (user.adult_access_token !== adultToken) {
            return res.status(403).json({
                success: false,
                message: 'Token has been revoked'
            });
        }

        // Check if token has expired
        if (user.adult_token_expiry && new Date(user.adult_token_expiry) < new Date()) {
            await UserModel.clearAdultAccessToken(user.id);
            return res.status(403).json({
                success: false,
                message: 'Access token has expired'
            });
        }

        // Attach user to request
        req.user = user;
        req.adultAccess = true;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                success: false,
                message: 'Invalid access token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({
                success: false,
                message: 'Access token has expired'
            });
        }

        console.error('Adult access verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify adult access'
        });
    }
};

/**
 * Generate adult access token
 */
export const generateAdultToken = (userId) => {
    return jwt.sign(
        {
            userId,
            purpose: 'adult-content',
            timestamp: Date.now()
        },
        ADULT_TOKEN_SECRET,
        { expiresIn: '30m' }
    );
};

/**
 * Validate adult access without middleware (for internal use)
 */
export const validateAdultAccess = async (userId, token) => {
    try {
        const decoded = jwt.verify(token, ADULT_TOKEN_SECRET);

        if (decoded.userId !== userId) {
            return false;
        }

        const user = await UserModel.findById(userId);

        if (!user || !user.adult_content_enabled) {
            return false;
        }

        if (user.adult_access_token !== token) {
            return false;
        }

        if (user.adult_token_expiry && new Date(user.adult_token_expiry) < new Date()) {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
};
