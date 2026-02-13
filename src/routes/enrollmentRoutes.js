const express = require('express');
const router = express.Router();
const {
    enrollCourse,
    getMyEnrollments,
    getCreatedCourses,
    unenrollCourse
} = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');

// Все маршруты защищены
router.use(protect);

router.post('/:courseId', enrollCourse);
router.get('/my-courses', getMyEnrollments);
router.get('/created-courses', getCreatedCourses);  // ✅ Добавлен маршрут
router.delete('/:enrollmentId', unenrollCourse);

module.exports = router;