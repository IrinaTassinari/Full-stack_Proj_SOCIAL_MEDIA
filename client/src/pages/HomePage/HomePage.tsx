import { useEffect, useState } from "react";
import PostPreviewModal from "../../components/posts/PostPreviewModal";
import Spinner from "../../components/ui/Spinner/Spinner";
import { fetchAllPosts } from "../../features/posts/postsThunks";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { Post } from "../../types/post";
import PostCard from "../../components/posts/PostCard";
import styles from "./HomePage.module.css";

function HomePage() {
  const dispatch = useAppDispatch();
  const { allPosts, feedStatus, error } = useAppSelector(
    (state) => state.posts,
  );
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    dispatch(fetchAllPosts());
  }, [dispatch]);

  if (feedStatus === "idle" || feedStatus === "loading") {
    return <Spinner label="Loading posts..." />;
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
          <PostCard key={post._id} post={post} onOpenPost={setSelectedPost} />
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
        <p className={styles.updatesText}>
          You have viewed all new publications
        </p>
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
