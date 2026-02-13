const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const mongoose = require('mongoose');

const COURSE_THUMBNAILS = {
    programming: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    design: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    business: 'https://images.unsplash.com/photo-1664575602276-acd073f104c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    marketing: 'https://images.unsplash.com/photo-1557838923-2985c318be48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    languages: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    other: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
};

const createCourse = async (req, res) => {
    try {
        console.log('📝 ПОЛУЧЕН ЗАПРОС НА СОЗДАНИЕ КУРСА');
        
        if (!req.user && !req.session?.userId) {
            return res.status(401).json({
                success: false,
                message: 'Требуется авторизация'
            });
        }
        
        const user = await User.findById(req.session.userId);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }
        
        if (user.role !== 'instructor') {
            return res.status(403).json({
                success: false,
                message: 'Только инструкторы могут создавать курсы'
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
        
        const thumbnail = COURSE_THUMBNAILS[category] || COURSE_THUMBNAILS.other;
        
        const newCourse = new Course({
            title,
            description,
            instructor: user.fullName,
            instructorId: user._id,
            category,
            price: parseFloat(price) || 0,
            duration: parseInt(duration) || 10,
            level,
            studentsEnrolled: 0,
            rating: 0,
            lessons: [],
            isPublished: true,
            thumbnail,
            requirements: Array.isArray(requirements) ? requirements : 
                         (typeof requirements === 'string' ? requirements.split('\n').filter(l => l.trim()) : []),
            learningOutcomes: Array.isArray(learningOutcomes) ? learningOutcomes : 
                            (typeof learningOutcomes === 'string' ? learningOutcomes.split('\n').filter(l => l.trim()) : []),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        await newCourse.save();
        
        res.json({
            success: true,
            message: 'Курс успешно создан',
            course: {
                ...newCourse.toObject(),
                id: newCourse._id
            }
        });
        
    } catch (error) {
        console.error('❌ Ошибка создания курса:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера: ' + error.message
        });
    }
};

// @desc    Получение всех курсов с флагом подписки
// @route   GET /api/courses
const getAllCourses = async (req, res) => {
    try {
        const query = { isPublished: true };
        
        // Фильтрация
        if (req.query.category && req.query.category !== '') {
            query.category = req.query.category;
        }
        
        if (req.query.level && req.query.level !== '') {
            query.level = req.query.level;
        }
        
        // Поиск
        if (req.query.search && req.query.search.trim() !== '') {
            const searchTerm = req.query.search.trim();
            query.$or = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } }
            ];
        }
        
        // Пагинация
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;
        
        const [courses, total] = await Promise.all([
            Course.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            Course.countDocuments(query)
        ]);
        
        // Получаем все подписки текущего пользователя (если авторизован)
        let enrolledCourseIds = [];
        if (req.user || req.session?.userId) {
            const enrollments = await Enrollment.find({ 
                studentId: req.session.userId 
            });
            enrolledCourseIds = enrollments.map(e => e.courseId.toString());
        }
        
        res.json({
            success: true,
            courses: courses.map(course => ({
                id: course._id,
                title: course.title,
                description: course.description,
                instructor: course.instructor,
                category: course.category,
                price: course.price,
                duration: course.duration,
                level: course.level,
                studentsEnrolled: course.studentsEnrolled,
                rating: course.rating,
                thumbnail: course.thumbnail,
                isEnrolled: enrolledCourseIds.includes(course._id.toString()) // ФЛАГ ПОДПИСКИ
            })),
            total,
            totalPages: Math.ceil(total / limit),
            page,
            limit
        });
        
    } catch (error) {
        console.error('❌ Ошибка загрузки курсов:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
};

const getCourseById = async (req, res) => {
    try {
        const courseId = req.params.id;
        let course = null;
        
        if (mongoose.Types.ObjectId.isValid(courseId)) {
            course = await Course.findById(courseId);
        }
        
        if (!course) {
            course = await Course.findOne({ id: courseId });
        }
        
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Курс не найден'
            });
        }
        
        let thumbnail = course.thumbnail;
        if (!thumbnail || 
            thumbnail.includes('undefined') || 
            thumbnail.includes('random') ||
            thumbnail.includes('photo-')) {
            thumbnail = COURSE_THUMBNAILS[course.category] || COURSE_THUMBNAILS.other;
        }
        
        let isEnrolled = false;
        if (req.user || req.session?.userId) {
            const enrollment = await Enrollment.findOne({
                studentId: req.session.userId,
                courseId: course._id
            });
            isEnrolled = !!enrollment;
        }
        
        res.json({
            success: true,
            course: {
                ...course.toObject(),
                id: course._id,
                thumbnail
            },
            isEnrolled
        });
        
    } catch (error) {
        console.error('❌ Ошибка получения курса:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
};

const getMyCourses = async (req, res) => {
    try {
        if (!req.user && !req.session?.userId) {
            return res.status(401).json({
                success: false,
                message: 'Требуется авторизация'
            });
        }
        
        const courses = await Course.find({ instructorId: req.session.userId })
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            courses: courses.map(course => {
                let thumbnail = course.thumbnail;
                if (!thumbnail || 
                    thumbnail.includes('undefined') || 
                    thumbnail.includes('random') ||
                    thumbnail.includes('photo-')) {
                    thumbnail = COURSE_THUMBNAILS[course.category] || COURSE_THUMBNAILS.other;
                }
                
                return {
                    ...course.toObject(),
                    id: course._id,
                    thumbnail
                };
            })
        });
        
    } catch (error) {
        console.error('❌ Ошибка загрузки моих курсов:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
};

const deleteCourse = async (req, res) => {
    try {
        if (!req.user && !req.session?.userId) {
            return res.status(401).json({
                success: false,
                message: 'Требуется авторизация'
            });
        }
        
        const courseId = req.params.id;
        let course = null;
        
        if (mongoose.Types.ObjectId.isValid(courseId)) {
            course = await Course.findById(courseId);
        }
        
        if (!course) {
            course = await Course.findOne({ id: courseId });
        }
        
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Курс не найден'
            });
        }
        
        if (course.instructorId.toString() !== req.session.userId) {
            return res.status(403).json({
                success: false,
                message: 'Вы не можете удалить этот курс'
            });
        }
        
        await Course.deleteOne({ _id: course._id });
        await Enrollment.deleteMany({ courseId: course._id });
        
        res.json({
            success: true,
            message: 'Курс успешно удален'
        });
        
    } catch (error) {
        console.error('❌ Ошибка удаления курса:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при удалении курса'
        });
    }
};

module.exports = {
    createCourse,
    getAllCourses,
    getCourseById,
    getMyCourses,
    deleteCourse
};