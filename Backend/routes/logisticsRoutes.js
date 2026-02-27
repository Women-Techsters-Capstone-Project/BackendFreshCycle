const express = require('express');
const router = express.Router();
const logisticsCtrl = require('../controllers/logisticsController');
const verifyToken = require('../middleware/authMiddleware');

// List Available Deliveries
// Note: `app.js` mounts this router at '/api/logistics', so keep paths relative.
router.get('/requests', verifyToken, (req, res, next) => {
    if (req.user.role !== 'logistics' && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Logistics access only" });
    }
    next();
}, logisticsCtrl.getAvailableJobs);

// List Deliveries


// Accept Deliveries
router.post('/accept/:id', verifyToken, logisticsCtrl.claimOrder);

// Complete Deliveries
router.put('/deliver/:id', verifyToken, logisticsCtrl.completeDelivery);

module.exports = router;