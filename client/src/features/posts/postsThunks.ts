import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { Post } from "../../types/post";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type ExplorePostsResponse = {
  success: boolean;
  posts: Post[];
  count: number;
};

export const fetchExplorePosts = createAsyncThunk(
  "posts/fetchExplorePosts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<ExplorePostsResponse>(
        `${API_URL}/api/posts/explore`,
      );

      return response.data.posts;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load explore posts",
      );
    }
  },
);
