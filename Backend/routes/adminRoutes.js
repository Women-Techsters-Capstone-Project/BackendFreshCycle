const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const verifyToken = require('../middleware/authMiddleware');

const isAdmin = (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
    next();
}

// Dashboard
router.get('/admin/stats', verifyToken, isAdmin, adminCtrl.getAdminDashboard);

// Get Users
router.get('/admin/users', verifyToken, isAdmin, adminCtrl.getAllUsers);

// Get Map
router.get('/admin/market-map', verifyToken, isAdmin, adminCtrl.getGlobalTrades);

module.exports = router;