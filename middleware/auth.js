// middleware/auth.js
// Middleware для проверки JWT токена

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware для проверки аутентификации
const authenticateToken = async (req, res, next) => {
    try {
        // Получаем токен из заголовка Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Формат: "Bearer TOKEN"
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Токен доступа не предоставлен' 
            });
        }
        
        // Проверяем токен
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        console.log('🔑 Декодированный токен:', decoded);
        
        // Находим пользователя в базе данных
        const user = await User.findById(decoded.userId);
        if (!user) {
            console.log('❌ Пользователь не найден по ID:', decoded.userId);
            return res.status(403).json({ 
                success: false,
                message: 'Пользователь не найден' 
            });
        }
        
        // Добавляем информацию о пользователе в объект запроса
        // Сохраняем ID пользователя как строку для совместимости
        req.user = {
            id: user._id.toString(), // Преобразуем ObjectId в строку
            username: user.username
        };
        
        console.log('✅ Аутентификация успешна:', user.username, req.user.id);
        next(); // Переходим к следующему middleware/обработчику
        
    } catch (error) {
        console.error('Ошибка аутентификации:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ 
                success: false,
                message: 'Недействительный токен' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ 
                success: false,
                message: 'Срок действия токена истек' 
            });
        }
        
        return res.status(500).json({ 
            success: false,
            message: 'Ошибка сервера при аутентификации' 
        });
    }
};

module.exports = {
    authenticateToken
};