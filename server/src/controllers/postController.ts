import mongoose from "mongoose";
import type { Request, Response, NextFunction } from "express";
import { Post } from "../models/Post.js";
import { AppError } from "../utils/appError.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { Like } from "../models/Like.js";
import { Comment } from "../models/Comment.js";

const getPostImageFiles = (req: Request): Express.Multer.File[] => {
  // Multer can return either an array or an object keyed by field name.
  if (Array.isArray(req.files)) {
    return req.files;
  }

  const files = req.files as
    | { images?: Express.Multer.File[]; image?: Express.Multer.File[] }
    | undefined;

  return [...(files?.images ?? []), ...(files?.image ?? [])];
};

const parseExistingImages = (value: unknown): string[] | undefined => {
  // undefined means the client did not ask to replace the existing gallery.
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.filter((image): image is string => typeof image === "string");
  }

  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.filter((image): image is string => typeof image === "string")
      : [];
  } catch {
    return [value];
  }
};

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const description = req.body?.description ?? "";

    const files = getPostImageFiles(req);

    if (!files || files.length === 0) {
      throw new AppError("At least one image is required", 400);
    }

    if (files.length > 10) {
      throw new AppError("Maximum 10 images allowed", 400);
    }

    const imageUrls = await Promise.all(
      files.map((file) =>
        uploadToCloudinary(file.buffer, "inst-project/posts"),
      ),
    );

    // Store only Cloudinary URLs in MongoDB, not the uploaded file data.
    const post = await Post.create({
      author: req.user._id,
      description,
      images: imageUrls,
    });
    await post.populate("author", "username fullName avatar");

    if (!post) {
      throw new AppError("Post is not created", 400);
    }

    res.status(201).json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid post id", 400);
    }

    const post = await Post.findById(id).populate(
      "author",
      "username fullName avatar",
    );

    if (!post) {
      throw new AppError("Post is not found", 404);
    }

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserPosts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;

    if (
      typeof userId !== "string" ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      throw new AppError("Invalid user id", 400);
    }

    const posts = await Post.find({ author: userId })
      .populate("author", "username fullName avatar")
      .sort({ createdAt: -1 });

    const currentUserId = req.user?._id?.toString();
    const enrichedPosts = await enrichPosts(posts, currentUserId);

    res.status(200).json({
      success: true,
      posts: enrichedPosts,
    });
  } catch (error) {
    next(error);
  }
};

const enrichPosts = async (
  posts: Awaited<ReturnType<typeof Post.find>>,
  currentUserId?: string,
) => {
  const postIds = posts.map((post) => post._id);

  const [likesStats, commentsStats, latestCommentRows, likedByMe] =
    await Promise.all([
      Like.aggregate([
        { $match: { post: { $in: postIds } } },
        { $group: { _id: "$post", count: { $sum: 1 } } },
      ]),

      Comment.aggregate([
        { $match: { post: { $in: postIds } } },
        { $group: { _id: "$post", count: { $sum: 1 } } },
      ]),

      Comment.aggregate([
        { $match: { post: { $in: postIds } } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: "$post", comment: { $first: "$$ROOT" } } },
      ]),

      currentUserId
        ? Like.find({ user: currentUserId, post: { $in: postIds } }).select(
            "post",
          )
        : [],
    ]);

  const latestComments = await Comment.populate(
    latestCommentRows.map((row) => row.comment),
    {
      path: "user",
      select: "username fullName avatar",
    },
  );

  const likesCountByPostId = new Map(
    likesStats.map((item) => [String(item._id), item.count]),
  );

  const commentsCountByPostId = new Map(
    commentsStats.map((item) => [String(item._id), item.count]),
  );

  const latestCommentByPostId = new Map(
    latestComments.map((comment) => [String(comment.post), comment]),
  );

  const likedPostIds = new Set(likedByMe.map((like) => String(like.post)));

  return posts.map((post) => {
    const postObject = post.toObject();
    const postId = String(postObject._id);

    return {
      ...postObject,
      likesCount: likesCountByPostId.get(postId) ?? 0,
      commentsCount: commentsCountByPostId.get(postId) ?? 0,
      latestComment: latestCommentByPostId.get(postId) ?? null,
      isLikedByMe: likedPostIds.has(postId),
    };
  });
};

// Return posts from all users for the home feed.
export const getAllPosts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const posts = await Post.find()
      .populate("author", "username fullName avatar")
      .sort({ updatedAt: -1 });

    const currentUserId = req.user?._id?.toString();
    const enrichedPosts = await enrichPosts(posts, currentUserId);

    res.status(200).json({
      success: true,
      posts: enrichedPosts,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
      throw new AppError("You are not allowed to update this post", 403);
    }

    const { description } = req.body ?? {};
    if (description !== undefined) {
      post.description = description;
    }

    const files = getPostImageFiles(req);
    const existingImages = parseExistingImages(req.body?.existingImages);

    if (files.length > 0 || existingImages !== undefined) {
      // Keep selected existing images and append newly uploaded Cloudinary images.
      const currentImages =
        post.images && post.images.length > 0
          ? post.images
          : post.image
            ? [post.image]
            : [];
      const retainedImages =
        existingImages?.filter((imageUrl) =>
          currentImages.includes(imageUrl),
        ) ?? currentImages;
      const imageUrls = await Promise.all(
        files.map((file) =>
          uploadToCloudinary(file.buffer, "inst-project/posts"),
        ),
      );
      const nextImages = [...retainedImages, ...imageUrls];

      if (nextImages.length === 0) {
        throw new AppError("Post must have at least one image", 400);
      }

      if (nextImages.length > 10) {
        throw new AppError("Maximum 10 images allowed", 400);
      }

      post.images = nextImages;
      post.image = undefined;
    }

    await post.save();
    await post.populate("author", "username fullName avatar");

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
  } catch (error) {
    next(error);
  }
};

// explore
export const getExplorePosts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 50);

    const excludeIds =
      typeof req.query.exclude === "string" && req.query.exclude.length > 0
        ? req.query.exclude
            .split(",")
            .filter((id) => mongoose.Types.ObjectId.isValid(id))
            .map((id) => new mongoose.Types.ObjectId(id))
        : [];

    const matchStage =
      excludeIds.length > 0
        ? {
            $match: {
              _id: {
                $nin: excludeIds,
              },
            },
          }
        : null;

    const pipeline = [
      ...(matchStage ? [matchStage] : []),
      { $sample: { size: limit } },
    ];

    const posts = await Post.aggregate(pipeline);

    await Post.populate(posts, {
      path: "author",
      select: "username fullName avatar",
    });

    const remainingCount = await Post.countDocuments(
      excludeIds.length > 0
        ? {
            _id: {
              $nin: excludeIds,
            },
          }
        : {},
    );

    res.status(200).json({
      success: true,
      posts,
      count: posts.length,
      limit,
      hasMore: posts.length < remainingCount,
    });
  } catch (error) {
    next(error);
  }
};
