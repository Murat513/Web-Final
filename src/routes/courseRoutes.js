const express = require('express');
const router = express.Router();
const { 
    createCourse,
    getAllCourses,
    getCourseById,
    getMyCourses,
    deleteCourse
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Все курсы (публичный)
router.get('/', getAllCourses);

// Мои курсы (инструктор)
router.get('/my', protect, getMyCourses);

// Создание курса (инструктор)
router.post('/', protect, authorize('instructor', 'admin'), createCourse);

// Курс по ID
router.get('/:id', getCourseById);

// Удаление курса (инструктор)
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);

module.exports = router;