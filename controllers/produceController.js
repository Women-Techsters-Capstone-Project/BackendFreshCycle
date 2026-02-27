const { Produce, Order, OrderItem } = require('../models');
const { Op } = require('sequelize');

// Create Produce
exports.addProduce = async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Access denied: no user' });
    if (req.user.role !== 'farmer') return res.status(403).json({ error: "Access denied"});

    try {
        const produce = await Produce.create({ ...req.body, farmer_id: req.user.userId });
        res.status(201).json(produce);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Edit Produce
exports.updateProduce = async (req, res) => {
    try {
        const produce = await Produce.findOne({ where: {id: req.params.id, farmer_id: req.user.userId } });
        if (!produce) return res.status(404).json({ error: "Produce not found" });

        await produce.update(req.body);
        res.json({ message: "Updated successfully", produce });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete Produce
exports.deleteProduce = async (req, res) => {
    try {
        const deleted = await Produce.destroy({ where: { id: req.params.id, farmer_id: req.user.userId } });
        if (!deleted) return res.status(404).json({ error: "Produce not found" });
        res.json({ message: "Produce deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Search Produce
exports.getMyProduce = async (req, res) => {
    const { name, date } = req.query; // filters come in query for GET
    if (!req.user) return res.status(401).json({ error: 'Access denied: no user' });
    let whereClause = { farmer_id: req.user.userId };

    if (name) {
    whereClause.name = { [Op.like]: `%${name}%` };
    }

    if (date) {
    whereClause.harvest_date = date;
    }

    try {
    const list = await Produce.findAll({ where: whereClause, order: [['harvest_date', 'DESC']] });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Farmer Dashboard
exports.getFarmerDashboard = async (req, res) => {
    if (req.user.role !== 'farmer') return res.status(403).json({ error: "Access denied" });

    try {
        const farmerId = req.user.userId;

        // 1. Total Sales
        const totalSales = await OrderItem.findAll({
            attributes: [[OrderItem.sequelize.literal('SUM(price_at_purchase * quantity)'), 'total']],
            include: [{
                model: Order,
                where: { status: 'paid' },
                attributes: []
            }, {
                model: Produce,
                where: { farmer_id: farmerId },
                attributes: []
            }],
            raw: true
        });

        // 2. Active Produce Count
        const activeListings = await Produce.count({
            where: { farmer_id: farmerId, quantity: { [Op.gt]: 0 } }
        });

        // 3. Pending Orders Count (Awaiting payment or action)
        const pendingOrdersCount = await OrderItem.count({
            include: [{
                model: Order,
                where: { status: 'pending' }
            }, {
                model: Produce,
                where: { farmer_id: farmerId }
            }]
        });

        // 4. Recent Sales (Last 5 paid items)
        const recentSales = await OrderItem.findAll({
            limit: 5,
            include: [
                { model: Produce, where: { farmer_id: farmerId } },
                { model: Order, where: { status: 'paid' } }
            ],
            order: [['createdAt', 'DESC']]
        });

        const totalEarnings = (totalSales && totalSales.length && totalSales[0].total) ? totalSales[0].total : 0;

        res.json({
            summary: {
                totalEarnings,
                activeListings,
                pendingOrders: pendingOrdersCount
            },
            recentSales
        });
    } catch (err) {
        res.status(500).json({ error: "Could not load dashboard data", details: err.message });
    }
};