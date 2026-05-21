import { useEffect, useState } from "react";
import PostPreviewModal from "../../components/posts/PostPreviewModal";
import Spinner from "../../components/ui/Spinner/Spinner";
import { fetchPostComments } from "../../features/comments/commentsThunks";
import { fetchPostLikes } from "../../features/likes/likesThunks";
import { fetchAllPosts } from "../../features/posts/postsThunks";
import { fetchMyProfile } from "../../features/profile/profileThunks";
import { fetchSubscriptionSummary } from "../../features/subscriptions/subscriptionsThunks";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { Post } from "../../types/post";
import PostCard from "../../components/posts/PostCard";
import styles from "./HomePage.module.css";

const getUserId = (
  user: { _id?: string; id?: string; userId?: string } | null | undefined,
) => user?._id || user?.userId || user?.id || "";

function HomePage() {
  const dispatch = useAppDispatch();
  const { allPosts, feedStatus, error } = useAppSelector(
    (state) => state.posts,
  );
  const { myProfile } = useAppSelector((state) => state.profile);
  const { byUserId } = useAppSelector((state) => state.subscriptions);
  const likesByPostId = useAppSelector((state) => state.likes.byPostId);
  const commentsByPostId = useAppSelector((state) => state.comments.byPostId);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    dispatch(fetchAllPosts());
  }, [dispatch]);

  useEffect(() => {
    if (!myProfile) {
      dispatch(fetchMyProfile());
    }
  }, [dispatch, myProfile]);

  useEffect(() => {
    const currentUserId = getUserId(myProfile);

    if (!currentUserId || allPosts.length === 0) {
      return;
    }

    const authorIds = Array.from(
      new Set(
        allPosts
          .map((post) => getUserId(post.author))
          .filter((authorId) => authorId && authorId !== currentUserId),
      ),
    );

    authorIds.forEach((authorId) => {
      if (!byUserId[authorId]) {
        dispatch(fetchSubscriptionSummary({ userId: authorId, currentUserId }));
      }
    });
  }, [allPosts, byUserId, dispatch, myProfile]);

  useEffect(() => {
    allPosts.forEach((post) => {
      if (!likesByPostId[post._id]) {
        dispatch(fetchPostLikes(post._id));
      }
    });
  }, [allPosts, dispatch, likesByPostId]);

  useEffect(() => {
    allPosts.forEach((post) => {
      if (!commentsByPostId[post._id]) {
        dispatch(fetchPostComments(post._id));
      }
    });
  }, [allPosts, commentsByPostId, dispatch]);

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
