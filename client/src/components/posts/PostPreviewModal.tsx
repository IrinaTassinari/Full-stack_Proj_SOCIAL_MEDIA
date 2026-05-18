import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type TouchEvent,
} from "react";
import { Link } from "react-router-dom";
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
} from "../../features/comments/commentsThunks";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

const getUserId = (user: { _id?: string; id?: string; userId?: string }) =>
  user._id || user.userId || user.id || "";

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
  const authorProfileUrl = `/users/${getUserId(post.author)}`;
  const images = getPostImages(post);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const currentImage = images[currentImageIndex] ?? "";
  const hasMultipleImages = images.length > 1;
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const [commentText, setCommentText] = useState("");

  const handleAddComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!commentText.trim()) {
      return;
    }

    dispatch(addPostComment({ postId: post._id, text: commentText }));
    setCommentText("");
  };

  const postLikes = useAppSelector((state) => state.likes.byPostId[post._id]);
  const postComments = useAppSelector(
    (state) => state.comments.byPostId[post._id],
  );

  const likesCount = postLikes?.count ?? 0;
  const comments = postComments?.comments ?? [];

  useEffect(() => {
    dispatch(fetchPostLikes(post._id));
    dispatch(fetchPostComments(post._id));
  }, [dispatch, post._id]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [post._id]);

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
    setCurrentImageIndex((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  };

  const showNextImage = () => {
    setCurrentImageIndex((current) =>
      current === images.length - 1 ? 0 : current + 1,
    );
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
                  </Link>{" "}
                  {post.description}
                </p>
              </div>
            )}

            {comments.map((comment) => (
              <div className={styles.captionRow} key={comment._id}>
                <span className={styles.avatarRing}>
                  <img
                    src={comment.user.avatar || "/icons/ICH_avatar.png"}
                    alt=""
                  />
                </span>
                <p>
                  <strong>{comment.user.username}</strong> {comment.text}
                </p>
              </div>
            ))}
          </div>

          <footer className={styles.footer}>
            <div className={styles.actions}>
              <button
                className={styles.actionButton}
                type="button"
                onClick={() => dispatch(togglePostLike(post._id))}
              >
                <img src="/icons/button-like.png" alt="" aria-hidden="true" />
              </button>
              <img src="/icons/button-comments.png" alt="" aria-hidden="true" />
            </div>
            <strong>{likesCount} likes</strong>
          </footer>

          <form className={styles.commentBar} onSubmit={handleAddComment}>
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
