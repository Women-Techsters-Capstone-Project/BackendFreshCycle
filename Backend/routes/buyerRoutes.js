const express = require('express');
const router = express.Router();
const buyerCtrl = require('../controllers/buyerController');
const verifyToken = require('../middleware/authMiddleware');
const { generateReceipt } = require('../utils/receiptGenerator');
const { OrderItem, Order, Produce } = require('../models');
const payCtrl = require('../controllers/paymentController');

// Main Dashboard
router.get('/dashboard', verifyToken, buyerCtrl.getBuyerDashboard);

// Marketplace
router.get('/marketplace', verifyToken, buyerCtrl.viewAllProduce);

// View specific order details
router.get('/orders/:id', verifyToken, async (req, res) => {
    try {
        const order = await Order.findOne({
            where: { id: req.params.id, buyer_id: req.user.userId },
            include: [{ model: OrderItem, include: [Produce] }]
        });

        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: 'Could not fetch order' });
    }
});

// Create Order
router.post('/orders', verifyToken, buyerCtrl.createOrder);

// Create Bulk Order
router.post('/orders/bulk', verifyToken, buyerCtrl.createBulkOrder);

// Get receipt
router.get('/orders/:id/receipt', verifyToken, async (req, res) => {
    try {
        const order = await Order.findOne({
            where: { id: req.params.id, buyer_id: req.user.userId }
        });

        if (!order || order.status !== 'paid') {
            return res.status(403).json({ error: "Receipt unavailable.Please complete payment first." });
        }
        
        const items = await OrderItem.findAll({
            where: { order_id: order.id },
            include: [Produce]
        });

        await generateReceipt(order, items, res);
    } catch (err) {
        res.status(500).send("Error generating receipt");
    }
});

// Get Orders


// View tracking info
router.get('/my-deliveries', verifyToken, buyerCtrl.getBuyerDeliveries);

// Trigger Delivery Payment
router.post('/pay-order', verifyToken, payCtrl.payForDelivery)

module.exports = router;