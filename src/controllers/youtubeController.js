const axios = require('axios');

const getCourseVideos = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Поисковый запрос обязателен'
            });
        }
        
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                maxResults: 6,
                q: query + ' tutorial course',
                type: 'video',
                videoDuration: 'medium',
                key: process.env.YOUTUBE_API_KEY
            }
        });
        
        const videos = response.data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium.url,
            channel: item.snippet.channelTitle,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`
        }));
        
        res.json({
            success: true,
            videos
        });
        
    } catch (error) {
        console.error('YouTube API error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Ошибка при поиске видео'
        });
    }
};

module.exports = { getCourseVideos };