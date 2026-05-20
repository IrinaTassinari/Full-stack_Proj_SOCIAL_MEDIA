import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatList from "../../components/messages/ChatList";
import ChatWindow from "../../components/messages/ChatWindow";
import { fetchMyProfile } from "../../features/profile/profileThunks";
import {
  fetchMyChats,
  type Message,
} from "../../features/messages/messagesThunks";
import { receiveSocketMessage } from "../../features/messages/messagesSlice";
import { markAllMessageNotificationsAsRead } from "../../features/messageNotifications/messageNotificationsThunks";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { connectSocket, disconnectSocket } from "../../socket";
import styles from "./MessagesPage.module.css";

const getUserId = (
  user: { _id?: string; id?: string; userId?: string } | null | undefined,
) => user?._id || user?.userId || user?.id || "";

function MessagesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { myProfile } = useAppSelector((state) => state.profile);

  const currentUserId = getUserId(myProfile);

  useEffect(() => {
    dispatch(fetchMyProfile());
    dispatch(fetchMyChats());
    dispatch(markAllMessageNotificationsAsRead());
  }, [dispatch]);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const socket = connectSocket(currentUserId);

    const handleReceiveMessage = (message: Message) => {
      dispatch(
        receiveSocketMessage({
          message,
          currentUserId,
        }),
      );
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      disconnectSocket();
    };
  }, [currentUserId, dispatch]);

  return (
    <section className={styles.page}>
      <button
        className={styles.closeButton}
        type="button"
        aria-label="Close messages"
        onClick={() => navigate("/")}
      />
      <ChatList currentUserId={currentUserId} />
      <ChatWindow currentUserId={currentUserId} />
    </section>
  );
}

export default MessagesPage;
