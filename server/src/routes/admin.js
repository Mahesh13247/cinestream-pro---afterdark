import express from 'express';
import { UserModel } from '../models/User.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { registerValidation, updateUserValidation, handleValidationErrors } from '../utils/validation.js';
import { body } from 'express-validator';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Get all users
router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        const users = await UserModel.findAll(limit, offset);
        const total = await UserModel.count();

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching users'
        });
    }
});

// Create new user
router.post('/users', registerValidation, handleValidationErrors, async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Check if username already exists
        const existingUser = await UserModel.findByUsername(username);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Create user
        const newUser = await UserModel.create(username, password, role || 'user');

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: newUser
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while creating user'
        });
    }
});

// Update user
router.put('/users/:id', updateUserValidation, handleValidationErrors, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const updates = req.body;

        // Check if user exists
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from changing their own role
        if (userId === req.user.id && updates.role && updates.role !== user.role) {
            return res.status(400).json({
                success: false,
                message: 'You cannot change your own role'
            });
        }

        // Update user
        const success = await UserModel.update(userId, updates);
        if (!success) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        const updatedUser = await UserModel.findById(userId);
        res.json({
            success: true,
            message: 'User updated successfully',
            data: UserModel.sanitize(updatedUser)
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating user'
        });
    }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        // Check if user exists
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from deleting themselves
        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        // Delete user
        const success = await UserModel.delete(userId);
        if (!success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete user'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while deleting user'
        });
    }
});

// Block user
router.patch('/users/:id/block', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        // Check if user exists
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from blocking themselves
        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot block your own account'
            });
        }

        // Block user
        const success = await UserModel.block(userId);
        if (!success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to block user'
            });
        }

        res.json({
            success: true,
            message: 'User blocked successfully'
        });
    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while blocking user'
        });
    }
});

// Unblock user
router.patch('/users/:id/unblock', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        // Check if user exists
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Unblock user
        const success = await UserModel.unblock(userId);
        if (!success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to unblock user'
            });
        }

        res.json({
            success: true,
            message: 'User unblocked successfully'
        });
    } catch (error) {
        console.error('Unblock user error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while unblocking user'
        });
    }
});

// Reset user password
router.patch('/users/:id/reset-password',
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    handleValidationErrors,
    async (req, res) => {
        try {
            const userId = parseInt(req.params.id);
            const { newPassword } = req.body;

            // Check if user exists
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Update password
            const success = await UserModel.updatePassword(userId, newPassword);
            if (!success) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to reset password'
                });
            }

            res.json({
                success: true,
                message: 'Password reset successfully'
            });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while resetting password'
            });
        }
    }
);

export default router;
