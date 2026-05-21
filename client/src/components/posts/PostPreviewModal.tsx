import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type TouchEvent,
} from "react";
import { Link } from "react-router-dom";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import CommentRow from "./CommentRow";
import type { Post } from "../../types/post";
import { getPostImages } from "../../utils/postImages";
import styles from "./PostPreviewModal.module.css";
import {
  fetchPostLikes,
  togglePostLike,
} from "../../features/likes/likesThunks";
import {
  fetchPostComments,
  addPostComment,
  deletePostComment,
} from "../../features/comments/commentsThunks";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

const getUserId = (
  user: { _id?: string; id?: string; userId?: string } | null | undefined,
) => user?._id || user?.userId || user?.id || "";

// это функция для отображения времени комментария
const getAgeLabel = (createdAt: string) => {
  const diffMinutes = Math.max(
    1,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000),
  );

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);

  return diffDays === 1 ? "1 day" : `${diffDays} days`;
};

type PostPreviewModalProps = {
  post: Post;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  showFollowButton?: boolean;
  isFollowingAuthor?: boolean;
  isFollowLoading?: boolean;
  onToggleFollowAuthor?: () => void;
};

function PostPreviewModal({
  post,
  onClose,
  onPrevious,
  onNext,
  showFollowButton = false,
  isFollowingAuthor = false,
  isFollowLoading = false,
  onToggleFollowAuthor,
}: PostPreviewModalProps) {
  const dispatch = useAppDispatch();
  const avatar = post.author.avatar || "/icons/ICH_avatar.png";

  // Это ссылка на профиль автора постa. То есть когда пользователь нажимает на имя автора или его аватар в модалке, его перекидывает на страницу профиля автора
  const authorProfileUrl = `/users/${getUserId(post.author)}`;

  // получает массив картинок поста ["img1.jpg", "img2.jpg", "img3.jpg"]
  const images = getPostImages(post);
  // хранит номер текущей картинки
  const [currentImageState, setCurrentImageState] = useState({
    postId: post._id,
    index: 0,
  });
  const currentImageIndex =
    currentImageState.postId === post._id ? currentImageState.index : 0;
  // берёт картинку по текущему индексу, Если пользователь нажал next: currentImageIndex = 1 тогда: currentImage = images[1]
  const currentImage = images[currentImageIndex] ?? "";
  const hasMultipleImages = images.length > 1;
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [likedOverride, setLikedOverride] = useState<{
    postId: string;
    value: boolean;
  } | null>(null);

  const handleAddComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Это проверка, чтобы нельзя было отправить пустой комментарий
    if (!commentText.trim()) {
      return;
    }

    dispatch(addPostComment({ postId: post._id, text: commentText }));
    setCommentText("");
    setIsEmojiOpen(false);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setCommentText((current) => `${current}${emojiData.emoji}`);
  };

  // Это чтение данных из Redux store - Берём текущего залогиненного пользователя из profile
  const { myProfile } = useAppSelector((state) => state.profile);
  // Берём лайки именно для этого поста 
  // postLikes — лайки открытого поста - берутся из Redux
  const postLikes = useAppSelector((state) => state.likes.byPostId[post._id]);
  // postComments — комментарии открытого поста - берутся из Redux
  const postComments = useAppSelector(
    (state) => state.comments.byPostId[post._id],
  );

  const likesCount = postLikes?.count ?? 0;
  const currentUserId = getUserId(myProfile);
  
  // Проверяет: есть ли лайк текущего пользователя среди лайков поста - .some(...) проверяет, есть ли хотя бы один подходящий элемент. Если совпало — значит текущий пользователь уже лайкнул пост. ?? false значит: если postLikes ещё не загружены, считать, что лайка нет
  const isPostLikedFromServer =
    postLikes?.likes.some((like) => getUserId(like.user) === currentUserId) ??
    false;
  // Если пользователь только что нажал лайк, используется likedOverride. Если ещё не нажимал, используется состояние с backend: isPostLikedFromServer
  const isPostLiked =
    likedOverride?.postId === post._id ? likedOverride.value : isPostLikedFromServer; 
  const likesLabel = `${likesCount} ${likesCount === 1 ? "like" : "likes"}`;

  // Берёт комментарии поста. Если ещё не загружены, возвращает пустой массив.
  const comments = postComments?.comments ?? [];

  const handleToggleLike = () => {
    setLikedOverride({ postId: post._id, value: !isPostLiked });
    dispatch(togglePostLike(post._id));
  };

  const handleDeleteComment = (commentId: string) => {
    dispatch(deletePostComment({ postId: post._id, commentId }));
  };

  /**
   * при смене поста:
   * 1. Загружает лайки нового поста
   * 2. Загружает комментарии нового поста
   * 3. Сбрасывает временное состояние лайка null значит: “не используй старое временное значение, жди/используй данные с backend”.
   */
  useEffect(() => {
    dispatch(fetchPostLikes(post._id));
    dispatch(fetchPostComments(post._id));
  }, [dispatch, post._id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowLeft") {
        onPrevious?.();
      }

      if (event.key === "ArrowRight") {
        onNext?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, onNext, onPrevious]);

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX;
    const touchEndY = event.changedTouches[0]?.clientY;

    if (touchEndX === undefined || touchEndY === undefined) {
      return;
    }

    const horizontalDistance = touchStartXRef.current - touchEndX;
    const swipeDistance = touchStartYRef.current - touchEndY;
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (
      Math.abs(horizontalDistance) > 70 &&
      Math.abs(horizontalDistance) > Math.abs(swipeDistance)
    ) {
      onClose();
      return;
    }

    if (Math.abs(swipeDistance) < 50) {
      return;
    }

    if (swipeDistance > 0) {
      onNext?.();
      return;
    }

    onPrevious?.();
  };

  const showPreviousImage = () => {
    setCurrentImageState({
      postId: post._id,
      index: currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1,
    });
  };

  const showNextImage = () => {
    setCurrentImageState({
      postId: post._id,
      index: currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1,
    });
  };

  return (
    <div className={styles.overlay}>
      <button
        className={styles.backdrop}
        type="button"
        aria-label="Close post"
        onClick={onClose}
      />

      {onPrevious && (
        <button
          className={`${styles.navButton} ${styles.navButtonLeft}`}
          type="button"
          aria-label="Previous post"
          onClick={onPrevious}
        >
          &lt;
        </button>
      )}

      {onNext && (
        <button
          className={`${styles.navButton} ${styles.navButtonRight}`}
          type="button"
          aria-label="Next post"
          onClick={onNext}
        >
          &gt;
        </button>
      )}

      <article
        className={styles.modal}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.imageWrap}>
          <img
            className={styles.image}
            src={currentImage}
            alt={post.description || `${post.author.username} post`}
          />
          {hasMultipleImages && (
            <>
              <button
                className={`${styles.imageNavButton} ${styles.imageNavButtonLeft}`}
                type="button"
                aria-label="Previous image"
                onClick={showPreviousImage}
              >
                &lt;
              </button>
              <button
                className={`${styles.imageNavButton} ${styles.imageNavButtonRight}`}
                type="button"
                aria-label="Next image"
                onClick={showNextImage}
              >
                &gt;
              </button>
              <span className={styles.imageCounter}>
                {currentImageIndex + 1}/{images.length}
              </span>
            </>
          )}
        </div>

        <div className={styles.details}>
          <header className={styles.header}>
            <Link className={styles.author} to={authorProfileUrl}>
              <span className={styles.avatarRing}>
                <img src={avatar} alt="" />
              </span>
              <strong>{post.author.username}</strong>
            </Link>
            {showFollowButton && (
              <>
                <span className={styles.authorDot}>.</span>
                <button
                  className={styles.followButton}
                  type="button"
                  disabled={isFollowLoading}
                  onClick={onToggleFollowAuthor}
                >
                  {isFollowingAuthor ? "Following" : "Follow"}
                </button>
              </>
            )}

            <button
              className={styles.closeButton}
              type="button"
              aria-label="Close post"
              onClick={onClose}
            />
          </header>

          <div className={styles.captionArea}>
            {post.description && (
              <div className={styles.captionRow}>
                <span className={styles.avatarRing}>
                  <img src={avatar} alt="" />
                </span>
                <p>
                  <Link to={authorProfileUrl}>
                    <strong>{post.author.username}</strong>
                  </Link>
                  <span>{post.description}</span>
                </p>
              </div>
            )}

            {comments.map((comment) => (
              <CommentRow
                key={comment._id}
                comment={comment}
                currentUserId={currentUserId}
                onDeleteComment={handleDeleteComment}
              />
            ))}
          </div>

          <footer className={styles.footer}>
            <div className={styles.actions}>
              <button
                className={`${styles.actionButton} ${
                  isPostLiked ? styles.likedButton : ""
                }`}
                type="button"
                aria-label={isPostLiked ? "Unlike post" : "Like post"}
                onClick={handleToggleLike}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M16.8 3.8c-1.8 0-3.3 1-4.2 2.4C11.7 4.8 10.2 3.8 8.4 3.8 5.5 3.8 3.2 6 3.2 8.8c0 5.2 8.8 10.4 9.2 10.6.1.1.3.1.4 0 .4-.2 9.2-5.4 9.2-10.6 0-2.8-2.3-5-5.2-5Z" />
                </svg>
              </button>
              <img src="/icons/button-comments.png" alt="" aria-hidden="true" />
            </div>
            <strong>{likesLabel}</strong>
            <time dateTime={post.createdAt}>{getAgeLabel(post.createdAt)}</time>
          </footer>

          <form className={styles.commentBar} onSubmit={handleAddComment}>
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
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
            <input
              type="text"
              placeholder="Add comment"
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </article>
    </div>
  );
}

export default PostPreviewModal;
