const jwt = require('jsonwebtoken');

// Секретный ключ для JWT (в продакшене должен быть в .env)
const JWT_SECRET = 'your-super-secret-jwt-key-2026';

// Сессии в памяти (оставляем для совместимости)
let sessions = {};

// Middleware для сессий (старый способ)
const sessionMiddleware = (req, res, next) => {
    const sessionId = req.cookies?.sessionId;
    
    if (sessionId && sessions[sessionId]) {
        req.session = sessions[sessionId];
    } else {
        req.session = {};
    }
    
    res.locals.sessionId = sessionId;
    
    const originalEnd = res.end;
    res.end = function(...args) {
        if (res.locals.sessionId && Object.keys(req.session).length > 0) {
            sessions[res.locals.sessionId] = req.session;
        }
        originalEnd.apply(res, args);
    };
    
    next();
};

// Middleware для JWT (новый способ)
const jwtMiddleware = (req, res, next) => {
    try {
        // Проверяем JWT в cookies
        const token = req.cookies?.token;
        
        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            
            // Для совместимости со старым кодом
            req.session.userId = decoded.id;
            req.session.userRole = decoded.role;
        }
    } catch (error) {
        // Невалидный токен - просто игнорируем
        console.log('JWT verification failed:', error.message);
    }
    next();
};

// Защита маршрутов (работает и с сессиями, и с JWT)
const protect = (req, res, next) => {
    const isAuthenticated = req.session?.userId || req.user?.id;
    
    if (!isAuthenticated) {
        return res.status(401).json({
            success: false,
            message: 'Требуется авторизация'
        });
    }
    next();
};

// Авторизация по ролям
const authorize = (...roles) => {
    return (req, res, next) => {
        const userRole = req.user?.role || req.session?.userRole;
        
        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Нет прав доступа'
            });
        }
        next();
    };
};

// Генерация ID для сессии
function generateSessionId() {
    return 'session_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Генерация JWT токена
function generateToken(user) {
    return jwt.sign(
        { 
            id: user._id.toString(), 
            role: user.role,
            username: user.username 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// Очистка старых сессий
setInterval(() => {
    const now = Date.now();
    Object.keys(sessions).forEach(sessionId => {
        if (sessions[sessionId]._createdAt && now - sessions[sessionId]._createdAt > 24 * 60 * 60 * 1000) {
            delete sessions[sessionId];
        }
    });
}, 60 * 60 * 1000);

module.exports = {
    sessions,
    sessionMiddleware,
    jwtMiddleware,
    protect,
    authorize,
    generateSessionId,
    generateToken,
    JWT_SECRET
};