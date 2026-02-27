const { User } = require('../models');

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Only allow known fields to be updated
        const { full_name, location, email, phone_number } = req.body;
        const updateData = {};
        if (full_name) updateData.full_name = full_name;
        if (location) updateData.location = location;
        if (email) updateData.email = email;
        if (phone_number) updateData.phone_number = phone_number;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        await User.update(updateData, { where: { id: userId } });
        const updatedUser = await User.findByPk(userId);
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        await User.destroy({ where: { id: userId } });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};