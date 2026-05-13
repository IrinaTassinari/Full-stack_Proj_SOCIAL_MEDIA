import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../../features/posts/postsThunks";
import { fetchMyProfile } from "../../features/profile/profileThunks";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import styles from "./CreatePostPage.module.css";

const maxDescriptionLength = 200;

function CreatePostPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { myProfile } = useAppSelector((state) => state.profile);
  const { createStatus, error } = useAppSelector((state) => state.posts);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null); // Это state для превью картинки перед созданием поста
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);

  const avatar = myProfile?.avatar || "/icons/ICH_avatar.png";
  const username = myProfile?.username || "user";
  const isLoading = createStatus === "loading";
  const canSubmit = Boolean(imageFile) && !isLoading;
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setDescription((current) =>
      `${current}${emojiData.emoji}`.slice(0, maxDescriptionLength),
    );
  };

  useEffect(() => {
    if (!myProfile) {
      dispatch(fetchMyProfile());
    }
  }, [dispatch, myProfile]);

    //  превью картинки перед созданием поста - огда ты выбираешь картинку, код делает:URL.createObjectURL(file) Это создает временную ссылку на файл
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview); // очисти старую preview-ссылку
      }
    };
  }, [preview]);

  // Счетчик символов 0/200
  const counterText = useMemo(
    () => `${description.length}/${maxDescriptionLength}`,
    [description.length],
  );

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!imageFile) {
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("description", description.trim());

    const result = await dispatch(createPost(formData));

    if (createPost.fulfilled.match(result)) {
      navigate("/profile");
    }
  };

  return (
    <section className={styles.page} aria-label="Create post">
      <form className={styles.modal} onSubmit={handleSubmit}>
        <header className={styles.header}>
          <h1>Create new post</h1>
          <div className={styles.headerActions}>
            <button
              className={styles.shareButton}
              type="submit"
              disabled={!canSubmit}
            >
              {isLoading ? "Sharing..." : "Share"}
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

export default CreatePostPage;
