import { useEffect, useRef } from "react";
import { fetchConversation, type Message } from "../../features/messages/messagesThunks";
import { selectChat, selectChatUser } from "../../features/messages/messagesSlice";
import { markMessageNotificationAsRead } from "../../features/messageNotifications/messageNotificationsThunks";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { User } from "../../types/user";
import { fetchUserFollowing } from "../../features/subscriptions/subscriptionsThunks";
import styles from "./ChatList.module.css";

const getUserId = (
  user:
    | { _id?: string; id?: string; userId?: string }
    | string
    | null
    | undefined,
) => (typeof user === "string" ? user : user?._id || user?.userId || user?.id || "");


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
  const readingNotificationIds = useRef(new Set<string>());
  const { chats, selectedUserId, status, error } = useAppSelector(
    (state) => state.messages,
  );
  const { myProfile } = useAppSelector((state) => state.profile);
  const messageNotifications = useAppSelector(
    (state) => state.messageNotifications.items,
  );
  const { followingByUserId, listStatus } = useAppSelector(
    (state) => state.subscriptions,
  );
  const following = currentUserId ? followingByUserId[currentUserId] ?? [] : [];


  const handleSelectChat = (userId: string, user: User) => {
    dispatch(selectChat(userId));
    dispatch(selectChatUser(user));
    dispatch(fetchConversation(userId));
  };

  useEffect(() => {
    const userId = getUserId(myProfile);

    if (userId) {
      dispatch(fetchUserFollowing(userId));
    }
  }, [dispatch, myProfile]);

  useEffect(() => {
    if (!selectedUserId) {
      return;
    }

    messageNotifications.forEach((notification) => {
      if (
        !notification.isRead &&
        getUserId(notification.sender) === selectedUserId &&
        !readingNotificationIds.current.has(notification._id)
      ) {
        readingNotificationIds.current.add(notification._id);
        void dispatch(markMessageNotificationAsRead(notification._id)).finally(
          () => {
            readingNotificationIds.current.delete(notification._id);
          },
        );
      }
    });
  }, [dispatch, messageNotifications, selectedUserId]);

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
        <div className={styles.emptyState}>
          <h2>Start a conversation</h2>
          <p>Choose someone you follow to send a message.</p>

          {listStatus === "loading" && (
            <p className={styles.stateText}>Loading people...</p>
          )}

          {listStatus === "succeeded" && following.length === 0 && (
            <p className={styles.stateText}>
              Follow people from Explore to start messaging them.
            </p>
          )}

          {following.length > 0 && (
            <ul className={styles.suggestions}>
              {following.map((user) => {
                const userId = getUserId(user);

                if (!userId) {
                  return null;
                }

                return (
                  <li key={userId}>
                    <button
                      className={styles.suggestionButton}
                      type="button"
                      onClick={() => handleSelectChat(userId, user)}
                    >
                      <img
                        className={styles.suggestionAvatar}
                        src={user.avatar || "/icons/ICH_avatar.png"}
                        alt=""
                        aria-hidden="true"
                      />
                      <span>
                        <strong>{user.username}</strong>
                        {user.fullName && <small>{user.fullName}</small>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <ul className={styles.list}>
        {chats.map((chat) => {
          const partner = getChatPartner(chat, currentUserId);
          const partnerId = getUserId(partner);
          const isActive = selectedUserId === partnerId;
          const isOwnLastMessage = getUserId(chat.sender) === currentUserId;
          const unreadCount = messageNotifications.filter(
            (notification) =>
              !notification.isRead &&
              getUserId(notification.sender) === partnerId,
          ).length;

          return (
            <li key={partnerId}>
              <button
                className={`${styles.chatButton} ${
                  isActive ? styles.active : ""
                } ${unreadCount > 0 ? styles.unread : ""}`}
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
                {unreadCount > 0 && (
                  <span
                    className={styles.unreadBadge}
                    aria-label={`${unreadCount} unread ${
                      unreadCount === 1 ? "message" : "messages"
                    }`}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export default ChatList;
