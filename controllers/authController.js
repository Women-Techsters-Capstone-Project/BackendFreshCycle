const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, Order, Produce, sequelize } = require('../models')

// Signup
exports.signup = async (req, res) => {
    try {
        const { full_name, phone_number, password, email, role, location } = req.body;

        if (!phone_number || !password || !email) {
            return res.status(400).json({ error: 'phone_number, email and password are required' });
        }

        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email: email }, { phone_number: phone_number }]
            }
        });

        if (existingUser) {
            const field = existingUser.email === email ? 'Email' : "Phone number";
            return res.status(400).json({ error: `${field} is already registered.`})
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            full_name,
            phone_number,
            password: hashedPassword,
            email,
            role,
            location
        });

        res.status(201).json({
            message: "User created successfully",
            userId: newUser.id
        });

    } catch(err) {
        res.status(400).json({ error: "Signup failed", details: err.message })
    }
};

// Login (accepts email or phone_number)
exports.login = async (req, res) => {
    const { phone_number, email, password } = req.body;

    if (!password || (!phone_number && !email)) {
        return res.status(400).json({ error: 'Provide password and either phone_number or email' });
    }

    try{
        const where = phone_number ? { phone_number } : { email };
        const user = await User.findOne({ where });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
                name: user.full_name
            },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, role: user.role, name: user.full_name }
        });

    } catch (err) {
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};

// Delete Account
exports.deleteAccount = async (req, res) => {
    const userId = req.user.userId;
    const t = await sequelize.transaction();

    try {
        // fetch the user record to compare password
        const user = await User.findByPk(userId);
        if (!user) {
            await t.rollback();
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            await t.rollback();
            return res.status(401).json({ error: "Incorrect password" });
        }

        const activeOrders = await Order.count({ where: { buyer_id: userId, status: 'shipping' } });
        if (activeOrders > 0) {
            await t.rollback();
            return res.status(400).json({ error: "Cannot delete account with active deliveries." });
        }

        if (req.user.role === 'farmer') {
            await Produce.destroy({ where: { farmer_id: userId }, transaction: t });
        }

        await Order.update(
            { status: 'cancelled' },
            { where: { buyer_id: userId, status: 'pending' }, transaction: t }
        );

        await User.destroy({ where: { id: userId }, transaction: t });

        await t.commit();
        res.json({ message: "Account and associated data deleted successfully" });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ error: "Failed to delete account", details: err.message });
    }
};