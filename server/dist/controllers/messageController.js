import mongoose from "mongoose";
import { Message } from "../models/Message.js";
import { User } from "../models/User.js";
import { Subscribe } from "../models/Subscribe.js";
import { NotificationMessage } from "../models/NotificationMessage.js";
import { AppError } from "../utils/appError.js";
import { getIo } from "../socket/socket.js";
export const sendMessage = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new AppError("Unauthorized", 401);
        }
        const { receiverId } = req.params;
        if (typeof receiverId !== "string" ||
            !mongoose.Types.ObjectId.isValid(receiverId)) {
            throw new AppError("Invalid receiver id", 400);
        }
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            throw new AppError("Receiver is not found", 404);
        }
        if (receiverId === req.user._id.toString()) {
            throw new AppError("You cannot send message to yourself", 400);
        }
        const subscription = await Subscribe.findOne({
            follower: req.user._id,
            following: receiverId,
        });
        if (!subscription) {
            throw new AppError("You can send messages only to users you follow", 403);
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
        // Store a separate notification document so the receiver can see unread messages.
        await NotificationMessage.create({
            recipient: receiverId,
            sender: req.user._id,
            message: message._id,
        });
        // Deliver the message in real time to the receiver's personal Socket.io room.
        getIo().to(receiverId).emit("receiveMessage", message);
        res.status(201).json({
            success: true,
            message,
        });
    }
    catch (error) {
        next(error);
    }
};
export const getConversation = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new AppError("Unauthorized", 401);
        }
        const { userId } = req.params;
        if (typeof userId !== "string" ||
            !mongoose.Types.ObjectId.isValid(userId)) {
            throw new AppError("Invalid user id", 400);
        }
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError("User is not found", 404);
        }
        const messages = await Message.find({
            $or: [
                {
                    sender: req.user._id,
                    receiver: userId,
                },
                {
                    sender: userId,
                    receiver: req.user._id,
                },
            ],
        })
            .populate("sender", "username fullName avatar")
            .populate("receiver", "username fullName avatar")
            .sort({ createdAt: 1 });
        res.status(200).json({
            success: true,
            messages,
            count: messages.length,
        });
    }
    catch (error) {
        next(error);
    }
};
export const getMyChats = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new AppError("Unauthorized", 401);
        }
        const messages = await Message.find({
            $or: [{ sender: req.user._id }, { receiver: req.user._id }],
        })
            .populate("sender", "username fullName avatar")
            .populate("receiver", "username fullName avatar")
            .sort({ createdAt: -1 });
        const chatsMap = new Map();
        // Keep only the latest message per chat partner.
        for (const message of messages) {
            const senderId = message.sender._id.toString();
            const receiverId = message.receiver._id.toString();
            let chatUserId;
            // If the current user sent the message, the chat partner is the receiver.
            // Otherwise, the chat partner is the sender.
            if (senderId === req.user._id.toString()) {
                chatUserId = receiverId;
            }
            else {
                chatUserId = senderId;
            }
            if (!chatsMap.has(chatUserId)) {
                chatsMap.set(chatUserId, message);
            }
        }
        const allChats = Array.from(chatsMap.values());
        res.status(200).json({
            success: true,
            allChats,
            count: allChats.length,
        });
    }
    catch (error) {
        next(error);
    }
};
