const mongoose = require('mongoose');
require('dotenv').config();

const fixFarmerRole = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/krishop');
        console.log('Connected to MongoDB...');

        const db = mongoose.connection.db;
        const result = await db.collection('users').updateOne(
            { email: 'farmers@gem.test' },
            { $set: { role: 'farmer' } }
        );

        console.log('Update result:', result);
        process.exit(0);
    } catch (err) {
        console.error('Error updating role:', err);
        process.exit(1);
    }
};

fixFarmerRole();