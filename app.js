// app.js
// Главный файл приложения - точка входа

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Импортируем наши модули
const { connectToDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');

// Создаем Express приложение
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Разрешаем CORS для всех доменов (в продакшене укажите конкретный домен)
app.use(express.json()); // Парсинг JSON тел запросов

// Логирование запросов (простейшее)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Подключаем маршруты
app.use('/api/auth', authRoutes);

// Базовый маршрут для проверки работы сервера
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Сервер аутентификации работает!',
        timestamp: new Date().toISOString()
    });
});

// Маршрут для проверки здоровья сервера
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// Обработка несуществующих маршрутов
app.use((req, res) => {
    console.log('❌ Маршрут не найден для:', req.method, req.originalUrl);
    res.status(404).json({
        success: false,
        message: 'Маршрут не найден',
        attemptedPath: req.originalUrl,
        method: req.method
    });
});

// Обработка ошибок
app.use((error, req, res, next) => {
    console.error('Необработанная ошибка:', error);
    res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера'
    });
});

// Функция запуска сервера
async function startServer() {
    try {
        await connectToDatabase();
        
        app.listen(PORT, () => {
            console.log(`🚀 Сервер запущен на порту ${PORT}`);
            console.log(`🔗 Базовый URL: http://localhost:${PORT}`);
            console.log(`📝 Регистрация: POST http://localhost:${PORT}/api/auth/register`);
            console.log(`🔑 Логин: POST http://localhost:${PORT}/api/auth/login`);
        });
        
    } catch (error) {
        console.error('❌ Не удалось запустить сервер:', error);
        process.exit(1);
    }
}

// Обработка graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Получен SIGINT. Завершение работы...');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Получен SIGTERM. Завершение работы...');
    process.exit(0);
});

// Запускаем сервер
startServer();