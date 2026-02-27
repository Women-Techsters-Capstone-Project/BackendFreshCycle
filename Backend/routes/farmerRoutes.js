const express = require('express');
const router = express.Router();
const produceCtrl = require('../controllers/produceController');
const verifyToken = require('../middleware/authMiddleware');

// Add Produce
router.post('/produce', verifyToken, produceCtrl.addProduce);

// List Produce
router.get('/produce', verifyToken, produceCtrl.getMyProduce);

// Update Produce
router.put('/produce/:id', verifyToken, produceCtrl.updateProduce);

// Delete Produce
router.delete('/produce/:id', verifyToken, produceCtrl.deleteProduce);

// Farmer Dashboard
router.get('/dashboard', verifyToken, produceCtrl.getFarmerDashboard)

module.exports = router;