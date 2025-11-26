import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/database.js';
import { UserModel } from './models/User.js';
import { cleanExpiredTokens } from './utils/jwt.js';
import { securityHeaders, apiLimiter, sanitizeInput } from './middleware/security.js';
import { authenticate } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Initialize database
initDatabase();

// Create default admin user if none exists
const initializeDefaultAdmin = async () => {
    try {
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'maheshisagoodboy';

        const existingAdmin = await UserModel.findByUsername(adminUsername);

        if (!existingAdmin) {
            // Create new admin if not exists
            await UserModel.create(adminUsername, adminPassword, 'admin');
            console.log(`✓ Default admin user created: ${adminUsername}`);
            console.log(`⚠️  IMPORTANT: Change the default password immediately!`);
        } else {
            // Check if password needs update
            const isPasswordMatch = await UserModel.comparePassword(adminPassword, existingAdmin.password);
            if (!isPasswordMatch) {
                await UserModel.updatePassword(existingAdmin.id, adminPassword);
                console.log(`✓ Admin password updated to match environment configuration`);
            }
        }
    } catch (error) {
        console.error('Error initializing default admin:', error);
    }
};

initializeDefaultAdmin();

// Clean expired tokens every hour
setInterval(async () => {
    const cleaned = await cleanExpiredTokens();
    if (cleaned > 0) {
        console.log(`Cleaned ${cleaned} expired tokens from blacklist`);
    }
}, 60 * 60 * 1000);

// Middleware
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(securityHeaders);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInput);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Protected route example (requires authentication)
app.get('/api/protected', authenticate, (req, res) => {
    res.json({
        success: true,
        message: 'This is a protected route',
        user: req.user
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🚀 Auth Server running on port ${PORT}`);
    console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

export default app;
