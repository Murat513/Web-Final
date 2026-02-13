const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

mongoose.connect('mongodb://localhost:27017/courses-platform')
.then(() => console.log('🟢 MongoDB подключена'))
.catch(err => console.error('❌ Ошибка MongoDB:', err.message));

// Модели
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');

// Мидлвары
app.use(cors({
    origin: 'http://localhost:5000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Сессии
const { sessionMiddleware } = require('./middleware/authMiddleware');
app.use(sessionMiddleware);

// Маршруты
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/auth', authRoutes);
app.use('/courses', courseRoutes);
app.use('/enroll', enrollmentRoutes);
app.use('/users', userRoutes);

// Тестовый маршрут
app.get('/test', (req, res) => {
    res.json({ success: true, message: 'API работает' });
});

module.exports = app;