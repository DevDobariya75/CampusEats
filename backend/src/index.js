import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from '../middleware/errorHandler.js';

// Import routes
import authRoutes from '../routes/authRoutes.js';
import shopRoutes from '../routes/shopRoutes.js';
import menuItemRoutes from '../routes/menuItemRoutes.js';
import orderRoutes from '../routes/orderRoutes.js';
import reviewRoutes from '../routes/reviewRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';
import shopkeeperRoutes from '../routes/shopkeeperRoutes.js';
import deliveryRoutes from '../routes/deliveryRoutes.js';

// Load env vars
dotenv.config();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
}));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shopkeeper', shopkeeperRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'CampusEats API is running',
        timestamp: new Date().toISOString()
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to CampusEats API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            shops: '/api/shops',
            menuItems: '/api/menu-items',
            orders: '/api/orders',
            reviews: '/api/reviews'
        }
    });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campuseats')
    .then(() => {
        console.log('✅ MongoDB Connected');
        app.listen(PORT, () => {
            console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err.message);
    // Close server & exit process
    process.exit(1);
});

export default app;
