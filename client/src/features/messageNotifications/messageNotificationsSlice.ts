import { createSlice } from "@reduxjs/toolkit";
import { logout } from "../auth/authSlice";
import {
  fetchMessageNotifications,
  markAllMessageNotificationsAsRead,
  markMessageNotificationAsRead,
  type MessageNotification,
} from "./messageNotificationsThunks";

type MessageNotificationsState = {
  items: MessageNotification[];
  count: number;
  unreadCount: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  updateStatus: "idle" | "loading";
  error: string | null;
};

const initialState: MessageNotificationsState = {
  items: [],
  count: 0,
  unreadCount: 0,
  status: "idle",
  updateStatus: "idle",
  error: null,
};

const messageNotificationsSlice = createSlice({
  name: "messageNotifications",
  initialState,
  reducers: {
    incrementUnreadMessageNotifications: (state) => {
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessageNotifications.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMessageNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.notifications;
        state.count = action.payload.count;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchMessageNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.error.message || "Failed to load message notifications";
      })
      .addCase(markMessageNotificationAsRead.pending, (state) => {
        state.updateStatus = "loading";
        state.error = null;
      })
      .addCase(markMessageNotificationAsRead.fulfilled, (state, action) => {
        state.updateStatus = "idle";
        const wasUnread = state.items.some(
          (notification) =>
            notification._id === action.payload._id && !notification.isRead,
        );

        state.items = state.items.map((notification) =>
          notification._id === action.payload._id
            ? { ...notification, isRead: true }
            : notification,
        );

        if (wasUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markMessageNotificationAsRead.rejected, (state, action) => {
        state.updateStatus = "idle";
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.error.message ||
              "Failed to mark message notification as read";
      })
      .addCase(markAllMessageNotificationsAsRead.pending, (state) => {
        state.updateStatus = "loading";
        state.error = null;
      })
      .addCase(markAllMessageNotificationsAsRead.fulfilled, (state) => {
        state.updateStatus = "idle";
        state.items = state.items.map((notification) => ({
          ...notification,
          isRead: true,
        }));
        state.unreadCount = 0;
      })
      .addCase(markAllMessageNotificationsAsRead.rejected, (state, action) => {
        state.updateStatus = "idle";
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.error.message ||
              "Failed to mark message notifications as read";
      })
      .addCase(logout, () => initialState);
  },
});

export const { incrementUnreadMessageNotifications } =
  messageNotificationsSlice.actions;
export default messageNotificationsSlice.reducer;
