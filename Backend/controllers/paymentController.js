const axios = require('axios');
const { Order, OrderItem, Produce } = require('../models');

// Pay for Order
exports.initiateMobileMoney = async (req, res) => {
    const { orderId, phoneNumber, provider } = req.body; // e.g. ('ecocash'/'mpesa')

    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        const order = await Order.findByPk(orderId);
        if (!order || order.buyer_id !== req.user.userId) {
            return res.status(404).json({ error: "Order not found" });
        }

        const amount = order.total_amount || order.total_price || 0;

        const paymentResponse = await axios.post(PAYMENT_GATEWAY_URL, {
            amount,
            currency: "USD",
            phone: phoneNumber,
            network: provider,
            reference: `Order-${order.id}`,
            callback_url: `${PAYMENT_GATEWAY_URL}/api/payments/webhook`
        }, {
            headers: { Authorization: `Bearer ${process.env.Payment_SECRET}` }
        });

        res.json({ message: "Payment Prompted on your phone", pollUrl: paymentResponse.data.poll_url });

    } catch (err) {
        res.status(500).json({ error: "Payment initiation failed", details: err.message });
    }
};

// Pay for Delivery
exports.payForDelivery = async (req, res) => {
    const { orderId, phoneNumber, provider } = req.body; // e.g. ('ecocash'/'mpesa')

    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        const order = await Order.findByPk(orderId);
        if (!order || order.buyer_id !== req.user.userId) {
            return res.status(404).json({ error: "Unauthorized or order not found" });
        }

        const amount = order.total_amount || order.total_price || 0;

        const response = await axios.post('https://api.paymentgateway.com', {
            amount,
            currency: "USD",
            phone: phoneNumber,
            network: provider,
            reference: `Order-${order.id}`,
            callback_url: `https://api.paymentgateway.com/api/payments/webhook`
        }, {
            headers: { Authorization: `Bearer ${process.env.Payment_SECRET}` }
        });

        res.json({ 
            message: "Payment Prompted on your phone", 
            pollUrl: response.data.poll_url 
        });

    } catch (err) {
        res.status(500).json({ error: "Payment initiation failed", details: err.message });
    }
};
