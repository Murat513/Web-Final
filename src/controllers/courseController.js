const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { 
  getYouTubeVideoInfo, 
  extractYouTubeVideoId 
} = require('../utils/externalAPI');

exports.addLesson = async (req, res, next) => {
  try {
    const { title, content, videoUrl, duration, order } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add lessons to this course'
      });
    }

    let videoInfo = null;
    let validatedDuration = duration;
    let videoThumbnail = null;

    if (videoUrl) {
      const videoId = extractYouTubeVideoId(videoUrl);
      
      if (videoId) {
        const youtubeData = await getYouTubeVideoInfo(videoId);
        
        if (youtubeData.success) {
          videoInfo = {
            title: youtubeData.title,
            description: youtubeData.description,
            duration: youtubeData.duration,
            thumbnail: youtubeData.thumbnail,
            channelTitle: youtubeData.channelTitle
          };
          
          validatedDuration = youtubeData.duration / 60;
          videoThumbnail = youtubeData.thumbnail;
        }
      }
    }

    const lesson = {
      title,
      content,
      videoUrl,
      duration: validatedDuration,
      order,
      videoInfo: videoInfo,
      thumbnail: videoThumbnail
    };

    course.lessons.push(lesson);
    await course.save();

    res.status(201).json({
      success: true,
      lesson: course.lessons[course.lessons.length - 1],
      message: videoInfo ? 'YouTube video info fetched successfully' : 'Lesson added without YouTube integration'
    });
  } catch (error) {
    next(error);
  }
};

exports.suggestYouTubeVideos = async (req, res, next) => {
  try {
    const { topic } = req.query;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this feature'
      });
    }

    const searchQuery = topic || `${course.title} tutorial`;
    const { searchYouTubeVideos } = require('../utils/externalAPI');
    const videos = await searchYouTubeVideos(searchQuery, 10);

    res.status(200).json({
      success: true,
      course: course.title,
      searchQuery: searchQuery,
      suggestions: videos
    });
  } catch (error) {
    next(error);
  }
};