const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const server = express();
const PORT = 5000;

server.use(cookieParser());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, 'public')));

const app = require('./src/app');
server.use('/api', app);

server.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 Сайт запущен на http://localhost:${PORT}`);
    console.log(`=================================`);
});