import type { User } from "./user";

export type Post = {
  _id: string;
  author: User;
  description?: string;
  image?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
};
