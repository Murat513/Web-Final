const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
    bio: { type: String, default: '' },
    avatar: { type: String, default: 'default-avatar.jpg' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);