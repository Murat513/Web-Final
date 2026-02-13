const User = require('../models/User');
const { generateSessionId } = require('../middleware/authMiddleware');

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
        
        const sessionId = generateSessionId();
        req.session.userId = newUser._id.toString();
        req.session.userRole = newUser.role;
        req.session._createdAt = Date.now();
        res.locals.sessionId = sessionId;
        
        res.cookie('sessionId', sessionId, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: false,
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
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при регистрации'
        });
    }
};

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
        
        const sessionId = generateSessionId();
        req.session.userId = user._id.toString();
        req.session.userRole = user.role;
        req.session._createdAt = Date.now();
        res.locals.sessionId = sessionId;
        
        res.cookie('sessionId', sessionId, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: false,
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
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при входе'
        });
    }
};

const logout = (req, res) => {
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
        const { sessions } = require('../middleware/authMiddleware');
        delete sessions[sessionId];
    }
    
    res.clearCookie('sessionId');
    res.json({
        success: true,
        message: 'Выход выполнен'
    });
};

const checkAuth = async (req, res) => {
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
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