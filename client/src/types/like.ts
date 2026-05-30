import type { User } from "./user";

export type Like = {
  _id: string;
  user: User;
  post: string;
  createdAt: string;
  updatedAt: string;
};