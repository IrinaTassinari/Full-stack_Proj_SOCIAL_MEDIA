import styles from "./PostActionsModal.module.css";

type PostActionsModalProps = {
  isOwnPost: boolean;
  copyStatus: "idle" | "copied";
  onDelete?: () => void;
  onEdit?: () => void;
  onCopyLink: () => void;
  onGoToPost?: () => void;
  onClose: () => void;
};

function PostActionsModal({
  isOwnPost,
  copyStatus,
  onDelete,
  onEdit,
  onCopyLink,
  onGoToPost,
  onClose,
}: PostActionsModalProps) {
  return (
    <>
      <button
        className={styles.backdrop}
        type="button"
        aria-label="Close post menu"
        onClick={onClose}
      />
      <div className={styles.menu} role="dialog" aria-label="Post menu">
        {isOwnPost && onDelete && (
          <button className={styles.deleteAction} type="button" onClick={onDelete}>
            Delete
          </button>
        )}
        {isOwnPost && onEdit && (
          <button type="button" onClick={onEdit}>
            Edit
          </button>
        )}
        <button type="button" onClick={onCopyLink}>
          {copyStatus === "copied" ? "Copied!" : "Copy link"}
        </button>
        {onGoToPost && (
          <button type="button" onClick={onGoToPost}>
            Go to post
          </button>
        )}
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </>
  );
}

export default PostActionsModal;
