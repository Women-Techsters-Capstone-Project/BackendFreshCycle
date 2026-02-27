const express = require('express');
const router = express.Router();
const profileCtrl = require('../controllers/profileController');
const verifyToken = require('../middleware/authMiddleware');

// Get Profile
router.get('/api/profile', verifyToken, profileCtrl.getProfile);

// Update Profile
router.put('/api/profile', verifyToken, profileCtrl.updateProfile);

// Delete Profile
router.delete('/api/profile', verifyToken, profileCtrl.deleteProfile);

module.exports = router;