import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/ui/Spinner/Spinner";
import {
  fetchMyProfile,
  updateMyProfile,
} from "../../features/profile/profileThunks";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import styles from "./EditProfilePage.module.css";

const maxBioLength = 150;

function EditProfilePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { myProfile, status, error } = useAppSelector((state) => state.profile);

  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    if (!myProfile) {
      dispatch(fetchMyProfile());
    }
  }, [dispatch, myProfile]);

  useEffect(() => {
    if (!myProfile) return;

    setUsername(myProfile.username || "");
    setWebsite(myProfile.website || "");
    setBio(myProfile.bio || "");
    setAvatarPreview(myProfile.avatar || "/icons/ICH_avatar.png");
  }, [myProfile]);

  const isLoading = status === "loading";

  // handlePhotoChange срабатывает сразу, когда пользователь выбрал файл
  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file)); //идёт вот сюда <img className={styles.avatar} src={avatarPreview} alt="" />

  };


  //  handleSubmit срабатывает позже, когда пользователь нажал Save
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // FormData — это специальный объект браузера для отправки данных формы на backend, особенно когда есть файлы. Обычный JSON хорошо подходит для текста. Но когда нужно отправить картинку, аватарку, файл поста, лучше использовать FormData.
    const formData = new FormData();
    formData.append("username", username.trim());
    formData.append("website", website.trim());
    formData.append("bio", bio.trim());

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const result = await dispatch(updateMyProfile(formData));

    if (updateMyProfile.fulfilled.match(result)) {
      navigate("/profile");
    }
  };

  if (!myProfile && isLoading) {
    return <Spinner label="Loading profile..." />;
  }

  return (
    <section className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Edit profile</h1>

        <div className={styles.summary}>
          <img className={styles.avatar} src={avatarPreview} alt="" />
          <div className={styles.summaryText}>
            <p>{username || "ichschool"}</p>
            <span>{bio.split("\n")[0]}</span>
          </div>
          <button
            className={styles.photoButton}
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            New photo
          </button>
          <input
            ref={fileInputRef}
            className={styles.fileInput}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
          />
        </div>

        <label className={styles.field}>
          <span>Username</span>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label className={styles.field}>
          <span>Website</span>
          <div className={styles.websiteField}>
            <img
              className={styles.websiteIcon}
              src="/icons/icon-website.png"
              alt=""
              aria-hidden="true"
            />
            <input
              type="text"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>
        </label>

        <label className={styles.field}>
          <span>About</span>
          <div className={styles.textareaWrap}>
            <textarea
              value={bio}
              maxLength={maxBioLength}
              onChange={(event) => setBio(event.target.value)}
            />
            <span className={styles.counter}>
              {bio.length} / {maxBioLength}
            </span>
          </div>
        </label>

        {error && <p className={styles.errorText}>{error}</p>}

        <div className={styles.actions}>
          <button className={styles.saveButton} type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </button>
          <button
            className={styles.exitButton}
            type="button"
            onClick={() => navigate("/profile")}
          >
            Exit
          </button>
        </div>
      </form>
    </section>
  );
}

export default EditProfilePage;
