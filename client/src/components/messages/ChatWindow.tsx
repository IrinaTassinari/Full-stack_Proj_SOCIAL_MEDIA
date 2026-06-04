import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Link } from "react-router-dom";
import type { EmojiClickData } from "emoji-picker-react";
import { sendMessage, type Message } from "../../features/messages/messagesThunks";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import styles from "./ChatWindow.module.css";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

const getUserId = (
  user: { _id?: string; id?: string; userId?: string } | null | undefined,
) => user?._id || user?.userId || user?.id || "";

const getMessageTime = (createdAt: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(createdAt));

const getChatPartner = (message: Message, currentUserId: string) => {
  const senderId = getUserId(message.sender);
  return senderId === currentUserId ? message.receiver : message.sender;
};

type ChatWindowProps = {
  currentUserId: string;
};

function ChatWindow({ currentUserId }: ChatWindowProps) {
  const dispatch = useAppDispatch();
  const {
    chats,
    byUserId,
    selectedUserId,
    selectedUser: selectedChatUser,
    conversationStatus,
    sendStatus,
    sendError,
  } =
    useAppSelector((state) => state.messages);
  const [messageText, setMessageText] = useState("");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const messagesAreaRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const messages = useMemo(
    () => (selectedUserId ? byUserId[selectedUserId] ?? [] : []),
    [byUserId, selectedUserId],
  );

  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;

    if (getUserId(selectedChatUser) === selectedUserId) {
      return selectedChatUser;
    }

    const chat = chats.find(
      (message) => getUserId(getChatPartner(message, currentUserId)) === selectedUserId,
    );

    if (chat) {
      return getChatPartner(chat, currentUserId);
    }

    const firstMessage = messages[0];

    if (!firstMessage) return null;

    return getChatPartner(firstMessage, currentUserId);
  }, [chats, currentUserId, messages, selectedChatUser, selectedUserId]);

  useEffect(() => {
    const messagesArea = messagesAreaRef.current;

    if (!messagesArea) {
      return;
    }

    messagesArea.scrollTop = messagesArea.scrollHeight;
  }, [messages.length]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedUserId || !messageText.trim() || sendStatus === "loading") {
      return;
    }

    const result = await dispatch(
      sendMessage({ receiverId: selectedUserId, text: messageText }),
    );

    if (sendMessage.fulfilled.match(result)) {
      setMessageText("");
      setIsEmojiOpen(false);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessageText((current) => `${current}${emojiData.emoji}`);
  };

  if (!selectedUserId) {
    return (
      <section className={styles.emptyState}>
        <h2>Your messages</h2>
      </section>
    );
  }

  return (
    <section className={styles.chatWindow}>
      <header className={styles.header}>
        {selectedUser && (
          <>
            <img
              className={styles.headerAvatar}
              src={selectedUser.avatar || "/icons/ICH_avatar.png"}
              alt=""
              aria-hidden="true"
            />
            <strong>{selectedUser.username}</strong>
          </>
        )}
      </header>

      <div className={styles.messagesArea} ref={messagesAreaRef}>
        {selectedUser && (
          <div className={styles.profilePreview}>
            <img
              className={styles.profileAvatar}
              src={selectedUser.avatar || "/icons/ICH_avatar.png"}
              alt=""
              aria-hidden="true"
            />
            <strong>{selectedUser.username}</strong>
            <span>{selectedUser.username} · ICHgram</span>
            <Link to={`/users/${getUserId(selectedUser)}`}>View profile</Link>
          </div>
        )}

        {conversationStatus === "loading" && (
          <p className={styles.stateText}>Loading messages...</p>
        )}

        {messages.map((message) => {
          const isOwnMessage = getUserId(message.sender) === currentUserId;

          return (
            <div
              className={`${styles.messageRow} ${
                isOwnMessage ? styles.ownMessageRow : ""
              }`}
              key={message._id}
            >
              {!isOwnMessage && (
                <img
                  className={styles.messageAvatar}
                  src={message.sender.avatar || "/icons/ICH_avatar.png"}
                  alt=""
                  aria-hidden="true"
                />
              )}

              <div
                className={`${styles.messageBubble} ${
                  isOwnMessage ? styles.ownBubble : ""
                }`}
              >
                {message.text}
              </div>

              {isOwnMessage && (
                <img
                  className={styles.messageAvatar}
                  src={message.sender.avatar || "/icons/ICH_avatar.png"}
                  alt=""
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}

        {messages[0] && (
          <time className={styles.timestamp} dateTime={messages[0].createdAt}>
            {getMessageTime(messages[0].createdAt)}
          </time>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className={styles.messageForm} onSubmit={handleSubmit}>
        <button
          className={styles.smileButton}
          type="button"
          aria-label="Choose emoji"
          onClick={() => setIsEmojiOpen((current) => !current)}
        >
          <img src="/icons/smile_btn.png" alt="" aria-hidden="true" />
        </button>
        {isEmojiOpen && (
          <div className={styles.emojiPicker}>
            <Suspense fallback={null}>
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </Suspense>
          </div>
        )}
        <input
          type="text"
          placeholder="Write message"
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
        />
        <button type="submit" disabled={!messageText.trim() || sendStatus === "loading"}>
          Send
        </button>
        {sendError && (
          <p className={styles.sendError} role="alert">
            {sendError}
          </p>
        )}
      </form>
    </section>
  );
}

export default ChatWindow;
