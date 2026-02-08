const express = require('express');
const router = express.Router();
const { 
  enrollInCourse,
  getMyCourses,
  updateProgress,
  unenrollFromCourse,
  getEnrollmentDetails
} = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:courseId', protect, enrollInCourse);
router.get('/my-courses', protect, getMyCourses);
router.put('/:id/progress', protect, updateProgress);
router.delete('/:id', protect, unenrollFromCourse);
router.get('/:id', protect, getEnrollmentDetails);

module.exports = router;