import type { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { AppError } from "../utils/appError.js";
import crypto from "crypto";
import { env } from "../config/env.js";
import { sendEmail } from "../utils/sendEmail.js";

// Регистрация пользователя
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Получаем данные из тела запроса (body)
    const { username, email, password, fullName } = req.body;

    // Проверка: все ли обязательные поля переданы
    if (!username || !email || !password || !fullName) {
      throw new AppError(
        "Fields username, email, password and fullName are required",
        400,
      );
    }

    // Проверяем, существует ли пользователь с таким email and username
    // $or — это  оператор MongoDB
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      // Если пользователь уже есть - ошибка 409 (Conflict)
      throw new AppError(
        "User with this email or username already exists",
        409,
      );
    }

    // Создаём нового пользователя
    const user = new User({
      username,
      email,
      password, // пароль захешируется автоматически (через pre('save'))
      fullName,
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
  } catch (error) {
    // Передаём ошибку в глобальный errorHandler middleware
    next(error);
  }
};

// Авторизация пользователя (логин)
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Получаем identifier(username or email - идёт со фронта) и пароль из запроса
    const { identifier, password } = req.body;

    // Проверяем наличие обязательных полей
    if (!identifier || !password) {
      throw new AppError("Email/username and password required", 400);
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select("+password");

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
  } catch (error) {
    // Передаём ошибку в middleware
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { identifier } = req.body ?? {};

    if (!identifier) {
      throw new AppError("Email or username is required", 400);
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    //resetToken отправляем пользователю - const resetToken это создание обычного токена
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Сохранить в базе не сам токен, а его хэш - хэш resetToken сохраняем в MongoDB
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    //положи хэш токена в поле passwordResetToken(User Model) у найденного пользователя
    user.passwordResetToken = hashedResetToken;
    //passwordResetExpires(User Model)
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    // сохраняет это в MongoDB.
    await user.save();

    //Создали ссылку именно с обычным resetToken, не с хэшем.
    const resetUrl = `${env.clientUrl}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your ICHgram password",
      text: `You requested a password reset. Open this link to reset your password: ${resetUrl}`,
    });

    res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request<{ token: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.params;
    const { password } = req.body ?? {};

    if (!token) {
      throw new AppError("Reset token is required", 400);
    }

    if (!password) {
      throw new AppError("New password is required", 400);
    }

    /**
     * // Здесь мы берём token из URL: const { token } = req.params
     * Но в базе у нас лежит не token, а его хэш. Поэтому backend должен снова сделать хэш из token, чтобы сравнить с тем, что лежит в MongoDB.
     */
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    //Это значит: найди пользователя, у которого: passwordResetToken === hashedResetToken и passwordResetExpires > new Date()
    const user = await User.findOne({
      passwordResetToken: hashedResetToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("+password");

    if (!user) {
      throw new AppError("Reset token is invalid or has expired", 400);
    }

    user.password = password;
    //Если не очистить эти поля, пользователь или кто-то другой сможет снова использовать ту же reset-ссылку до истечения времени
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    const jwtToken = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
      token: jwtToken,
      user: {
        userId: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
