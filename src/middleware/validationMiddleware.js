const Joi = require('joi');

const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string()
      .min(3)
      .max(30)
      .required()
      .pattern(/^[a-zA-Z0-9_]+$/),
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .min(6)
      .required(),
    fullName: Joi.string()
      .min(2)
      .max(50)
      .required(),
    role: Joi.string()
      .valid('student', 'instructor')
      .default('student')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateCourse = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string()
      .min(5)
      .max(100)
      .required(),
    description: Joi.string()
      .min(10)
      .max(1000)
      .required(),
    category: Joi.string()
      .valid('programming', 'design', 'business', 'marketing', 'languages', 'other')
      .required(),
    price: Joi.number()
      .min(0)
      .required(),
    duration: Joi.number()
      .min(1)
      .required(),
    level: Joi.string()
      .valid('beginner', 'intermediate', 'advanced')
      .default('beginner'),
    requirements: Joi.array()
      .items(Joi.string()),
    learningOutcomes: Joi.array()
      .items(Joi.string())
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateCourse
};