// routes/profile.js
// Маршруты для управления профилем пользователя

const express = require('express');
const User = require('../models/User');
const MedicalProfile = require('../models/MedicalProfile');
const { authenticateToken } = require('../middleware/auth');
const { validateMedicalProfile } = require('../middleware/validation');

const router = express.Router();

// GET /api/profile/medical - Получить медицинский профиль
router.get('/medical', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }
        
        res.json({
            success: true,
            data: {
                medicalProfile: user.medicalProfile,
                personalData: user.personalData
            }
        });
        
    } catch (error) {
        console.error('Ошибка получения медицинского профиля:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при получении медицинского профиля'
        });
    }
});

// PUT /api/profile/medical - Обновить медицинский профиль
router.put('/medical', authenticateToken, validateMedicalProfile, async (req, res) => {
    try {
        const medicalData = req.body;
        
        // Обновляем медицинский профиль
        const updated = await User.updateMedicalProfile(req.user.id, medicalData);
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }
        
        res.json({
            success: true,
            message: 'Медицинский профиль успешно обновлен',
            data: {
                medicalProfile: medicalData
            }
        });
        
    } catch (error) {
        console.error('Ошибка обновления медицинского профиля:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при обновлении медицинского профиля'
        });
    }
});

// PUT /api/profile/personal - Обновить персональные данные
router.put('/personal', authenticateToken, async (req, res) => {
    try {
        const personalData = req.body;
        
        // Валидация даты рождения
        if (personalData.birthDate && !MedicalProfile.isValidBirthDate(personalData.birthDate)) {
            return res.status(400).json({
                success: false,
                message: 'Недопустимая дата рождения'
            });
        }
        
        // Обновляем персональные данные
        const updated = await User.updatePersonalData(req.user.id, personalData);
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }
        
        res.json({
            success: true,
            message: 'Персональные данные успешно обновлены',
            data: {
                personalData: personalData
            }
        });
        
    } catch (error) {
        console.error('Ошибка обновления персональных данных:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при обновлении персональных данных'
        });
    }
});

// GET /api/profile/complete - Получить полный профиль (включая медицинские заметки)
router.get('/complete', authenticateToken, async (req, res) => {
    try {
        const db = require('../config/database').getDatabase();
        const usersCollection = db.collection('users');
        
        const user = await usersCollection.findOne(
            { _id: req.user.id },
            { projection: { password: 0 } } // Только пароль исключаем
        );
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }
        
        res.json({
            success: true,
            data: {
                user: user
            }
        });
        
    } catch (error) {
        console.error('Ошибка получения полного профиля:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при получении профиля'
        });
    }
});

module.exports = router;