import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import {
  fetchPostById,
  updatePost,
} from "../../features/posts/postsThunks";
import { fetchMyProfile } from "../../features/profile/profileThunks";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import styles from "../CreatePostPage/CreatePostPage.module.css";

const maxDescriptionLength = 200;

function EditPostPage() {
  const { postId } = useParams<{ postId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { myProfile } = useAppSelector((state) => state.profile);
  const { selectedPost, selectedStatus, updateStatus, error } = useAppSelector(
    (state) => state.posts,
  );
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);

  const avatar = myProfile?.avatar || selectedPost?.author.avatar || "/icons/ICH_avatar.png";
  const username = myProfile?.username || selectedPost?.author.username || "user";
  const isLoading = updateStatus === "loading";
  const canSubmit = Boolean(selectedPost) && !isLoading;

  useEffect(() => {
    if (!myProfile) {
      dispatch(fetchMyProfile());
    }
  }, [dispatch, myProfile]);

  useEffect(() => {
    if (postId) {
      dispatch(fetchPostById(postId));
    }
  }, [dispatch, postId]);

  useEffect(() => {
    if (selectedPost) {
      setDescription(selectedPost.description || "");
      setPreview(selectedPost.image);
      setImageFile(null);
    }
  }, [selectedPost]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const counterText = useMemo(
    () => `${description.length}/${maxDescriptionLength}`,
    [description.length],
  );

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setDescription((current) =>
      `${current}${emojiData.emoji}`.slice(0, maxDescriptionLength),
    );
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!postId || !selectedPost) {
      return;
    }

    const formData = new FormData();
    formData.append("description", description.trim());

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const result = await dispatch(updatePost({ postId, formData }));

    if (updatePost.fulfilled.match(result)) {
      navigate("/profile");
    }
  };

  if (selectedStatus === "failed") {
    return (
      <section className={styles.page} aria-label="Post error">
        <form className={styles.modal}>
          <p className={styles.error}>{error || "Failed to load post"}</p>
        </form>
      </section>
    );
  }

  if (selectedStatus === "idle" || selectedStatus === "loading" || !selectedPost) {
    return (
      <section className={styles.page} aria-label="Loading post">
        <form className={styles.modal}>
          <header className={styles.header}>
            <h1>Loading post...</h1>
          </header>
        </form>
      </section>
    );
  }

  return (
    <section className={styles.page} aria-label="Edit post">
      <form className={styles.modal} onSubmit={handleSubmit}>
        <header className={styles.header}>
          <h1>Edit post</h1>
          <div className={styles.headerActions}>
            <button
              className={styles.shareButton}
              type="submit"
              disabled={!canSubmit}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
            <button
              className={styles.closeButton}
              type="button"
              onClick={() => navigate("/profile")}
            >
              Close
            </button>
          </div>
        </header>

        <div className={styles.body}>
          <label className={styles.uploadArea}>
            <input
              className={styles.fileInput}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {preview ? (
              <img className={styles.previewImage} src={preview} alt="" />
            ) : (
              <img
                className={styles.uploadIcon}
                src="/icons/icon-upload.png"
                alt=""
                aria-hidden="true"
              />
            )}
          </label>

          <aside className={styles.details}>
            <div className={styles.author}>
              <img src={avatar} alt="" />
              <span>{username}</span>
            </div>

            <textarea
              className={styles.textarea}
              maxLength={maxDescriptionLength}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              aria-label="Post description"
            />

            <p className={styles.counter}>{counterText}</p>

            <div className={styles.footerRow}>
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
            </div>
          </aside>
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </form>
    </section>
  );
}

export default EditPostPage;
