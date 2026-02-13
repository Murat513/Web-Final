const express = require('express');
require('dotenv').config();
const path = require('path');
const cookieParser = require('cookie-parser');

const server = express();
const PORT = 5000;

server.use(cookieParser());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Статические файлы
server.use(express.static(path.join(__dirname, 'public')));

// ИЗМЕНИТЬ: используем /api префикс
const app = require('./src/app');
server.use('/api', app);  // ВАЖНО: добавляем /api

// Все остальные запросы - отдаем index.html
server.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 Сайт запущен на http://localhost:${PORT}`);
    console.log(`📌 API: http://localhost:${PORT}/api/test`);
    console.log(`=================================`);
});