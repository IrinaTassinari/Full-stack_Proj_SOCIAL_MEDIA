import mongoose from "mongoose";
import { User } from "../models/User.js";
import { AppError } from "../utils/appError.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { Comment } from "../models/Comment.js";
import { CommentLike } from "../models/CommentLike.js";
import { Like } from "../models/Like.js";
import { Message } from "../models/Message.js";
import { Notification } from "../models/Notification.js";
import { NotificationMessage } from "../models/NotificationMessage.js";
import { Post } from "../models/Post.js";
import { Subscribe } from "../models/Subscribe.js";
export const getUserProfile = async (req, res, next) => {
    try {
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
    }
    catch (error) {
        next(error);
    }
};
export const getMyProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new AppError("Unauthorized", 401);
        }
        res.status(200).json({
            success: true,
            user: req.user,
        });
    }
    catch (error) {
        next(error);
    }
};
export const updateUserProfile = async (req, res, next) => {
    try {
        const { fullName, username, bio, website } = req.body ?? {};
        if (!req.user) {
            throw new AppError("Unauthorized", 401);
        }
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            throw new AppError("User not found", 404);
        }
        const nextUsername = typeof username === "string" ? username.trim() : undefined;
        const nextFullName = typeof fullName === "string" ? fullName.trim() : undefined;
        const nextBio = typeof bio === "string" ? bio.trim() : undefined;
        const nextWebsite = typeof website === "string" ? website.trim() : undefined;
        if (nextUsername !== undefined && !nextUsername) {
            throw new AppError("Username is required", 400);
        }
        // Update only the fields that were sent in the request.
        if (nextFullName !== undefined)
            user.fullName = nextFullName;
        if (nextUsername !== undefined && nextUsername !== user.username) {
            // A changed username must stay unique across all users.
            const existingUser = await User.findOne({
                username: nextUsername,
                _id: { $ne: user._id },
            });
            if (existingUser) {
                throw new AppError("Username is already taken", 409);
            }
            user.username = nextUsername;
        }
        if (nextBio !== undefined)
            user.bio = nextBio;
        if (nextWebsite !== undefined)
            user.website = nextWebsite;
        if (req.file) {
            // Avatars are uploaded to Cloudinary and saved as a URL.
            const avatarUrl = await uploadToCloudinary(req.file.buffer, "inst-project/avatars");
            user.avatar = avatarUrl;
        }
        const updatedUser = await user.save();
        res.status(200).json({
            success: true,
            message: "User has been successfully updated",
            user: updatedUser,
        });
    }
    catch (error) {
        next(error);
    }
};
export const deleteMyProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new AppError("Unauthorized", 401);
        }
        const userId = req.user._id;
        const [posts, comments, messages, subscriptions] = await Promise.all([
            Post.find({ author: userId }).select("_id"),
            Comment.find({ user: userId }).select("_id"),
            Message.find({ $or: [{ sender: userId }, { receiver: userId }] }).select("_id"),
            Subscribe.find({
                $or: [{ follower: userId }, { following: userId }],
            }).select("_id"),
        ]);
        const postIds = posts.map((post) => post._id);
        const commentsOnDeletedPosts = await Comment.find({
            post: { $in: postIds },
        }).select("_id");
        const commentIds = [
            ...new Set([...comments, ...commentsOnDeletedPosts].map((comment) => comment._id.toString())),
        ];
        const messageIds = messages.map((message) => message._id);
        const subscriptionIds = subscriptions.map((subscription) => subscription._id);
        // Delete dependent documents before removing the user account.
        await Promise.all([
            CommentLike.deleteMany({
                $or: [{ user: userId }, { comment: { $in: commentIds } }],
            }),
            Like.deleteMany({
                $or: [{ user: userId }, { post: { $in: postIds } }],
            }),
            Notification.deleteMany({
                $or: [
                    { recipient: userId },
                    { sender: userId },
                    { post: { $in: postIds } },
                    { comment: { $in: commentIds } },
                    { subscription: { $in: subscriptionIds } },
                ],
            }),
            NotificationMessage.deleteMany({
                $or: [
                    { recipient: userId },
                    { sender: userId },
                    { message: { $in: messageIds } },
                ],
            }),
            Comment.deleteMany({
                $or: [{ user: userId }, { post: { $in: postIds } }],
            }),
            Message.deleteMany({
                $or: [{ sender: userId }, { receiver: userId }],
            }),
            Subscribe.deleteMany({
                $or: [{ follower: userId }, { following: userId }],
            }),
            Post.deleteMany({ author: userId }),
        ]);
        await User.deleteOne({ _id: userId });
        res.status(200).json({
            success: true,
            message: "Profile deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
export const searchUsers = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
