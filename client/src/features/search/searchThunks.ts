import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { User } from "../../types/user";
import { getErrorMessage } from "../../utils/getErrorMessage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type SearchUsersResponse = {
  success: boolean;
  users: User[];
  count: number;
};

// GET /api/users/search?query=...
export const searchUsers = createAsyncThunk(
  "search/searchUsers",
  async (query: string, { rejectWithValue }) => {
    if (!query.trim()) {
      return {
        users: [],
        count: 0,
      };
    }

    try {
      const response = await axios.get<SearchUsersResponse>(
        `${API_URL}/api/users/search`,
        {
            // Это способ axios добавить query-параметр в URL
          params: {
            query: query.trim(),
          },
        },
      );

      return {
        users: response.data.users,
        count: response.data.count,
      };
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, "Failed to search users"));
    }
  },
);