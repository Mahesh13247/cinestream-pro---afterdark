import { verifyAccessToken, isTokenBlacklisted } from '../utils/jwt.js';
import { UserModel } from '../models/User.js';

// Authenticate JWT token
export const authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Check if token is blacklisted
        const blacklisted = await isTokenBlacklisted(token);
        if (blacklisted) {
            return res.status(401).json({
                success: false,
                message: 'Token has been revoked'
            });
        }

        // Verify token
        const decoded = verifyAccessToken(token);

        // Get user from database
        const user = await UserModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is blocked
        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been blocked by the administrator'
            });
        }

        // Attach user to request
        req.user = UserModel.sanitize(user);
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message || 'Invalid token'
        });
    }
};

// Require admin role
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }

    next();
};

// Require authenticated user (any role)
export const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    next();
};
