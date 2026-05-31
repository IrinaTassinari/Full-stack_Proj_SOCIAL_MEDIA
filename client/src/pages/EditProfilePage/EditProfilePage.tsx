import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/ui/Spinner/Spinner";
import { logout } from "../../features/auth/authSlice";
import {
  deleteMyProfile,
  fetchMyProfile,
  updateMyProfile,
} from "../../features/profile/profileThunks";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { User } from "../../types/user";
import styles from "./EditProfilePage.module.css";

const maxBioLength = 150;

type EditProfileFormProps = {
  myProfile: User;
  status: "idle" | "loading" | "succeeded" | "failed";
  deleteStatus: "idle" | "loading" | "failed";
  error: string | null;
};

function EditProfileForm({
  myProfile,
  status,
  deleteStatus,
  error,
}: EditProfileFormProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [username, setUsername] = useState(myProfile.username || "");
  const [website, setWebsite] = useState(myProfile.website || "");
  const [bio, setBio] = useState(myProfile.bio || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(
    myProfile.avatar || "/icons/ICH_avatar.png",
  );

  const isLoading = status === "loading";
  const isDeleting = deleteStatus === "loading";

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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

  const handleDeleteProfile = async () => {
    const result = await dispatch(deleteMyProfile());

    if (deleteMyProfile.fulfilled.match(result)) {
      dispatch(logout());
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    if (!isDeleteModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) {
        setIsDeleteModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDeleteModalOpen, isDeleting]);

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

      <div className={styles.dangerZone}>
        <h2>Delete profile</h2>
        <p>
          Permanently delete your account and all associated content. This
          action cannot be undone.
        </p>
        <button
          className={styles.deleteButton}
          type="button"
          disabled={isDeleting}
          onClick={() => setIsDeleteModalOpen(true)}
        >
          {isDeleting ? "Deleting..." : "Delete profile"}
        </button>
      </div>

      {isDeleteModalOpen && (
        <div className={styles.modalOverlay}>
          <button
            className={styles.modalBackdrop}
            type="button"
            aria-label="Close delete profile dialog"
            disabled={isDeleting}
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <section
            className={styles.deleteModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-profile-title"
          >
            <h2 id="delete-profile-title">Delete profile?</h2>
            <p>
              Your posts, comments, likes, follows, and messages will be
              permanently deleted. This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                type="button"
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className={styles.confirmDeleteButton}
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteProfile}
              >
                {isDeleting ? "Deleting..." : "Delete profile"}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function EditProfilePage() {
  const dispatch = useAppDispatch();
  const { myProfile, status, deleteStatus, error } = useAppSelector(
    (state) => state.profile,
  );

  useEffect(() => {
    if (!myProfile) {
      dispatch(fetchMyProfile());
    }
  }, [dispatch, myProfile]);

  if (!myProfile) {
    return <Spinner label="Loading profile..." />;
  }

  return (
    <EditProfileForm
      key={myProfile._id || myProfile.userId || myProfile.id}
      myProfile={myProfile}
      status={status}
      deleteStatus={deleteStatus}
      error={error}
    />
  );
}

export default EditProfilePage;
