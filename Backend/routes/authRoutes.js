const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { validateSignup, validateAuth } = require('../middleware/validateAuth');
const verifyToken = require('../middleware/authMiddleware');
const { Notifications } = require('../models');

// Signup (ensure required signup fields validated first)
router.post('/signup', validateSignup, validateAuth, auth.signup)

// Login (email + password flow; phone validation not required)
router.post('/login', auth.login)

// Delete Account
router.delete('/delete-account', verifyToken, auth.deleteAccount)

// Notifications
router.get('/notifications', verifyToken, async (req, res) => {
    try {
        const notifications = await Notifications.findAll({
            where: { user_id: req.user.userId },
            order: [[require('../models').sequelize.col('Notifications.createdAt'), 'DESC']],
        });

        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: 'Could not fetch notifications' });
    }
});

module.exports = router;