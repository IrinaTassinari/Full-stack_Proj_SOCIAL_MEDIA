import { User } from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { AppError } from '../utils/appError.js';
// Регистрация пользователя
export const register = async (req, res, next) => {
    try {
        // Получаем данные из тела запроса (body)
        const { username, email, password, fullName } = req.body;
        // Проверка: все ли обязательные поля переданы
        if (!username || !email || !password || !fullName) {
            throw new AppError("Fields username, email, password and fullName are required", 400);
        }
        // Проверяем, существует ли пользователь с таким email and username
        // $or — это  оператор MongoDB
        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });
        if (existingUser) {
            // Если пользователь уже есть - ошибка 409 (Conflict)
            throw new AppError("User with this email or username already exists", 409);
        }
        // Создаём нового пользователя
        const user = new User({
            username,
            email,
            password, // пароль захешируется автоматически (через pre('save'))
            fullName
        });
        // Сохраняем пользователя в базу данных
        await user.save();
        // Если не вернуть токен после регистрации, тогда пользователю придётся: сначала зарегистрироваться, потом отдельно логиниться
        // значит:
        //возьми id созданного/найденного пользователя
        //преврати его в строку
        //создай JWT-токен с этим id
        const token = generateToken(user._id.toString());
        // Отправляем ответ клиенту
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        // Передаём ошибку в глобальный errorHandler middleware
        next(error);
    }
};
// =======================
// Авторизация пользователя (логин)
export const login = async (req, res, next) => {
    try {
        // Получаем email и пароль из запроса
        const { email, password } = req.body;
        // Проверяем наличие обязательных полей
        if (!email || !password) {
            throw new AppError("Email and password required", 400);
        }
        // Ищем пользователя в базе по email
        const user = await User.findOne({ email });
        // Если пользователь не найден - ошибка
        if (!user) {
            throw new AppError("Invalid password or email", 401);
        }
        // Сравниваем введённый пароль с хешем из базы данных
        const isPasswordValid = await user.comparePassword(password);
        // Если пароль не совпал - ошибка
        if (!isPasswordValid) {
            throw new AppError("Invalid password or email", 401);
        }
        // Если всё ок - генерируем JWT токен
        const token = generateToken(user._id.toString());
        // Отправляем успешный ответ
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                userId: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        // Передаём ошибку в middleware
        next(error);
    }
};
