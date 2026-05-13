import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deletePost } from "../../features/posts/postsThunks";
import { fetchMyPosts, fetchMyProfile } from "../../features/profile/profileThunks";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { Post } from "../../types/post";
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
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
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
      }

      if (event.key === "ArrowRight") {
        const nextIndex =
          selectedPostIndex === myPosts.length - 1 ? 0 : selectedPostIndex + 1;

        setSelectedPost(myPosts[nextIndex]);
        setSelectedPostIndex(nextIndex);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPostMenuOpen, myPosts, selectedPostIndex]);

  if (status === "loading") {
    return <p className={styles.stateText}>Loading profile...</p>;
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
              <dt>9 993</dt>
              <dd>followers</dd>
            </div>
            <div>
              <dt>59</dt>
              <dd>following</dd>
            </div>
          </dl>

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

      {postsStatus === "loading" && (
        <p className={styles.postsState}>Loading posts...</p>
      )}

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
                setIsPostMenuOpen(false);
                setCopyStatus("idle");
              }}
            >
              <img src={post.image} alt={post.description || "Profile post"} />
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
                src={selectedPost.image}
                alt={selectedPost.description || "Selected post"}
              />
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
