const { Order, OrderItem, Produce, User } = require('../models');
const { Op, fn, col } = require('sequelize');

exports.getGlobalTrades = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });

    try {
        
        // 1. Get all paid orders and their items 
        const activeOrders = await Order.findAll({
            where: { status: 'paid' },
            include: [
                { model: OrderItem, include: [{ model: Produce }] },
                { model: User, attributes: ['full_name', 'location'] }
            ],
            limit: 50,
            order: [['updatedAt', 'DESC']]
        });

        // 2. Map 
        const tradesWithLocations = activeOrders.map(order => {
            return {
                orderId: order.id,
                total: order.total_amount || order.total_price || 0,
                buyer: order.User || null,
                items: (order.OrderItems || []).map(item => ({
                    name: item.Produce?.name || null,
                    farmer_id: item.Produce?.farmer_id || null,
                    location: item.Produce?.location || null
                }))
            };
        });
        res.json(tradesWithLocations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// List all users
exports.getAllUsers = async (req, res) => {
    const { role } = req.query;
    const filter = role ? { where: { role } } : {};

    try {
        const users = await User.findAll(filter);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

// Admin Dashboard
exports.getAdminDashboard = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied" });

    try {
        const totalRevenue = await Order.sum('total_amount', { where: { status: 'paid' } });
        const totalUsers = await User.count();
        const activeProduces = await Produce.count({ where: { quantity: { [Op.gt]: 0 } } });

        const userRoles = await User.findAll({
            attributes: ['role', [fn('COUNT', col('role')), 'count']],
            group: ['role']
        });

        const recentTrades = await Order.findAll({
            limit: 10,
            include: [{ model: User, attributes: ['full_name', 'location'] }],
            order: [['createdAt', 'DESC']]
        });

        const topCategories = await Produce.findAll({
            attributes: ['category', [fn('COUNT', col('category')), 'count']],
            group: ['category'],
            limit: 5,
            order: [[fn('COUNT', col('category')), 'DESC']]
        });

        res.json({
            metrics: {
                revenue: totalRevenue || 0,
                users: totalUsers,
                listings: activeProduces
            },
            userBreakdown: userRoles,
            topCategories,
            recentTrades
        });

    } catch (err) {
        res.status(500).json({ error: "Dashboard data failed", details: err.message });
    }
};