const express = require('express');
const router = express.Router();
const aiCtrl = require('../controllers/aiController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/api/ai/predict-price', verifyToken, aiCtrl.pricePrediction);

module.exports = router;