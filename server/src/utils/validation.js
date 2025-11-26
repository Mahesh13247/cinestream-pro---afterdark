import { body, validationResult } from 'express-validator';

// Username validation rules
export const usernameValidation = () =>
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores');

// Password validation rules
export const passwordValidation = () =>
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number');

// Role validation
export const roleValidation = () =>
    body('role')
        .optional()
        .isIn(['admin', 'user'])
        .withMessage('Role must be either "admin" or "user"');

// Login validation
export const loginValidation = [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Register validation
export const registerValidation = [
    usernameValidation(),
    passwordValidation(),
    roleValidation()
];

// Update user validation
export const updateUserValidation = [
    body('username').optional().trim().isLength({ min: 3, max: 30 }),
    body('role').optional().isIn(['admin', 'user'])
];

// Validation error handler middleware
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};
