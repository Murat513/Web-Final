const User = require('../models/User');
const { getWeatherData } = require('../utils/externalAPI');

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

exports.getWeatherInfo = async (req, res, next) => {
  try {
    const city = req.query.city || 'Moscow';
    const weatherData = await getWeatherData(city);

    if (!weatherData) {
      return res.status(500).json({
        success: false,
        message: 'Unable to fetch weather data'
      });
    }

    res.status(200).json({
      success: true,
      weather: weatherData
    });
  } catch (error) {
    next(error);
  }
};