const express = require('express');
const router = express.Router();
const { getCourseVideos } = require('../controllers/youtubeController');
const { protect } = require('../middleware/authMiddleware');

router.get('/search', protect, getCourseVideos);

module.exports = router;