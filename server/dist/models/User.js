import mongoose from "mongoose";
import bcrypt from 'bcrypt';
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false, //  Mongoose по умолчанию не будет возвращать password при запросах
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    bio: {
        type: String,
        default: '',
    },
    avatar: {
        type: String,
        default: '',
    },
}, {
    timestamps: true, // разрешаем создание полей createdAt и updatedAt
    versionKey: false // запрещаем создание поля __v
});
// candidatePassword: string  - это пароль, который пользователь ввёл при логине
// this.password -  это хэшированный пароль из базы данных.
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};
//Это Mongoose middleware. Он запускается перед сохранением пользователя
userSchema.pre('save', async function () {
    //проверяет: изменился ли пароль?
    if (!this.isModified('password')) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
});
export const User = mongoose.model('User', userSchema);
