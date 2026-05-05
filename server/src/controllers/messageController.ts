import mongoose from "mongoose";
import type { Request, Response, NextFunction } from "express";
import { Message } from "../models/Message.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/appError.js";

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { receiverId } = req.params;
    if (
      typeof receiverId !== "string" ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      throw new AppError("Invalid receiver id", 400);
    }

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      throw new AppError("Receiver is not found", 404);
    }

    //отправку сообщения самому себе
    if (receiverId === req.user._id.toString()) {
      throw new AppError("You cannot send message to yourself", 400);
    }

    const { text } = req.body;
    if (typeof text !== "string" || !text.trim()) {
      throw new AppError("Text is required", 400);
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text,
    });

    await message.populate("sender", "username fullName avatar");
    await message.populate("receiver", "username fullName avatar");
    await Notification.create({
      recipient: receiverId,
      sender: req.user._id,
      type: "message",
      message: message._id,
    });

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

// export const getConversation
// export const getMyChats
/**
 * sendMessage        // можно пока через REST, потом переиспользовать в socket
getConversation    // получить переписку с конкретным пользователем
getMyChats         // список пользователей, с которыми есть переписка, опционально
 */