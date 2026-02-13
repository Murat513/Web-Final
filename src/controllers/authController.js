const User = require('../models/User');
const { generateSessionId, generateToken } = require('../middleware/authMiddleware');

// @desc    Регистрация
const register = async (req, res) => {
    try {
        const { username, email, password, fullName, role = 'student' } = req.body;
        
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Пользователь уже существует'
            });
        }
        
        const newUser = new User({
            username,
            email,
            password,
            fullName,
            role,
            bio: '',
            avatar: 'default-avatar.jpg',
            createdAt: new Date()
        });
        
        await newUser.save();
        
        // Генерируем оба типа аутентификации
        const sessionId = generateSessionId();
        const token = generateToken(newUser);
        
        req.session.userId = newUser._id.toString();
        req.session.userRole = newUser.role;
        req.session._createdAt = Date.now();
        res.locals.sessionId = sessionId;
        
        // Устанавливаем оба cookie
        res.cookie('sessionId', sessionId, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: false,
            sameSite: 'lax'
        });
        
        res.cookie('token', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'lax'
        });
        
        res.json({
            success: true,
            message: 'Регистрация успешна',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                fullName: newUser.fullName,
                role: newUser.role
            },
            token
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при регистрации'
        });
    }
};

// @desc    Вход
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email, password });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }
        
        // Генерируем оба типа аутентификации
        const sessionId = generateSessionId();
        const token = generateToken(user);
        
        req.session.userId = user._id.toString();
        req.session.userRole = user.role;
        req.session._createdAt = Date.now();
        res.locals.sessionId = sessionId;
        
        // Устанавливаем оба cookie
        res.cookie('sessionId', sessionId, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: false,
            sameSite: 'lax'
        });
        
        res.cookie('token', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'lax'
        });
        
        res.json({
            success: true,
            message: 'Вход выполнен',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            },
            token
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при входе'
        });
    }
};

// @desc    Выход
const logout = (req, res) => {
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
        const { sessions } = require('../middleware/authMiddleware');
        delete sessions[sessionId];
    }
    
    // Очищаем оба cookie
    res.clearCookie('sessionId');
    res.clearCookie('token');
    
    res.json({
        success: true,
        message: 'Выход выполнен'
    });
};

// @desc    Проверка авторизации
const checkAuth = async (req, res) => {
    // Проверяем оба способа аутентификации
    const userId = req.user?.id || req.session?.userId;
    
    if (userId) {
        try {
            const user = await User.findById(userId);
            if (user) {
                return res.json({
                    success: true,
                    isAuthenticated: true,
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        fullName: user.fullName,
                        role: user.role
                    }
                });
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    }
    
    res.json({
        success: true,
        isAuthenticated: false,
        user: null
    });
};

module.exports = {
    register,
    login,
    logout,
    checkAuth
};