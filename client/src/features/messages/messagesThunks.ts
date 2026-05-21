import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { User } from "../../types/user";
import { getErrorMessage } from "../../utils/getErrorMessage";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type Message = {
  _id: string;
  sender: User;
  receiver: User;
  text: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

// возвращает список чатов, но каждый чат представлен последним сообщением с этим пользователем
// GET /api/messages/allchats
type ChatsResponse = {
  success: boolean;
  allChats: Message[];
  count: number;
};
// возвращает всю переписку с конкретным пользователем.
// GET /api/messages/:userId
type ConversationResponse = {
  success: boolean;
  messages: Message[];
  count: number;
};

// возвращает одно новое отправленное сообщение, не массив
// POST /api/messages/:receiverId
type SendMessageResponse = {
  success: boolean;
  message: Message;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

// GET /api/messages/allchats
export const fetchMyChats = createAsyncThunk(
  "messages/fetchMyChats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<ChatsResponse>(
        `${API_URL}/api/messages/allchats`,
        { headers: getAuthHeaders() },
      );

      return response.data.allChats;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, "Failed to load chats"));
    }
  },
);

// GET /api/messages/:userId
export const fetchConversation = createAsyncThunk(
  "messages/fetchConversation",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<ConversationResponse>(
        `${API_URL}/api/messages/${userId}`,
        { headers: getAuthHeaders() },
      );

      return {
        userId,
        messages: response.data.messages,
      };
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, "Failed to load messages"));
    }
  },
);

// POST /api/messages/:receiverId
export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async (
    { receiverId, text }: { receiverId: string; text: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.post<SendMessageResponse>(
        `${API_URL}/api/messages/${receiverId}`,
        { text },
        { headers: getAuthHeaders() },
      );

      return response.data.message;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, "Failed to send message"));
    }
  },
);
