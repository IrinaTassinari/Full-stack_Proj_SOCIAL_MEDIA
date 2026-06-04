import type { User } from "./user";

export type Comment = {
  _id: string;
  user: User;
  post: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  likesCount?: number;
  isLikedByMe?: boolean;
};
