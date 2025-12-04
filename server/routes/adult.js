import express from 'express';
import { body, validationResult } from 'express-validator';
import { UserModel } from '../src/models/User.js';
import { authenticate } from '../src/middleware/auth.js';
import { verifyAdultAccess, generateAdultToken } from '../src/middleware/adultSecurity.js';
import { readDB, writeDB } from '../src/config/database.js';

const router = express.Router();

/**
 * Set adult content PIN
 * POST /api/adult/set-pin
 */
router.post('/set-pin',
    authenticate,
    [
        body('pin')
            .isString()
            .trim()
            .isLength({ min: 4, max: 6 })
            .matches(/^\d+$/)
            .withMessage('PIN must be 4-6 digits')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid PIN format',
                    errors: errors.array()
                });
            }

            const { pin } = req.body;
            const userId = req.user.id;

            // Set the PIN
            const success = await UserModel.setAdultPin(userId, pin);

            if (success) {
                // Automatically enable adult content when user sets their PIN
                await UserModel.setAdultContentEnabled(userId, true);

                return res.json({
                    success: true,
                    message: 'Adult content PIN set successfully'
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Failed to set PIN'
            });
        } catch (error) {
            console.error('Set PIN error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
);

/**
 * Verify adult content PIN and issue access token
 * POST /api/adult/verify-pin
 */
router.post('/verify-pin',
    authenticate,
    [
        body('pin')
            .isString()
            .trim()
            .notEmpty()
            .withMessage('PIN is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'PIN is required',
                    errors: errors.array()
                });
            }

            const { pin } = req.body;
            const userId = req.user.id;

            // Check if user is locked out
            const isLockedOut = await UserModel.isAdultLockedOut(userId);
            if (isLockedOut) {
                return res.status(403).json({
                    success: false,
                    message: 'Too many failed attempts. Please try again in 5 minutes.',
                    lockedOut: true
                });
            }

            // Get user
            const user = await UserModel.findById(userId);

            // Check if user has set a PIN
            if (!user.adult_pin_hash) {
                return res.status(400).json({
                    success: false,
                    message: 'Please set a PIN first',
                    requiresSetup: true
                });
            }

            // Auto-enable adult content if user has a PIN but it's not enabled
            if (!user.adult_content_enabled) {
                await UserModel.setAdultContentEnabled(userId, true);
            }

            // Verify PIN
            const isValid = await UserModel.verifyAdultPin(userId, pin);

            if (!isValid) {
                const attempts = await UserModel.incrementAdultFailedAttempts(userId);
                const remainingAttempts = Math.max(0, 3 - attempts);

                return res.status(401).json({
                    success: false,
                    message: 'Incorrect PIN',
                    remainingAttempts,
                    lockedOut: remainingAttempts === 0
                });
            }

            // Generate access token
            const token = generateAdultToken(userId);
            const expiryMinutes = 30;

            await UserModel.setAdultAccessToken(userId, token, expiryMinutes);

            // Log access
            await logAdultAccess(userId, 'pin_verified', null);

            return res.json({
                success: true,
                message: 'Access granted',
                data: {
                    token,
                    expiresIn: expiryMinutes * 60, // seconds
                    expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString()
                }
            });
        } catch (error) {
            console.error('Verify PIN error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
);

/**
 * Check current adult access status
 * GET /api/adult/check-access
 */
router.get('/check-access',
    authenticate,
    async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await UserModel.findById(userId);

            const hasPin = !!user.adult_pin_hash;
            const isEnabled = user.adult_content_enabled;
            const hasValidToken = user.adult_access_token &&
                user.adult_token_expiry &&
                new Date(user.adult_token_expiry) > new Date();

            return res.json({
                success: true,
                data: {
                    hasPin,
                    isEnabled,
                    hasValidToken,
                    requiresSetup: !hasPin,
                    tokenExpiry: user.adult_token_expiry
                }
            });
        } catch (error) {
            console.error('Check access error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
);

/**
 * Revoke adult access token (logout from adult section)
 * POST /api/adult/revoke-access
 */
router.post('/revoke-access',
    authenticate,
    async (req, res) => {
        try {
            const userId = req.user.id;
            await UserModel.clearAdultAccessToken(userId);

            return res.json({
                success: true,
                message: 'Adult access revoked'
            });
        } catch (error) {
            console.error('Revoke access error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
);

/**
 * Log adult content access
 * POST /api/adult/log-access
 */
router.post('/log-access',
    authenticate,
    verifyAdultAccess,
    [
        body('contentId').optional().isString(),
        body('action').isString().notEmpty(),
        body('metadata').optional().isObject()
    ],
    async (req, res) => {
        try {
            const { contentId, action, metadata } = req.body;
            const userId = req.user.id;

            await logAdultAccess(userId, action, contentId, metadata);

            return res.json({
                success: true,
                message: 'Access logged'
            });
        } catch (error) {
            console.error('Log access error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
);

/**
 * Get adult access logs (admin only)
 * GET /api/adult/access-logs
 */
router.get('/access-logs',
    authenticate,
    async (req, res) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Admin access required'
                });
            }

            const { userId, limit = 100, offset = 0 } = req.query;
            const db = await readDB();

            let logs = db.adultAccessLogs || [];

            // Filter by user if specified
            if (userId) {
                logs = logs.filter(log => log.userId === parseInt(userId));
            }

            // Sort by timestamp descending
            logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // Paginate
            const paginatedLogs = logs.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

            return res.json({
                success: true,
                data: {
                    logs: paginatedLogs,
                    total: logs.length,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            });
        } catch (error) {
            console.error('Get access logs error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
);

/**
 * Helper function to log adult content access
 */
async function logAdultAccess(userId, action, contentId = null, metadata = {}) {
    try {
        const db = await readDB();

        if (!db.adultAccessLogs) {
            db.adultAccessLogs = [];
        }

        const logEntry = {
            id: db.adultAccessLogs.length + 1,
            userId,
            action,
            contentId,
            metadata,
            timestamp: new Date().toISOString(),
            ipAddress: null // Could be added from req.ip if needed
        };

        db.adultAccessLogs.push(logEntry);

        // Keep only last 10000 logs to prevent database bloat
        if (db.adultAccessLogs.length > 10000) {
            db.adultAccessLogs = db.adultAccessLogs.slice(-10000);
        }

        await writeDB(db);
    } catch (error) {
        console.error('Failed to log adult access:', error);
        // Don't throw error - logging failure shouldn't break the request
    }
}

export default router;
