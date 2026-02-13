const User = require('../models/User');

const getProfile = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Требуется авторизация'
            });
        }
        
        const user = await User.findById(req.session.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }
        
        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                bio: user.bio || '',
                avatar: user.avatar
            }
        });
        
    } catch (error) {
        console.error('❌ Ошибка получения профиля:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Требуется авторизация'
            });
        }
        
        const user = await User.findById(req.session.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }
        
        const { fullName, bio, username, email } = req.body;
        
        if (fullName) user.fullName = fullName;
        if (bio !== undefined) user.bio = bio;
        
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Этот username уже занят'
                });
            }
            user.username = username;
        }
        
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Этот email уже используется'
                });
            }
            user.email = email;
        }
        
        await user.save();
        
        res.json({
            success: true,
            message: 'Профиль успешно обновлен',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                bio: user.bio || '',
                avatar: user.avatar
            }
        });
        
    } catch (error) {
        console.error('❌ Ошибка обновления профиля:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера: ' + error.message
        });
    }
};

module.exports = {
    getProfile,
    updateProfile
};