import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Rate limiter for login attempts
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 attempts per window (increased for testing)
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for general API requests
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        success: false,
        message: 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Helmet security headers - relaxed CSP for development
export const securityHeaders = helmet({
    contentSecurityPolicy: false, // Disable CSP in development to avoid CORS issues
    crossOriginEmbedderPolicy: false,
});

// Sanitize user input (basic XSS prevention)
export const sanitizeInput = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                // Remove potentially dangerous characters
                req.body[key] = req.body[key]
                    .replace(/[<>]/g, '') // Remove < and >
                    .trim();
            }
        });
    }
    next();
};
