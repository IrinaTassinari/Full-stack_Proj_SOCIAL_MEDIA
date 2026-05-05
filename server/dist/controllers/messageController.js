import mongoose from "mongoose";
import { Message } from "../models/Message.js";
import { User } from "../models/User.js";
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
        //отправку сообщения самому себе
        if (receiverId === req.user._id.toString()) {
            throw new AppError("You cannot send message to yourself", 400);
        }
        const { text } = req.body;
        if (typeof text !== "string" || !text.trim()) {
            throw new AppError("Text is required", 400);
        }
        // Сообщения в БД сохраняются через:
        const message = await Message.create({
            sender: req.user._id,
            receiver: receiverId,
            text,
        });
        await message.populate("sender", "username fullName avatar");
        await message.populate("receiver", "username fullName avatar");
        await NotificationMessage.create({
            recipient: receiverId,
            sender: req.user._id,
            message: message._id,
        });
        //пользователь отправляет сообщение через REST, сервер сохраняет его в базу и сразу отправляет получателю событие receiveMessage через Socket.io
        //Возьми Socket.io-сервер, найди комнату получателя по его receiverId и отправь туда событие receiveMessage с новым сообщением
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
        // Сначала мы получили все сообщения
        const messages = await Message.find({
            $or: [{ sender: req.user._id }, { receiver: req.user._id }],
        })
            .populate("sender", "username fullName avatar")
            .populate("receiver", "username fullName avatar")
            .sort({ createdAt: -1 });
        // Map здесь нужен, чтобы из всех сообщений оставить по одному последнему сообщению на каждый чат
        const chatsMap = new Map();
        for (const message of messages) {
            // Берём ID отправителя и получателя
            const senderId = message.sender._id.toString();
            const receiverId = message.receiver._id.toString();
            let chatUserId;
            //если сообщение отправила я,chatUserId = получатель
            if (senderId === req.user._id.toString()) {
                chatUserId = receiverId;
            }
            else {
                // иначе chatUserId = отправитель
                chatUserId = senderId;
            }
            // Проверяем: есть ли уже чат с этим пользователем?Если нет - добавляем:
            if (!chatsMap.has(chatUserId)) {
                chatsMap.set(chatUserId, message);
            }
        }
        /**
         * chatsMap - это не обычный массив. Это Map
         * внутри него лежит:
         *  "user1" -> сообщение с user1
            "user2" -> сообщение с user2
            "user3" -> сообщение с user3
    
            chatsMap.values() - дай мне только значения, без ключей
            только это:
            сообщение с user1
            сообщение с user2
    
            Array.from(chatsMap.values()) - сделай из этих значений обычный массив
         */
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
