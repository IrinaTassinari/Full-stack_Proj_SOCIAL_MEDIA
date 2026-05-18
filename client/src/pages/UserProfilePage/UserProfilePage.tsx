import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PostPreviewModal from "../../components/posts/PostPreviewModal";
import Spinner from "../../components/ui/Spinner/Spinner";
import { fetchMyProfile } from "../../features/profile/profileThunks";
import {
  fetchSubscriptionSummary,
  followUser,
  unfollowUser,
} from "../../features/subscriptions/subscriptionsThunks";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { Post } from "../../types/post";
import type { User } from "../../types/user";
import { getPostCoverImage, getPostImages } from "../../utils/postImages";
import styles from "./UserProfilePage.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type UserResponse = {
  success: boolean;
  user: User;
};

type PostsResponse = {
  success: boolean;
  posts: Post[];
};

const getUserId = (
  user: { _id?: string; id?: string; userId?: string } | null | undefined,
) => user?._id || user?.userId || user?.id || "";

function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { myProfile } = useAppSelector((state) => state.profile);
  const { byUserId, followStatus, error: subscriptionError } = useAppSelector(
    (state) => state.subscriptions,
  );
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profileStatus, setProfileStatus] = useState<
    "idle" | "loading" | "succeeded" | "failed"
  >("idle");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const selectedPost =
    selectedPostIndex === null ? null : posts[selectedPostIndex] ?? null;
  const currentUserId = getUserId(myProfile);
  const subscriptionSummary = userId ? byUserId[userId] : undefined;
  const followersCount = subscriptionSummary?.followersCount ?? 0;
  const followingCount = subscriptionSummary?.followingCount ?? 0;
  const isFollowing = subscriptionSummary?.isFollowing ?? false;

  useEffect(() => {
    if (!myProfile) {
      dispatch(fetchMyProfile());
    }
  }, [dispatch, myProfile]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    if (currentUserId && userId === currentUserId) {
      navigate("/profile", { replace: true });
      return;
    }

    const loadProfile = async () => {
      try {
        setProfileStatus("loading");
        setProfileError(null);

        const [userResponse, postsResponse] = await Promise.all([
            axios.get<UserResponse>(`${API_URL}/api/users/${userId}`),
            axios.get<PostsResponse>(`${API_URL}/api/posts/user/${userId}`),
          ]);

        setUser(userResponse.data.user);
        setPosts(postsResponse.data.posts);
        setProfileStatus("succeeded");
      } catch (requestError: any) {
        setProfileStatus("failed");
        setProfileError(
          requestError.response?.data?.message || "Failed to load user profile",
        );
      }
    };

    loadProfile();
  }, [currentUserId, navigate, userId]);

  useEffect(() => {
    if (userId && currentUserId && userId !== currentUserId) {
      dispatch(fetchSubscriptionSummary({ userId, currentUserId }));
    }
  }, [currentUserId, dispatch, userId]);

  const handleToggleFollow = async () => {
    if (!userId || followStatus === "loading") {
      return;
    }

    if (isFollowing) {
      dispatch(unfollowUser(userId));
      return;
    }

    dispatch(followUser(userId));
  };

  if (profileStatus === "idle" || profileStatus === "loading") {
    return <Spinner label="Loading profile..." />;
  }

  if (profileStatus === "failed") {
    return <p className={styles.errorText}>{profileError}</p>;
  }

  if (!user) {
    return <p className={styles.stateText}>Profile not found.</p>;
  }

  const avatar = user.avatar || "/icons/ICH_avatar.png";
  const bio = user.bio?.trim();
  const website = user.website?.trim();
  const websiteHref =
    website && (website.startsWith("http") ? website : `https://${website}`);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.avatarRing}>
          <img className={styles.avatar} src={avatar} alt="" />
        </div>

        <div className={styles.info}>
          <div className={styles.topRow}>
            <h1 className={styles.username}>{user.username}</h1>
            <button
              className={`${styles.followButton} ${
                isFollowing ? styles.followingButton : ""
              }`}
              type="button"
              disabled={followStatus === "loading"}
              onClick={handleToggleFollow}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
            <button className={styles.messageButton} type="button">
              Message
            </button>
          </div>

          <dl className={styles.stats}>
            <div>
              <dt>{posts.length}</dt>
              <dd>posts</dd>
            </div>
            <div>
              <dt>{followersCount}</dt>
              <dd>followers</dd>
            </div>
            <div>
              <dt>{followingCount}</dt>
              <dd>following</dd>
            </div>
          </dl>

          {user.fullName && <p className={styles.fullName}>{user.fullName}</p>}
          {bio && <p className={styles.bio}>{bio}</p>}
          {website && (
            <a className={styles.website} href={websiteHref}>
              {website}
            </a>
          )}
        </div>
      </header>

      {subscriptionError && (
        <p className={styles.inlineError}>{subscriptionError}</p>
      )}

      {posts.length > 0 ? (
        <div className={styles.postsGrid}>
          {posts.map((post, index) => (
            <button
              className={styles.postTile}
              type="button"
              key={post._id}
              onClick={() => setSelectedPostIndex(index)}
            >
              <img src={getPostCoverImage(post)} alt={post.description || ""} />
              {getPostImages(post).length > 1 && (
                <span className={styles.galleryBadge}>
                  1/{getPostImages(post).length}
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <p className={styles.stateText}>No posts yet.</p>
      )}

      {selectedPost && (
        <PostPreviewModal
          post={selectedPost}
          onClose={() => setSelectedPostIndex(null)}
          showFollowButton
          isFollowingAuthor={isFollowing}
          isFollowLoading={followStatus === "loading"}
          onToggleFollowAuthor={handleToggleFollow}
          onPrevious={() =>
            setSelectedPostIndex((currentIndex) => {
              if (currentIndex === null) {
                return currentIndex;
              }

              return currentIndex === 0 ? posts.length - 1 : currentIndex - 1;
            })
          }
          onNext={() =>
            setSelectedPostIndex((currentIndex) => {
              if (currentIndex === null) {
                return currentIndex;
              }

              return currentIndex === posts.length - 1 ? 0 : currentIndex + 1;
            })
          }
        />
      )}
    </section>
  );
}

export default UserProfilePage;
