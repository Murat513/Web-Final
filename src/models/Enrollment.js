const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedLessons: [Number],
    enrolledAt: { type: Date, default: Date.now },
    lastAccessed: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Enrollment', enrollmentSchema);