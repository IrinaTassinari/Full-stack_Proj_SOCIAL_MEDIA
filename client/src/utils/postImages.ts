import type { Post } from "../types/post";

// Posts can use the current gallery field (`images`) or the legacy single-image field (`image`).
export const getPostImages = (post: Post) => {
  if (post.images && post.images.length > 0) {
    return post.images;
  }

  return post.image ? [post.image] : [];
};

export const getPostCoverImage = (post: Post) => getPostImages(post)[0] ?? "";
