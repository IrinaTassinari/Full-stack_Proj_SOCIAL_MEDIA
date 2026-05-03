import mongoose from "mongoose";
import { Post } from "../models/Post.js";
import { Like } from "../models/Like.js";
import { AppError } from "../utils/appError.js";
export const toggleLike = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new AppError("Unauthorized", 401);
        }
        const { postId } = req.params;
        if (typeof postId !== "string" ||
            !mongoose.Types.ObjectId.isValid(postId)) {
            throw new AppError("Invalid post id", 400);
        }
        const post = await Post.findById(postId);
        if (!post) {
            throw new AppError("Post is not found", 404);
        }
        const existingLike = await Like.findOne({
            user: req.user._id,
            post: postId,
        });
        //Если лайк уже есть, удалить его.
        if (existingLike) {
            await existingLike.deleteOne();
            return res.status(200).json({
                success: true,
                liked: false,
                message: "Like removed",
            });
        }
        // Если лайка нет, создать его
        const like = await Like.create({
            user: req.user._id,
            post: postId,
        });
        return res.status(201).json({
            success: true,
            liked: true,
            like,
        });
    }
    catch (error) {
        next(error);
    }
};
export const getPostLikes = async (req, res, next) => {
    try {
        const { postId } = req.params;
        if (typeof postId !== "string" ||
            !mongoose.Types.ObjectId.isValid(postId)) {
            throw new AppError("Invalid post id", 400);
        }
        const post = await Post.findById(postId);
        if (!post) {
            throw new AppError("Post is not found", 404);
        }
        const likes = await Like.find({ post: postId })
            .populate("user", "username fullName")
            .sort({ createdAt: -1 });
        const count = await Like.countDocuments({ post: postId });
        res.status(200).json({
            success: true,
            likes,
            count,
        });
    }
    catch (error) {
        next(error);
    }
};
