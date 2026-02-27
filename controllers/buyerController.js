const { sequelize, Order: OrderModel, OrderItem: OrderItemModel, Produce, User } = require('../models');
const { sendNotification } = require('../utils/notificationsHelper');
const { Op } = require('sequelize');

// View Produce by name, location or harvest_date
exports.viewAllProduce = async (req, res) => {
    const { name, location, date, category } = req.query;
    let filter = { quantity: { [Op.gt]: 0 } };

    if (name) filter.name = { [Op.like]: `%${name}%` };
    if (location) filter.location = { [Op.like]: `%${location}%` };
    if (date) filter.harvest_date = date;
    if (category) filter.category = category;

    try {
        const queryOptions = {
          where: filter,
          include: [{ model: User, attributes: ['full_name', 'phone_number'] }]
        };
        console.log('viewAllProduce queryOptions:', JSON.stringify(queryOptions));
        const produce = await Produce.findAll(queryOptions);
        res.json(produce);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Create Order
exports.createOrder = async (req, res) => {
  const { buyer_id, items, delivery_type } = req.body;
  
  try {
    const result = await sequelize.transaction(async (t) => {
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // 1. Create Order
  const order = await OrderModel.create({
        buyer_id,
        total_price: totalPrice,
        delivery_type,
        status: 'pending'
      }, { transaction: t });

  const farmerNotifications = new Set();
  for (const item of items) {
        // 2. Find and Lock the Produce row
        const produce = await Produce.findByPk(item.produce_id, { 
          transaction: t,
          lock: t.LOCK.UPDATE 
        });

        if (!produce || produce.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${produce?.name || 'item'}`);
        }

        // 3. Update Inventory
        const newQty = produce.quantity - item.quantity;
        await produce.update({
          quantity: newQty,
          status: newQty <= 0 ? 'sold' : 'available'
        }, { transaction: t });

        // 4. Create Order Item
        await OrderItemModel.create({
          order_id: order.id,
          produce_id: item.produce_id,
          quantity: item.quantity,
          price_at_purchase: item.price
        }, { transaction: t });

        // collect farmer id for notification
        if (produce.farmer_id) farmerNotifications.add(produce.farmer_id);
    }

    return order;
  });

  // 5. Send Notification to farmers collected during the transaction
  if (result && result.id) {
    try {
      farmerNotifications.forEach(farmerId => {
        sendNotification(
          farmerId,
          `New Order Received! Order ID: #${result.id}. Check your produce dashboard.`,
          result.id
        );
      });
    } catch (notifyErr) {
      console.error('Failed to send farmer notifications', notifyErr);
    }
  }

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create Bulk Order
exports.createBulkOrder = async (req, res) => {
    if (req.user.role !== 'buyer') return res.status(403).json({ error: "Only buyers can place orders" });

    const {items } = req.body;
    const t = await sequelize.transaction();
    const farmerNotifications = new Set();

    try {
        let totalOrderPrice = 0;

  // 1. Create main Order record
  const order = await OrderModel.create({ buyer_id: req.user.userId }, { transaction: t });

        // 2. Process each item
        for (const item of items) {
            const product = await Produce.findByPk(item.produce_id);

            if (!product || product.quantity < item.quantity) {
                throw new Error(`Product ${item.produce_id} is unavailable or has insufficient stock.`);
            }

            const itemPrice = product.price_per_kg * item.quantity;
            totalOrderPrice += itemPrice;

            // Create Order item linked to this order
            await OrderItemModel.create({
                order_id: order.id,
                produce_id: product.id,
                quantity: item.quantity,
                price_at_purchase: product.price_per_kg
            }, { transaction: t })

            // 3. Deduct stock from Produce table
            await product.update({
                quantity: product.quantity - item.quantity
            }, { transaction: t })

            farmerNotifications.add(product.farmer_id);
        }
        
        // 4. Update total price in main Order
        await order.update({ total_price: totalOrderPrice }, { transaction: t });

        await t.commit();

        // 5. Send Notification to farmer
        farmerNotifications.forEach(farmerId => {
            sendNotification(
                farmerId,
                `New Bulk Order Received! Order ID: #${order.id}. Check your produce dashboard.`,
                order.id
            );
        });

        res.status(201).json({ message: "Bulk order placed successfully", orderId: order.id, total: totalOrderPrice });

    } catch (err) {
        await t.rollback();
        res.status(400).json({ error: err.message });
    };
};

// Get Buyer Deliveries
exports.getBuyerDeliveries = async (req, res) => {
  try{
  const deliveries = await OrderModel.findAll({
      where: {
        buyer_id: req.user.userId,
        status: ['shipping', 'delivered'] 
      },
      include: [{ 
    model: OrderItemModel, 
        include: [{ model: Produce, attributes: ['name', 'location'] }] 
      }]
    });

    if (!deliveries.length) {
      return res.status(404).json({ message: "No active deliveries found." });
    }

    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ error: "Error fetching deliveries", details: err.message });
  }
};

// Buyer Dashboard
exports.getBuyerDashboard = async (req, res) => {
    if (req.user.role !== 'buyer') return res.status(403).json({ error: "Access denied" });

    try { 
        const buyerId = req.user.userId;

        // 1. Total Spent (Sum of all orders)
  const totalSpent = await OrderModel.sum('total_price', {
            where: { buyer_id: buyerId, status: 'paid' }
        });

        // 2. Active Orders
  const activeOrders = await OrderModel.findAll({
            where: {
                buyer_id: buyerId,
                status: { [Op.in]: ['paid', 'shipping'] }
            },
            include: [{
    model: OrderItemModel,
                include: [{ model: Produce, attributes: ['name', 'category'] }]
            }],
            order: [['updatedAt', 'DESC']]
        });

        // Pending Payments (Items in Cart)
    const pendingOrders = await OrderModel.findAll({
      where: { buyer_id: buyerId, status: 'pending' },
      include: [{ model: OrderItemModel, include: [Produce] }]
    });

        res.json({
            summary: {
                totalSpent: totalSpent || 0,
                activeDeliveries: activeOrders.length,
                itemsInCart: pendingOrders.length
            },
            activeOrders,
            cart: pendingOrders
        });

    } catch (err) {
        res.status(500).json({ error: "Could not load buyer dashboard", details: err.message })
    }
};