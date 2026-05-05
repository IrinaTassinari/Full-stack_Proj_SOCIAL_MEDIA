import mongoose from "mongoose";
import type { Request, Response, NextFunction } from "express";
import { NotificationMessage } from "../models/NotificationMessage.js";
import { AppError } from "../utils/appError.js";

export const getMyMessageNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const notifications = await NotificationMessage.find({
      recipient: req.user._id,
    })
      .populate("sender", "username fullName avatar")
      .populate({
        path: "message",
        populate: [
          { path: "sender", select: "username fullName avatar" },
          { path: "receiver", select: "username fullName avatar" },
        ],
      })
      .sort({ createdAt: -1 });

    const unreadCount = await NotificationMessage.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      notifications,
      count: notifications.length,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

export const markMessageNotificationAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { notificationId } = req.params;

    if (
      typeof notificationId !== "string" ||
      !mongoose.Types.ObjectId.isValid(notificationId)
    ) {
      throw new AppError("Invalid notification id", 400);
    }

    const notification = await NotificationMessage.findOne({
      _id: notificationId,
      recipient: req.user._id,
    });

    if (!notification) {
      throw new AppError("Message notification is not found", 404);
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllMessageNotificationsAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const result = await NotificationMessage.updateMany(
      {
        recipient: req.user._id,
        isRead: false,
      },
      {
        isRead: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "All message notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};
