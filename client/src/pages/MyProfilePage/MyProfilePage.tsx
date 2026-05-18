import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../../components/ui/Spinner/Spinner";
import { deletePost } from "../../features/posts/postsThunks";
import { fetchMyPosts, fetchMyProfile } from "../../features/profile/profileThunks";
import { fetchSubscriptionSummary } from "../../features/subscriptions/subscriptionsThunks";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { Post } from "../../types/post";
import { getPostCoverImage, getPostImages } from "../../utils/postImages";
import styles from "./MyProfilePage.module.css";

const getUserId = (user: { _id?: string; id?: string; userId?: string } | null) =>
  user?._id || user?.userId || user?.id || "";
const collapsedBioLength = 120;

function MyProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { myProfile, myPosts, status, postsStatus, error } = useAppSelector(
    (state) => state.profile,
  );
  const { byUserId: subscriptionsByUserId, error: subscriptionsError } =
    useAppSelector((state) => state.subscriptions);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

  // Он запускается один раз, когда открывается MyProfilePage - Он делает запрос: GET /api/users/me
  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);

  // Он срабатывает, когда изменился myProfile
  useEffect(() => {
    const userId = getUserId(myProfile);

    if (userId) {
      dispatch(fetchMyPosts(userId));
      dispatch(fetchSubscriptionSummary({ userId, currentUserId: userId }));
    }
  }, [dispatch, myProfile]);


  /**
   * отвечает за открытый пост в модалке: закрытие по Escape, переключение стрелками, копирование ссылки и выбор следующего поста после удаления
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPostMenuOpen(false);
        setSelectedPost(null);
        setSelectedPostIndex(null);
        setSelectedImageIndex(0);
        return;
      }

      // если пост не выбран или пост всего один, переключать некуда или открыто меню Delete/Edit/Copy,то стрелки не трогаем
      if (selectedPostIndex === null || myPosts.length < 2 || isPostMenuOpen) {
        return;
      }

      if (event.key === "ArrowLeft") {
        const nextIndex =
          selectedPostIndex === 0 ? myPosts.length - 1 : selectedPostIndex - 1;

        setSelectedPost(myPosts[nextIndex]);
        setSelectedPostIndex(nextIndex);
        setSelectedImageIndex(0);
      }

      if (event.key === "ArrowRight") {
        const nextIndex =
          selectedPostIndex === myPosts.length - 1 ? 0 : selectedPostIndex + 1;

        setSelectedPost(myPosts[nextIndex]);
        setSelectedPostIndex(nextIndex);
        setSelectedImageIndex(0);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPostMenuOpen, myPosts, selectedPostIndex]);

  if (status === "loading") {
    return <Spinner label="Loading profile..." />;
  }

  if (status === "failed") {
    return <p className={styles.errorText}>{error}</p>;
  }

  if (!myProfile) {
    return <p className={styles.stateText}>Profile not found.</p>;
  }

  const avatar = myProfile.avatar || "/icons/ICH_avatar.png";
  const bio = myProfile.bio?.trim();
  const isBioLong = Boolean(bio && bio.length > collapsedBioLength);
  const website = myProfile.website?.trim();
  const websiteHref =
    website && (website.startsWith("http") ? website : `https://${website}`);
  const selectedPostAuthor = selectedPost?.author || myProfile;
  const selectedPostAvatar = selectedPostAuthor?.avatar || avatar;
  const selectedPostUsername = selectedPostAuthor?.username || myProfile.username;
  const selectedPostImages = selectedPost ? getPostImages(selectedPost) : [];
  const selectedPostImage =
    selectedPostImages[selectedImageIndex] || selectedPostImages[0] || "";
  const hasMultipleSelectedImages = selectedPostImages.length > 1;
  const myProfileId = getUserId(myProfile);
  const subscriptionSummary = subscriptionsByUserId[myProfileId];
  const followersCount = subscriptionSummary?.followersCount ?? 0;
  const followingCount = subscriptionSummary?.followingCount ?? 0;

  const handleCopyLink = async () => {
    if (!selectedPost) {
      return;
    }

    const postUrl = `${window.location.origin}/posts/${selectedPost._id}`;
    // navigator.clipboard.writeText(postUrl) копирует текст в буфер обмена.
    await navigator.clipboard.writeText(postUrl);
    setCopyStatus("copied");
  };

  const handleDeletePost = async () => {
    if (!selectedPost) {
      return;
    }

    const postId = selectedPost._id;
    const result = await dispatch(deletePost(postId));

    if (!deletePost.fulfilled.match(result)) {
      return;
    }

    const remainingPosts = myPosts.filter((post) => post._id !== postId);
    setIsPostMenuOpen(false);

    if (remainingPosts.length === 0) {
      setSelectedPost(null);
      setSelectedPostIndex(null);
      return;
    }

    //  Выбор следующего поста после удаления
    /**
     * Смысл у него такой: после удаления поста модалка должна показать какой-то другой оставшийся пост, а не сломаться.
     */
    const nextIndex = Math.min(selectedPostIndex ?? 0, remainingPosts.length - 1);
    setSelectedPost(remainingPosts[nextIndex]);
    setSelectedPostIndex(nextIndex);
    setSelectedImageIndex(0);
  };

  const showPreviousSelectedImage = () => {
    setSelectedImageIndex((currentIndex) =>
      currentIndex === 0 ? selectedPostImages.length - 1 : currentIndex - 1,
    );
  };

  const showNextSelectedImage = () => {
    setSelectedImageIndex((currentIndex) =>
      currentIndex === selectedPostImages.length - 1 ? 0 : currentIndex + 1,
    );
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.avatarRing}>
          <img className={styles.avatar} src={avatar} alt="" />
        </div>

        <div className={styles.info}>
          <div className={styles.topRow}>
            <h1 className={styles.username}>{myProfile.username}</h1>
            <Link className={styles.editButton} to="/profile/edit">
              Edit profile
            </Link>
          </div>

          <dl className={styles.stats}>
            <div>
              <dt>{myPosts.length}</dt>
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

          {subscriptionsError && (
            <p className={styles.subscriptionError}>{subscriptionsError}</p>
          )}

          {bio && (
            <p className={styles.bio}>
              {isBioLong ? `${bio.slice(0, collapsedBioLength)}...` : bio}
              {isBioLong && <span> more</span>}
            </p>
          )}

          {website && (
            <a className={styles.website} href={websiteHref}>
              {website}
            </a>
          )}
        </div>
      </header>

      {postsStatus === "loading" && <Spinner label="Loading posts..." />}

      {postsStatus === "failed" && <p className={styles.errorText}>{error}</p>}

      {postsStatus === "succeeded" && myPosts.length > 0 && (
        <div className={styles.createPostBlock}>
          <Link className={styles.newPostButton} to="/create" aria-label="Create post">
            <span aria-hidden="true" />
          </Link>
          <p>New</p>
        </div>
      )}

      {postsStatus === "succeeded" && myPosts.length === 0 && (
        <div className={styles.emptyPosts}>
          <Link className={styles.newPostButton} to="/create" aria-label="Create post">
            <span aria-hidden="true" />
          </Link>
          <p>New</p>
          <span>No posts yet.</span>
        </div>
      )}

      {myPosts.length > 0 && (
        <div className={styles.postsGrid}>
          {myPosts.map((post, index) => (
            <button
              className={styles.postTile}
              type="button"
              key={post._id}
              onClick={() => {
                setSelectedPost(post);
                setSelectedPostIndex(index);
                setSelectedImageIndex(0);
                setIsPostMenuOpen(false);
                setCopyStatus("idle");
              }}
            >
              <img
                src={getPostCoverImage(post)}
                alt={post.description || "Profile post"}
              />
              {getPostImages(post).length > 1 && (
                <span className={styles.galleryBadge}>
                  1/{getPostImages(post).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {selectedPost && (
        <div className={styles.postOverlay}>
          <button
            className={styles.postBackdrop}
            type="button"
            aria-label="Close post"
            onClick={() => {
              setSelectedPost(null);
              setSelectedPostIndex(null);
              setSelectedImageIndex(0);
              setIsPostMenuOpen(false);
            }}
          />

          {myPosts.length > 1 && selectedPostIndex !== null && (
            <>
              <button
                className={`${styles.navButton} ${styles.navButtonLeft}`}
                type="button"
                aria-label="Previous post"
                onClick={() => {
                  const nextIndex =
                    selectedPostIndex === 0
                      ? myPosts.length - 1
                      : selectedPostIndex - 1;

                  setSelectedPost(myPosts[nextIndex]);
                  setSelectedPostIndex(nextIndex);
                  setSelectedImageIndex(0);
                  setIsPostMenuOpen(false);
                  setCopyStatus("idle");
                }}
              >
                &lt;
              </button>
              <button
                className={`${styles.navButton} ${styles.navButtonRight}`}
                type="button"
                aria-label="Next post"
                onClick={() => {
                  const nextIndex =
                    selectedPostIndex === myPosts.length - 1
                      ? 0
                      : selectedPostIndex + 1;

                  setSelectedPost(myPosts[nextIndex]);
                  setSelectedPostIndex(nextIndex);
                  setSelectedImageIndex(0);
                  setIsPostMenuOpen(false);
                  setCopyStatus("idle");
                }}
              >
                &gt;
              </button>
            </>
          )}

          <article className={styles.postModal}>
            <div className={styles.postImageWrap}>
              <img
                className={styles.postModalImage}
                src={selectedPostImage}
                alt={selectedPost.description || "Selected post"}
              />
              {hasMultipleSelectedImages && (
                <>
                  <button
                    className={`${styles.imageNavButton} ${styles.imageNavButtonLeft}`}
                    type="button"
                    aria-label="Previous image"
                    onClick={showPreviousSelectedImage}
                  >
                    &lt;
                  </button>
                  <button
                    className={`${styles.imageNavButton} ${styles.imageNavButtonRight}`}
                    type="button"
                    aria-label="Next image"
                    onClick={showNextSelectedImage}
                  >
                    &gt;
                  </button>
                  <span className={styles.imageCounter}>
                    {selectedImageIndex + 1}/{selectedPostImages.length}
                  </span>
                </>
              )}
            </div>

            <div className={styles.postDetails}>
              <header className={styles.postModalHeader}>
                <div className={styles.postAuthor}>
                  <span className={styles.postAuthorRing}>
                    <img src={selectedPostAvatar} alt="" />
                  </span>
                  <strong>{selectedPostUsername}</strong>
                </div>

                <button
                  className={styles.dotsButton}
                  type="button"
                  aria-label="Post settings"
                  onClick={() => setIsPostMenuOpen(true)}
                >
                  ...
                </button>
              </header>

              <div className={styles.postTextArea}>
                <div className={styles.postCaptionRow}>
                  <span className={styles.postAuthorRing}>
                    <img src={selectedPostAvatar} alt="" />
                  </span>
                  <p>
                    <strong>{selectedPostUsername}</strong>{" "}
                    {selectedPost.description}
                  </p>
                </div>
              </div>

              <footer className={styles.postModalFooter}>
                <div className={styles.postActions}>
                  <img src="/icons/button-like.png" alt="" aria-hidden="true" />
                  <img
                    src="/icons/button-comments.png"
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <strong>25 likes</strong>
                <span>1 day</span>
              </footer>

              <div className={styles.commentBar}>
                <img src="/icons/smile_btn.png" alt="" aria-hidden="true" />
                <span>Add comment</span>
                <button type="button">Send</button>
              </div>
            </div>
          </article>

          {isPostMenuOpen && (
            <>
              <button
                className={styles.menuBackdrop}
                type="button"
                aria-label="Close post menu"
                onClick={() => setIsPostMenuOpen(false)}
              />
              <div className={styles.postMenu} role="dialog" aria-label="Post menu">
                <button
                  className={styles.deleteAction}
                  type="button"
                  onClick={handleDeletePost}
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/posts/${selectedPost._id}/edit`)}
                >
                  Edit
                </button>
                <button type="button" onClick={() => setIsPostMenuOpen(false)}>
                  Go to post
                </button>
                <button type="button" onClick={handleCopyLink}>
                  {copyStatus === "copied" ? "Copied!" : "Copy link"}
                </button>
                <button type="button" onClick={() => setIsPostMenuOpen(false)}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default MyProfilePage;
