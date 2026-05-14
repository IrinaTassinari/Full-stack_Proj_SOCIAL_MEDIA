import type { Post } from "../types/post";

export const getPostImages = (post: Post) => {
  if (post.images && post.images.length > 0) {
    return post.images;
  }

  return post.image ? [post.image] : [];
};

export const getPostCoverImage = (post: Post) => getPostImages(post)[0] ?? "";
