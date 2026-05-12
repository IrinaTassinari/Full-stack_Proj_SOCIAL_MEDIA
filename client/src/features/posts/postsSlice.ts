import { createSlice } from "@reduxjs/toolkit";
import type { Post } from "../../types/post";
import { fetchExplorePosts } from "./postsThunks";

type PostsState = {
  explorePosts: Post[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: PostsState = {
  explorePosts: [],
  status: "idle",
  error: null,
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExplorePosts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchExplorePosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.explorePosts = action.payload;
      })
      .addCase(fetchExplorePosts.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.error.message || "Failed to load explore posts";
      });
  },
});

export default postsSlice.reducer;
