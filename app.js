require('dotenv').config();
const express = require('express');
const http = require('http');
const helmet = require('helmet');
const cors = require('cors');
const db = require('./models');
const verifyToken = require('./middleware/authMiddleware');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const buyerRoutes = require('./routes/buyerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');
const profileRoutes = require('./routes/profileRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/profile', verifyToken, (req, res) => {
    res.json({ message: "This is a protected profile", userId: req.user.userId });
});

// Health Check
app.get('/', (req, res) => res.send('Fresh-Cycle API is Running...'));

// Database and Server
const PORT = process.env.PORT || 3000;

db.sequelize.sync()
    .then(() => {
        console.log('MySQL Database Connected and Synced');
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to sync database:', err.message);
    });

// app.use(errorHandler);

module.exports = app;

