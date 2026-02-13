const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/courses-platform');
        console.log('🟢 MongoDB подключена');
        console.log(`📊 База: ${mongoose.connection.db.databaseName}`);
        return mongoose.connection;
    } catch (err) {
        console.error('❌ Ошибка MongoDB:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;