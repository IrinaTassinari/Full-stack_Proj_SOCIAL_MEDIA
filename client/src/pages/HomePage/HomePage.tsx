import { useEffect, useState } from "react";
import PostPreviewModal from "../../components/posts/PostPreviewModal";
import { fetchAllPosts } from "../../features/posts/postsThunks";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { Post } from "../../types/post";
import { getPostCoverImage } from "../../utils/postImages";
import styles from "./HomePage.module.css";

const getPostAgeLabel = (createdAt: string) => {
  const createdTime = new Date(createdAt).getTime();
  const diffMs = Date.now() - createdTime;
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}d`;
  }

  return `${Math.floor(diffDays / 7)}w`;
};

function HomePage() {
  const dispatch = useAppDispatch();
  const { allPosts, feedStatus, error } = useAppSelector((state) => state.posts);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    dispatch(fetchAllPosts());
  }, [dispatch]);

  if (feedStatus === "idle" || feedStatus === "loading") {
    return <p className={styles.stateText}>Loading posts...</p>;
  }

  if (feedStatus === "failed") {
    return <p className={styles.errorText}>{error}</p>;
  }

  if (feedStatus === "succeeded" && allPosts.length === 0) {
    return <p className={styles.stateText}>No posts yet.</p>;
  }

  return (
    <section className={styles.page}>
      <div className={styles.feedGrid}>
        {allPosts.map((post) => (
          <article className={styles.postCard} key={post._id}>
            <header className={styles.postHeader}>
              <img
                className={styles.avatar}
                src={post.author.avatar || "/icons/ICH_avatar.png"}
                alt={`${post.author.username} avatar`}
              />

              <div className={styles.authorMeta}>
                <span className={styles.username}>{post.author.username}</span>
                <span className={styles.dot}>.</span>
                <span className={styles.time}>{getPostAgeLabel(post.createdAt)}</span>
                <span className={styles.dot}>.</span>
              </div>

              <button className={styles.followButton} type="button">
                follow
              </button>
            </header>

            <button
              className={styles.postImageButton}
              type="button"
              onClick={() => setSelectedPost(post)}
            >
              <img
                className={styles.postImage}
                src={getPostCoverImage(post)}
                alt=""
              />
            </button>

            <div className={styles.actions}>
              <button className={styles.iconButton} type="button" aria-label="Like">
                <img src="/icons/button-like.png" alt="" aria-hidden="true" />
              </button>
              <button
                className={styles.iconButton}
                type="button"
                aria-label="Comment"
              >
                <img src="/icons/button-comments.png" alt="" aria-hidden="true" />
              </button>
            </div>

            <p className={styles.likes}>0 likes</p>

            {post.description && (
              <p className={styles.caption}>
                <span>{post.author.username}</span> <em>{post.description}</em>
              </p>
            )}

            <button className={styles.commentsButton} type="button">
              View all comments
            </button>
          </article>
        ))}
      </div>

      <div className={styles.updates}>
        <img
          className={styles.checkIcon}
          src="/icons/seen_all_updates.png"
          alt=""
          aria-hidden="true"
        />
        <p className={styles.updatesTitle}>You&apos;ve seen all the updates</p>
        <p className={styles.updatesText}>You have viewed all new publications</p>
      </div>

      {selectedPost && (
        <PostPreviewModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </section>
  );
}

export default HomePage;
