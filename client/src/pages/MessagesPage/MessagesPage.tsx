import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatList from "../../components/messages/ChatList";
import ChatWindow from "../../components/messages/ChatWindow";
import { fetchMyProfile } from "../../features/profile/profileThunks";
import {
  fetchMyChats,
  type Message,
} from "../../features/messages/messagesThunks";
import {
  receiveSocketMessage,
  selectChat,
  selectChatUser,
} from "../../features/messages/messagesSlice";
import { fetchMessageNotifications } from "../../features/messageNotifications/messageNotificationsThunks";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { connectSocket, disconnectSocket } from "../../socket";
import styles from "./MessagesPage.module.css";

const getUserId = (
  user: { _id?: string; id?: string; userId?: string } | null | undefined,
) => user?._id || user?.userId || user?.id || "";

function MessagesPage() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { myProfile } = useAppSelector((state) => state.profile);

  const currentUserId = getUserId(myProfile);

  useEffect(() => {
    if (location.state?.openSelectedChat !== true) {
      dispatch(selectChat(null));
      dispatch(selectChatUser(null));
    }

    dispatch(fetchMyProfile());
    dispatch(fetchMyChats());
    dispatch(fetchMessageNotifications());
  }, [dispatch, location.state]);

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
      dispatch(fetchMessageNotifications());
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
