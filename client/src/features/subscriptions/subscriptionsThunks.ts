import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getErrorMessage } from "../../utils/getErrorMessage";
import type { User } from "../../types/user";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type SubscriptionUser = {
  _id?: string;
  id?: string;
  userId?: string;
};

type FollowerItem = {
  follower: SubscriptionUser | string;
};

type FollowersResponse = {
  success: boolean;
  followers: FollowerItem[];
  count: number;
};

type FollowingItem = {
  following: SubscriptionUser | string;
};

type FollowingResponse = {
  success: boolean;
  following: FollowingItem[];
  count: number;
};

type SubscriptionListItem = {
  follower?: User;
  following?: User;
};

type FollowersListResponse = {
  success: boolean;
  followers: SubscriptionListItem[];
  count: number;
};

type FollowingListResponse = {
  success: boolean;
  following: SubscriptionListItem[];
  count: number;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

const getUserId = (user: SubscriptionUser | string) =>
  typeof user === "string" ? user : user._id || user.userId || user.id || "";

// Load follower/following counts and whether the current user follows this profile.
// GET /api/subscriptions/:userId/followers
// GET /api/subscriptions/:userId/following
export const fetchSubscriptionSummary = createAsyncThunk(
  "subscriptions/fetchSummary",
  async (
    { userId, currentUserId }: { userId: string; currentUserId: string },
    { rejectWithValue },
  ) => {
    try {
      const headers = getAuthHeaders();
      const [followersResponse, followingResponse] = await Promise.all([
        axios.get<FollowersResponse>(
          `${API_URL}/api/subscriptions/${userId}/followers`,
          { headers },
        ),
        axios.get<FollowingResponse>(
          `${API_URL}/api/subscriptions/${userId}/following`,
          { headers },
        ),
      ]);

      return {
        userId,
        followersCount: followersResponse.data.count,
        followingCount: followingResponse.data.count,
        isFollowing: followersResponse.data.followers.some(
          (item) => getUserId(item.follower) === currentUserId,
        ),
      };
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load subscriptions"),
      );
    }
  },
);

// POST /api/subscriptions/:userId
export const followUser = createAsyncThunk(
  "subscriptions/followUser",
  async (userId: string, { rejectWithValue }) => {
    if (!userId) {
      return rejectWithValue("User id is required");
    }
    try {
      await axios.post(
        `${API_URL}/api/subscriptions/${userId}`,
        {},
        { headers: getAuthHeaders() },
      );

      return userId;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, "Failed to follow user"));
    }
  },
);

// DELETE /api/subscriptions/:userId
export const unfollowUser = createAsyncThunk(
  "subscriptions/unfollowUser",
  async (userId: string, { rejectWithValue }) => {
    if (!userId) {
      return rejectWithValue("User id is required");
    }
    try {
      await axios.delete(`${API_URL}/api/subscriptions/${userId}`, {
        headers: getAuthHeaders(),
      });

      return userId;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, "Failed to unfollow user"));
    }
  },
);

// GET /api/subscriptions/:userId/followers
export const fetchUserFollowers = createAsyncThunk(
  "subscriptions/fetchUserFollowers",
  async (userId: string, { rejectWithValue }) => {
    if (!userId) {
      return rejectWithValue("User id is required");
    }

    try {
      const response = await axios.get<FollowersListResponse>(
        `${API_URL}/api/subscriptions/${userId}/followers`,
        { headers: getAuthHeaders() },
      );

      return {
        userId,
        users: response.data.followers
          // Convert [{ follower: user }] into [user].
          .map((item) => item.follower)
          .filter((user): user is User => Boolean(user)),
        count: response.data.count,
      };
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load followers"),
      );
    }
  },
);

// GET /api/subscriptions/:userId/following
export const fetchUserFollowing = createAsyncThunk(
  "subscriptions/fetchUserFollowing",
  async (userId: string, { rejectWithValue }) => {
    if (!userId) {
      return rejectWithValue("User id is required");
    }

    try {
      const response = await axios.get<FollowingListResponse>(
        `${API_URL}/api/subscriptions/${userId}/following`,
        { headers: getAuthHeaders() },
      );

      return {
        userId,
        users: response.data.following
          // Convert [{ following: user }] into [user].
          .map((item) => item.following)
          .filter((user): user is User => Boolean(user)),
        count: response.data.count,
      };
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load following"),
      );
    }
  },
);
