// routes/auth.js
// Обновленные маршруты для аутентификации

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { validateRegistration } = require('../middleware/validation');

const router = express.Router();

// POST /api/auth/register - Регистрация нового пользователя
router.post('/register', validateRegistration, async (req, res) => {
    try {
        const { username, password, email, fullName, birthDate, gender } = req.body;
        
        // Создаем пользователя
        const user = await User.create({ 
            username, 
            password,
            email,
            fullName,
            birthDate,
            gender
        });
        
        res.status(201).json({
            success: true,
            message: 'Пользователь успешно зарегистрирован',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    personalData: user.personalData,
                    createdAt: user.createdAt
                }
            }
        });
        
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        
        if (error.message === 'Пользователь с таким именем уже существует') {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при регистрации'
        });
    }
});

// POST /api/auth/login - Вход пользователя
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Валидация входных данных
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Имя пользователя и пароль обязательны'
            });
        }
        
        // Ищем пользователя
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Неверное имя пользователя или пароль'
            });
        }
        
        // Проверяем пароль
        const isPasswordValid = await User.checkPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Неверное имя пользователя или пароль'
            });
        }
        
        // Обновляем время последнего входа
        await User.updateLastLogin(user._id);
        
        // Создаем JWT токен
        const token = jwt.sign(
            { 
                userId: user._id,
                username: user.username 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        
        res.json({
            success: true,
            message: 'Вход выполнен успешно',
            data: {
                token: token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    personalData: user.personalData
                }
            }
        });
        
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при входе'
        });
    }
});

// GET /api/auth/me - Получить информацию о текущем пользователе
router.get('/me', authenticateToken, async (req, res) => {
    try {
        // Пользователь уже добавлен в req объект middleware authenticateToken
        res.json({
            success: true,
            data: {
                user: req.user
            }
        });
        
    } catch (error) {
        console.error('Ошибка получения профиля:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при получении профиля'
        });
    }
});

// GET /api/auth/profile - Защищенный маршрут (пример)
router.get('/profile', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: `Добро пожаловать, ${req.user.username}!`,
        data: {
            secretData: 'Это защищенные данные, доступные только аутентифицированным пользователям',
            user: req.user
        }
    });
});

module.exports = router;