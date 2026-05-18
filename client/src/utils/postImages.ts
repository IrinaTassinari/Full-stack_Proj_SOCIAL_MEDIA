import type { Post } from "../types/post";

// Этот файл нужен, чтобы в одном месте правильно получать картинки поста
// У поста могут быть два варианта: массив картинок post.images или старый/одиночный вариант: post.image
export const getPostImages = (post: Post) => {
  if (post.images && post.images.length > 0) {
    return post.images;
  }

  return post.image ? [post.image] : [];
};

// берет первую картинку поста. Она используется как обложка/превью поста
export const getPostCoverImage = (post: Post) => getPostImages(post)[0] ?? "";
