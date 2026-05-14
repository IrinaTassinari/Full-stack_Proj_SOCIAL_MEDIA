import { useEffect, useRef, useState, type TouchEvent } from "react";
import type { Post } from "../../types/post";
import { getPostImages } from "../../utils/postImages";
import styles from "./PostPreviewModal.module.css";

type PostPreviewModalProps = {
  post: Post;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
};

function PostPreviewModal({
  post,
  onClose,
  onPrevious,
  onNext,
}: PostPreviewModalProps) {
  const avatar = post.author.avatar || "/icons/ICH_avatar.png";
  const images = getPostImages(post);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const currentImage = images[currentImageIndex] ?? "";
  const hasMultipleImages = images.length > 1;
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

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

    if (Math.abs(horizontalDistance) > 70 && Math.abs(horizontalDistance) > Math.abs(swipeDistance)) {
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
            <div className={styles.author}>
              <span className={styles.avatarRing}>
                <img src={avatar} alt="" />
              </span>
              <strong>{post.author.username}</strong>
            </div>

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
                  <strong>{post.author.username}</strong> {post.description}
                </p>
              </div>
            )}
          </div>

          <footer className={styles.footer}>
            <div className={styles.actions}>
              <img src="/icons/button-like.png" alt="" aria-hidden="true" />
              <img src="/icons/button-comments.png" alt="" aria-hidden="true" />
            </div>
            <strong>0 likes</strong>
          </footer>
        </div>
      </article>
    </div>
  );
}

export default PostPreviewModal;
