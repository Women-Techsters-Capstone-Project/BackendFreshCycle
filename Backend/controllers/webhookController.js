const { Order, OrderItem, Produce } = require('../models');
const { sendNotification } = require('../utils/notificationsHelper');

exports.handleMomoWebhook = async (req, res) => {
    const signature = req.headers['x-pay-signature'];
    if (typeof verifySignature !== 'function' || !verifySignature(req.body, signature)) {
        return res.status(401).send('Invalid signature');
    }

    const { status, reference, transactionId } = req.body;

    try {
    const orderId = reference.replace(/ORDER-/i, '');
        const order = await Order.findByPk(orderId);

        if (!order) return res.status(404).send('Order not found');

        if (status === 'success' || status === 'paid') {
            await order.update({
                status: 'paid',
                transaction_id: transactionId
            });
        }

        try {
            await sendNotification(
                order.buyer_id,
                `Payment successful! Your receipt for Order #${order.id} is now available for download.`,
                order.id
            );
        } catch (notifyErr) {
            console.error('Failed to send notification:', notifyErr);
        }

        console.log(`Payment confirmed for Order ${orderId}`);
        return res.status(200).send('OK');
    } catch (err) {
        console.error('Webhook Error', err);
        res.status(500).send('Internal Server Error');
    }
};