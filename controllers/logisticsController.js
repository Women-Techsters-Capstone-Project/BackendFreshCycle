const { Order, OrderItem, Produce, Consignment } = require('../models');

// 1. View all paid orders waiting delivery
exports.getAvailableJobs = async (req, res) => {
    try {
        const jobs = await Order.findAll({
            where: { status: 'paid' },
            include: [{ model: OrderItem, include: [Produce] }]
        });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Claim an order for delivery
exports.claimOrder = async (req, res) => {
    const { orderId, pickup, delivery, estDate } = req.body;

    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        const consignment = await Consignment.create({
            order_id: orderId,
            driver_id: req.user.userId,
            pickup_location: pickup,
            delivery_location: delivery,
            estimated_delivery: estDate,
            status: 'in-transit'
        });

        await Order.update({ status: 'shipping' }, { where: { id: orderId } });
        res.status(201).json(consignment);
    } catch (err) {
        res.status(400).json({ error: "Could not claim order", details: err.message });
    }
};

// 3. Update delivery status to delivered
exports.completeDelivery = async (req, res) => {
    try {
        await Consignment.update(
            { status: 'delivered' },
            { where: { id: req.params.id, driver_id: req.user.userId } }
        );
        res.json({ message: "Delivered confirmed" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};