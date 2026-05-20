import {
  fetchConversation,
  type Message,
} from "../../features/messages/messagesThunks";
import { selectChat, selectChatUser } from "../../features/messages/messagesSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { User } from "../../types/user";
import styles from "./ChatList.module.css";

const getUserId = (
  user: { _id?: string; id?: string; userId?: string } | null | undefined,
) => user?._id || user?.userId || user?.id || "";

const getChatPartner = (message: Message, currentUserId: string) => {
  const senderId = getUserId(message.sender);

  return senderId === currentUserId ? message.receiver : message.sender;
};

const getAgeLabel = (createdAt: string) => {
  const diffMinutes = Math.max(
    1,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000),
  );

  if (diffMinutes < 60) return `${diffMinutes}m`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;

  return `${Math.floor(diffDays / 7)}w`;
};

type ChatListProps = {
  currentUserId: string;
};

function ChatList({ currentUserId }: ChatListProps) {
  const dispatch = useAppDispatch();
  const { chats, selectedUserId, status, error } = useAppSelector(
    (state) => state.messages,
  );
  const { myProfile } = useAppSelector((state) => state.profile);

  const handleSelectChat = (userId: string, user: User) => {
    dispatch(selectChat(userId));
    dispatch(selectChatUser(user));
    dispatch(fetchConversation(userId));
  };

  return (
    <aside className={styles.sidebar}>
      <header className={styles.header}>
        <h1>{myProfile?.username || "Messages"}</h1>
      </header>

      {status === "loading" && (
        <p className={styles.stateText}>Loading chats...</p>
      )}

      {status === "failed" && <p className={styles.errorText}>{error}</p>}

      {status === "succeeded" && chats.length === 0 && (
        <p className={styles.stateText}>No chats yet.</p>
      )}

      <ul className={styles.list}>
        {chats.map((chat) => {
          const partner = getChatPartner(chat, currentUserId);
          const partnerId = getUserId(partner);
          const isActive = selectedUserId === partnerId;
          const isOwnLastMessage = getUserId(chat.sender) === currentUserId;

          return (
            <li key={partnerId}>
              <button
                className={`${styles.chatButton} ${
                  isActive ? styles.active : ""
                }`}
                type="button"
                onClick={() => handleSelectChat(partnerId, partner)}
              >
                <img
                  className={styles.avatar}
                  src={partner.avatar || "/icons/ICH_avatar.png"}
                  alt=""
                  aria-hidden="true"
                />

                <span className={styles.chatMeta}>
                  <strong>{partner.username}</strong>
                  <span>
                    {isOwnLastMessage
                      ? `You: ${chat.text}`
                      : `${partner.username} sent a message.`}{" "}
                    · {getAgeLabel(chat.createdAt)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export default ChatList;
