import type { User } from "./user";
import type { Comment } from "./comment";

export type Post = {
  _id: string;
  author: User;
  description?: string;
  image?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  likesCount?: number;
  commentsCount?: number;
  latestComment?: Comment | null;
  isLikedByMe?: boolean;
};
