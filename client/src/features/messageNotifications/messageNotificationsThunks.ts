import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { User } from "../../types/user";
import type { Message } from "../messages/messagesThunks";
import { getErrorMessage } from "../../utils/getErrorMessage";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type MessageNotification = {
  _id: string;
  recipient: string;
  sender: User | string;
  message: Message | string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

type MessageNotificationsResponse = {
  success: boolean;
  notifications: MessageNotification[];
  count: number;
  unreadCount: number;
};

type MessageNotificationResponse = {
  success: boolean;
  notification: MessageNotification;
};

type MarkAllMessageNotificationsResponse = {
  success: boolean;
  message: string;
  modifiedCount: number;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

// GET /api/message-notifications
export const fetchMessageNotifications = createAsyncThunk(
  "messageNotifications/fetchMessageNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<MessageNotificationsResponse>(
        `${API_URL}/api/message-notifications`,
        { headers: getAuthHeaders() },
      );

      return {
        notifications: response.data.notifications,
        count: response.data.count,
        unreadCount: response.data.unreadCount,
      };
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load message notifications"),
      );
    }
  },
);

// PATCH /api/message-notifications/:notificationId/read
export const markMessageNotificationAsRead = createAsyncThunk(
  "messageNotifications/markMessageNotificationAsRead",
  async (notificationId: string, { rejectWithValue }) => {
    if (!notificationId) {
      return rejectWithValue("Notification id is required");
    }

    try {
      const response = await axios.patch<MessageNotificationResponse>(
        `${API_URL}/api/message-notifications/${notificationId}/read`,
        {},
        { headers: getAuthHeaders() },
      );

      return response.data.notification;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to mark message notification as read"),
      );
    }
  },
);

// PATCH /api/message-notifications/read-all
export const markAllMessageNotificationsAsRead = createAsyncThunk(
  "messageNotifications/markAllMessageNotificationsAsRead",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.patch<MarkAllMessageNotificationsResponse>(
        `${API_URL}/api/message-notifications/read-all`,
        {},
        { headers: getAuthHeaders() },
      );

      return response.data.modifiedCount;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to mark message notifications as read"),
      );
    }
  },
);
