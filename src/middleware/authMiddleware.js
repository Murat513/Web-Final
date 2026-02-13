// Сессии в памяти
let sessions = {};

const sessionMiddleware = (req, res, next) => {
    const sessionId = req.cookies?.sessionId;
    
    if (sessionId && sessions[sessionId]) {
        req.session = sessions[sessionId];
    } else {
        req.session = {};
    }
    
    res.locals.sessionId = sessionId;
    
    // Сохраняем сессию
    const originalEnd = res.end;
    res.end = function(...args) {
        if (res.locals.sessionId && Object.keys(req.session).length > 0) {
            sessions[res.locals.sessionId] = req.session;
        }
        originalEnd.apply(res, args);
    };
    
    next();
};

const protect = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: 'Требуется авторизация'
        });
    }
    next();
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.session.userRole || !roles.includes(req.session.userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Нет прав доступа'
            });
        }
        next();
    };
};

function generateSessionId() {
    return 'session_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
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
    protect,
    authorize,
    generateSessionId
};