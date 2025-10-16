// middleware/validation.js
// Middleware для валидации данных

const MedicalProfile = require('../models/MedicalProfile');

// Валидация регистрации
const validateRegistration = (req, res, next) => {
    const { username, password, email, birthDate } = req.body;
    
    const errors = [];
    
    // Валидация имени пользователя
    if (!username || username.length < 3) {
        errors.push('Имя пользователя должно быть не менее 3 символов');
    }
    
    if (username && username.length > 50) {
        errors.push('Имя пользователя должно быть не более 50 символов');
    }
    
    // Валидация пароля
    if (!password || password.length < 6) {
        errors.push('Пароль должен быть не менее 6 символов');
    }
    
    // Валидация email (если предоставлен)
    if (email && !isValidEmail(email)) {
        errors.push('Некорректный формат email');
    }
    
    // Валидация даты рождения
    if (birthDate && !MedicalProfile.isValidBirthDate(birthDate)) {
        errors.push('Недопустимая дата рождения');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Ошибки валидации',
            errors: errors
        });
    }
    
    next();
};

// Валидация медицинского профиля
const validateMedicalProfile = (req, res, next) => {
    const validation = MedicalProfile.validateMedicalProfile(req.body);
    
    if (!validation.isValid) {
        return res.status(400).json({
            success: false,
            message: 'Ошибки валидации медицинского профиля',
            errors: validation.errors
        });
    }
    
    next();
};

// Вспомогательная функция для валидации email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

module.exports = {
    validateRegistration,
    validateMedicalProfile
};