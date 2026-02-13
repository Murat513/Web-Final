const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: String,
    content: String,
    duration: Number,
    order: Number
});

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: { type: String, required: true },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    price: { type: Number, default: 0 },
    duration: { type: Number, required: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    studentsEnrolled: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    lessons: [lessonSchema],
    requirements: [String],
    learningOutcomes: [String],
    isPublished: { type: Boolean, default: true },
    thumbnail: { type: String, default: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);