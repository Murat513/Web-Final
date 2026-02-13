const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Запись на курс
// @route   POST /api/enroll/:courseId
const enrollCourse = async (req, res) => {
    try {
        if (!req.user && !req.session?.userId) {
            return res.status(401).json({
                success: false,
                message: 'Требуется авторизация'
            });
        }
        
        const courseId = req.params.courseId;
        console.log('📝 Запись на курс:', courseId);
        
        // Поиск курса
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
        
        // 🔥 ПРОСТО СОЗДАЕМ ЗАПИСЬ, БЕЗ ПРОВЕРОК
        const enrollment = new Enrollment({
            studentId: req.session.userId,
            courseId: course._id,
            progress: 0,
            enrolledAt: new Date()
        });
        
        await enrollment.save();
        console.log('✅ Запись создана:', enrollment._id);
        
        // Увеличиваем счетчик
        course.studentsEnrolled += 1;
        await course.save();
        
        res.json({
            success: true,
            message: 'Вы успешно записались на курс!',
            enrollment: {
                id: enrollment._id,
                courseId: course._id,
                courseTitle: course.title
            }
        });
        
    } catch (error) {
        console.error('❌ Ошибка:', error.code, error.message);
        res.status(500).json({
            success: false,
            message: 'Ошибка: ' + error.message
        });
    }
};

// @desc    Мои курсы
// @route   GET /api/enroll/my-courses
const getMyEnrollments = async (req, res) => {
    try {
        if (!req.user && !req.session?.userId) {
            return res.status(401).json({ success: false, message: 'Требуется авторизация' });
        }
        
        const enrollments = await Enrollment.find({ studentId: req.session.userId })
            .populate('courseId');
        
        res.json({
            success: true,
            enrollments: enrollments.map(e => ({
                enrollmentId: e._id,
                course: e.courseId ? {
                    id: e.courseId._id,
                    title: e.courseId.title,
                    instructor: e.courseId.instructor,
                    thumbnail: e.courseId.thumbnail
                } : null,
                progress: e.progress,
                enrolledAt: e.enrolledAt
            })).filter(e => e.course !== null)
        });
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
};

// @desc    Созданные курсы (инструктор)
const getCreatedCourses = async (req, res) => {
    try {
        if (!req.user && !req.session?.userId) {
            return res.status(401).json({ success: false, message: 'Требуется авторизация' });
        }
        
        const courses = await Course.find({ instructorId: req.session.userId });
        res.json({
            success: true,
            courses: courses.map(c => ({ ...c.toObject(), id: c._id }))
        });
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
};

// @desc    Отписка
const unenrollCourse = async (req, res) => {
    try {
        if (!req.user && !req.session?.userId) {
            return res.status(401).json({ success: false, message: 'Требуется авторизация' });
        }
        
        const enrollment = await Enrollment.findById(req.params.enrollmentId);
        
        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Запись не найдена' });
        }
        
        if (enrollment.studentId.toString() !== req.session.userId) {
            return res.status(403).json({ success: false, message: 'Нет прав' });
        }
        
        const course = await Course.findById(enrollment.courseId);
        if (course) {
            course.studentsEnrolled = Math.max(0, course.studentsEnrolled - 1);
            await course.save();
        }
        
        await enrollment.deleteOne();
        res.json({ success: true, message: 'Отписка успешна' });
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
};

module.exports = {
    enrollCourse,
    getMyEnrollments,
    getCreatedCourses,
    unenrollCourse
};