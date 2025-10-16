// models/MedicalProfile.js
// Вспомогательный класс для работы с медицинскими данными

class MedicalProfile {
    // Валидация группы крови
    static isValidBloodType(bloodType) {
        const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        return !bloodType || validBloodTypes.includes(bloodType);
    }
    
    // Валидация роста
    static isValidHeight(height) {
        return !height || (height >= 50 && height <= 250); // от 50см до 250см
    }
    
    // Валидация веса
    static isValidWeight(weight) {
        return !weight || (weight >= 2 && weight <= 300); // от 2кг до 300кг
    }
    
    // Валидация даты рождения
    static isValidBirthDate(birthDate) {
        if (!birthDate) return true;
        
        const date = new Date(birthDate);
        const now = new Date();
        const minDate = new Date(1900, 0, 1);
        
        return date <= now && date >= minDate;
    }
    
    // Расчет возраста по дате рождения
    static calculateAge(birthDate) {
        if (!birthDate) return null;
        
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }
    
    // Валидация всего медицинского профиля
    static validateMedicalProfile(profile) {
        const errors = [];
        
        if (profile.bloodType && !this.isValidBloodType(profile.bloodType)) {
            errors.push('Неверная группа крови');
        }
        
        if (profile.height && !this.isValidHeight(profile.height)) {
            errors.push('Недопустимое значение роста');
        }
        
        if (profile.weight && !this.isValidWeight(profile.weight)) {
            errors.push('Недопустимое значение веса');
        }
        
        if (profile.birthDate && !this.isValidBirthDate(profile.birthDate)) {
            errors.push('Недопустимая дата рождения');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

module.exports = MedicalProfile;