import express from 'express';
import { UserModel } from '../models/User.js';
import { generateAccessToken, generateRefreshToken, blacklistToken } from '../utils/jwt.js';
import { loginValidation, handleValidationErrors } from '../utils/validation.js';
import { loginLimiter } from '../middleware/security.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Login
router.post('/login', loginLimiter, loginValidation, handleValidationErrors, async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await UserModel.findByUsername(username);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Check if user is blocked (use database field name)
        if (user.is_blocked === 1 || user.is_blocked === true) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been blocked. Please contact the administrator.'
            });
        }

        // Verify password
        const isPasswordValid = await UserModel.comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Update last login
        await UserModel.updateLastLogin(user.id);

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Return user data and tokens
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: UserModel.sanitize(user),
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during login'
        });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            await blacklistToken(token);
        }

        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during logout'
        });
    }
});

// Get current user (requires authentication)
router.get('/me', authenticate, async (req, res) => {
    try {
        // User is attached by authenticate middleware
        res.json({
            success: true,
            data: req.user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred'
        });
    }
});

export default router;
