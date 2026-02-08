const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

exports.enrollInCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Course is not published yet'
      });
    }

    const existingEnrollment = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: req.params.courseId
    });

    course.studentsEnrolled += 1;
    await course.save();

    res.status(201).json({
      success: true,
      enrollment
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyCourses = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'username fullName avatar'
        }
      })
      .sort({ lastAccessed: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProgress = async (req, res, next) => {
  try {
    const { lessonIndex } = req.body;
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    if (enrollment.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this enrollment'
      });
    }

    if (!enrollment.completedLessons.includes(lessonIndex)) {
      enrollment.completedLessons.push(lessonIndex);
    }

    const course = await Course.findById(enrollment.course);
    if (course && course.lessons.length > 0) {
      enrollment.progress = Math.round(
        (enrollment.completedLessons.length / course.lessons.length) * 100
      );
      
      if (enrollment.progress === 100 && !enrollment.completedAt) {
        enrollment.completedAt = new Date();
      }
    }

    enrollment.lastAccessed = new Date();
    await enrollment.save();

    res.status(200).json({
      success: true,
      enrollment
    });
  } catch (error) {
    next(error);
  }
};

exports.unenrollFromCourse = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    if (enrollment.student.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to unenroll from this course'
      });
    }

    const course = await Course.findById(enrollment.course);
    if (course && course.studentsEnrolled > 0) {
      course.studentsEnrolled -= 1;
      await course.save();
    }

    await enrollment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Successfully unenrolled from the course'
    });
  } catch (error) {
    next(error);
  }
};

exports.getEnrollmentDetails = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'username fullName avatar'
        }
      });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    if (enrollment.student.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this enrollment'
      });
    }

    res.status(200).json({
      success: true,
      enrollment
    });
  } catch (error) {
    next(error);
  }
};