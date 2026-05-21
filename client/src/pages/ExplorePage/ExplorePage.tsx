import { useEffect, useState } from "react";
import PostPreviewModal from "../../components/posts/PostPreviewModal";
import Spinner from "../../components/ui/Spinner/Spinner";
import { fetchExplorePosts } from "../../features/posts/postsThunks";
import { fetchMyProfile } from "../../features/profile/profileThunks";
import {
  fetchSubscriptionSummary,
  followUser,
  unfollowUser,
} from "../../features/subscriptions/subscriptionsThunks";
import { resetExplorePosts } from "../../features/posts/postsSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getPostCoverImage } from "../../utils/postImages";
import styles from "./ExplorePage.module.css";

const getUserId = (
  user: { _id?: string; id?: string; userId?: string } | null | undefined,
) => user?._id || user?.userId || user?.id || "";

function ExplorePage() {
  const dispatch = useAppDispatch();
  const { explorePosts, status, error, exploreHasMore } = useAppSelector(
    (state) => state.posts,
  );
  const { myProfile } = useAppSelector((state) => state.profile);
  const { byUserId, followStatus } = useAppSelector(
    (state) => state.subscriptions,
  );
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(
    null,
  );
  const selectedPost =
    selectedPostIndex === null
      ? null
      : (explorePosts[selectedPostIndex] ?? null);
  const currentUserId = getUserId(myProfile);
  const selectedAuthorId = getUserId(selectedPost?.author);
  const isLoading = status === "loading";
  const isInitialLoading = isLoading && explorePosts.length === 0;
  const isOwnPost = Boolean(
    currentUserId && selectedAuthorId && currentUserId === selectedAuthorId,
  );
  const subscriptionSummary = selectedAuthorId
    ? byUserId[selectedAuthorId]
    : undefined;
  const isFollowingAuthor = subscriptionSummary?.isFollowing ?? false;

  const handleLoadMore = () => {
    if (isLoading || !exploreHasMore) {
      return;
    }

    dispatch(
      fetchExplorePosts({
        limit: 50,
        exclude: explorePosts.map((post) => post._id),
      }),
    );
  };

  useEffect(() => {
    dispatch(resetExplorePosts());
    dispatch(fetchExplorePosts({ limit: 50 }));
  }, [dispatch]);

  useEffect(() => {
    if (selectedPost && !myProfile) {
      dispatch(fetchMyProfile());
    }
  }, [dispatch, myProfile, selectedPost]);

  useEffect(() => {
    if (!selectedAuthorId || !currentUserId || isOwnPost) {
      return;
    }

    dispatch(
      fetchSubscriptionSummary({
        userId: selectedAuthorId,
        currentUserId,
      }),
    );
  }, [currentUserId, dispatch, isOwnPost, selectedAuthorId]);

  const handleToggleFollowAuthor = () => {
    if (!selectedAuthorId || followStatus === "loading" || isOwnPost) {
      return;
    }

    if (isFollowingAuthor) {
      dispatch(unfollowUser(selectedAuthorId));
      return;
    }

    dispatch(followUser(selectedAuthorId));
  };

  if (isInitialLoading) {
    return <Spinner label="Loading posts..." />;
  }

  if (status === "failed") {
    return <p className={styles.errorText}>{error}</p>;
  }

  if (status === "succeeded" && explorePosts.length === 0) {
    return <p className={styles.stateText}>No posts yet.</p>;
  }

  return (
    <section className={styles.page} aria-label="Explore posts">
      <div className={styles.grid}>
        {/* Это логика, которая назначает разным картинкам разные размеры в сетке Explore */}
        {explorePosts.map((post, index) => (
          <button
            className={`${styles.tile} ${
              index % 7 === 2 || index % 7 === 5 ? styles.tall : ""
            } ${index % 11 === 6 ? styles.wide : ""}`}
            key={post._id}
            type="button"
            onClick={() => setSelectedPostIndex(index)}
          >
            <img
              className={styles.image}
              src={getPostCoverImage(post)}
              alt={post.description || `${post.author.username} post`}
            />
          </button>
        ))}
      </div>

      {exploreHasMore && explorePosts.length > 0 && (
        <button
          className={styles.loadMoreButton}
          type="button"
          disabled={isLoading}
          onClick={handleLoadMore}
        >
          {isLoading ? "Loading..." : "Load more"}
        </button>
      )}

      {selectedPost && (
        <PostPreviewModal
          post={selectedPost}
          onClose={() => setSelectedPostIndex(null)}
          showFollowButton={Boolean(currentUserId && !isOwnPost)}
          isFollowingAuthor={isFollowingAuthor}
          isFollowLoading={followStatus === "loading"}
          onToggleFollowAuthor={handleToggleFollowAuthor}
          onPrevious={() =>
            setSelectedPostIndex((currentIndex) => {
              if (currentIndex === null) {
                return currentIndex;
              }

              return currentIndex === 0
                ? explorePosts.length - 1
                : currentIndex - 1;
            })
          }
          onNext={() =>
            setSelectedPostIndex((currentIndex) => {
              if (currentIndex === null) {
                return currentIndex;
              }

              return currentIndex === explorePosts.length - 1
                ? 0
                : currentIndex + 1;
            })
          }
        />
      )}
    </section>
  );
}

export default ExplorePage;
