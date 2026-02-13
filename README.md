📋 Project Overview
A RESTful API for an online courses platform built with Node.js, Express.js, and MongoDB. The platform allows users to register as students or instructors, create and manage courses, enroll in courses, and track their learning progress.

Features
🔐 User authentication with JWT

👥 Role-based authorization (Student/Instructor/Admin)

📚 Course management system

🎓 Enrollment system with progress tracking

📊 Student progress monitoring

🔍 Course search and filtering

🛡️ Input validation and error handling

🛠️ Technologies Used
Backend Framework: Node.js with Express.js

Database: MongoDB with Mongoose ODM

Authentication: JSON Web Tokens (JWT)

Password Hashing: bcryptjs

Validation: Joi

Security: Helmet, CORS, express-rate-limit

Environment Variables: dotenv

🚀 Installation & Setup
Prerequisites
Node.js (v16 or higher)

MongoDB (local or Atlas)

npm or yarn

Step-by-Step Installation
Clone the repository:

 
git clone https://github.com/yourusername/online-courses-platform.git
cd online-courses-platform
Install dependencies:

 
npm install
Configure environment variables:

 
cp .env.example .env
Edit the .env file:


NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/online-courses
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
Start the development server:

 
npm run dev
Access the API:
http://localhost:5000
📁 Project Structure
 
online-courses-platform/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── courseController.js  # Course CRUD operations
│   │   ├── userController.js    # User profile management
│   │   └── enrollmentController.js # Enrollment management
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   ├── errorMiddleware.js   # Global error handler
│   │   └── validationMiddleware.js # Request validation
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Course.js           # Course schema
│   │   └── Enrollment.js       # Enrollment schema
│   ├── routes/
│   │   ├── authRoutes.js       # Authentication routes
│   │   ├── courseRoutes.js     # Course routes
│   │   ├── userRoutes.js       # User routes
│   │   └── enrollmentRoutes.js # Enrollment routes
│   └── app.js                  # Express application setup
├── .env.example                # Environment variables template
├── package.json               # Dependencies and scripts
└── README.md                  # This file
🔌 API Documentation
Authentication Endpoints
Register a new user
 
POST /api/auth/register
Request Body:
 
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "student"
}
Response:

{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "student"
  }
}
Login user
 
POST /api/auth/login
Request Body:
 
{
  "email": "john@example.com",
  "password": "password123"
}
Response: Same as register

Get current user profile
 
GET /api/users/profile
Headers:


Authorization: Bearer <jwt_token>
Course Endpoints
Create a new course (Instructor only)
 
POST /api/courses
Headers:
 
Authorization: Bearer <jwt_token>
Content-Type: application/json
Request Body:

 
{
  "title": "JavaScript Fundamentals",
  "description": "Learn JavaScript from scratch",
  "category": "programming",
  "level": "beginner",
  "price": 0,
  "duration": 30,
  "requirements": ["Basic computer knowledge", "Text editor"],
  "learningOutcomes": ["Write JavaScript code", "Understand DOM manipulation"]
}
Get all published courses
http
 
GET /api/courses
Query Parameters (optional):

category - Filter by category

level - Filter by level

search - Search in title and description

page - Page number for pagination

limit - Items per page

Get single course
 
GET /api/courses/:id
Update course (Course owner only)
 
PUT /api/courses/:id
Headers:

 
Authorization: Bearer <jwt_token>
Delete course (Course owner only)
 
DELETE /api/courses/:id
Headers:
 
Authorization: Bearer <jwt_token>
Enrollment Endpoints
Enroll in a course
 
POST /api/enroll/:courseId
Headers:
 
Authorization: Bearer <jwt_token>
Response:
 
{
  "success": true,
  "message": "Successfully enrolled in course",
  "enrollment": {
    "id": "enrollment_id",
    "studentId": "student_id",
    "courseId": "course_id",
    "progress": 0,
    "enrolledAt": "2024-01-15T10:30:00Z"
  }
}
Get user's enrolled courses with progress
 
GET /api/enroll/my-courses
Headers:
 
Authorization: Bearer <jwt_token>
Response:

 
{
  "success": true,
  "enrollments": [
    {
      "enrollmentId": "enrollment_id",
      "course": {
        "id": "course_id",
        "title": "Course Title",
        "description": "Course Description",
        "instructor": "Instructor Name",
        "thumbnail": "image_url",
        "duration": 30,
        "price": 0
      },
      "progress": 45,
      "enrolledAt": "2024-01-10T14:20:00Z"
    }
  ]
}
Update course progress
 
PUT /api/enroll/:enrollmentId/progress
Headers:

 
Authorization: Bearer <jwt_token>
Content-Type: application/json
Request Body:

 
{
  "progress": 75
}
Unenroll from a course

DELETE /api/enroll/:enrollmentId
Headers:

Authorization: Bearer <jwt_token>
Get instructor's created courses

GET /api/enroll/created-courses
Headers:

Authorization: Bearer <jwt_token>
📊 Database Models
User Model


{
  username: String,      // Unique username
  email: String,         // Unique email
  password: String,      // Hashed password
  fullName: String,      // User's full name
  role: String,          // 'student', 'instructor', or 'admin'
  bio: String,           // User biography
  avatar: String,        // Profile picture URL
  createdAt: Date,       // Account creation date
  updatedAt: Date        // Last update date
}
Course Model

{
  title: String,         // Course title
  description: String,   // Course description
  instructor: ObjectId,  // Reference to User (instructor)
  category: String,      // 'programming', 'design', etc.
  price: Number,         // Course price
  duration: Number,      // Duration in hours
  level: String,         // 'beginner', 'intermediate', 'advanced'
  studentsEnrolled: Number, // Number of enrolled students
  rating: Number,        // Average rating
  lessons: Array,        // Array of lesson objects
  requirements: Array,   // Array of requirements
  learningOutcomes: Array, // Array of learning outcomes
  isPublished: Boolean,  // Course publication status
  thumbnail: String,     // Course thumbnail URL
  createdAt: Date,       // Course creation date
  updatedAt: Date        // Last update date
}
Enrollment Model

{
  student: ObjectId,     // Reference to User (student)
  course: ObjectId,      // Reference to Course
  progress: Number,      // Progress percentage (0-100)
  completedLessons: Array, // Array of completed lesson IDs
  enrolledAt: Date,      // Enrollment date
  lastAccessed: Date     // Last course access date
}
🧪 Testing Examples
Using cURL
Register a new instructor:

curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "instructor_jane",
    "email": "jane@example.com",
    "password": "password123",
    "fullName": "Jane Smith",
    "role": "instructor"
  }'
Create a course:


curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Advanced React Patterns",
    "description": "Master advanced React patterns and best practices",
    "category": "programming",
    "level": "advanced",
    "price": 49,
    "duration": 40,
    "requirements": ["JavaScript experience", "Basic React knowledge"],
    "learningOutcomes": ["Master React patterns", "Build scalable applications"]
  }'

🔧 Error Handling
The API uses consistent error responses:

{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (in development)"
}
Common HTTP Status Codes:

200 - Success

201 - Created

400 - Bad Request (validation errors)

401 - Unauthorized (authentication required)

403 - Forbidden (insufficient permissions)

404 - Not Found

409 - Conflict (duplicate resource)

500 - Internal Server Error

🚀 Deployment
Deploy to Render
Create a new Web Service on Render

Connect your GitHub repository

Configure environment variables:

MONGODB_URI - Your MongoDB connection string

JWT_SECRET - Secret key for JWT

NODE_ENV - Set to "production"

Build Command: npm install

Start Command: npm start

Deploy to Railway
Create new project on Railway

Add MongoDB plugin

Connect your GitHub repository

Railway automatically detects and deploys the Node.js app

📚 API ДОКУМЕНТАЦИЯ
🔐 Authentication Routes (Публичные)
Метод	Endpoint	Описание	Доступ
POST	/api/auth/register	Регистрация нового пользователя	Публичный
POST	/api/auth/login	Вход в систему	Публичный
POST	/api/auth/logout	Выход из системы	Публичный
GET	/api/auth/check	Проверка авторизации	Публичный
👤 User Routes (Приватные)
Метод	Endpoint	Описание	Доступ
GET	/api/users/profile	Получить профиль пользователя	Приватный
PUT	/api/users/profile	Обновить профиль	Приватный
📚 Course Routes (Приватные)
Метод	Endpoint	Описание	Доступ
POST	/api/courses	Создать новый курс	Инструктор
GET	/api/courses	Получить все курсы	Публичный
GET	/api/courses/:id	Получить курс по ID	Публичный
GET	/api/courses/my	Получить мои курсы	Инструктор
PUT	/api/courses/:id	Обновить курс	Инструктор
DELETE	/api/courses/:id	Удалить курс	Инструктор
📝 Enrollment Routes (Приватные)
Метод	Endpoint	Описание	Доступ
POST	/api/enroll/:courseId	Записаться на курс	Студент
GET	/api/enroll/my-courses	Мои записи на курсы	Студент
GET	/api/enroll/created-courses	Мои созданные курсы	Инструктор
DELETE	/api/enroll/:enrollmentId	Отписаться от курса	Студент
🎬 YouTube API Routes (Приватные)
Метод	Endpoint	Описание	Доступ
GET	/api/youtube/search	Поиск видео по теме	Авторизован