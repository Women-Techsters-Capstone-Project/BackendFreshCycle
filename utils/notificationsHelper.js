const { Notifications } = require('../models');

exports.sendNotification = async (userId, message, orderId = null) => {
    try {
        await Notifications.create({
            user_id: userId,
            message,
            order_id: orderId,
            is_read: false
        });

        console.log(`Notification sent to User ${userId}`);
    } catch (err) {
        console.error('Notification failed to save', err);
    }
};