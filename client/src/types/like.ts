import type { User } from "./user";

// Это один лайк
export type Like = {
  _id: string;
  user: User;
  post: string;
  createdAt: string;
  updatedAt: string;
};