    const express = require('express');
    const cors = require('cors');
    const fs = require('fs').promises;
    const path = require('path');

    const app = express();

    const DATA_FILE = path.join(__dirname, 'data.json');
    const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

    let sessions = {};

    app.use(cors({
        origin: 'http://localhost:5000',
        credentials: true
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static('public'));

    app.use((req, res, next) => {
        const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
        
        if (sessionId && sessions[sessionId]) {
            req.session = sessions[sessionId];
        } else {
            req.session = {};
        }
        
        res.locals.sessionId = sessionId;
        
        next();
    });

    app.use((req, res, next) => {
        const originalEnd = res.end;
        
        res.end = function(...args) {
            if (res.locals.sessionId && Object.keys(req.session).length > 0) {
                sessions[res.locals.sessionId] = req.session;
            }
            
            originalEnd.apply(res, args);
        };
        
        next();
    });

    async function loadData() {
        try {
            const data = await fs.readFile(DATA_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            const initialData = {
                users: [
                    {
                        id: '1',
                        username: 'john_doe',
                        email: 'john@example.com',
                        password: 'password123',
                        fullName: 'John Doe',
                        role: 'instructor',
                        bio: 'Senior Web Developer',
                        avatar: 'default-avatar.jpg',
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: '2',
                        username: 'jane_smith',
                        email: 'jane@example.com',
                        password: 'password123',
                        fullName: 'Jane Smith',
                        role: 'student',
                        bio: 'Aspiring developer',
                        avatar: 'default-avatar.jpg',
                        createdAt: new Date().toISOString()
                    }
                ],
                courses: [
                    {
                        id: '1',
                        title: 'JavaScript Basics',
                        description: 'Learn JavaScript from scratch',
                        instructor: 'John Doe',
                        instructorId: '1',
                        category: 'programming',
                        price: 0,
                        duration: 30,
                        level: 'beginner',
                        studentsEnrolled: 150,
                        rating: 4.5,
                        lessons: [],
                        isPublished: true,
                        thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
                    },
                    {
                        id: '4',
                        title: 'Python Programming',
                        description: 'Learn Python from zero to hero. Perfect for beginners who want to start programming.',
                        instructor: 'Jane Smith',
                        instructorId: '2',
                        category: 'programming',
                        price: 30,
                        duration: 35,
                        level: 'beginner',
                        studentsEnrolled: 180,
                        rating: 4.6,
                        lessons: [
                            { id: 1, title: 'Python Basics', content: 'Syntax and basic concepts', duration: 45, order: 1 },
                            { id: 2, title: 'Data Structures', content: 'Lists, dictionaries, tuples', duration: 55, order: 2 }
                        ],
                        isPublished: true,
                        thumbnail: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
                    }
                ],
                enrollments: []
            };
            
            await saveData(initialData);
            return initialData;
        }
    }

    async function saveData(data) {
        try {
            await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    let data = loadData();

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    function generateSessionId() {
        return 'session_' + generateId();
    }

    app.post('/api/courses', async (req, res) => {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Требуется авторизация'
            });
        }
        
        try {
            const loadedData = await data;
            const user = loadedData.users.find(u => u.id === req.session.userId);
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Пользователь не найден'
                });
            }
            
            const {
                title,
                description,
                category,
                level,
                price,
                duration,
                requirements = [],
                learningOutcomes = []
            } = req.body;
            
            if (!title || !description || !category || !level || price === undefined || !duration) {
                return res.status(400).json({
                    success: false,
                    message: 'Заполните все обязательные поля'
                });
            }
            
            const newCourse = {
                id: generateId(),
                title,
                description,
                instructor: user.fullName,
                instructorId: user.id,
                category,
                price: parseFloat(price) || 0,
                duration: parseInt(duration) || 10,
                level,
                studentsEnrolled: 0,
                rating: 0,
                lessons: [],
                isPublished: false,
                thumbnail: `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2)}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`,
                requirements: Array.isArray(requirements) ? requirements : [],
                learningOutcomes: Array.isArray(learningOutcomes) ? learningOutcomes : [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            loadedData.courses.push(newCourse);
            await saveData(loadedData);
            
            res.json({
                success: true,
                message: 'Курс успешно создан',
                course: newCourse
            });
            
        } catch (error) {
            console.error('Error creating course:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка сервера при создании курса'
            });
        }
    });

    app.get('/api/courses/my', async (req, res) => {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Требуется авторизация'
            });
        }
        
        const loadedData = await data;
        const userCourses = loadedData.courses.filter(course => course.instructorId === req.session.userId);
        
        res.json({
            success: true,
            courses: userCourses
        });
    });

    app.post('/auth/register', async (req, res) => {
        const loadedData = await data;
        const { username, email, password, fullName, role = 'student' } = req.body;
        
        const existingUser = loadedData.users.find(u => u.email === email || u.username === username);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Пользователь уже существует'
            });
        }
        
        const newUser = {
            id: generateId(),
            username,
            email,
            password,
            fullName,
            role,
            bio: '',
            avatar: 'default-avatar.jpg',
            createdAt: new Date().toISOString()
        };
        
        loadedData.users.push(newUser);
        await saveData(loadedData);
        
        const sessionId = generateSessionId();
        req.session.userId = newUser.id;
        req.session.userRole = newUser.role;
        res.locals.sessionId = sessionId;
        
        res.cookie('sessionId', sessionId, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: false
        });
        
        res.json({
            success: true,
            message: 'Регистрация успешна',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                fullName: newUser.fullName,
                role: newUser.role
            },
            sessionId: sessionId
        });
    });

    app.post('/auth/login', async (req, res) => {
        const loadedData = await data;
        const { email, password } = req.body;
        
        const user = loadedData.users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }
        
        const sessionId = generateSessionId();
        req.session.userId = user.id;
        req.session.userRole = user.role;
        res.locals.sessionId = sessionId;
        
        res.cookie('sessionId', sessionId, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: false
        });
        
        res.json({
            success: true,
            message: 'Вход выполнен',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            },
            sessionId: sessionId
        });
    });

    app.post('/auth/logout', (req, res) => {
        const sessionId = req.cookies?.sessionId;
        if (sessionId) {
            delete sessions[sessionId];
        }
        
        res.clearCookie('sessionId');
        res.json({
            success: true,
            message: 'Выход выполнен'
        });
    });

    app.get('/auth/check', (req, res) => {
        if (req.session.userId) {
            data.then(loadedData => {
                const user = loadedData.users.find(u => u.id === req.session.userId);
                if (user) {
                    return res.json({
                        success: true,
                        isAuthenticated: true,
                        user: {
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            fullName: user.fullName,
                            role: user.role
                        }
                    });
                }
            }).catch(() => {
                res.json({
                    success: true,
                    isAuthenticated: false,
                    user: null
                });
            });
        } else {
            res.json({
                success: true,
                isAuthenticated: false,
                user: null
            });
        }
    });

    app.get('/auth/profile', async (req, res) => {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Требуется авторизация'
            });
        }
        
        const loadedData = await data;
        const user = loadedData.users.find(u => u.id === req.session.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }
        
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                bio: user.bio || '',
                avatar: user.avatar
            }
        });
    });

    app.get('/enroll/created-courses', async (req, res) => {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Требуется авторизация'
            });
        }
        
        const loadedData = await data;
        const user = loadedData.users.find(u => u.id === req.session.userId);
        
        if (user.role !== 'instructor') {
            return res.json({
                success: true,
                courses: []     
            });
        }
        
        const userCourses = loadedData.courses.filter(course => course.instructorId === req.session.userId);
        
        res.json({
            success: true,
            courses: userCourses
        });
    });

    app.get('/courses', async (req, res) => {
        const loadedData = await data;
        
        res.json({
            success: true,
            courses: loadedData.courses.filter(course => course.isPublished).map(course => ({
                id: course.id,
                title: course.title,
                description: course.description,
                instructor: course.instructor,
                category: course.category,
                price: course.price,
                duration: course.duration,
                level: course.level,
                studentsEnrolled: course.studentsEnrolled,
                rating: course.rating,
                thumbnail: course.thumbnail
            }))
        });
    });

    app.get('/courses/:id', async (req, res) => {
        const loadedData = await data;
        const course = loadedData.courses.find(c => c.id === req.params.id);
        
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Курс не найден'
            });
        }
        
        let isEnrolled = false;
        if (req.session.userId) {
            isEnrolled = loadedData.enrollments.some(e => 
                e.studentId === req.session.userId && e.courseId === course.id
            );
        }
        
        res.json({
            success: true,
            course,
            isEnrolled
        });
    });

    app.post('/enroll/:courseId', async (req, res) => {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Требуется авторизация'
            });
        }
        
        const loadedData = await data;
        const courseId = req.params.courseId;
        const course = loadedData.courses.find(c => c.id === courseId);
        
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Курс не найден'
            });
        }
        
        const existing = loadedData.enrollments.find(e => 
            e.studentId === req.session.userId && e.courseId === courseId
        );
        
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Уже записан'
            });
        }
        
        course.studentsEnrolled += 1;
        
        const enrollment = {
            id: generateId(),
            studentId: req.session.userId,
            courseId,
            progress: 0,
            enrolledAt: new Date().toISOString()
        };
        
        loadedData.enrollments.push(enrollment);
        await saveData(loadedData);
        
        res.json({
            success: true,
            message: 'Запись успешна',
            enrollment
        });
    });

    app.get('/enroll/my-courses', async (req, res) => {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Требуется авторизация'
            });
        }
        
        const loadedData = await data;
        const userEnrollments = loadedData.enrollments.filter(e => e.studentId === req.session.userId);
        
        const coursesWithEnrollment = userEnrollments.map(enrollment => {
            const course = loadedData.courses.find(c => c.id === enrollment.courseId);
            return {
                enrollmentId: enrollment.id,
                course: course ? {
                    id: course.id,
                    title: course.title,
                    description: course.description,
                    instructor: course.instructor,
                    thumbnail: course.thumbnail,
                    duration: course.duration,
                    price: course.price
                } : null,
                progress: enrollment.progress,
                enrolledAt: enrollment.enrolledAt
            };
        });
        
        res.json({
            success: true,
            enrollments: coursesWithEnrollment.filter(e => e.course !== null)
        });
    });

    app.delete('/enroll/:enrollmentId', async (req, res) => {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Требуется авторизация'
            });
        }
        
        const loadedData = await data;
        const enrollmentId = req.params.enrollmentId;
        
        const enrollmentIndex = loadedData.enrollments.findIndex(e => e.id === enrollmentId);
        
        if (enrollmentIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Запись не найдена'
            });
        }
        
        const enrollment = loadedData.enrollments[enrollmentIndex];
        
        if (enrollment.studentId !== req.session.userId) {
            return res.status(403).json({
                success: false,
                message: 'Нет прав'
            });
        }
        
        const course = loadedData.courses.find(c => c.id === enrollment.courseId);
        if (course && course.studentsEnrolled > 0) {
            course.studentsEnrolled -= 1;
        }
        
        loadedData.enrollments.splice(enrollmentIndex, 1);
        await saveData(loadedData);
        
        res.json({
            success: true,
            message: 'Отписка успешна'
        });
    });

    app.delete('/api/courses/:id', async (req, res) => {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Требуется авторизация'
            });
        }
        
        try {
            const loadedData = await data;
            const courseId = req.params.id;
            const courseIndex = loadedData.courses.findIndex(c => c.id === courseId);
            
            if (courseIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Курс не найден'
                });
            }
            
            const course = loadedData.courses[courseIndex];
            
            // Проверяем, что курс принадлежит текущему пользователю
            if (course.instructorId !== req.session.userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Вы не можете удалить этот курс'
                });
            }
            
            // Удаляем курс
            loadedData.courses.splice(courseIndex, 1);
            
            // Удаляем все записи на этот курс
            loadedData.enrollments = loadedData.enrollments.filter(enrollment => enrollment.courseId !== courseId);
            
            await saveData(loadedData);
            
            res.json({
                success: true,
                message: 'Курс успешно удален'
            });
            
        } catch (error) {
            console.error('Error deleting course:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка сервера при удалении курса'
            });
        }
    });


    app.get('/health', (req, res) => {
        res.json({
            success: true,
            message: 'API работает',
            timestamp: new Date().toISOString(),
            sessionsCount: Object.keys(sessions).length
        });
    });

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    setInterval(() => {
        const now = Date.now();
        Object.keys(sessions).forEach(sessionId => {
            if (sessions[sessionId]._createdAt && now - sessions[sessionId]._createdAt > 24 * 60 * 60 * 1000) {
                delete sessions[sessionId];
            }
        });
    }, 60 * 60 * 1000);

    module.exports = app;