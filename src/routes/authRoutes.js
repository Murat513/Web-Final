const express = require('express');
const router = express.Router();
const {
    register,
    login,
    logout,
    checkAuth,
    getProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Публичные маршруты
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/check', checkAuth);


module.exports = router;