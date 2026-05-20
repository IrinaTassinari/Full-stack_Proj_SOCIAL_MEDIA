import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  fetchConversation,
  fetchMyChats,
  sendMessage,
  type Message,
} from "./messagesThunks";
import type { User } from "../../types/user";

type MessagesState = {
  chats: Message[];
  byUserId: Record<string, Message[]>;
  selectedUserId: string | null;
  selectedUser: User | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  conversationStatus: "idle" | "loading" | "succeeded" | "failed";
  sendStatus: "idle" | "loading";
  error: string | null;
};

const initialState: MessagesState = {
  chats: [],
  byUserId: {},
  selectedUserId: null,
  selectedUser: null,
  status: "idle",
  conversationStatus: "idle",
  sendStatus: "idle",
  error: null,
};

const getUserId = (user: { _id?: string; id?: string; userId?: string }) =>
  user._id || user.userId || user.id || "";

// Эта функция нужна, чтобы понять: с кем именно открыт чат, независимо от того, кто отправил сообщение
// Если текущий пользователь отправил сообщение, то собеседник это receiver.
// Если текущий пользователь получил сообщение, то собеседник это sender.
const getChatPartnerId = (message: Message, currentUserId: string) => {
  const senderId = getUserId(message.sender);
  const receiverId = getUserId(message.receiver);

  // Если отправитель сообщения — это я,то собеседник = получатель.Иначе собеседник = отправитель.
  return senderId === currentUserId ? receiverId : senderId;
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    selectChat: (state, action: PayloadAction<string | null>) => {
      state.selectedUserId = action.payload;
      if (!action.payload) {
        state.selectedUser = null;
      }
    },
    selectChatUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    receiveSocketMessage: (
      state,
      action: PayloadAction<{ message: Message; currentUserId: string }>,
    ) => {
      const { message, currentUserId } = action.payload;
      const partnerId = getChatPartnerId(message, currentUserId);

      //обновления Redux state -  добавляет новое сообщение в историю конкретного чата.  хранит переписку по id собеседника
      state.byUserId[partnerId] = [
        ...(state.byUserId[partnerId] ?? []), //  если чата ещё нет, возьми пустой массив
        message,
      ];

      state.chats = [
        message, // Поставить новое сообщение первым
        ...state.chats.filter(
          (chat) => getChatPartnerId(chat, currentUserId) !== partnerId, // Убрать старую запись этого же чата из списка
        ),
      ];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyChats.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMyChats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.chats = action.payload;
      })
      .addCase(fetchMyChats.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.error.message || "Failed to load chats";
      })
      .addCase(fetchConversation.pending, (state) => {
        state.conversationStatus = "loading";
        state.error = null;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.conversationStatus = "succeeded";
        state.byUserId[action.payload.userId] = action.payload.messages;
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.conversationStatus = "failed";
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.error.message || "Failed to load messages";
      })
      .addCase(sendMessage.pending, (state) => {
        state.sendStatus = "loading";
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendStatus = "idle";
        const receiverId = getUserId(action.payload.receiver);

        // добавляет новое сообщение в историю переписки с получателем
        state.byUserId[receiverId] = [
          ...(state.byUserId[receiverId] ?? []),
          action.payload,
        ];

        //  обновляет список чатов слевa -state.chats хранит не всю переписку, а последние сообщения по каждому чату
        state.chats = [
          action.payload,
          ...state.chats.filter(
            (chat) =>
              getUserId(chat.receiver) !== receiverId &&
              getUserId(chat.sender) !== receiverId,
          ),
        ];
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendStatus = "idle";
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.error.message || "Failed to send message";
      });
  },
});

export const { selectChat, selectChatUser, receiveSocketMessage } =
  messagesSlice.actions;
export default messagesSlice.reducer;
