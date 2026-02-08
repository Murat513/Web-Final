const express = require('express');
const path = require('path');
const app = require('./src/app');
const cookieParser = require('cookie-parser');

const server = express();
const PORT = 5000;

// Middleware для кук
server.use(cookieParser());

// Статические файлы
server.use(express.static(path.join(__dirname, 'public')));

// API
server.use('/api', app);

// Все остальные запросы
server.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 Сайт запущен!`);
    console.log(`📍 Порт: ${PORT}`);
    console.log(`🌐 Ссылка: http://localhost:${PORT}`);
    console.log(`=================================`);
    console.log(`🔧 Используется кастомная система сессий`);
    console.log(`👤 Тестовые пользователи:`);
    console.log(`   Email: john@example.com, Пароль: password123`);
    console.log(`   Email: jane@example.com, Пароль: password123`);
    console.log(`=================================`);
});