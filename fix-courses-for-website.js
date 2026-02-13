const mongoose = require('mongoose');
require('dotenv').config();

// Подключаем модели
const User = require('./src/models/User');
const Course = require('./src/models/Course');

async function fixCourses() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/courses-platform');
        console.log('🟢 Подключено к MongoDB');
        
        // Находим инструктора через модель User
        const instructor = await User.findOne({ email: 'john@example.com' });
        
        if (!instructor) {
            console.log('❌ Инструктор не найден!');
            console.log('Проверьте email: john@example.com');
            process.exit(1);
        }
        
        console.log('👤 Инструктор найден:');
        console.log(`   ID: ${instructor._id}`);
        console.log(`   Имя: ${instructor.fullName}`);
        console.log(`   Email: ${instructor.email}`);
        console.log(`   Роль: ${instructor.role}`);
        
        // Обновляем курс с id "1"
        const course1 = await Course.findOne({ id: "1" });
        if (course1) {
            course1.instructorId = instructor._id;
            course1.instructor = instructor.fullName;
            course1.isPublished = true;
            course1.requirements = course1.requirements || ["Базовые знания компьютера", "Текстовый редактор"];
            course1.learningOutcomes = course1.learningOutcomes || ["Понимать основы JavaScript", "Писать простые программы"];
            await course1.save();
            console.log('✅ Курс "JavaScript Basics" обновлен');
        } else {
            console.log('❌ Курс с id "1" не найден');
        }
        
        // Обновляем курс с id "4"
        const course4 = await Course.findOne({ id: "4" });
        if (course4) {
            course4.instructorId = instructor._id;
            course4.instructor = instructor.fullName;
            course4.isPublished = true;
            course4.requirements = course4.requirements || ["Базовые знания Python"];
            course4.learningOutcomes = course4.learningOutcomes || ["Писать на Python", "Работать с данными"];
            await course4.save();
            console.log('✅ Курс "Python Programming" обновлен');
        } else {
            console.log('❌ Курс с id "4" не найден');
        }
        
        // Проверяем все курсы
        const courses = await Course.find({});
        console.log(`\n📚 Все курсы в базе (${courses.length}):`);
        courses.forEach((c, i) => {
            console.log(`\n${i + 1}. ${c.title}:`);
            console.log(`   ID: ${c._id}`);
            console.log(`   Старый id: ${c.id || 'нет'}`);
            console.log(`   Инструктор ID: ${c.instructorId}`);
            console.log(`   Инструктор: ${c.instructor}`);
            console.log(`   Опубликован: ${c.isPublished}`);
        });
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        process.exit(1);
    }
}

fixCourses();