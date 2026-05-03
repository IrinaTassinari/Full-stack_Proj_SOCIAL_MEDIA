import mongoose from "mongoose";
import { Post } from "../models/Post.js";
import { AppError } from "../utils/appError.js";
//create post
export const createPost = async (req, res, next) => {
    try {
        // Проверить req.user значит убедиться, что пользователь авторизован
        // если пользователя нет в req.user, значит запрос не авторизован
        if (!req.user) {
            throw new AppError("Unauthorized", 401);
        }
        //Взять description из req.body
        const description = req.body?.description ?? "";
        //Если есть req.file, конвертировать в base64
        if (!req.file) {
            throw new AppError("Image is required", 400);
        }
        const base64Image = req.file.buffer.toString("base64");
        const image = `data:${req.file.mimetype};base64,${base64Image}`;
        // Создать Post через Post.create
        const post = await Post.create({
            author: req.user._id,
            description,
            image,
        });
        await post.populate("author", "username fullName avatar");
        if (!post) {
            throw new AppError("Post is not created", 400);
        }
        //Вернуть 201
        res.status(201).json({
            success: true,
            post,
        });
    }
    catch (error) {
        next(error);
    }
};
// Получение поста по ID
export const getPostById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid post id", 400);
        }
        // С populate Mongoose идёт в коллекцию пользователей, находит автора по userId и подставляет его данные: 'username fullName avatar'
        const post = await Post.findById(id).populate("author", "username fullName avatar");
        if (!post) {
            throw new AppError("Post is not found", 404);
        }
        res.status(200).json({
            success: true,
            post,
        });
    }
    catch (error) {
        next(error);
    }
};
//Получение всех постов пользователя
export const getUserPosts = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (typeof userId !== "string" ||
            !mongoose.Types.ObjectId.isValid(userId)) {
            throw new AppError("Invalid user id", 400);
        }
        // С populate Mongoose идёт в коллекцию пользователей, находит автора по userId и подставляет его данные: 'username fullName avatar'
        const posts = await Post.find({ author: userId })
            .populate("author", "username fullName avatar")
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            posts,
        });
    }
    catch (error) {
        next(error);
    }
};
// getAllPosts from all Users
export const getAllPosts = async (req, res, next) => {
    try {
        const posts = await Post.find()
            // подставь данные автора поста, но верни только username, fullName и avatar
            .populate("author", "username fullName avatar")
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            posts,
        });
    }
    catch (error) {
        next(error);
    }
};
export const updatePost = async (req, res, next) => {
    try {
        //Проверить req.user.
        if (!req.user) {
            throw new AppError("Unauthorized", 401);
        }
        // Взять id из req.params и проверить, что id валидный ObjectId
        const { id } = req.params;
        if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid post id", 400);
        }
        // Найти пост по id. Если поста нет — 404.
        const post = await Post.findById(id);
        if (!post) {
            throw new AppError("Post is not found", 404);
        }
        // Проверить, что текущий пользователь является автором поста.Если не автор — 403.
        if (post.author.toString() !== req.user._id.toString()) {
            throw new AppError("You are not allowed to update this post", 403);
        }
        // Если пришёл description — обновить описание
        const { description } = req.body ?? {};
        if (description !== undefined) {
            post.description = description;
        }
        // Если пришёл файл image — конвертировать в Base64 и обновить картинку
        if (req.file) {
            const base64Image = req.file.buffer.toString("base64");
            post.image = `data:${req.file.mimetype};base64,${base64Image}`;
        }
        // Сохранить пост
        await post.save();
        await post.populate("author", "username fullName avatar");
        // Вернуть обновлённый пост
        res.status(200).json({
            success: true,
            post,
        });
    }
    catch (error) {
        next(error);
    }
};
export const deletePost = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new AppError("Unauthorized", 401);
        }
        const { id } = req.params;
        if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid post id", 400);
        }
        const post = await Post.findById(id);
        if (!post) {
            throw new AppError("Post is not found", 404);
        }
        if (post.author.toString() !== req.user._id.toString()) {
            throw new AppError("You are not allowed to delete this post", 403);
        }
        await post.deleteOne();
        res.status(200).json({
            success: true,
            message: "Post deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
