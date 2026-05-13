import mongoose from "mongoose";
import type { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";
import { AppError } from "../utils/appError.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // ID задачи берётся из URL: /user/:id
    const { id } = req.params;

    if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid user id", 400);
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fullName, username, bio, website } = req.body ?? {};

    //req.user может быть undefined. Поэтому в контроллере нужно проверить. если authMiddleware не положил пользователя в req.user, значит пользователь не авторизован

    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    //После authMiddleware  -  уже есть текущий пользователь в:req.user
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const nextUsername =
      typeof username === "string" ? username.trim() : undefined;
    const nextFullName =
      typeof fullName === "string" ? fullName.trim() : undefined;
    const nextBio = typeof bio === "string" ? bio.trim() : undefined;
    const nextWebsite =
      typeof website === "string" ? website.trim() : undefined;

    if (nextUsername !== undefined && !nextUsername) {
      throw new AppError("Username is required", 400);
    }

    // Обновляем только те поля, которые пришли в запросе
    // Это важно - чтобы не затирать данные undefined значениями
    if (nextFullName !== undefined) user.fullName = nextFullName;

    if (nextUsername !== undefined && nextUsername !== user.username) {
      const existingUser = await User.findOne({
        username: nextUsername,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        throw new AppError("Username is already taken", 409);
      }

      user.username = nextUsername;
    }

    if (nextBio !== undefined) user.bio = nextBio;
    if (nextWebsite !== undefined) user.website = nextWebsite;

    //if (avatar!== undefined) user.avatar = avatar;

    if (req.file) {
      const avatarUrl = await uploadToCloudinary(
        req.file.buffer,
        "inst-project/avatars",
      );

      user.avatar = avatarUrl;
    }

    // Сохраняем изменения в базе
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "User has been successfully updated",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const searchUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { query } = req.query;
    if (typeof query !== "string" || !query.trim()) {
      throw new AppError("Search query is required", 400);
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { fullName: { $regex: query, $options: "i" } },
      ],
    }).select("-password");

    res.status(200).json({
      success: true,
      users,
      count: users.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * getUserProfile
берёт пользователя по id из URL
GET /api/users/:id


* updateUserProfile
берёт пользователя из токена
PATCH /api/users/me
Authorization: Bearer token

 */
