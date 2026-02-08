const express = require('express');
const router = express.Router();
const { 
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addLesson,
  publishCourse
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateCourse } = require('../middleware/validationMiddleware');

router.post('/', protect, authorize('instructor', 'admin'), validateCourse, createCourse);
router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.put('/:id', protect, authorize('instructor', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);
router.post('/:id/lessons', protect, authorize('instructor', 'admin'), addLesson);
router.put('/:id/publish', protect, authorize('instructor', 'admin'), publishCourse);
const { suggestYouTubeVideos } = require('../controllers/courseController');

router.get('/:id/youtube-suggestions', protect, authorize('instructor', 'admin'), suggestYouTubeVideos);
module.exports = router;